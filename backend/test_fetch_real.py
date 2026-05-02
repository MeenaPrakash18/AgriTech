import requests
headers = {'User-Agent': 'AgriTechApp/1.0 (hello@example.com)'}

# Attempt 1: Overpass ru
q_ru = '[out:json];node["shop"~"agrarian|seeds"](around:35000,13.087,80.278);out center;'
try:
    r = requests.post("https://overpass.kumi.systems/api/interpreter", data=q_ru, headers=headers, timeout=5)
    print("Kumi", r.status_code, len(r.json().get('elements',[])) if r.status_code==200 else "")
except Exception as e: print("Kumi error", e)

# Attempt 2: Nominatim proper structured
try:
    r = requests.get("https://nominatim.openstreetmap.org/search?q=seeds+in+Chennai&format=json", headers=headers, timeout=5)
    print("Nom", r.status_code, len(r.json()) if r.status_code==200 else "")
except Exception as e: print("Nom error", e)
