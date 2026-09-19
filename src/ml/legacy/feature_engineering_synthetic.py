"""
PortFlow AI — Feature Engineering Pipeline
Prepares tabular operational, nautical, and weather data for Random Forest training and inference.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from typing import Tuple, List, Dict, Any

NUMERIC_FEATURES = [
    "hour_of_day",
    "day_of_week",
    "vessel_count",
    "avg_draft_m",
    "weather_wind_knots",
    "weather_visibility_nm",
    "tide_height_m",
    "quay_crane_utilization",
    "yard_occupancy_pct",
]

ZONE_MAPPING = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5}
REVERSE_ZONE_MAPPING = {v: k for k, v in ZONE_MAPPING.items()}


class PortFeaturePipeline:
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = ["zone_encoded"] + NUMERIC_FEATURES

    def fit(self, df: pd.DataFrame) -> "PortFeaturePipeline":
        df_copy = df.copy()
        df_copy["zone_encoded"] = df_copy["zone_id"].map(lambda z: ZONE_MAPPING.get(str(z).upper(), 0))
        X_num = df_copy[self.feature_names].values
        self.scaler.fit(X_num)
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        df_copy = df.copy()
        df_copy["zone_encoded"] = df_copy["zone_id"].map(lambda z: ZONE_MAPPING.get(str(z).upper(), 0))
        # Ensure all columns exist with defaults if missing
        for col in self.feature_names:
            if col not in df_copy.columns:
                df_copy[col] = 0.0
        X_num = df_copy[self.feature_names].values
        return self.scaler.transform(X_num)

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        self.fit(df)
        return self.transform(df)

    def transform_dict_list(self, rows: List[Dict[str, Any]]) -> np.ndarray:
        df = pd.DataFrame(rows)
        return self.transform(df)
