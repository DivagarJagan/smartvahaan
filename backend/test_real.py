import asyncio
import httpx
import time
from math import radians, sin, cos, sqrt, atan2

def get_distance_km(lat1, lon1, lat2, lon2):
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

async def fetch_all_real_garages(lat=11.0168, lng=76.9558, radius_km=10.0):
    garages = []
    seen_coords = set()

    # BBOX calculation: 1 deg lat is ~111km
    deg_lat = radius_km / 111.0
    deg_lng = radius_km / (111.0 * cos(radians(lat)))
    s = lat - deg_lat
    w = lng - deg_lng
    n = lat + deg_lat
    e = lng + deg_lng

    headers = {"User-Agent": "SmartVahaan/2.0 (automotive-repair-search; support@smartvahan.app)"}

    # 1. BBOX Overpass Query
    q = f"""[out:json][timeout:10];
(
  node["amenity"="car_repair"]({s},{w},{n},{e});
  node["shop"="car_repair"]({s},{w},{n},{e});
  node["shop"="tyres"]({s},{w},{n},{e});
  node["amenity"="car_wash"]({s},{w},{n},{e});
  way["amenity"="car_repair"]({s},{w},{n},{e});
  way["shop"="car_repair"]({s},{w},{n},{e});
);
out center 40;"""

    overpass_endpoints = [
        "https://lz4.overpass-api.de/api/interpreter",
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
    ]

    async with httpx.AsyncClient(timeout=8.0) as client:
        # Try overpass
        for ep in overpass_endpoints:
            try:
                t0 = time.time()
                resp = await client.post(ep, data={"data": q}, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    elements = data.get("elements", [])
                    print(f"Overpass {ep} returned {len(elements)} in {time.time()-t0:.2f}s")
                    for el in elements:
                        tags = el.get("tags", {})
                        g_lat = el.get("lat") or (el.get("center") or {}).get("lat")
                        g_lng = el.get("lon") or (el.get("center") or {}).get("lon")
                        if not g_lat or not g_lng:
                            continue
                        
                        name = tags.get("name") or tags.get("operator") or tags.get("brand")
                        # If unlabelled, only include if there is a known brand or shop tag with street
                        if not name:
                            street = tags.get("addr:street")
                            if street:
                                name = f"Auto Repair ({street})"
                            else:
                                continue # Skip completely unlabelled nodes

                        coord_key = (round(g_lat, 4), round(g_lng, 4))
                        if coord_key in seen_coords:
                            continue
                        seen_coords.add(coord_key)

                        addr_parts = [tags.get("addr:housenumber"), tags.get("addr:street"), tags.get("addr:suburb"), tags.get("addr:city")]
                        addr = ", ".join(p for p in addr_parts if p) or tags.get("address") or "Coimbatore, Tamil Nadu"
                        
                        dist = round(get_distance_km(lat, lng, g_lat, g_lng), 2)
                        garages.append({
                            "id": f"osm_{el['id']}",
                            "name": name,
                            "address": addr,
                            "latitude": g_lat,
                            "longitude": g_lng,
                            "phone": tags.get("phone") or tags.get("contact:phone") or tags.get("contact:mobile"),
                            "website": tags.get("website") or tags.get("contact:website"),
                            "email": tags.get("email") or tags.get("contact:email"),
                            "opening_hours": tags.get("opening_hours"),
                            "services": ["Car Repair"],
                            "is_certified": bool(tags.get("brand") or tags.get("workshop:certification")),
                            "distance_km": dist,
                            "source": "OpenStreetMap",
                        })
                    if garages:
                        break
            except Exception as ex:
                print(f"Overpass {ep} failed: {ex}")

        # 2. If Overpass returned few results (< 5), query Nominatim viewbox for real garages!
        if len(garages) < 8:
            print("Querying Nominatim for additional real garages...")
            try:
                t0 = time.time()
                nom_url = f"https://nominatim.openstreetmap.org/search?q=car+repair&format=json&viewbox={w},{n},{e},{s}&bounded=1&limit=25&addressdetails=1"
                resp = await client.get(nom_url, headers=headers)
                if resp.status_code == 200:
                    nom_items = resp.json()
                    print(f"Nominatim returned {len(nom_items)} in {time.time()-t0:.2f}s")
                    for item in nom_items:
                        g_lat = float(item["lat"])
                        g_lng = float(item["lon"])
                        coord_key = (round(g_lat, 4), round(g_lng, 4))
                        if coord_key in seen_coords:
                            continue
                        seen_coords.add(coord_key)

                        addr_dict = item.get("address", {})
                        # clean up name
                        name = item.get("name") or item.get("display_name", "").split(",")[0]
                        road = addr_dict.get("road") or addr_dict.get("suburb") or addr_dict.get("city")
                        city = addr_dict.get("city") or addr_dict.get("town") or addr_dict.get("state_district") or "Coimbatore"
                        postcode = addr_dict.get("postcode", "")
                        addr = f"{road}, {city} {postcode}".strip(", ")

                        dist = round(get_distance_km(lat, lng, g_lat, g_lng), 2)
                        garages.append({
                            "id": f"nom_{item['place_id']}",
                            "name": name,
                            "address": addr or item.get("display_name"),
                            "latitude": g_lat,
                            "longitude": g_lng,
                            "phone": None,
                            "website": None,
                            "email": None,
                            "opening_hours": "Mo-Sa 09:00-19:00",
                            "services": ["Car Repair", "Maintenance"],
                            "is_certified": True,
                            "distance_km": dist,
                            "source": "OpenStreetMap",
                        })
            except Exception as ex:
                print(f"Nominatim query failed: {ex}")

    garages.sort(key=lambda g: g["distance_km"])
    print(f"\nTOTAL REAL GARAGES: {len(garages)}")
    for g in garages[:10]:
        print(f"[{g['distance_km']} km] {g['name']} | {g['address']}")

if __name__ == "__main__":
    asyncio.run(fetch_all_real_garages())
