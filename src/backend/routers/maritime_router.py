"""
PortFlow AI — Maritime ML & Dynamic Rerouting FastAPI Router
Exposes:
- GET /api/vessels/live: Live AIS telemetry & summary decisions
- GET /api/vessels/{mmsi}/decision: Comprehensive ML ETA, risk, route waypoints, alternate corridor & cost
- GET /api/weather/route: Real-time Open-Meteo marine route weather sampling
- GET /api/currency/rates: Live / cached FX rates relative to USD
- POST /api/route/reroute: Dynamic rerouting simulation for custom vessel & waypoints
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

try:
    from ..services.ais_service import get_live_vessels_summary, get_vessel_decision_payload, get_vessel_route_waypoints
    from ..services.weather_service import sample_route_weather, fetch_point_weather
    from ..services.cost_service import get_exchange_rates, convert_to_usd, calculate_voyage_cost
    from ..services.rerouting_service import analyze_and_reroute
    from ..services.recommendation_service import generate_maritime_decision
except (ImportError, ValueError):
    from services.ais_service import get_live_vessels_summary, get_vessel_decision_payload, get_vessel_route_waypoints
    from services.weather_service import sample_route_weather, fetch_point_weather
    from services.cost_service import get_exchange_rates, convert_to_usd, calculate_voyage_cost
    from services.rerouting_service import analyze_and_reroute
    from services.recommendation_service import generate_maritime_decision


router = APIRouter(prefix="/api", tags=["Maritime Intelligence & Routing"])


class Waypoint(BaseModel):
    name: Optional[str] = "Waypoint"
    lat: float
    lon: float


class DynamicRerouteRequest(BaseModel):
    vessel_name: Optional[str] = "Simulated Vessel"
    mmsi: Optional[int] = 999999999
    sog: Optional[float] = 15.0
    draught: Optional[float] = 12.0
    distance_remaining_nm: Optional[float] = 300.0
    billing_currency: Optional[str] = "USD"
    hourly_rate_usd: Optional[float] = 2500.0
    congestion_index: Optional[float] = 65.0
    waypoints: List[Waypoint]


@router.get("/vessels/live")
def get_live_vessels():
    """
    Returns near-real-time AIS telemetry and ML-driven decision summaries for all active vessels.
    """
    vessels = get_live_vessels_summary()
    return {
        "count": len(vessels),
        "vessels": vessels,
        "timestamp_utc": vessels[0]["timestamp_utc"] if vessels else "",
    }


@router.get("/vessels/{mmsi}/decision")
def get_vessel_decision(mmsi: int, congestion_index: float = Query(65.0, ge=0.0, le=100.0)):
    """
    Returns the complete maritime decision support package for a specific MMSI:
    - ML ETA forecast
    - ML Route Risk probability
    - Open-Meteo live weather sampling
    - Alternate corridor route waypoints
    - Currency-normalized cost comparison & savings
    - Explainable decision reasons (PROCEED, HOLD, REROUTE)
    """
    decision = get_vessel_decision_payload(mmsi, destination_port_congestion_index=congestion_index)
    if not decision:
        raise HTTPException(status_code=404, detail=f"Vessel with MMSI {mmsi} not found in active AIS stream")
    return decision


@router.get("/weather/route")
def get_route_weather(
    lats: str = Query(..., description="Comma-separated latitudes (e.g. 18.95,15.2,10.5)"),
    lons: str = Query(..., description="Comma-separated longitudes (e.g. 72.85,73.1,75.4)"),
):
    """
    Samples real-time marine weather along provided coordinates using Open-Meteo.
    """
    try:
        lat_list = [float(x.strip()) for x in lats.split(",") if x.strip()]
        lon_list = [float(x.strip()) for x in lons.split(",") if x.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid latitude/longitude format. Expected comma-separated floats.")

    if len(lat_list) != len(lon_list):
        raise HTTPException(status_code=400, detail="Counts of latitudes and longitudes must match.")

    waypoints = [{"lat": lat_list[i], "lon": lon_list[i]} for i in range(len(lat_list))]
    weather_summary = sample_route_weather(waypoints)
    return weather_summary


@router.get("/currency/rates")
def get_currency_rates():
    """
    Returns current foreign exchange rates relative to USD used for demurrage and operational cost valuation.
    """
    rates = get_exchange_rates()
    return {
        "base_currency": "USD",
        "rates": rates,
        "supported_currencies": list(rates.keys()),
    }


@router.post("/route/reroute")
def evaluate_custom_reroute(req: DynamicRerouteRequest):
    """
    Evaluates dynamic rerouting for arbitrary vessel telemetry and planned route waypoints.
    """
    vessel_dict = {
        "mmsi": req.mmsi,
        "name": req.vessel_name,
        "sog": req.sog,
        "draught": req.draught,
        "distance_remaining_nm": req.distance_remaining_nm,
        "billing_currency": req.billing_currency,
        "hourly_rate_usd": req.hourly_rate_usd,
    }
    waypoints_dict = [{"name": wp.name, "lat": wp.lat, "lon": wp.lon} for wp in req.waypoints]
    decision = generate_maritime_decision(
        vessel_dict,
        waypoints_dict,
        destination_port_congestion_index=req.congestion_index,
    )
    return decision
