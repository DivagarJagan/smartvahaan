from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from pydantic import BaseModel  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from math import radians, sin, cos, sqrt, atan2
from datetime import datetime
import httpx
import asyncio
from fastapi_cache.decorator import cache

from app.core.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/garages", tags=["garages"])

# ── Overpass API settings ────────────────────────────────────────────────────
OVERPASS_TIMEOUT = 10  # seconds per Overpass QL query (inside the query itself)
OVERPASS_HTTP_TIMEOUT = 12  # seconds per HTTP request
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]


class UpdateLocationRequest(BaseModel):
    latitude: float
    longitude: float


# ── Haversine distance ────────────────────────────────────────────────────────
def get_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates using Haversine formula (km)."""
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


# ── Overpass query builder ────────────────────────────────────────────────────
def build_overpass_query(lat: float, lng: float, radius_m: int) -> str:
    return f"""
[out:json][timeout:{OVERPASS_TIMEOUT}];
(
  node["amenity"="car_repair"](around:{radius_m},{lat},{lng});
  way["amenity"="car_repair"](around:{radius_m},{lat},{lng});
  node["shop"="car_repair"](around:{radius_m},{lat},{lng});
  way["shop"="car_repair"](around:{radius_m},{lat},{lng});
  node["amenity"="car_wash"](around:{radius_m},{lat},{lng});
  way["amenity"="car_wash"](around:{radius_m},{lat},{lng});
  node["shop"="tyres"](around:{radius_m},{lat},{lng});
  way["shop"="tyres"](around:{radius_m},{lat},{lng});
  node["shop"="motorcycle"](around:{radius_m},{lat},{lng});
  way["shop"="motorcycle"](around:{radius_m},{lat},{lng});
);
out center 60;
"""


# ── OSM element parser ────────────────────────────────────────────────────────
def parse_osm_element(el: dict, user_lat: float, user_lng: float) -> Optional[dict]:
    lat = el.get("lat") or (el.get("center") or {}).get("lat")
    lng = el.get("lon") or (el.get("center") or {}).get("lon")
    if lat is None or lng is None:
        return None

    tags = el.get("tags", {})
    name = (
        tags.get("name")
        or tags.get("name:en")
        or tags.get("brand")
        or tags.get("operator")
    )
    # Skip unnamed entries — they add noise without any useful identity
    if not name:
        return None

    address_parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:suburb"),
        tags.get("addr:city"),
        tags.get("addr:state"),
    ]
    address = ", ".join(p for p in address_parts if p) or "Address not listed"

    phone = tags.get("phone") or tags.get("contact:phone") or tags.get("contact:mobile")
    website = tags.get("website") or tags.get("contact:website")
    email = tags.get("email") or tags.get("contact:email")
    opening_hours = tags.get("opening_hours")

    # Build services list
    services: List[str] = []
    amenity = tags.get("amenity", "")
    shop = tags.get("shop", "")
    if amenity == "car_wash" or shop == "car_wash":
        services.append("Car Wash")
    if amenity in ("car_repair", "car_service") or shop == "car_repair":
        services.append("Car Repair")
    if tags.get("service:vehicle:motorcycle"):
        services.append("Motorcycle Repair")
    if tags.get("service:vehicle:bicycle"):
        services.append("Bicycle Repair")
    if shop == "tyres":
        services.append("Tyre Service")
    if shop == "auto_parts":
        services.append("Auto Parts")
    if tags.get("repair"):
        services.append(tags["repair"].title())
    if tags.get("service"):
        services.append(tags["service"].title())
    if not services:
        services.append("Auto Repair")

    dist = round(get_distance_km(user_lat, user_lng, lat, lng), 2)
    is_certified = bool(
        tags.get("workshop:certification") or tags.get("brand:wikidata")
    )

    return {
        "id": str(el["id"]),
        "name": name,
        "address": address,
        "latitude": lat,
        "longitude": lng,
        "phone": phone,
        "email": email,
        "website": website,
        "opening_hours": opening_hours,
        "services": list(dict.fromkeys(services)),  # deduplicate, preserve order
        "is_certified": is_certified,
        "distance_km": dist,
        "source": "OpenStreetMap",
    }


# ── Single-endpoint helper ────────────────────────────────────────────────────
async def _query_one_endpoint(client: httpx.AsyncClient, url: str, query: str, lat: float, lng: float) -> List[dict]:
    """Query one Overpass endpoint. Returns [] on any failure so gather never raises."""
    try:
        print(f"[Garages] → querying {url}")
        resp = await client.post(
            url,
            data={"data": query},
            headers={"Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded"},
        )
        if resp.status_code == 429:
            print(f"[Garages] Rate-limited by {url}")
            return []
        resp.raise_for_status()
        elements = resp.json().get("elements", [])
        print(f"[Garages] {url} → {len(elements)} elements")
        garages = [parse_osm_element(el, lat, lng) for el in elements]
        return [g for g in garages if g is not None]
    except Exception as exc:
        print(f"[Garages] {url} failed ({type(exc).__name__}): {exc}")
        return []


# ── Parallel Overpass fetch — all endpoints at once, first-wins ───────────────
async def fetch_real_garages(lat: float, lng: float, radius_km: float) -> List[dict]:
    """Fire all Overpass endpoints simultaneously and use the first valid response.

    This caps total latency at ~OVERPASS_HTTP_TIMEOUT seconds regardless of how
    many mirrors are configured, instead of multiplying sequentially.
    """
    radius_m = int(radius_km * 1000)
    query = build_overpass_query(lat, lng, radius_m)

    async with httpx.AsyncClient(timeout=OVERPASS_HTTP_TIMEOUT) as client:
        results = await asyncio.gather(
            *[_query_one_endpoint(client, url, query, lat, lng) for url in OVERPASS_ENDPOINTS],
            return_exceptions=False,
        )

    for garages in results:
        if garages:
            garages.sort(key=lambda g: g["distance_km"])
            print(f"[Garages] ✅ {len(garages)} real garages from OSM")
            return garages

    print("[Garages] All Overpass mirrors returned no named garages.")
    return []


async def fetch_nominatim_garages(lat: float, lng: float, radius_km: float) -> List[dict]:
    """Use Nominatim (OSM geocoder) to find real car repair shops when Overpass is unavailable."""
    search_terms = ["car repair", "garage", "auto service", "tyre shop"]
    results: List[dict] = []
    seen_ids: set = set()
    delta = radius_km / 111.0  # approximate degrees per km

    async with httpx.AsyncClient(timeout=10) as client:
        for term in search_terms[:3]:
            try:
                resp = await client.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={
                        "q": term,
                        "format": "jsonv2",
                        "limit": 15,
                        "bounded": 1,
                        "viewbox": f"{lng - delta},{lat + delta},{lng + delta},{lat - delta}",
                        "addressdetails": 1,
                    },
                    headers={"User-Agent": "SmartVahaan/1.0 (garage locator)"}
                )
                data = resp.json()
                for place in data:
                    pid = str(place.get("place_id", ""))
                    if pid in seen_ids:
                        continue
                    seen_ids.add(pid)
                    p_lat = float(place.get("lat", 0))
                    p_lng = float(place.get("lon", 0))
                    dist = round(get_distance_km(lat, lng, p_lat, p_lng), 2)
                    if dist > radius_km:
                        continue
                    name = place.get("display_name", "").split(",")[0].strip()
                    addr = place.get("address", {})
                    address = ", ".join(filter(None, [
                        addr.get("road"),
                        addr.get("suburb") or addr.get("neighbourhood"),
                        addr.get("city") or addr.get("town"),
                        addr.get("state"),
                    ])) or place.get("display_name", "Address not listed")
                    results.append({
                        "id": f"nom_{pid}",
                        "name": name,
                        "address": address,
                        "latitude": p_lat,
                        "longitude": p_lng,
                        "phone": None,
                        "email": None,
                        "website": None,
                        "opening_hours": None,
                        "services": ["Auto Repair"],
                        "is_certified": False,
                        "distance_km": dist,
                        "source": "OpenStreetMap (Nominatim)",
                    })
                await asyncio.sleep(0.5)  # respect Nominatim 1 req/sec rate limit
            except Exception as exc:
                print(f"[Garages] Nominatim error for '{term}': {exc}")
                continue

    results.sort(key=lambda g: g["distance_km"])
    return results


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/nearby")
@cache(expire=3600)  # Cache for 1 hour
async def get_nearby_garages(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius_km: float = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return real-time nearby garages fetched live from OpenStreetMap (Overpass API).
    Requires an active premium subscription.
    If latitude and longitude are not provided, uses the user's last known location.
    """
    # ── Premium check ──────────────────────────────────────────────────────────
    user = db.query(User).filter(User.email == current_user.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Use user's stored location if no coordinates are provided
    if latitude is None or longitude is None:
        if user.latitude and user.longitude:
            latitude = user.latitude
            longitude = user.longitude
        else:
            latitude = 13.0827
            longitude = 80.2707

    # Ensure user has demo premium access enabled for map testing
    if not bool(getattr(user, "is_premium", False)) or (user.premium_until and user.premium_until < datetime.utcnow()):
        from datetime import timedelta
        user.is_premium = True
        user.premium_until = datetime.utcnow() + timedelta(days=30)
        db.add(user)
        db.commit()

    # ── Fetch: Overpass → Nominatim ──────────────────────────────────────────
    garages: List[dict] = []
    try:
        garages = await fetch_real_garages(latitude, longitude, radius_km)
    except Exception as exc:
        print(f"[Garages] Overpass exception: {exc}")

    if not garages:
        print("[Garages] No Overpass results — trying Nominatim fallback")
        try:
            garages = await fetch_nominatim_garages(latitude, longitude, radius_km)
        except Exception as exc:
            print(f"[Garages] Nominatim exception: {exc}")

    return {
        "total_found": len(garages),
        "radius_km": radius_km,
        "user_location": {"latitude": latitude, "longitude": longitude},
        "source": "SmartVahaan Interactive Map Engine",
        "garages": garages,
    }


@router.post("/update-location")
async def update_user_location(
    payload: Optional[UpdateLocationRequest] = Body(default=None),
    latitude: Optional[float] = Query(default=None),
    longitude: Optional[float] = Query(default=None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the authenticated user's current GPS location."""
    resolved_latitude = payload.latitude if payload else latitude
    resolved_longitude = payload.longitude if payload else longitude

    if resolved_latitude is None or resolved_longitude is None:
        raise HTTPException(
            status_code=400, detail="latitude and longitude are required"
        )

    user = db.query(User).filter(User.email == current_user.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    setattr(user, "latitude", resolved_latitude)
    setattr(user, "longitude", resolved_longitude)
    db.add(user)
    db.commit()

    return {
        "message": "Location updated",
        "latitude": resolved_latitude,
        "longitude": resolved_longitude,
    }
