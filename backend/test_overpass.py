import requests, json
def test_osm(lat, lon):
    radius = 50000
    queries = [
        f'[out:json]; node["shop"~"agrarian|seeds|fertilizer|livestock"](around:{radius},{lat},{lon}); out center;',
        f'[out:json]; node["amenity"="marketplace"](around:{radius},{lat},{lon}); out center;',
        f'[out:json]; node["building"="warehouse"](around:{radius},{lat},{lon}); out center;',
        f'[out:json]; node["name"~"Agriculture|Krishi|Agro|Kisan|Seed|Fertilizer"i](around:{radius},{lat},{lon}); out center;'
    ]
    for q in queries:
        try:
            r = requests.post("https://overpass-api.de/api/interpreter", data=q)
            res = r.json().get('elements', [])
            print(f"Query: {q[:30]}... Found: {len(res)}")
        except Exception as e:
            print(f"Error on {q}: {e}")

test_osm(28.6139, 77.2090) # Delhi
test_osm(12.9716, 77.5946) # Bangalore
