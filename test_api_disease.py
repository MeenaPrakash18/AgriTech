import requests
import numpy as np
from PIL import Image
import io

# Create a dummy image (e.g., all green for healthy leaf)
img = Image.new('RGB', (224, 224), color = (0, 128, 0))
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='PNG')
img_byte_arr.seek(0)

# Send request
url = 'http://localhost:5000/api/detect-disease'
files = {'image': ('dummy.png', img_byte_arr, 'image/png')}
response = requests.post(url, files=files)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
