from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from pydantic import BaseModel  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from math import radians, sin, cos, sqrt, atan2
from datetime import datetime
import httpx
from fastapi_cache.decorator import cache

from app.core.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/garages", tags=["garages"])

# ── Overpass API endpoint ─────────────────────────────────────────────────────
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
OVERPASS_TIMEOUT =  300 # seconds


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
  node["amenity"="car_service"](around:{radius_m},{lat},{lng});
  way["amenity"="car_service"](around:{radius_m},{lat},{lng});
  node["amenity"="car_wash"](around:{radius_m},{lat},{lng});
  way["amenity"="car_wash"](around:{radius_m},{lat},{lng});
  node["shop"="tyres"](around:{radius_m},{lat},{lng});
  node["shop"="auto_parts"](around:{radius_m},{lat},{lng});
);
out center;
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
        or "Auto Repair Shop"
    )

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


# ── Fetch from Overpass ───────────────────────────────────────────────────────
async def fetch_real_garages(lat: float, lng: float, radius_km: float) -> List[dict]:
    """Query Overpass API endpoints and return a parsed, sorted garage list."""
    radius_m = int(radius_km * 1000)
    query = build_overpass_query(lat, lng, radius_m)
    
    endpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass.nchc.org.tw/api/interpreter",
    ]

    async with httpx.AsyncClient(timeout=OVERPASS_TIMEOUT + 5) as client:
        for url in endpoints:
            try:
                # Overpass API expects the query in a URL-encoded 'data' field
                response = await client.post(
                    url,
                    data={"data": query},
                    headers={
                        "Accept": "application/json",
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                )
                
                if response.status_code == 429: # Too Many Requests
                    print(f"Rate limited by {url}, trying next endpoint.")
                    continue

                response.raise_for_status()
                data = response.json()
                
                elements = data.get("elements", [])
                if not elements:
                    continue # Try next endpoint if results are empty

                garages = [parse_osm_element(el, lat, lng) for el in elements]
                garages = [g for g in garages if g is not None]
                
                if garages:
                    garages.sort(key=lambda g: g["distance_km"])
                    return garages

            except httpx.HTTPStatusError as exc:
                print(f"HTTP error with {url}: {exc.response.status_code}")
                # Continue to next endpoint on server errors
                if 500 <= exc.response.status_code <= 599:
                    continue
            except (httpx.TimeoutException, httpx.RequestError) as exc:
                print(f"Request failed for {url}: {str(exc)}")
                # Continue to next endpoint on connection/timeout errors
                continue
            except Exception as exc:
                print(f"An unexpected error occurred with {url}: {str(exc)}")
                continue

    # Final fallback if all endpoints fail
    print("All Overpass API endpoints failed. Returning empty list.")
    return []


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
            raise HTTPException(
                status_code=400,
                detail="Location not provided and no location stored for user. Please update your location.",
            )

    if not bool(getattr(user, "is_premium", False)):
        raise HTTPException(
            status_code=403,
            detail="This feature is only available for premium users. Please upgrade to access garage maps.",
        )

    premium_until = getattr(user, "premium_until", None)
    if premium_until and premium_until < datetime.utcnow():
        raise HTTPException(
            status_code=403,
            detail="Your premium subscription has expired. Please renew to access this feature.",
        )

    # ── Live OSM fetch ────────────────────────────────────────────────────────
    try:
        garages = await fetch_real_garages(latitude, longitude, radius_km)
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Garage data request timed out. Please try again shortly.",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not fetch real-time garage data: {str(exc)}",
        )

    return {
        "total_found": len(garages),
        "radius_km": radius_km,
        "user_location": {"latitude": latitude, "longitude": longitude},
        "source": "OpenStreetMap / Overpass API",
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
