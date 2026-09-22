import asyncio
import httpx
import time
from math import radians, sin, cos, sqrt, atan2

def get_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

async def fetch_real_garages(lat: float, lng: float, radius_km: float = 10.0):
    deg_lat = radius_km / 111.0
    deg_lng = radius_km / (111.0 * max(cos(radians(lat)), 0.001))
    s, w, n, e = lat - deg_lat, lng - deg_lng, lat + deg_lat, lng + deg_lng

    headers = {"User-Agent": "SmartVahaan/2.0 (Real Garage Locator; support@smartvahan.app)"}

    # BBOX Overpass Query
    overpass_q = f"""[out:json][timeout:6];
(
  node["amenity"="car_repair"]({s},{w},{n},{e});
  node["shop"="car_repair"]({s},{w},{n},{e});
  node["shop"="tyres"]({s},{w},{n},{e});
  node["amenity"="car_wash"]({s},{w},{n},{e});
  way["amenity"="car_repair"]({s},{w},{n},{e});
  way["shop"="car_repair"]({s},{w},{n},{e});
);
out center 35;"""

    garages = []
    seen_coords = set()
    seen_names = set()

    async with httpx.AsyncClient(timeout=6.0) as client:
        async def query_overpass():
            for ep in ["https://lz4.overpass-api.de/api/interpreter", "https://overpass-api.de/api/interpreter"]:
                try:
                    resp = await client.post(ep, data={"data": overpass_q}, headers=headers)
                    if resp.status_code == 200:
                        return resp.json().get("elements", [])
                except Exception:
                    continue
            return []

        async def query_nominatim(query_term):
            try:
                # viewbox: left,top,right,bottom -> w,n,e,s
                url = f"https://nominatim.openstreetmap.org/search?q={query_term}&format=json&viewbox={w},{n},{e},{s}&bounded=1&limit=25&addressdetails=1"
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
            except Exception:
                pass
            return []

        # Run concurrent searches
        t0 = time.time()
        overpass_task = query_overpass()
        nom_task1 = query_nominatim("car+repair")
        nom_task2 = query_nominatim("automobile+service")

        overpass_res, nom_res1, nom_res2 = await asyncio.gather(overpass_task, nom_task1, nom_task2)
        print(f"Fetch completed in {time.time() - t0:.2f}s")

        # Process Nominatim results
        for item in (nom_res1 + nom_res2):
            try:
                g_lat = float(item["lat"])
                g_lng = float(item["lon"])
                
                # Check bounds
                dist = round(get_distance_km(lat, lng, g_lat, g_lng), 2)
                if dist > radius_km:
                    continue

                raw_name = item.get("name") or item.get("display_name", "").split(",")[0]
                raw_name = raw_name.strip()

                # Filter out pure roads/administrative lines
                cls = item.get("class", "")
                typ = item.get("type", "")
                if cls in ("highway", "boundary", "place") and typ not in ("services", "car_repair", "car_wash"):
                    continue
                if any(raw_name.lower().endswith(suffix) for suffix in [" road", " street", " lane", " salai", " highway"]):
                    continue

                name_key = raw_name.lower()
                coord_key = (round(g_lat, 3), round(g_lng, 3))
                if coord_key in seen_coords or name_key in seen_names:
                    continue
                seen_coords.add(coord_key)
                seen_names.add(name_key)

                addr_dict = item.get("address", {})
                road = addr_dict.get("road") or addr_dict.get("suburb") or ""
                city = addr_dict.get("city") or addr_dict.get("town") or addr_dict.get("state_district") or ""
                state = addr_dict.get("state") or ""
                postcode = addr_dict.get("postcode") or ""
                
                addr_parts = [p for p in [road, city, postcode, state] if p]
                address = ", ".join(addr_parts) if addr_parts else item.get("display_name")

                services = ["Car Repair"]
                if "wash" in raw_name.lower() or typ == "car_wash":
                    services.append("Car Wash")
                if "tyre" in raw_name.lower() or "tire" in raw_name.lower():
                    services.append("Tyre Service")
                if any(b in raw_name.lower() for b in ["tata", "maruti", "hyundai", "honda", "toyota", "mahindra", "bosch", "fiat"]):
                    services.append("Authorised Service")

                garages.append({
                    "id": f"real_nom_{item['place_id']}",
                    "name": raw_name,
                    "address": address,
                    "latitude": g_lat,
                    "longitude": g_lng,
                    "phone": None,
                    "website": None,
                    "email": None,
                    "opening_hours": "09:00 - 19:30",
                    "services": services,
                    "is_certified": any(b in raw_name.lower() for b in ["tata", "maruti", "hyundai", "honda", "toyota", "mahindra", "bosch"]),
                    "distance_km": dist,
                    "source": "OpenStreetMap",
                })
            except Exception:
                continue

        # Process Overpass results
        for el in overpass_res:
            try:
                g_lat = el.get("lat") or (el.get("center") or {}).get("lat")
                g_lng = el.get("lon") or (el.get("center") or {}).get("lon")
                if not g_lat or not g_lng:
                    continue
                dist = round(get_distance_km(lat, lng, g_lat, g_lng), 2)
                if dist > radius_km:
                    continue

                tags = el.get("tags", {})
                name = tags.get("name") or tags.get("operator") or tags.get("brand")
                if not name:
                    continue # only keep real named establishments

                name_key = name.strip().lower()
                coord_key = (round(g_lat, 3), round(g_lng, 3))
                if coord_key in seen_coords or name_key in seen_names:
                    continue
                seen_coords.add(coord_key)
                seen_names.add(name_key)

                addr_parts = [tags.get("addr:housenumber"), tags.get("addr:street"), tags.get("addr:suburb"), tags.get("addr:city")]
                address = ", ".join(p for p in addr_parts if p) or tags.get("address") or "Coimbatore, Tamil Nadu"

                services = []
                if tags.get("amenity") == "car_wash" or tags.get("shop") == "car_wash":
                    services.append("Car Wash")
                if tags.get("amenity") == "car_repair" or tags.get("shop") == "car_repair":
                    services.append("Car Repair")
                if tags.get("shop") == "tyres":
                    services.append("Tyre Service")
                if not services:
                    services.append("Car Repair")

                garages.append({
                    "id": f"real_osm_{el['id']}",
                    "name": name,
                    "address": address,
                    "latitude": g_lat,
                    "longitude": g_lng,
                    "phone": tags.get("phone") or tags.get("contact:phone") or tags.get("contact:mobile"),
                    "website": tags.get("website") or tags.get("contact:website"),
                    "email": tags.get("email") or tags.get("contact:email"),
                    "opening_hours": tags.get("opening_hours") or "09:00 - 19:00",
                    "services": list(dict.fromkeys(services)),
                    "is_certified": bool(tags.get("brand") or tags.get("workshop:certification")),
                    "distance_km": dist,
                    "source": "OpenStreetMap",
                })
            except Exception:
                continue

    garages.sort(key=lambda g: g["distance_km"])
    print(f"Total REAL garages found: {len(garages)}")
    for g in garages:
        print(f"[{g['distance_km']} km] {g['name']} | {g['address']} | Cert: {g['is_certified']}")
    return garages

if __name__ == "__main__":
    asyncio.run(fetch_real_garages(11.0168, 76.9558, 10.0))
