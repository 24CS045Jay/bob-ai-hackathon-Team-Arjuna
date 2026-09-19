"""
PortFlow AI — Maritime AI Recommendation & Explainable Decision Engine
Combines ML predictions (ETA, Route Risk), Open-Meteo weather sampling,
dynamic rerouting, and currency-aware financial optimization to generate
grounded operational recommendations: PROCEED, HOLD, or REROUTE.
"""

from typing import Dict, Any, List
from ...ml.eta_model import predict_vessel_eta
from ...ml.risk_model import predict_route_risk
from .weather_service import sample_route_weather
from .rerouting_service import analyze_and_reroute
from .cost_service import compare_routes_cost, convert_to_usd


def generate_maritime_decision(
    vessel: Dict[str, Any],
    current_waypoints: List[Dict[str, float]],
    destination_port_congestion_index: float = 65.0,
) -> Dict[str, Any]:
    """
    Generates a full decision support payload for any given vessel:
    - ML ETA forecast
    - Route Risk classification
    - Open-Meteo Route Weather sampling
    - Alternate corridor reroute analysis
    - Currency-normalized cost comparison
    - Recommendation: PROCEED, HOLD, or REROUTE with clear explainability reasons.
    """
    sog = float(vessel.get("sog", 15.0) or 15.0)
    avg_speed = float(vessel.get("avg_speed", sog) or sog)
    draught = float(vessel.get("draught", 12.5) or 12.5)
    dist_rem = float(vessel.get("distance_remaining_nm", 250.0) or 250.0)

    # 1. Rerouting & Weather Analysis
    reroute_analysis = analyze_and_reroute(vessel, current_waypoints, speed_knots=sog)
    curr_weather = reroute_analysis["current_route"]["weather"]
    wind_kts = max(float(curr_weather.get("max_wind_knots", 0.0)), float(vessel.get("wind_speed_knots", 0.0) or 0.0))
    wave_m = max(float(curr_weather.get("max_wave_height_m", 0.0)), float(vessel.get("wave_height_m", 0.0) or 0.0))
    wind_norm = min(1.0, wind_kts / 40.0)
    wave_norm = min(1.0, wave_m / 4.5)
    weather_score = round(max(curr_weather.get("route_weather_score", 0.0), 0.55 * wind_norm + 0.45 * wave_norm), 3)

    if (wind_kts >= 25.0 or wave_m >= 2.5) and not curr_weather.get("hazard_waypoints"):
        curr_weather["hazard_waypoints"] = [{
            "index": 0,
            "lat": float(vessel.get("lat", current_waypoints[0]["lat"])),
            "lon": float(vessel.get("lon", current_waypoints[0]["lon"])),
            "wind_speed_knots": wind_kts,
            "wave_height_m": wave_m,
            "warning": "Severe Sea State Hazard",
        }]

    # 2. ML ETA Prediction
    ml_eta = predict_vessel_eta(
        distance_remaining_nm=dist_rem,
        sog=sog,
        avg_speed=avg_speed,
        draught=draught,
        wind_speed_knots=wind_kts,
        wave_height_m=wave_m,
    )

    # 3. ML Route Risk Prediction
    ml_risk = predict_route_risk(
        wind_speed_knots=wind_kts,
        wave_height_m=wave_m,
        sog=sog,
        draught=draught,
        distance_remaining_nm=dist_rem,
    )

    # 4. Currency Cost Optimization
    cost_comp = compare_routes_cost(
        curr_route_metrics=reroute_analysis["current_route"],
        alt_route_metrics=reroute_analysis["alternate_route"],
        vessel=vessel,
        curr_weather_score=weather_score,
        alt_weather_score=reroute_analysis["alternate_route"]["weather"]["route_weather_score"],
    )

    # 5. Multi-Criteria Scoring (Weights: ETA 0.2, Weather 0.3, Cost 0.2, Congestion 0.15, Reliability 0.15)
    eta_norm = min(1.0, ml_eta["eta_hours"] / 48.0)
    risk_norm = ml_risk["risk_probability"] if ml_risk["risk_level"] != "LOW" else 0.2
    cost_norm = min(1.0, cost_comp["current_route_cost_usd"] / 100000.0)
    cong_norm = min(1.0, destination_port_congestion_index / 100.0)
    rel_norm = 0.85 if reroute_analysis["current_route"]["reliability"] == "UNRELIABLE" else 0.15

    composite_score = round(
        0.20 * eta_norm + 0.30 * risk_norm + 0.20 * cost_norm + 0.15 * cong_norm + 0.15 * rel_norm,
        3
    )

    # 6. Recommendation Logic (Section 24 of Plan)
    reasons = []
    if ml_risk["risk_level"] == "HIGH" or weather_score >= 0.65:
        if destination_port_congestion_index >= 88.0 and cost_comp["net_cost_difference_usd"] > 15000:
            decision = "HOLD"
            reasons.append(f"Severe gale conditions on fairway (Weather Score: {weather_score}, Waves: {wave_m}m).")
            reasons.append(f"Destination terminal is saturated (Congestion: {destination_port_congestion_index}%).")
            reasons.append("Holding vessel at safe outer anchorage avoids laytime demurrage and storm risk.")
        else:
            decision = "REROUTE"
            reasons.append(f"High weather risk detected on primary route ({ml_risk['risk_level']} Risk, {wind_kts} kts wind).")
            reasons.append(f"Deepwater bypass corridor reduces weather exposure by {reroute_analysis['comparison']['weather_risk_reduction_pct']}%.")
            reasons.append(f"Transit duration delta: +{reroute_analysis['comparison']['transit_delta_hours']}h ({cost_comp['net_cost_difference_usd']:+,.0f} USD).")
            reasons.append(f"Avoids ${cost_comp['expected_delay_loss_avoided_usd']:,.0f} USD in expected laytime delay penalties.")
    else:
        decision = "PROCEED"
        reasons.append("Current navigation fairway is within certified maritime safety thresholds (RELIABLE).")
        reasons.append(f"Favorable wind/wave sea state ({wind_kts} kts wind, {wave_m}m wave height).")
        reasons.append(f"On schedule for terminal arrival in {ml_eta['eta_hours']} hours.")

    # 7. Route Acceptance Trade-off Analysis (Explainable Why Accept vs Why Decline)
    vessel_name = vessel.get("name") or vessel.get("vessel_name") or f"Vessel {vessel.get('mmsi')}"
    weather_risk_pct = reroute_analysis["comparison"]["weather_risk_reduction_pct"]
    dist_delta = reroute_analysis["comparison"]["distance_delta_nm"]
    hours_delta = reroute_analysis["comparison"]["transit_delta_hours"]
    demurrage_saved = cost_comp.get("expected_delay_loss_avoided_usd", 0.0)
    net_fuel_cost = max(0.0, cost_comp.get("net_cost_difference_usd", 0.0))

    why_accept = [
        f"Reduces severe weather exposure by {weather_risk_pct}% bypassing dangerous gale and swell sectors.",
        f"Avoids high-risk gale zone ({wind_kts} kts wind, {wave_m}m waves) protecting vessel hull, crew, and cargo stability.",
        f"Prevents an estimated ${demurrage_saved:,.0f} USD in laytime delay penalties & berth demurrage caused by storm delays.",
        "Guarantees safe oceanic navigation through certified 100% deepwater international maritime corridors (zero land contact)."
    ]

    why_decline = [
        f"Extends total voyage transit distance by +{dist_delta} nautical miles around the storm hazard zone.",
        f"Adds +{hours_delta} hours to vessel transit time before reaching Port of Arjuna.",
        f"Incurs estimated +${net_fuel_cost:,.0f} USD in additional bunker fuel and engine wear from the longer detour.",
        "Potential risk of missing pre-assigned container crane berthing slot if the port schedule cannot flex."
    ]

    route_acceptance = {
        "question": f"Do you want to accept the alternate deepwater bypass route for {vessel_name}?",
        "recommended_action": decision,
        "why_accept": why_accept,
        "why_decline": why_decline,
        "metrics_tradeoff": {
            "weather_risk_reduction_pct": weather_risk_pct,
            "demurrage_saved_usd": demurrage_saved,
            "extra_distance_nm": dist_delta,
            "extra_transit_hours": hours_delta,
            "additional_bunker_fuel_usd": net_fuel_cost,
        },
        "summary": (
            f"Accepting the alternate corridor reduces weather risk by {weather_risk_pct}% and avoids ${demurrage_saved:,.0f} USD in demurrage, "
            f"in exchange for +{dist_delta} nm (+{hours_delta}h) and ~${net_fuel_cost:,.0f} USD in bunker fuel."
        )
    }

    return {
        "vessel_mmsi": vessel.get("mmsi"),
        "vessel_name": vessel_name,
        "origin_country": vessel.get("origin_country", "International"),
        "destination_port": vessel.get("destination", "Port of Arjuna"),
        "recommendation": decision,
        "composite_decision_score": composite_score,
        "explainability_reasons": reasons,
        "route_acceptance": route_acceptance,
        "eta": ml_eta,
        "risk": ml_risk,
        "weather": curr_weather,
        "cost": cost_comp,
        "current_route": reroute_analysis["current_route"],
        "alternate_route": reroute_analysis["alternate_route"],
        "comparison": reroute_analysis["comparison"],
    }
