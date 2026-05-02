import requests
import json

lat=19.0760; lon=72.8777 # Mumbai
city_res = requests.get(f"https://nominatim.openstreetmap.org/reverse?lon={lon}&lat={lat}&format=json").json()
city = city_res.get('address', {}).get('state_district', 'Mumbai')
print("CITY:", city)

url = f"https://nominatim.openstreetmap.org/search?q=fertilizer+in+{city}&format=json&addressdetails=1&extratags=1"
headers = {'User-Agent': 'AgriTechApp/1.0'}
res = requests.get(url, headers=headers).json()
print("RES:", len(res))
if res:
    print("Example:", json.dumps(res[0], indent=2))
