"""
PortFlow AI — Synthetic Historical Data Generator
Generates realistic multi-zone operational, meteorological, and nautical telemetry for Port of Arjuna.
"""

import numpy as np
import pandas as pd
from pathlib import Path

ZONES = ["A", "B", "C", "D", "E", "F"]

ZONE_PROFILES = {
    "A": {"vessel_base": 8, "vessel_std": 3, "avg_draft": 14.5, "yard_base": 0.40, "crane_base": 0.35},
    "B": {"vessel_base": 12, "vessel_std": 4, "avg_draft": 13.0, "yard_base": 0.75, "crane_base": 0.80},
    "C": {"vessel_base": 6, "vessel_std": 2, "avg_draft": 10.5, "yard_base": 0.55, "crane_base": 0.50},
    "D": {"vessel_base": 4, "vessel_std": 1.5, "avg_draft": 15.0, "yard_base": 0.50, "crane_base": 0.30},
    "E": {"vessel_base": 7, "vessel_std": 2.5, "avg_draft": 11.0, "yard_base": 0.45, "crane_base": 0.20},
    "F": {"vessel_base": 5, "vessel_std": 2, "avg_draft": 9.5, "yard_base": 0.35, "crane_base": 0.15},
}


def calculate_target_congestion(row: pd.Series) -> float:
    """Calculates deterministic ground-truth congestion with meteorological & nautical penalties."""
    yard_impact = row["yard_occupancy_pct"] * 38.0
    crane_impact = row["quay_crane_utilization"] * 28.0
    vessel_impact = min(25.0, row["vessel_count"] * 2.2)

    # Weather penalties
    wind_penalty = max(0.0, (row["weather_wind_knots"] - 20.0) * 1.25)
    vis_penalty = max(0.0, (5.0 - row["weather_visibility_nm"]) * 2.8)

    # Tide penalty (low water restricts fairway throughput)
    tide_penalty = 12.0 if row["tide_height_m"] < 2.0 else 0.0

    score = yard_impact + crane_impact + vessel_impact + wind_penalty + vis_penalty + tide_penalty
    # Add minor measurement stochasticity
    noise = np.random.normal(0, 1.8)
    return float(np.clip(score + noise, 5.0, 99.0))


def generate_synthetic_data(num_samples: int = 2400, random_state: int = 42) -> pd.DataFrame:
    """Generates synthetic dataset for training and validation."""
    np.random.seed(random_state)
    records = []

    samples_per_zone = num_samples // len(ZONES)

    for zone in ZONES:
        prof = ZONE_PROFILES[zone]
        for _ in range(samples_per_zone):
            hour = int(np.random.randint(0, 24))
            day_of_week = int(np.random.randint(0, 7))

            # Diurnal surge during working hours (06:00 - 20:00)
            is_peak = 1 if 6 <= hour <= 20 else 0
            vessel_cnt = max(1, int(np.round(np.random.normal(prof["vessel_base"] + (2 if is_peak else -1), prof["vessel_std"]))))
            avg_draft = float(np.clip(np.random.normal(prof["avg_draft"], 1.2), 6.5, 16.5))

            # Weather
            wind = float(np.clip(np.random.gamma(shape=3.5, scale=4.0), 2.0, 48.0))
            vis = float(np.clip(np.random.normal(7.5, 2.2), 0.8, 12.0))
            tide = float(np.clip(np.random.normal(3.2, 1.1), 0.9, 5.4))

            # Operational utilization
            yard_occ = float(np.clip(np.random.normal(prof["yard_base"] + (0.1 if is_peak else -0.05), 0.12), 0.1, 0.98))
            crane_util = float(np.clip(np.random.normal(prof["crane_base"] + (0.15 if is_peak else -0.1), 0.14), 0.05, 0.99))

            row = {
                "zone_id": zone,
                "hour_of_day": hour,
                "day_of_week": day_of_week,
                "vessel_count": vessel_cnt,
                "avg_draft_m": round(avg_draft, 2),
                "weather_wind_knots": round(wind, 1),
                "weather_visibility_nm": round(vis, 1),
                "tide_height_m": round(tide, 2),
                "quay_crane_utilization": round(crane_util, 3),
                "yard_occupancy_pct": round(yard_occ, 3),
            }
            row["congestion_index"] = round(calculate_target_congestion(pd.Series(row)), 2)
            records.append(row)

    df = pd.DataFrame(records)
    return df


if __name__ == "__main__":
    out_dir = Path(__file__).resolve().parent / "data"
    out_dir.mkdir(parents=True, exist_ok=True)
    csv_path = out_dir / "synthetic_port_congestion.csv"
    data = generate_synthetic_data(2400)
    data.to_csv(csv_path, index=False)
    print(f"Generated {len(data)} synthetic records at {csv_path}")
