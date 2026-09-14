"""
PortFlow AI — 72-Hour Operations Planner (Contract B)
Generates 12 discrete 6-hour operational horizons across all 6 port zones,
synthesizing ML congestion forecasts with discrete berth & crane scheduling recommendations.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Callable
import math

try:
    from ..ml.predict import predict_congestion
except (ImportError, ValueError):
    try:
        from src.ml.predict import predict_congestion
    except (ImportError, ValueError):
        predict_congestion = None


ZONES = ["A", "B", "C", "D", "E", "F"]


def calculate_semi_diurnal_tide(hour_offset: int) -> float:
    """Semi-diurnal tide simulation (12.4 hour lunar cycle, range 1.2m to 5.2m)."""
    period = 12.4
    phase = (hour_offset % period) / period * 2 * math.pi
    height = 3.2 + 1.8 * math.sin(phase)
    return round(float(height), 2)


def generate_horizon_slice(
    slice_index: int,
    base_time: datetime,
    predict_fn: Optional[Callable[[List[Dict[str, Any]]], List[Dict[str, Any]]]] = None,
) -> Dict[str, Any]:
    """Computes operational state and congestion predictions for a 6-hour window."""
    offset_hours = slice_index * 6
    slice_time = base_time + timedelta(hours=offset_hours)
    tide_height = calculate_semi_diurnal_tide(offset_hours)

    # Realistic diurnal patterns
    hour = slice_time.hour
    is_busy = 1 if 6 <= hour <= 18 else 0

    zone_telemetry = []
    for z in ZONES:
        if z == "B":
            v_cnt = 10 + is_busy * 3 + (slice_index % 3)
            yard = min(0.96, 0.72 + (slice_index * 0.015) % 0.22)
            crane = 0.85 if is_busy else 0.55
            draft = 14.2
        elif z == "A":
            v_cnt = 6 + is_busy * 2
            yard = 0.40
            crane = 0.30
            draft = 15.0
        elif z == "C":
            v_cnt = 5 + is_busy * 2
            yard = 0.60
            crane = 0.65
            draft = 10.5
        elif z == "D":
            v_cnt = 3 + (slice_index % 2)
            yard = 0.50
            crane = 0.35
            draft = 14.8
        elif z == "E":
            v_cnt = 5
            yard = 0.45
            crane = 0.40
            draft = 11.2
        else:  # F
            v_cnt = 4
            yard = 0.35
            crane = 0.25
            draft = 9.2

        wind = round(14.0 + 6.0 * math.sin(slice_index * 0.6), 1)
        vis = round(8.0 - 2.0 * math.cos(slice_index * 0.4), 1)

        zone_telemetry.append({
            "zone_id": z,
            "hour_of_day": hour,
            "day_of_week": slice_time.weekday(),
            "vessel_count": v_cnt,
            "avg_draft_m": draft,
            "weather_wind_knots": max(5.0, wind),
            "weather_visibility_nm": max(1.5, vis),
            "tide_height_m": tide_height,
            "quay_crane_utilization": crane,
            "yard_occupancy_pct": yard,
        })

    # Predict congestion
    if predict_fn:
        preds = predict_fn(zone_telemetry)
    elif predict_congestion:
        preds = predict_congestion(zone_telemetry)
    else:
        # Internal rule fallback
        preds = [
            {
                "zone_id": row["zone_id"],
                "predicted_congestion_index": round(row["yard_occupancy_pct"] * 50 + row["quay_crane_utilization"] * 30 + row["vessel_count"] * 1.5, 1),
                "risk_level": "medium",
                "bottleneck_factors": ["Operational Flow Normal"],
            }
            for row in zone_telemetry
        ]

    # Combine
    zone_details = {}
    max_score = 0.0
    critical_zone = "B"
    for p, row in zip(preds, zone_telemetry):
        z_id = p["zone_id"]
        score = p["predicted_congestion_index"]
        if score > max_score:
            max_score = score
            critical_zone = z_id
        zone_details[z_id] = {
            **p,
            "vessel_count": row["vessel_count"],
            "yard_occupancy_pct": row["yard_occupancy_pct"],
            "crane_utilization": row["quay_crane_utilization"],
        }

    # Actionable operational recommendation
    recommendations = []
    if max_score >= 80.0:
        recommendations.append(f"Deploy reserve crane gang to Zone {critical_zone} (congestion index {max_score})")
        recommendations.append("Enforce 4-hour dwell gate cap on dry container stacks")
    elif max_score >= 65.0:
        recommendations.append(f"Monitor Zone {critical_zone} vessel ingress; buffer berths B02/B03")
    else:
        recommendations.append("Operations within nominal terminal throughput thresholds")

    if tide_height < 2.0:
        recommendations.append(f"Low tide window ({tide_height}m); pause >14m draft transits in Approach Channel")

    return {
        "slice_index": slice_index,
        "horizon_label": f"T+{offset_hours}h",
        "timestamp_utc": slice_time.isoformat(),
        "tide_height_m": tide_height,
        "primary_bottleneck_zone": critical_zone,
        "peak_congestion_index": max_score,
        "overall_status": "critical" if max_score >= 85 else ("high" if max_score >= 65 else "normal"),
        "zone_predictions": zone_details,
        "recommended_actions": recommendations,
    }


def generate_72h_plan(
    base_time_iso: Optional[str] = None,
    predict_fn: Optional[Callable] = None,
) -> Dict[str, Any]:
    """Generates the full 72-hour operational outlook (12 slices of 6h each)."""
    base_time = datetime.fromisoformat(base_time_iso.replace("Z", "+00:00")) if base_time_iso else datetime.utcnow()
    slices = [generate_horizon_slice(i, base_time, predict_fn) for i in range(12)]

    avg_port_congestion = round(sum(s["peak_congestion_index"] for s in slices) / len(slices), 1)
    high_risk_slices = [s["horizon_label"] for s in slices if s["overall_status"] in ["high", "critical"]]

    return {
        "generated_at": base_time.isoformat(),
        "horizon_hours": 72,
        "slice_interval_hours": 6,
        "total_slices": len(slices),
        "average_peak_congestion": avg_port_congestion,
        "high_risk_horizons": high_risk_slices,
        "slices": slices,
    }


if __name__ == "__main__":
    plan = generate_72h_plan()
    print("72h Plan generated with", len(plan["slices"]), "slices. High risk windows:", plan["high_risk_horizons"])
