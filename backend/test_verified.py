import sys
sys.path.insert(0, '.')
from app import app as flask_app

with flask_app.test_client() as c:
    # Test Chennai - fertilizer
    r = c.get('/api/nearby-resources?lat=13.087&lon=80.278&category=fertilizer&name=Chennai')
    data = r.get_json()
    print(f'Chennai fertilizer: {len(data)} results')
    for s in data[:3]:
        print(f'  - {s["name"]} | {s["address"][:55]} | {s["distance"]}')

    print()

    # Test Delhi - mandi
    r2 = c.get('/api/nearby-resources?lat=28.613&lon=77.209&category=mandi&name=Delhi')
    data2 = r2.get_json()
    print(f'Delhi mandi: {len(data2)} results')
    for s in data2[:3]:
        print(f'  - {s["name"]} | {s["address"][:55]} | {s["distance"]}')

    print()

    # Test Bangalore - seeds
    r3 = c.get('/api/nearby-resources?lat=12.971&lon=77.594&category=seeds&name=Bengaluru')
    data3 = r3.get_json()
    print(f'Bangalore seeds: {len(data3)} results')
    for s in data3[:3]:
        print(f'  - {s["name"]} | {s["address"][:55]} | {s["distance"]}')
