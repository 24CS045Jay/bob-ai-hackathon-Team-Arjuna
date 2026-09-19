"""
PortFlow AI — Route Risk Classification Service
Inference wrapper for RandomForest route risk classifier.
"""

from pathlib import Path
from typing import Dict, Any
import numpy as np
import joblib

MODEL_PATH = Path(__file__).resolve().parent / "models" / "risk_model.pkl"

_MODEL = None


def get_risk_model():
    global _MODEL
    if _MODEL is None and MODEL_PATH.exists():
        _MODEL = joblib.load(MODEL_PATH)
    return _MODEL


def predict_route_risk(
    wind_speed_knots: float,
    wave_height_m: float,
    sog: float = 15.0,
    draught: float = 12.0,
    distance_remaining_nm: float = 200.0,
) -> Dict[str, Any]:
    """
    Predicts route risk: LOW, MEDIUM, or HIGH with class probability.
    """
    model = get_risk_model()

    if model is None:
        # Rule-based safety thresholds
        if wave_height_m >= 3.0 or wind_speed_knots >= 28.0:
            level = "HIGH"
            prob = 0.88
        elif wave_height_m >= 2.0 or wind_speed_knots >= 20.0:
            level = "MEDIUM"
            prob = 0.65
        else:
            level = "LOW"
            prob = 0.90

        return {
            "risk_level": level,
            "risk_probability": prob,
            "model_used": "Rule-Threshold Fallback",
            "contributing_factors": [
                f"Wave Height: {wave_height_m}m",
                f"Wind Speed: {wind_speed_knots} kts"
            ]
        }

    import pandas as pd
    features = pd.DataFrame([{
        "wind_speed_knots": wind_speed_knots,
        "wave_height_m": wave_height_m,
        "sog": sog,
        "draught": draught,
        "distance_remaining_nm": distance_remaining_nm,
    }])

    pred_class = model.predict(features)[0]
    probs = model.predict_proba(features)[0]
    class_idx = list(model.classes_).index(pred_class)
    confidence = float(probs[class_idx])

    factors = []
    if wind_speed_knots >= 25.0:
        factors.append(f"Severe gale wind ({wind_speed_knots} kts)")
    if wave_height_m >= 2.5:
        factors.append(f"Heavy swell waves ({wave_height_m}m)")
    if sog < 10.0:
        factors.append("Speed retardation along fairway")

    if not factors:
        factors.append("Nominal maritime sea state")

    return {
        "risk_level": str(pred_class),
        "risk_probability": round(confidence, 3),
        "model_used": "RandomForestClassifier-v2",
        "contributing_factors": factors,
    }
