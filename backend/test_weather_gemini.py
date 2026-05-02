import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("No API Key")
    exit()

genai.configure(api_key=api_key)

# Test if we can use the search capability
model = genai.GenerativeModel('gemini-2.5-pro')

def get_weather(location):
    prompt = f"Using Google Search, find the current real-time weather and 7-day forecast for {location}. Provide: current temperature, humidity, wind speed, precipitation, and a 7-day daily forecast (max/min/condition). Return the result as a RAW JSON object with this structure: {{'current': {{'temp': 0, 'humidity': 0, 'wind': 0, 'rain': 0, 'desc': ''}}, 'forecast': [{{'day': '', 'max': 0, 'min': 0, 'condition': ''}}]}}. DO NOT use markdown blocks."
    
    try:
        response = model.generate_content(prompt)
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")

get_weather("Chennai")
