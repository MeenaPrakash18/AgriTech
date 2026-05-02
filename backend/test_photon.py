import requests
import json
url = "https://photon.komoot.io/api/?q=fertilizer+Delhi&limit=10"
res = requests.get(url).json()
print(json.dumps(res, indent=2))
