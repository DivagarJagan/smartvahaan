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

async def fetch_real_garages_parallel(lat=11.0168, lng=76.9558, radius_km=10.0):
    deg_lat = radius_km / 111.0
    deg_lng = radius_km / (111.0 * cos(radians(lat)))
    s, w, n, e = lat - deg_lat, lng - deg_lng, lat + deg_lat, lng + deg_lng

    headers = {"User-Agent": "SmartVahaan/2.0 (automotive-repair-search; support@smartvahan.app)"}

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

    async with httpx.AsyncClient(timeout=8.0) as client:
        async def fetch_overpass():
            for ep in ["https://lz4.overpass-api.de/api/interpreter", "https://overpass-api.de/api/interpreter"]:
                try:
                    resp = await client.post(ep, data={"data": q}, headers=headers)
                    if resp.status_code == 200:
                        return resp.json().get("elements", [])
                except Exception as ex:
                    pass
            return []

        async def fetch_nominatim():
            try:
                nom_url = f"https://nominatim.openstreetmap.org/search?q=car+repair&format=json&viewbox={w},{n},{e},{s}&bounded=1&limit=20&addressdetails=1"
                resp = await client.get(nom_url, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
            except Exception as ex:
                pass
            return []

        t0 = time.time()
        overpass_res, nominatim_res = await asyncio.gather(fetch_overpass(), fetch_nominatim())
        print(f"Parallel fetch took {time.time()-t0:.2f}s (Overpass: {len(overpass_res)}, Nominatim: {len(nominatim_res)})")

        garages = []
        seen = set()

        for item in nominatim_res:
            try:
                g_lat = float(item["lat"])
                g_lng = float(item["lon"])
                key = (round(g_lat, 3), round(g_lng, 3))
                if key in seen:
                    continue
                seen.add(key)
                name = item.get("name") or item.get("display_name", "").split(",")[0]
                addr = item.get("display_name", "")
                dist = round(get_distance_km(lat, lng, g_lat, g_lng), 2)
                garages.append({
                    "id": f"nom_{item['place_id']}",
                    "name": name,
                    "address": addr,
                    "latitude": g_lat,
                    "longitude": g_lng,
                    "services": ["Car Repair", "Automotive Service"],
                    "distance_km": dist,
                    "source": "OpenStreetMap",
                })
            except Exception:
                continue

        for el in overpass_res:
            try:
                g_lat = el.get("lat") or (el.get("center") or {}).get("lat")
                g_lng = el.get("lon") or (el.get("center") or {}).get("lon")
                if not g_lat or not g_lng:
                    continue
                key = (round(g_lat, 3), round(g_lng, 3))
                if key in seen:
                    continue
                seen.add(key)

                tags = el.get("tags", {})
                name = tags.get("name") or tags.get("operator") or tags.get("brand")
                if not name:
                    continue # only keep real named businesses
                addr_parts = [tags.get("addr:housenumber"), tags.get("addr:street"), tags.get("addr:suburb"), tags.get("addr:city")]
                addr = ", ".join(p for p in addr_parts if p) or "Coimbatore, Tamil Nadu"
                dist = round(get_distance_km(lat, lng, g_lat, g_lng), 2)
                garages.append({
                    "id": f"osm_{el['id']}",
                    "name": name,
                    "address": addr,
                    "latitude": g_lat,
                    "longitude": g_lng,
                    "services": ["Car Repair", "Maintenance"],
                    "distance_km": dist,
                    "source": "OpenStreetMap",
                })
            except Exception:
                continue

        garages.sort(key=lambda g: g["distance_km"])
        print(f"Total merged named real garages: {len(garages)}")
        for g in garages:
            print(f"- [{g['distance_km']}km] {g['name']} ({g['latitude']}, {g['longitude']}) - {g['address'][:60]}")

if __name__ == "__main__":
    asyncio.run(fetch_real_garages_parallel())
