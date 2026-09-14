"""
PortFlow AI — Prediction Inference Engine (Contract A)
Evaluates incoming zone telemetry and returns congestion indices, risk tiers, and bottleneck factors.
Includes graceful fallback if model artifact is not yet compiled.
"""

import sys
from pathlib import Path
from typing import List, Dict, Any
import joblib
import numpy as np

# Ensure feature_engineering (in the same ml/ directory) is importable
# when this module is loaded from any working directory.
_ML_DIR = Path(__file__).resolve().parent
if str(_ML_DIR) not in sys.path:
    sys.path.insert(0, str(_ML_DIR))

MODEL_PATH = Path(__file__).resolve().parent / "models" / "congestion_model.pkl"
_CACHED_BUNDLE = None


def get_risk_level(score: float) -> str:
    """Maps continuous congestion index to 4-tier operational risk classification."""
    if score < 35.0:
        return "low"
    elif score < 65.0:
        return "medium"
    elif score < 85.0:
        return "high"
    return "critical"


def identify_bottleneck_factors(row: Dict[str, Any]) -> List[str]:
    """Identifies primary contributing factors to terminal congestion."""
    factors = []
    if row.get("yard_occupancy_pct", 0) > 0.80:
        factors.append(f"High Yard Occupancy ({int(row['yard_occupancy_pct'] * 100)}%)")
    if row.get("quay_crane_utilization", 0) > 0.82:
        factors.append(f"Crane Saturation ({int(row['quay_crane_utilization'] * 100)}% active)")
    if row.get("vessel_count", 0) >= 10:
        factors.append(f"Vessel Cluster ({row['vessel_count']} vessels queued)")
    if row.get("weather_wind_knots", 0) >= 25.0:
        factors.append(f"Wind Advisory ({row['weather_wind_knots']} kn gusting)")
    if row.get("weather_visibility_nm", 10.0) < 3.0:
        factors.append(f"Restricted Visibility ({row['weather_visibility_nm']} nm)")
    if row.get("tide_height_m", 3.0) < 2.0:
        factors.append(f"Low Water Fairway Constraint ({row['tide_height_m']}m)")

    if not factors:
        factors.append("Nominal Terminal Operations")
    return factors


def rule_based_fallback(row: Dict[str, Any]) -> float:
    """Deterministic formula fallback if model bundle is unavailable."""
    yard = float(row.get("yard_occupancy_pct", 0.5)) * 38.0
    cranes = float(row.get("quay_crane_utilization", 0.5)) * 28.0
    vessels = min(25.0, float(row.get("vessel_count", 5)) * 2.2)
    wind_pen = max(0.0, (float(row.get("weather_wind_knots", 10.0)) - 20.0) * 1.25)
    vis_pen = max(0.0, (5.0 - float(row.get("weather_visibility_nm", 7.0))) * 2.8)
    tide_pen = 12.0 if float(row.get("tide_height_m", 3.0)) < 2.0 else 0.0
    score = yard + cranes + vessels + wind_pen + vis_pen + tide_pen
    return float(np.clip(score, 5.0, 98.0))


def load_model():
    global _CACHED_BUNDLE
    if _CACHED_BUNDLE is not None:
        return _CACHED_BUNDLE
    if MODEL_PATH.exists():
        try:
            _CACHED_BUNDLE = joblib.load(MODEL_PATH)
            return _CACHED_BUNDLE
        except Exception:
            return None
    return None


def predict_congestion(zone_features: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Contract A Implementation:
    zone_features: list of dicts with:
      zone_id, hour_of_day, day_of_week, vessel_count, avg_draft_m,
      weather_wind_knots, weather_visibility_nm, tide_height_m,
      quay_crane_utilization, yard_occupancy_pct
    returns:
      list of dicts with:
      zone_id, predicted_congestion_index (float 0-100), risk_level ('low'|'medium'|'high'|'critical'),
      bottleneck_factors (list[str]), confidence (float)
    """
    bundle = load_model()
    results = []

    if bundle is not None:
        try:
            pipeline = bundle["pipeline"]
            model = bundle["model"]
            X = pipeline.transform_dict_list(zone_features)
            preds = model.predict(X)
            for i, row in enumerate(zone_features):
                score = round(float(np.clip(preds[i], 0.0, 100.0)), 1)
                results.append({
                    "zone_id": str(row.get("zone_id", "A")).upper(),
                    "predicted_congestion_index": score,
                    "risk_level": get_risk_level(score),
                    "bottleneck_factors": identify_bottleneck_factors(row),
                    "confidence": 0.94,
                    "model_source": "RandomForestRegressor-v1",
                })
            return results
        except Exception:
            # Fall back safely
            pass

    # Rule-based fallback
    for row in zone_features:
        score = round(rule_based_fallback(row), 1)
        results.append({
            "zone_id": str(row.get("zone_id", "A")).upper(),
            "predicted_congestion_index": score,
            "risk_level": get_risk_level(score),
            "bottleneck_factors": identify_bottleneck_factors(row),
            "confidence": 0.82,
            "model_source": "Deterministic-Fallback",
        })
    return results


if __name__ == "__main__":
    sample = [
        {
            "zone_id": "B",
            "hour_of_day": 14,
            "day_of_week": 2,
            "vessel_count": 14,
            "avg_draft_m": 13.5,
            "weather_wind_knots": 28.0,
            "weather_visibility_nm": 4.0,
            "tide_height_m": 1.8,
            "quay_crane_utilization": 0.88,
            "yard_occupancy_pct": 0.82,
        },
        {
            "zone_id": "F",
            "hour_of_day": 2,
            "day_of_week": 2,
            "vessel_count": 3,
            "avg_draft_m": 8.0,
            "weather_wind_knots": 10.0,
            "weather_visibility_nm": 8.0,
            "tide_height_m": 3.5,
            "quay_crane_utilization": 0.20,
            "yard_occupancy_pct": 0.30,
        },
    ]
    out = predict_congestion(sample)
    print("Sample predictions:", out)
