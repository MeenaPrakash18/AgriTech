import requests
import json
lat=28.6139; lon=77.2090; radius=20000
query = f'[out:json];node["shop"~"agrarian|seeds"](around:{radius},{lat},{lon});out center;'
res = requests.post("https://overpass-api.de/api/interpreter", data=query).json()
print("SEEDS:", len(res.get('elements',[])))

lat=12.97; lon=77.59
query = f'[out:json];node["shop"~"agrarian|seeds"](around:{radius},{lat},{lon});out center;'
res = requests.post("https://overpass-api.de/api/interpreter", data=query).json()
print("BLR SEEDS:", len(res.get('elements',[])))
