import app
from app import app as flask_app

with flask_app.test_client() as c:
    response = c.get('/api/nearby-resources?lat=28.6139&lon=77.2090&category=fertilizer')
    print(response.json)
