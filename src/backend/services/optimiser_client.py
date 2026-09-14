"""
PortFlow AI — Optimization Service Client
Wraps berth assignment, crane scheduling, and channel routing solvers with DB fallback.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

try:
    from ...optimisation.berth_assignment import optimize_berth_assignments, CANONICAL_BERTHS
    from ...optimisation.crane_assignment import optimize_crane_assignments, CANONICAL_CRANES
    from ...optimisation.routing import plan_vessel_route, WAYPOINTS
except (ImportError, ValueError):
    try:
        from src.optimisation.berth_assignment import optimize_berth_assignments, CANONICAL_BERTHS
        from src.optimisation.crane_assignment import optimize_crane_assignments, CANONICAL_CRANES
        from src.optimisation.routing import plan_vessel_route, WAYPOINTS
    except (ImportError, ValueError):
        pass

from ..db.models import VesselModel, BerthModel, CraneModel


def run_berth_optimization(db: Session, vessels: Optional[List[Dict[str, Any]]] = None, current_time_iso: Optional[str] = None) -> Dict[str, Any]:
    if not vessels:
        # Load active vessels from database
        db_vessels = db.query(VesselModel).all()
        vessels = [
            {
                "vessel_id": v.vessel_id,
                "name": v.name,
                "length_m": v.length_m,
                "draft_m": v.draft_m,
                "teu": v.teu,
                "dwt": v.dwt,
                "cargo_type": "container" if "container" in v.type.lower() else ("tanker" if "tanker" in v.type.lower() else "bulk"),
                "priority": v.priority,
                "eta_utc": v.eta_utc,
            }
            for v in db_vessels
        ]

    db_berths = db.query(BerthModel).all()
    berths = [
        {
            "berth_id": b.berth_id,
            "zone_id": b.zone_id,
            "terminal": b.terminal,
            "max_length_m": b.max_length_m,
            "max_draft_m": b.max_draft_m,
            "cargo_types": b.cargo_types if isinstance(b.cargo_types, list) else ["container"],
        }
        for b in db_berths
    ] if db_berths else CANONICAL_BERTHS

    return optimize_berth_assignments(vessels, berths, current_time_iso)


def run_crane_optimization(db: Session, berth_assignments: Optional[List[Dict[str, Any]]] = None, current_time_iso: Optional[str] = None) -> Dict[str, Any]:
    if not berth_assignments:
        # Generate baseline assignments first
        berth_res = run_berth_optimization(db, current_time_iso=current_time_iso)
        berth_assignments = berth_res["assignments"]

    db_cranes = db.query(CraneModel).all()
    cranes = [
        {
            "crane_id": c.crane_id,
            "name": c.name,
            "zone_id": c.zone_id,
            "compatible_berths": c.compatible_berths if isinstance(c.compatible_berths, list) else ["B01"],
            "moves_per_hour": c.moves_per_hour,
            "status": c.status,
        }
        for c in db_cranes
    ] if db_cranes else CANONICAL_CRANES

    return optimize_crane_assignments(berth_assignments, cranes, current_time_iso)


def run_route_optimization(
    start_wp: str,
    end_wp: str,
    draft_m: float,
    tide_height_m: float = 3.2,
    min_ukc_m: float = 1.2,
) -> Dict[str, Any]:
    return plan_vessel_route(start_wp, end_wp, draft_m, tide_height_m, min_ukc_m)
