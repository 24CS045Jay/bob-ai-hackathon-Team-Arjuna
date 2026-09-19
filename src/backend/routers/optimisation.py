"""
PortFlow AI — Optimisation Router
Endpoints:
  POST /api/optimisation/berths — Priority-queue berth allocation
  POST /api/optimisation/cranes — Earliest Deadline First crane scheduling
  POST /api/optimisation/routes — Dijkstra channel routing with UKC depth check
  GET  /api/optimisation/berths/status — Current berth state
  GET  /api/optimisation/cranes/status — Current crane state
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
try:
    from ..db.database import get_db
    from ..db.models import BerthModel, CraneModel, VesselModel
    from ..models.schemas import (
        BerthOptimizationRequest,
        BerthOptimizationResponse,
        CraneOptimizationRequest,
        CraneOptimizationResponse,
        RouteOptimizationRequest,
        RouteOptimizationResponse,
    )
    from ..services.optimiser_client import (
        run_berth_optimization,
        run_crane_optimization,
        run_route_optimization,
    )
except (ImportError, ValueError):
    from db.database import get_db
    from db.models import BerthModel, CraneModel, VesselModel
    from models.schemas import (
        BerthOptimizationRequest,
        BerthOptimizationResponse,
        CraneOptimizationRequest,
        CraneOptimizationResponse,
        RouteOptimizationRequest,
        RouteOptimizationResponse,
    )
    from services.optimiser_client import (
        run_berth_optimization,
        run_crane_optimization,
        run_route_optimization,
    )

router = APIRouter(prefix="/api/optimisation", tags=["Optimisation"])


@router.post("/berths", response_model=BerthOptimizationResponse)
def optimize_berths_endpoint(payload: BerthOptimizationRequest, db: Session = Depends(get_db)):
    v_data = [v.model_dump() for v in payload.vessels] if payload.vessels else None
    return run_berth_optimization(db, vessels=v_data, current_time_iso=payload.current_time_iso)


@router.get("/berths/status")
def get_berths_status(db: Session = Depends(get_db)):
    berths = db.query(BerthModel).all()
    return {"berths": berths, "total": len(berths)}


@router.post("/cranes", response_model=CraneOptimizationResponse)
def optimize_cranes_endpoint(payload: CraneOptimizationRequest, db: Session = Depends(get_db)):
    return run_crane_optimization(db, berth_assignments=payload.berth_assignments, current_time_iso=payload.current_time_iso)


@router.get("/cranes/status")
def get_cranes_status(db: Session = Depends(get_db)):
    cranes = db.query(CraneModel).all()
    return {"cranes": cranes, "total": len(cranes)}


@router.post("/routes", response_model=RouteOptimizationResponse)
def optimize_routes_endpoint(payload: RouteOptimizationRequest):
    return run_route_optimization(
        start_wp=payload.start_waypoint,
        end_wp=payload.end_waypoint,
        draft_m=payload.draft_m,
        tide_height_m=payload.tide_height_m or 3.2,
        min_ukc_m=payload.min_ukc_m or 1.2,
    )
