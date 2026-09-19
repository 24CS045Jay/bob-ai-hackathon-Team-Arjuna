"""
PortFlow AI — ETA Prediction Service
Inference wrapper for RandomForest ETA regression model.
"""

from pathlib import Path
from typing import Dict, Any
import numpy as np
import joblib

MODEL_PATH = Path(__file__).resolve().parent / "models" / "eta_model.pkl"

_MODEL = None


def get_eta_model():
    global _MODEL
    if _MODEL is None and MODEL_PATH.exists():
        _MODEL = joblib.load(MODEL_PATH)
    return _MODEL


def predict_vessel_eta(
    distance_remaining_nm: float,
    sog: float,
    avg_speed: float = None,
    draught: float = 12.0,
    wind_speed_knots: float = 15.0,
    wave_height_m: float = 1.5,
) -> Dict[str, Any]:
    """
    Predicts vessel transit ETA in minutes and hours.
    """
    if avg_speed is None:
        avg_speed = max(sog, 1.0)
    model = get_eta_model()

    if model is None or sog <= 0.1:
        # Physics baseline fallback
        effective_speed = max(5.0, avg_speed if avg_speed > 0 else (sog if sog > 0 else 12.0))
        # Weather retardation penalty: 1.5% speed reduction per 5 knots of wind over 15
        weather_penalty = 1.0 + (max(0.0, wind_speed_knots - 15.0) / 100.0)
        hours = (distance_remaining_nm / effective_speed) * weather_penalty
        return {
            "eta_hours": round(float(hours), 2),
            "eta_minutes": int(round(hours * 60)),
            "confidence": 0.85,
            "model_used": "Physics-Hydrodynamic Fallback",
        }

    import pandas as pd
    features = pd.DataFrame([{
        "distance_remaining_nm": distance_remaining_nm,
        "sog": sog,
        "avg_speed": avg_speed,
        "draught": draught,
        "wind_speed_knots": wind_speed_knots,
        "wave_height_m": wave_height_m,
    }])

    pred_hours = float(model.predict(features)[0])
    pred_hours = max(0.5, pred_hours)

    return {
        "eta_hours": round(pred_hours, 2),
        "eta_minutes": int(round(pred_hours * 60)),
        "confidence": 0.92,
        "model_used": "RandomForestRegressor-v2",
    }
