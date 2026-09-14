"""
PortFlow AI — Predictions Router
Endpoints:
  POST /api/predictions/congestion — Evaluates multi-zone congestion forecasts
  GET  /api/predictions/hotspots   — Returns real-time congestion hotspots
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models.schemas import CongestionPredictionRequest, CongestionPredictionResponse, HotspotResponse
from ..services.ml_client import evaluate_zones, get_current_hotspots

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


@router.post("/congestion", response_model=CongestionPredictionResponse)
def predict_congestion_endpoint(payload: CongestionPredictionRequest):
    data = [item.model_dump() for item in payload.zones]
    result = evaluate_zones(data)
    return result


@router.get("/hotspots", response_model=HotspotResponse)
def get_hotspots_endpoint():
    return get_current_hotspots()
