import json
from duckduckgo_search import DDGS
results = DDGS().maps("seeds shop near Delhi, India")
print(json.dumps(results[:2], indent=2))
