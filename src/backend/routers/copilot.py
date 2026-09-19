"""
PortFlow AI — Copilot Router
Endpoints:
  POST /api/copilot/chat   — Natural language Q&A grounded in live terminal telemetry
  GET  /api/copilot/status — Current Copilot mode and engine configuration
"""

import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
try:
    from ..db.database import get_db
    from ..models.schemas import CopilotChatRequest, CopilotChatResponse
    from ..services.copilot_service import process_copilot_query, DEMO_MODE, WATSONX_APIKEY, WATSONX_PROJECT_ID
except (ImportError, ValueError):
    from db.database import get_db
    from models.schemas import CopilotChatRequest, CopilotChatResponse
    from services.copilot_service import process_copilot_query, DEMO_MODE, WATSONX_APIKEY, WATSONX_PROJECT_ID

router = APIRouter(prefix="/api/copilot", tags=["Copilot"])


@router.post("/chat", response_model=CopilotChatResponse)
def copilot_chat_endpoint(payload: CopilotChatRequest, db: Session = Depends(get_db)):
    return process_copilot_query(payload.message, db)


@router.get("/status")
def copilot_status_endpoint():
    has_watsonx_creds = bool(WATSONX_APIKEY and WATSONX_PROJECT_ID)
    return {
        "demo_mode": DEMO_MODE,
        "watsonx_configured": has_watsonx_creds,
        "active_llm": (
            "ibm/granite-3-8b-instruct (watsonx.ai)"
            if (not DEMO_MODE and has_watsonx_creds)
            else "PortFlow-Deterministic-Engine (Grounded Live State)"
        ),
        "grounding_domains": ["berths", "cranes", "routing_waypoints", "ml_congestion_predictions", "weather_tides"],
    }
