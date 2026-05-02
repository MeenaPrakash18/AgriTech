import requests
import json
headers = {'User-Agent': 'AgriTechApp/1.0 (hello@example.com)'}
url = "https://nominatim.openstreetmap.org/search?q=fertilizer+in+Chennai&format=json&limit=5"
res = requests.get(url, headers=headers)
print(res.status_code)
print(json.dumps(res.json(), indent=2))
