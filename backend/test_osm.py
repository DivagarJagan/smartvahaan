import asyncio
import httpx
import time

async def main():
    lat = 11.0168  # Coimbatore (from the user screenshot!)
    lng = 76.9558
    radius_m = 10000

    q = f"""[out:json][timeout:15];
(
  node["amenity"="car_repair"](around:{radius_m},{lat},{lng});
  node["shop"="car_repair"](around:{radius_m},{lat},{lng});
  node["amenity"="car_wash"](around:{radius_m},{lat},{lng});
  node["shop"="tyres"](around:{radius_m},{lat},{lng});
  way["amenity"="car_repair"](around:{radius_m},{lat},{lng});
  way["shop"="car_repair"](around:{radius_m},{lat},{lng});
);
out center 30;"""

    endpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass.private.coffee/api/interpreter",
    ]

    headers = {
        "User-Agent": "SmartVahaan/1.0 (contact: support@smartvahan.app)"
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        for ep in endpoints:
            t0 = time.time()
            try:
                print(f"Trying {ep}...")
                resp = await client.post(ep, data={"data": q}, headers=headers)
                dt = time.time() - t0
                print(f"{ep}: status {resp.status_code} in {dt:.2f}s")
                if resp.status_code == 200:
                    data = resp.json()
                    elements = data.get("elements", [])
                    print(f"Found {len(elements)} elements!")
                    for el in elements[:5]:
                        tags = el.get("tags", {})
                        name = tags.get("name") or tags.get("operator") or tags.get("brand")
                        print(" -", name, tags.get("shop") or tags.get("amenity"), el.get("lat") or el.get("center", {}).get("lat"))
                    return
            except Exception as e:
                print(f"{ep} failed ({time.time()-t0:.2f}s): {type(e).__name__} {e}")

if __name__ == "__main__":
    asyncio.run(main())
