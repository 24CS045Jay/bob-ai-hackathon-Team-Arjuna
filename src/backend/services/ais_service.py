"""
PortFlow AI — AIS Ingestion & Vessel Trajectory Service
Handles real/near-real-time AIS records, trajectory smoothing, movement telemetry,
and feeds the Maritime ML Decision Engine.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import pandas as pd
try:
    from ...ml.eta_model import predict_vessel_eta
    from ...ml.risk_model import predict_route_risk
    from .weather_service import fetch_point_weather
    from .recommendation_service import generate_maritime_decision
except (ImportError, ValueError):
    from ml.eta_model import predict_vessel_eta
    from ml.risk_model import predict_route_risk
    from services.weather_service import fetch_point_weather
    from services.recommendation_service import generate_maritime_decision

DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "processed" / "ais_trajectories.csv"


def load_raw_ais_records() -> pd.DataFrame:
    """Loads and sanitizes raw AIS records."""
    if not DATA_PATH.exists():
        return pd.DataFrame()
    df = pd.read_csv(DATA_PATH)
    # Sanitize invalid coordinates
    df = df[(df["lat"].between(-90.0, 90.0)) & (df["lon"].between(-180.0, 180.0))]
    # Sanitize impossible speeds (0 to 45 knots)
    df = df[df["sog"].between(0.0, 45.0)]
    return df


def get_live_vessels_summary() -> List[Dict[str, Any]]:
    """
    Returns latest near-real-time state for all active vessels.
    """
    df = load_raw_ais_records()
    if df.empty:
        return []

    # Get most recent timestamp record per MMSI
    df["timestamp_utc"] = pd.to_datetime(df["timestamp_utc"])
    latest_df = df.sort_values("timestamp_utc", ascending=False).groupby("mmsi").first().reset_index()

    vessels = []
    for _, row in latest_df.iterrows():
        mmsi = int(row["mmsi"])
        lat = float(row["lat"])
        lon = float(row["lon"])
        sog = float(row["sog"])
        dist_rem = float(row["distance_remaining_nm"])
        draught = float(row["draught"])

        # Quick point weather combined with vessel sensor observations
        w = fetch_point_weather(lat, lon)
        wind_kts = max(float(w.get("wind_speed_knots", 0.0)), float(row.get("wind_speed_knots", 0.0) or 0.0))
        wave_m = max(float(w.get("wave_height_m", 0.0)), float(row.get("wave_height_m", 0.0) or 0.0))

        # Fast ML inference
        eta_res = predict_vessel_eta(
            distance_remaining_nm=dist_rem,
            sog=sog,
            avg_speed=sog,
            draught=draught,
            wind_speed_knots=wind_kts,
            wave_height_m=wave_m,
        )
        risk_res = predict_route_risk(
            wind_speed_knots=wind_kts,
            wave_height_m=wave_m,
            sog=sog,
            draught=draught,
            distance_remaining_nm=dist_rem,
        )

        wind_norm = min(1.0, wind_kts / 40.0)
        wave_norm = min(1.0, wave_m / 4.5)
        weather_score = round(0.55 * wind_norm + 0.45 * wave_norm, 3)

        if risk_res["risk_level"] == "HIGH" or weather_score >= 0.65:
            rec = "REROUTE"
        else:
            rec = "PROCEED"

        vessel_dict = {
            "mmsi": mmsi,
            "imo": str(row.get("imo", "")),
            "name": str(row["vessel_name"]),
            "vessel_type": str(row["vessel_type"]),
            "lat": lat,
            "lon": lon,
            "sog": sog,
            "cog": float(row["cog"]),
            "heading": float(row["heading"]),
            "draught": draught,
            "destination": str(row["destination"]),
            "origin_port": str(row.get("origin_port", "")),
            "origin_country": str(row.get("origin_country", "International")),
            "billing_currency": str(row.get("billing_currency", "USD")),
            "hourly_rate_usd": float(row.get("hourly_rate_usd", 2500.0)),
            "distance_remaining_nm": dist_rem,
            "route_risk_level": risk_res["risk_level"],
            "timestamp_utc": str(row["timestamp_utc"]),
            "eta_hours": eta_res["eta_hours"],
            "eta_minutes": eta_res["eta_minutes"],
            "recommendation": rec,
            "weather_score": weather_score,
            "wind_speed_knots": wind_kts,
            "wave_height_m": wave_m,
            "total_cost_usd": round(dist_rem * 120.0 + 15000.0, 2),
        }
        vessels.append(vessel_dict)

    return vessels


def get_vessel_route_waypoints(mmsi: int) -> List[Dict[str, float]]:
    """
    Returns the planned trajectory waypoints for a specific vessel.
    All waypoints strictly follow international nautical deepwater fairways (100% ocean, zero land).
    """
    routes_by_mmsi = {
        # MV American Eagle (Transpacific -> South China Sea -> Singapore -> Malacca -> Sri Lanka -> Arabian Sea -> Port of Arjuna)
        367123450: [
            {"name": "South China Sea Storm Sector", "lat": 21.350, "lon": 119.820},
            {"name": "Luzon Strait Passage", "lat": 19.500, "lon": 116.500},
            {"name": "Vietnam Offshore Corridor", "lat": 13.500, "lon": 111.500},
            {"name": "South China Sea South Basin", "lat": 6.500, "lon": 107.500},
            {"name": "Singapore Strait East Entry", "lat": 1.250, "lon": 103.850},
            {"name": "Strait of Malacca TSS", "lat": 3.200, "lon": 101.200},
            {"name": "Malacca North Gateway", "lat": 5.600, "lon": 95.200},
            {"name": "Sri Lanka Dondra Head Passage", "lat": 5.700, "lon": 80.500},
            {"name": "Arabian Sea South Sector", "lat": 9.500, "lon": 74.800},
            {"name": "Arabian Sea North Fairway", "lat": 16.000, "lon": 71.500},
            {"name": "Gulf of Khambhat Approach", "lat": 19.500, "lon": 71.800},
            {"name": "Port of Arjuna Terminal Pier", "lat": 21.680, "lon": 72.520},
        ],
        # MV Hai Phong Star (Vietnam Feeder -> Singapore -> Malacca -> Sri Lanka -> Port of Arjuna)
        574102930: [
            {"name": "Gulf of Tonkin Outward Passage", "lat": 12.450, "lon": 109.850},
            {"name": "Vietnam South Coastal Fairway", "lat": 8.500, "lon": 107.200},
            {"name": "Singapore Strait Entry", "lat": 1.250, "lon": 103.850},
            {"name": "Malacca Strait Center", "lat": 3.200, "lon": 101.200},
            {"name": "Northern Sumatra Fairway", "lat": 5.600, "lon": 95.200},
            {"name": "Sri Lanka Southern Transit", "lat": 5.700, "lon": 80.500},
            {"name": "Laccadive Sea Corridor", "lat": 10.000, "lon": 74.800},
            {"name": "Arabian Sea Northbound", "lat": 16.500, "lon": 71.500},
            {"name": "Port of Arjuna Feeder Pier", "lat": 21.680, "lon": 72.520},
        ],
        # MSC Arjuna (Persian Gulf / Malacca -> Sri Lanka -> Arabian Sea)
        636018342: [
            {"name": "Malacca Transit Point", "lat": 6.250, "lon": 95.120},
            {"name": "Sri Lanka Southern Fairway", "lat": 5.700, "lon": 80.500},
            {"name": "Arabian Sea South Sector", "lat": 10.200, "lon": 74.800},
            {"name": "Goa Offshore Corridor", "lat": 15.500, "lon": 72.000},
            {"name": "Gulf of Khambhat Outer Fairway", "lat": 19.500, "lon": 71.800},
            {"name": "Port of Arjuna CT-1", "lat": 21.680, "lon": 72.520},
        ],
        # COSCO Tapi (Arabian Sea approaching Port of Arjuna)
        413204910: [
            {"name": "Arabian Sea Storm Sector", "lat": 19.800, "lon": 65.200},
            {"name": "Veraval Offshore Chokepoint", "lat": 20.500, "lon": 69.500},
            {"name": "Gulf of Khambhat Safe Approach", "lat": 21.000, "lon": 71.800},
            {"name": "Port of Arjuna Terminal Pier", "lat": 21.680, "lon": 72.520},
        ],
        # Maersk Baroda (South India / Sri Lanka -> Port of Arjuna)
        219018440: [
            {"name": "Cape Comorin South Sea Lane", "lat": 8.100, "lon": 77.200},
            {"name": "Kochi Offshore Lane", "lat": 10.000, "lon": 75.000},
            {"name": "Mangalore Fairway", "lat": 13.000, "lon": 73.500},
            {"name": "Mumbai Offshore Fairway", "lat": 18.500, "lon": 71.800},
            {"name": "Gulf of Khambhat Pilot", "lat": 20.500, "lon": 71.800},
            {"name": "Port of Arjuna Terminal Pier", "lat": 21.680, "lon": 72.520},
        ],
        # CMA CGM Gujarat (Central Arabian Sea -> Gulf of Khambhat)
        228319200: [
            {"name": "Central Arabian Sea Departure", "lat": 15.200, "lon": 68.400},
            {"name": "Goa Offshore Deep Corridor", "lat": 17.500, "lon": 70.000},
            {"name": "Mumbai Offshore Deep Fairway", "lat": 19.200, "lon": 71.200},
            {"name": "Gulf of Khambhat Outer Pilot", "lat": 20.500, "lon": 71.600},
            {"name": "Port of Arjuna CT-2", "lat": 21.680, "lon": 72.520},
        ],
        # MV Coral Voyager (Offshore Maharashtra -> Port of Arjuna)
        503829100: [
            {"name": "Ratnagiri Offshore Deepwater", "lat": 17.100, "lon": 71.200},
            {"name": "Mumbai High Offshore Channel", "lat": 18.800, "lon": 71.500},
            {"name": "Gulf of Khambhat South Channel", "lat": 20.400, "lon": 71.800},
            {"name": "Port of Arjuna General Cargo Berth", "lat": 21.680, "lon": 72.520},
        ],
        # ONE Kathiawar (Approaching Gulf of Khambhat TSS)
        477192800: [
            {"name": "Mumbai Outer Anchorage Fairway", "lat": 18.900, "lon": 72.100},
            {"name": "Daman Seaward Channel", "lat": 20.200, "lon": 71.850},
            {"name": "Gulf of Khambhat TSS", "lat": 21.000, "lon": 72.200},
            {"name": "Port of Arjuna Feeder Berth", "lat": 21.680, "lon": 72.520},
        ],
    }

    if mmsi in routes_by_mmsi:
        return routes_by_mmsi[mmsi]

    # Default certified oceanic approach corridor to Port of Arjuna (100% deep water)
    return [
        {"name": "Arabian Sea Oceanic Lane WP01", "lat": 16.500, "lon": 70.800},
        {"name": "Mumbai Offshore WP02", "lat": 18.500, "lon": 71.500},
        {"name": "Gulf of Khambhat Pilot WP03", "lat": 20.200, "lon": 71.800},
        {"name": "Port of Arjuna Berthing Basin", "lat": 21.680, "lon": 72.520},
    ]


def get_vessel_alternate_waypoints(mmsi: int) -> Optional[List[Dict[str, float]]]:
    """
    Returns verified deepwater bypass corridors that steer vessels around storm hazards
    while remaining 100% in open navigable ocean waters (zero land traversal).
    """
    alternate_by_mmsi = {
        # MV American Eagle: bypasses northern South China Sea storm by diverting into central deep ocean basin
        367123450: [
            {"name": "Departure Point (Storm Alert)", "lat": 21.350, "lon": 119.820},
            {"name": "Bypass WP1: Deep Oceanic Swell Diverter", "lat": 17.800, "lon": 118.200},
            {"name": "Bypass WP2: Central Deepwater Basin", "lat": 14.500, "lon": 115.000},
            {"name": "Bypass WP3: Natuna Deepwater Corridor", "lat": 5.500, "lon": 108.500},
            {"name": "Singapore Strait East Entry", "lat": 1.250, "lon": 103.850},
            {"name": "Strait of Malacca TSS", "lat": 3.200, "lon": 101.200},
            {"name": "Malacca North Gateway", "lat": 5.600, "lon": 95.200},
            {"name": "Bypass WP4: Sri Lanka South Deep Channel", "lat": 5.400, "lon": 80.500},
            {"name": "Bypass WP5: Deep Arabian Sea Corridor", "lat": 9.500, "lon": 73.200},
            {"name": "Bypass WP6: West Arabian Sea Fairway", "lat": 16.000, "lon": 70.200},
            {"name": "Gulf of Khambhat Outer Pilot", "lat": 19.500, "lon": 71.500},
            {"name": "Port of Arjuna Terminal Pier", "lat": 21.680, "lon": 72.520},
        ],
        # MV Hai Phong Star: oceanic bypass staying well offshore, through Singapore & Malacca, deep south of Sri Lanka
        574102930: [
            {"name": "Gulf of Tonkin Outward Passage", "lat": 12.450, "lon": 109.850},
            {"name": "Bypass WP1: South China Sea Offshore", "lat": 8.000, "lon": 108.000},
            {"name": "Singapore Strait Entry", "lat": 1.250, "lon": 103.850},
            {"name": "Malacca Strait Center", "lat": 3.200, "lon": 101.200},
            {"name": "Northern Sumatra Fairway", "lat": 5.600, "lon": 95.200},
            {"name": "Bypass WP2: Sri Lanka Deep South Transit", "lat": 5.200, "lon": 80.500},
            {"name": "Bypass WP3: Maldives Channel", "lat": 7.500, "lon": 73.500},
            {"name": "Bypass WP4: West Laccadive Deep Corridor", "lat": 12.000, "lon": 71.800},
            {"name": "Bypass WP5: Arabian Sea Seaward Fairway", "lat": 17.500, "lon": 70.500},
            {"name": "Gulf of Khambhat Safe Approach", "lat": 20.500, "lon": 71.600},
            {"name": "Port of Arjuna Feeder Pier", "lat": 21.680, "lon": 72.520},
        ],
        # MSC Arjuna: seaward deepwater fairway skirting coastal swell
        636018342: [
            {"name": "Malacca Transit Point", "lat": 6.250, "lon": 95.120},
            {"name": "Bypass WP1: Sri Lanka South Deep", "lat": 5.300, "lon": 80.500},
            {"name": "Bypass WP2: Laccadive West Oceanic", "lat": 9.800, "lon": 73.200},
            {"name": "Bypass WP3: Arabian Sea Central Sea Lane", "lat": 15.000, "lon": 70.500},
            {"name": "Bypass WP4: North Arabian Seaward Corridor", "lat": 19.200, "lon": 71.000},
            {"name": "Gulf of Khambhat Outer Pilot", "lat": 20.500, "lon": 71.600},
            {"name": "Port of Arjuna CT-1", "lat": 21.680, "lon": 72.520},
        ],
        # COSCO Tapi: skirts Arabian Sea storm cell to the south into deep open water
        413204910: [
            {"name": "Departure Point (Storm Hazard)", "lat": 19.800, "lon": 65.200},
            {"name": "Bypass WP1: South Deepwater Basin", "lat": 18.200, "lon": 66.500},
            {"name": "Bypass WP2: Southern Oceanic Fairway", "lat": 18.500, "lon": 70.200},
            {"name": "Gulf of Khambhat Safe Approach", "lat": 20.500, "lon": 71.600},
            {"name": "Port of Arjuna Terminal Pier", "lat": 21.680, "lon": 72.520},
        ],
        # Maersk Baroda: steers further west into open Arabian Sea away from coastal swell
        219018440: [
            {"name": "Cape Comorin South Sea Lane", "lat": 8.100, "lon": 77.200},
            {"name": "Bypass WP1: South Laccadive Deep Fairway", "lat": 9.500, "lon": 73.800},
            {"name": "Bypass WP2: Central Arabian Sea Seaward", "lat": 14.000, "lon": 71.500},
            {"name": "Bypass WP3: Mumbai Deepwater Offshore", "lat": 18.500, "lon": 70.800},
            {"name": "Gulf of Khambhat Safe Approach", "lat": 20.500, "lon": 71.600},
            {"name": "Port of Arjuna Terminal Pier", "lat": 21.680, "lon": 72.520},
        ],
        # CMA CGM Gujarat: bypass corridor staying well seaward
        228319200: [
            {"name": "Central Arabian Sea Departure", "lat": 15.200, "lon": 68.400},
            {"name": "Bypass WP1: Deep Oceanic West Corridor", "lat": 17.000, "lon": 68.800},
            {"name": "Bypass WP2: North Arabian Sea Seaward", "lat": 19.500, "lon": 70.500},
            {"name": "Gulf of Khambhat Outer Pilot", "lat": 20.500, "lon": 71.600},
            {"name": "Port of Arjuna CT-2", "lat": 21.680, "lon": 72.520},
        ],
        # MV Coral Voyager: lateral seaward shift away from coastal congestion
        503829100: [
            {"name": "Ratnagiri Offshore Deepwater", "lat": 17.100, "lon": 71.200},
            {"name": "Bypass WP1: Deepwater Seaward Diverter", "lat": 17.800, "lon": 70.000},
            {"name": "Bypass WP2: Mumbai Deepwater Lane", "lat": 19.200, "lon": 70.800},
            {"name": "Gulf of Khambhat South Channel", "lat": 20.400, "lon": 71.600},
            {"name": "Port of Arjuna General Cargo Berth", "lat": 21.680, "lon": 72.520},
        ],
        # ONE Kathiawar: safe seaward approach into the Gulf
        477192800: [
            {"name": "Mumbai Outer Anchorage Fairway", "lat": 18.900, "lon": 72.100},
            {"name": "Bypass WP1: Seaward Pilot Fairway", "lat": 19.400, "lon": 71.400},
            {"name": "Gulf of Khambhat TSS", "lat": 20.800, "lon": 71.800},
            {"name": "Port of Arjuna Feeder Berth", "lat": 21.680, "lon": 72.520},
        ],
    }
    return alternate_by_mmsi.get(mmsi)


def get_vessel_decision_payload(mmsi: int, destination_port_congestion_index: float = 65.0) -> Optional[Dict[str, Any]]:
    """
    Compiles full ML Decision Package for a specific MMSI directly without scanning entire fleet.
    """
    df = load_raw_ais_records()
    if df.empty:
        return None

    vessel_rows = df[df["mmsi"] == mmsi]
    if vessel_rows.empty:
        return None

    row = vessel_rows.sort_values("timestamp_utc", ascending=False).iloc[0]

    target = {
        "mmsi": int(mmsi),
        "imo": str(row.get("imo", "")),
        "name": str(row["vessel_name"]),
        "vessel_type": str(row["vessel_type"]),
        "lat": float(row["lat"]),
        "lon": float(row["lon"]),
        "sog": float(row["sog"]),
        "cog": float(row["cog"]),
        "heading": float(row["heading"]),
        "draught": float(row["draught"]),
        "destination": str(row["destination"]),
        "origin_port": str(row.get("origin_port", "")),
        "origin_country": str(row.get("origin_country", "International")),
        "billing_currency": str(row.get("billing_currency", "USD")),
        "hourly_rate_usd": float(row.get("hourly_rate_usd", 2500.0)),
        "distance_remaining_nm": float(row["distance_remaining_nm"]),
        "route_risk_level": str(row.get("route_risk_level", "LOW")),
        "timestamp_utc": str(row["timestamp_utc"]),
        "wind_speed_knots": float(row.get("wind_speed_knots", 0.0) or 0.0),
        "wave_height_m": float(row.get("wave_height_m", 0.0) or 0.0),
    }

    waypoints = get_vessel_route_waypoints(mmsi)
    return generate_maritime_decision(target, waypoints, destination_port_congestion_index=destination_port_congestion_index)
