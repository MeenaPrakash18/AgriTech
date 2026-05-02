import requests
from bs4 import BeautifulSoup
import json
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
url = "https://html.duckduckgo.com/html/?q=fertilizer+shop+chennai+address+phone"
res = requests.get(url, headers=headers)
soup = BeautifulSoup(res.text, 'html.parser')
results = []
for a in soup.find_all('a', class_='result__snippet', limit=5):
    results.append(a.text)
print(json.dumps(results, indent=2))
