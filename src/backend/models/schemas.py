"""
PortFlow AI — Pydantic Schemas (Contracts C & D)
Defines request and response validation contracts for predictions, discrete optimizations,
72-hour planning, and watsonx Copilot interactions.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Predictions Schemas
# -------------------------------------------------------------
class ZoneFeatureItem(BaseModel):
    zone_id: str = Field(..., description="Port operational zone (A, B, C, D, E, or F)")
    hour_of_day: int = Field(12, ge=0, le=23)
    day_of_week: int = Field(2, ge=0, le=6)
    vessel_count: int = Field(6, ge=0)
    avg_draft_m: float = Field(12.5, ge=0.0)
    weather_wind_knots: float = Field(15.0, ge=0.0)
    weather_visibility_nm: float = Field(8.0, ge=0.0)
    tide_height_m: float = Field(3.2, ge=0.0)
    quay_crane_utilization: float = Field(0.65, ge=0.0, le=1.0)
    yard_occupancy_pct: float = Field(0.70, ge=0.0, le=1.0)


class CongestionPredictionRequest(BaseModel):
    zones: List[ZoneFeatureItem]


class ZonePredictionResult(BaseModel):
    zone_id: str
    predicted_congestion_index: float
    risk_level: str
    bottleneck_factors: List[str]
    confidence: float
    model_source: str


class CongestionPredictionResponse(BaseModel):
    predictions: List[ZonePredictionResult]
    evaluated_at: str
    peak_zone: str
    average_congestion: float


class HotspotResponse(BaseModel):
    timestamp_utc: str
    hotspots: List[Dict[str, Any]]
    critical_count: int
    system_advisory: str


# -------------------------------------------------------------
# Optimisation Schemas
# -------------------------------------------------------------
class VesselInput(BaseModel):
    vessel_id: str
    name: str
    length_m: float
    draft_m: float
    teu: Optional[int] = 0
    dwt: Optional[int] = 0
    cargo_type: Optional[str] = "container"
    priority: Optional[int] = 2
    eta_utc: Optional[str] = None


class BerthOptimizationRequest(BaseModel):
    vessels: Optional[List[VesselInput]] = None
    current_time_iso: Optional[str] = None


class BerthOptimizationResponse(BaseModel):
    assignments: List[Dict[str, Any]]
    unassigned_or_waiting: List[Dict[str, Any]]
    metrics: Dict[str, Any]


class CraneOptimizationRequest(BaseModel):
    berth_assignments: Optional[List[Dict[str, Any]]] = None
    current_time_iso: Optional[str] = None


class CraneOptimizationResponse(BaseModel):
    allocations: List[Dict[str, Any]]
    vessel_crane_schedules: List[Dict[str, Any]]
    metrics: Dict[str, Any]


class RouteOptimizationRequest(BaseModel):
    start_waypoint: str = "WP01"
    end_waypoint: str = "WP07"
    draft_m: float = 14.5
    tide_height_m: Optional[float] = 3.2
    min_ukc_m: Optional[float] = 1.2


class RouteOptimizationResponse(BaseModel):
    route_status: str
    start_waypoint: str
    end_waypoint: str
    total_distance_nm: Optional[float]
    estimated_transit_minutes: Optional[float]
    path: List[str]
    waypoints: List[Dict[str, Any]]
    tide_height_m: float
    vessel_draft_m: float
    minimum_under_keel_clearance_m: float
    advisories: List[str]


# -------------------------------------------------------------
# 72-Hour Planning Schemas
# -------------------------------------------------------------
class Planning72hRequest(BaseModel):
    base_time_iso: Optional[str] = None


class HorizonSliceResponse(BaseModel):
    slice_index: int
    horizon_label: str
    timestamp_utc: str
    tide_height_m: float
    primary_bottleneck_zone: str
    peak_congestion_index: float
    overall_status: str
    zone_predictions: Dict[str, Any]
    recommended_actions: List[str]


class Planning72hResponse(BaseModel):
    generated_at: str
    horizon_hours: int
    slice_interval_hours: int
    total_slices: int
    average_peak_congestion: float
    high_risk_horizons: List[str]
    slices: List[HorizonSliceResponse]


# -------------------------------------------------------------
# watsonx Grounded Copilot Schemas
# -------------------------------------------------------------
class CopilotChatRequest(BaseModel):
    message: str = Field(..., description="User query or dispatch prompt")
    context_filter: Optional[str] = Field("all", description="Scope filter: all, berths, cranes, routing, weather")
    session_id: Optional[str] = Field("session-default", description="Client session identifier")


class CopilotChatResponse(BaseModel):
    reply: str
    model_used: str
    confidence: float
    grounding_sources: List[str]
    citations: List[str]
    timestamp: str
    context_snapshot: Optional[Dict[str, Any]] = None
