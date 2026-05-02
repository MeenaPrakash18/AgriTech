import requests, re
import urllib3
urllib3.disable_warnings()
js_content = requests.get('https://agmarknet.gov.in/static/js/main.16f19e44.js', verify=False).text
apis = set(re.findall(r'https?://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(?::\d+)?(?:/[a-zA-Z0-9\-\._~:\?#\[\]@!\$&\'\(\)\*\+,;=]*)?', js_content))
for api in apis:
    if 'api' in api.lower() or 'agmarknet' in api.lower() or 'data' in api.lower() or 'nic' in api.lower():
        print(api)
