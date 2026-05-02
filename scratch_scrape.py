import requests
import re
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

r = requests.get('https://agmarknet.gov.in/static/js/main.16f19e44.js', verify=False)
js_content = r.text

urls = re.findall(r'(https?://[^\s\"\'\\]+)', js_content)
api_paths = re.findall(r'(\/api\/[^\s\"\'\\]+)', js_content)

print("URLs found:")
for u in set(urls):
    print(u)
    
print("\nAPI paths found:")
for p in set(api_paths):
    print(p)
