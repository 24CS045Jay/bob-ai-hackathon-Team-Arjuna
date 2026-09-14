"""
PortFlow AI — Model Training Script
Trains RandomForestRegressor on synthetic port operational dataset and exports model artifacts.
"""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from data_generator import generate_synthetic_data
from feature_engineering import PortFeaturePipeline


def train():
    base_dir = Path(__file__).resolve().parent
    models_dir = base_dir / "models"
    data_dir = base_dir / "data"
    models_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(parents=True, exist_ok=True)

    csv_path = data_dir / "synthetic_port_congestion.csv"
    if not csv_path.exists():
        print("Generating synthetic data...")
        df = generate_synthetic_data(2400)
        df.to_csv(csv_path, index=False)
    else:
        df = pd.read_csv(csv_path)

    print(f"Loaded {len(df)} samples across zones: {df['zone_id'].unique().tolist()}")

    pipeline = PortFeaturePipeline()
    X = pipeline.fit_transform(df)
    y = df["congestion_index"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training RandomForestRegressor(n_estimators=100)...")
    model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    print(f"Evaluation Metrics — MAE: {mae:.2f}, RMSE: {rmse:.2f}, R2: {r2:.4f}")

    # Feature importances
    feature_importances = dict(zip(pipeline.feature_names, [float(v) for v in model.feature_importances_]))
    sorted_importances = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True))

    # Save artifacts
    model_bundle = {
        "model": model,
        "pipeline": pipeline,
        "feature_names": pipeline.feature_names,
        "metrics": {"mae": mae, "rmse": rmse, "r2": r2},
    }

    model_path = models_dir / "congestion_model.pkl"
    joblib.dump(model_bundle, model_path)
    print(f"Saved model bundle to {model_path}")

    importance_path = models_dir / "feature_importance.json"
    with open(importance_path, "w") as f:
        json.dump(sorted_importances, f, indent=2)
    print(f"Saved feature importances to {importance_path}")

    metrics_path = models_dir / "training_metrics.json"
    with open(metrics_path, "w") as f:
        json.dump({"mae": mae, "rmse": rmse, "r2": r2, "samples": len(df)}, f, indent=2)


if __name__ == "__main__":
    train()
