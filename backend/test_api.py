import requests
import os
import json

def test_detect_disease():
    url = "http://localhost:5000/api/detect-disease"
    
    # Path to a dummy image or any existing image in the project
    # I'll use a small empty image for testing confidence fallback
    from PIL import Image
    import io
    
    img = Image.new('RGB', (224, 224), color = (73, 109, 137))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    
    files = {'image': ('test.jpg', img_byte_arr, 'image/jpeg')}
    
    try:
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        print("Response JSON:")
        print(json.dumps(response.json(), indent=2))
        
        data = response.json()
        if 'notSure' in data:
            print("\nSUCCESS: Confidence logic working (Low confidence detected).")
        elif 'organicRemedies' in data and 'preventionTips' in data:
            print("\nSUCCESS: Mandatory fields returned.")
        else:
            print("\nFAILURE: Missing mandatory fields.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_detect_disease()
