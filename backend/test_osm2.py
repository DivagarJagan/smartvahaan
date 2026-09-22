import asyncio
import httpx
import time

async def test_bbox():
    lat = 11.0168
    lng = 76.9558
    d = 0.09 # ~10km
    s, w, n, e = lat - d, lng - d, lat + d, lng + d

    # Bounding box is indexed in Overpass!
    q = f"""[out:json][timeout:10];
(
  node["amenity"="car_repair"]({s},{w},{n},{e});
  node["shop"="car_repair"]({s},{w},{n},{e});
);
out 25;"""

    print("--- Testing BBOX Overpass ---")
    headers = {"User-Agent": "SmartVahaanApp/1.0 (test@smartvahan.app)"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        for ep in ["https://overpass-api.de/api/interpreter", "https://lz4.overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]:
            t0 = time.time()
            try:
                resp = await client.post(ep, data={"data": q}, headers=headers)
                print(f"{ep}: status {resp.status_code} in {time.time()-t0:.2f}s")
                if resp.status_code == 200:
                    elements = resp.json().get("elements", [])
                    print(f"BBOX returned {len(elements)} elements!")
                    for el in elements[:5]:
                        print(" ->", el.get("tags", {}).get("name"), el.get("lat"), el.get("lon"))
                    return
            except Exception as ex:
                print(f"{ep} error: {ex}")

async def test_nominatim():
    print("\n--- Testing Nominatim Search ---")
    headers = {"User-Agent": "SmartVahaanApp/1.0 (test@smartvahan.app)"}
    # Nominatim query: car repair near Coimbatore or viewbox
    lat = 11.0168
    lng = 76.9558
    d = 0.1
    viewbox = f"{lng-d},{lat+d},{lng+d},{lat-d}"
    url = f"https://nominatim.openstreetmap.org/search?q=car+repair&format=json&viewbox={viewbox}&bounded=1&limit=20&addressdetails=1"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            t0 = time.time()
            resp = await client.get(url, headers=headers)
            print(f"Nominatim: status {resp.status_code} in {time.time()-t0:.2f}s")
            if resp.status_code == 200:
                results = resp.json()
                print(f"Nominatim returned {len(results)} items!")
                for r in results[:5]:
                    print(" ->", r.get("display_name"), r.get("lat"), r.get("lon"))
        except Exception as ex:
            print("Nominatim error:", ex)

async def test_photon():
    print("\n--- Testing Photon Search ---")
    # Photon by Komoot (free, fast OSM search index)
    url = f"https://photon.komoot.io/api/?q=car+repair&lat=11.0168&lon=76.9558&limit=15"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            t0 = time.time()
            resp = await client.get(url)
            print(f"Photon: status {resp.status_code} in {time.time()-t0:.2f}s")
            if resp.status_code == 200:
                features = resp.json().get("features", [])
                print(f"Photon returned {len(features)} items!")
                for f in features[:5]:
                    props = f.get("properties", {})
                    coords = f.get("geometry", {}).get("coordinates", [])
                    print(" ->", props.get("name"), props.get("street"), props.get("city"), coords)
        except Exception as ex:
            print("Photon error:", ex)

async def run():
    await test_bbox()
    await test_nominatim()
    await test_photon()

if __name__ == "__main__":
    asyncio.run(run())
