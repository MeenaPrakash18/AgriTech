import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def generate_dataset(n_samples=2000):
    np.random.seed(42)
    
    # Features: Temp, Humidity, Rainfall, WaterAvail(0-2), Season(0-2), SoilType(0-3)
    # Soil: 0:Red, 1:Black, 2:Sandy, 3:Clay
    # Water: 0:Low, 1:Medium, 2:High
    # Season: 0:Kharif, 1:Rabi, 2:Zaid
    
    crops = {
        'Rice': {'temp': (25, 35), 'hum': (70, 90), 'rain': (150, 300), 'soil': [3], 'water': [2], 'season': [0]},
        'Wheat': {'temp': (15, 25), 'hum': (30, 60), 'rain': (50, 100), 'soil': [3, 1], 'water': [1], 'season': [1]},
        'Cotton': {'temp': (20, 35), 'hum': (50, 70), 'rain': (50, 150), 'soil': [1], 'water': [1], 'season': [0]},
        'Maize': {'temp': (18, 27), 'hum': (50, 80), 'rain': (60, 120), 'soil': [2, 1], 'water': [1], 'season': [0, 2]},
        'Tomato': {'temp': (20, 30), 'hum': (60, 80), 'rain': (60, 150), 'soil': [0, 1], 'water': [1], 'season': [0, 2]},
        'Millets': {'temp': (25, 35), 'hum': (30, 50), 'rain': (40, 70), 'soil': [2, 0], 'water': [0], 'season': [0]},
        'Sugarcane': {'temp': (20, 35), 'hum': (60, 80), 'rain': (150, 250), 'soil': [1, 3], 'water': [2], 'season': [0]},
        'Soybean': {'temp': (20, 30), 'hum': (60, 75), 'rain': (60, 100), 'soil': [1], 'water': [1], 'season': [0]}
    }
    
    data = []
    crop_names = list(crops.keys())
    
    for _ in range(n_samples):
        # Pick a random crop and generate matching conditions
        crop = np.random.choice(crop_names)
        c_info = crops[crop]
        
        temp = np.random.uniform(*c_info['temp'])
        hum = np.random.uniform(*c_info['hum'])
        rain = np.random.uniform(*c_info['rain'])
        soil = np.random.choice(c_info['soil'])
        water = np.random.choice(c_info['water'])
        season = np.random.choice(c_info['season'])
        
        # Add some noise to make it realistic
        temp += np.random.normal(0, 1)
        hum += np.random.normal(0, 2)
        rain += np.random.normal(0, 5)
        
        data.append([temp, hum, rain, soil, water, season, crop])
        
    df = pd.DataFrame(data, columns=['temperature', 'humidity', 'rainfall', 'soil_type', 'water_availability', 'season', 'label'])
    return df

def train_and_save():
    print("Generating synthetic dataset...")
    df = generate_dataset(5000)
    
    X = df.drop('label', axis=1)
    y = df['label']
    
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Model Accuracy: {accuracy:.4f}")
    
    # Save model, encoder and feature names
    model_path = os.path.join(os.path.dirname(__file__), 'crop_model.joblib')
    encoder_path = os.path.join(os.path.dirname(__file__), 'label_encoder.joblib')
    
    joblib.dump(model, model_path)
    joblib.dump(le, encoder_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_and_save()
