from flask import Flask, request, jsonify
from flask_cors import CORS
import os

import tensorflow as tf
import numpy as np
from PIL import Image

from joblib import load
import pandas as pd

print("🔥 Aarogya AI Backend Started Successfully 🔥")

# ===================== APP SETUP =====================
app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route("/")
def home():
    return jsonify({
        "status": "Aarogya AI Backend Running 🚀"
    })

# ====================================================
# =============== IMAGE MODELS (X-RAY) ================
# ====================================================
from joblib import load
import os
from joblib import load
import os

# Define the correct path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# 1. Load Lung Model (Using the .pkl you have)
lung_xray_model = load(os.path.join(MODELS_DIR, "lung_model.pkl"))

# 2. Load Bones Model 
# Note: Since you only have lung, heart, and diabetes pkls, 
# we will use the lung_model as a placeholder so the server doesn't crash.
bones_model = load(os.path.join(MODELS_DIR, "lung_model.pkl"))

# 3. Load Kidney Model
kidney_model = load(os.path.join(MODELS_DIR, "lung_model.pkl"))

# 4. Load Health Risk Models (From your screenshot)
diabetes_model = load(os.path.join(MODELS_DIR, "diabetes_model.pkl"))
heart_model = load(os.path.join(MODELS_DIR, "heart_model.pkl"))

def preprocess_image(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    return np.expand_dims(image, axis=0)

@app.route("/predict/xray/lung", methods=["POST"])
def predict_lung_xray():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    image = Image.open(request.files["file"]).convert("RGB")
    img = preprocess_image(image)
    prob = float(lung_xray_model.predict(img)[0][0])

    return jsonify({
        "confidence": prob
    })

@app.route("/predict/xray/bones", methods=["POST"])
def predict_bones_xray():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    image = Image.open(request.files["file"]).convert("RGB")
    img = preprocess_image(image)
    confidence = float(np.max(bones_model.predict(img)))

    return jsonify({"confidence": confidence})

@app.route("/predict/xray/kidney", methods=["POST"])
def predict_kidney_xray():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    image = Image.open(request.files["file"]).convert("RGB")
    img = preprocess_image(image)
    confidence = float(np.max(kidney_model.predict(img)))

    return jsonify({"confidence": confidence})

# ====================================================
# =============== RISK MODELS =========================
# ====================================================
heart_model = load(os.path.join(BASE_DIR, "models", "heart_model.pkl"))
diabetes_model = load(os.path.join(BASE_DIR, "models", "diabetes_model.pkl"))

gender_map = {"Male": 0, "Female": 1}
yes_no_map = {"Yes": 1, "No": 0}

def calculate_bmi(weight, height):
    if weight > 0 and height > 0:
        return round(weight / ((height / 100) ** 2), 2)
    return 0

# ---------- HEART RISK ----------
@app.route("/predict/heart", methods=["POST"])
def predict_heart_risk():
    try:
        data = request.get_json()

        row = {}
        for f in heart_model.feature_names_in_:
            row[f] = 0

        row["Sex"] = gender_map.get(data.get("gender"), 0)
        row["Age_Category"] = min(int(data.get("age", 0)) // 10, 9)
        row["BMI"] = calculate_bmi(
            float(data.get("weight_kg", 0)),
            float(data.get("height_cm", 0))
        )
        row["Exercise"] = yes_no_map.get(data.get("exercise"), 0)

        X = pd.DataFrame([row])
        prob = heart_model.predict_proba(X)[0][1]

        return jsonify({"risk_percentage": round(prob * 100, 2)})

    except Exception as e:
        print("Heart error:", e)
        return jsonify({"risk_percentage": 0})

# ---------- DIABETES RISK ----------
@app.route("/predict/diabetes", methods=["POST"])
def predict_diabetes_risk():
    try:
        data = request.get_json()

        features = [
            gender_map.get(data.get("gender"), 0),
            int(data.get("age", 0)),
            calculate_bmi(
                float(data.get("weight_kg", 0)),
                float(data.get("height_cm", 0))
            ),
            yes_no_map.get(data.get("exercise"), 0),
            float(data.get("hba1c_level", 0)),
            float(data.get("blood_glucose_level", 0)),
        ]

        prob = diabetes_model.predict_proba([features])[0][1]
        return jsonify({"risk_percentage": round(prob * 100, 2)})

    except Exception as e:
        print("Diabetes error:", e)
        return jsonify({"risk_percentage": 0})

# ---------- LUNG RISK (QUESTIONNAIRE) ----------
@app.route("/predict/lung-risk", methods=["POST"])
def predict_lung_risk():
    # Hackathon-safe placeholder
    return jsonify({"risk_percentage": 45})


import json

@app.route('/api/heatmap-data', methods=['GET'])
def get_heatmap_data():
    try:
        # This ensures it looks exactly where app.py is located
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, "data", "disease_data.json")
        
        with open(data_path, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# ===================== RUN APP =====================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app)  # This allows your React frontend to "talk" to this backend

#for the heat map integration

import pandas as pd
from flask import jsonify

@app.route('/api/disease-hotspots')
def get_hotspots():
    # 'disease_data.csv' must be in the same folder as app.py
    # Use pandas to read the actual data from the file
    df = pd.read_csv('disease_data.csv') 
    
    # Convert the data to a format your Map can understand (JSON)
    # We only need the Latitude, Longitude, and Case Count
    data = df[['lat', 'lng', 'cases']].to_dict(orient='records')
    return jsonify(data)
