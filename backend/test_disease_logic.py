import os
import json

# Mock remedies_data for testing logic
with open('backend/remedies.json', 'r') as f:
    remedies_data = json.load(f)

def test_matching(disease_name):
    # Logic from app.py
    # 1. Try Exact Match
    d_info = remedies_data.get(disease_name)
    
    # 2. Try Fuzzy Match
    if not d_info:
        search_key = disease_name.lower().replace(" ", "_")
        for key, info in remedies_data.items():
            key_clean = key.lower().replace(" ", "_")
            if key_clean in search_key or search_key in key_clean:
                d_info = info
                break
                
    if not d_info:
        return f"MISSING: {disease_name}"
    
    return f"MATCHED: {disease_name} -> {list(d_info.keys())[:3]}"

test_cases = [
    "Early Blight",
    "Tomato___Early_blight",
    "Apple___Apple_scab",
    "Healthy Leaf",
    "Tomato___healthy",
    "Tomato___Late_blight",
    "Corn___Common_rust"
]

print("--- Testing Disease Matching Logic ---")
for tc in test_cases:
    print(test_matching(tc))
