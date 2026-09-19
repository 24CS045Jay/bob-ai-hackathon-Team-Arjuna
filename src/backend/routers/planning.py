"""
PortFlow AI — 72-Hour Planning Router
Endpoints:
  GET  /api/planning/72h — Returns 12-slice multi-horizon operational plan
  POST /api/planning/72h — Generates plan with customized base timestamp
"""
from fastapi import APIRouter

try:
    from ..models.schemas import Planning72hRequest, Planning72hResponse
    from ..services.planner_client import get_72h_operations_plan
except (ImportError, ValueError):
    from models.schemas import Planning72hRequest, Planning72hResponse
    from services.planner_client import get_72h_operations_plan

router = APIRouter(prefix="/api/planning", tags=["Planning"])


@router.get("/72h", response_model=Planning72hResponse)
def get_planning_72h():
    return get_72h_operations_plan()


@router.post("/72h", response_model=Planning72hResponse)
def post_planning_72h(payload: Planning72hRequest):
    return get_72h_operations_plan(base_time_iso=payload.base_time_iso)
