"""
PortFlow AI — Currency-Aware Cost Optimization & Valuation Service
Normalizes multi-currency maritime operating costs into a common base currency (USD).
Calculates fuel expenditure, port dues, laytime demurrage, and expected delay loss.
"""

import time
from typing import Dict, Any, Optional
import requests

# Live/Cached Foreign Exchange Rates to USD
_EXCHANGE_RATES_TO_USD = {
    "USD": 1.0,
    "EUR": 1.085,
    "GBP": 1.295,
    "AUD": 0.665,
    "SGD": 0.748,
    "VND": 0.0000401,   # ~24,950 VND per 1 USD
    "INR": 0.0120,      # ~83.5 INR per 1 USD
    "CNY": 0.138,       # ~7.23 CNY per 1 USD
    "PKR": 0.0036,      # ~278 PKR per 1 USD
}

_LAST_FX_FETCH = 0
FX_CACHE_TTL = 3600  # 1 hour


def get_exchange_rates() -> Dict[str, float]:
    """
    Returns latest currency exchange rates relative to USD.
    """
    global _LAST_FX_FETCH
    now = time.time()
    if now - _LAST_FX_FETCH < FX_CACHE_TTL:
        return _EXCHANGE_RATES_TO_USD

    try:
        # Attempt open exchange rate fetch (e.g. open.er-api.com)
        res = requests.get("https://open.er-api.com/v6/latest/USD", timeout=3.0)
        if res.status_code == 200:
            rates = res.json().get("rates", {})
            for cur in _EXCHANGE_RATES_TO_USD.keys():
                if cur in rates and rates[cur] > 0:
                    # Invert if needed to represent 1 UNIT = X USD
                    _EXCHANGE_RATES_TO_USD[cur] = round(1.0 / rates[cur], 7)
            _EXCHANGE_RATES_TO_USD["USD"] = 1.0
            _LAST_FX_FETCH = now
    except Exception:
        pass

    return _EXCHANGE_RATES_TO_USD


def convert_to_usd(amount: float, source_currency: str) -> float:
    """Converts a monetary amount in source_currency to USD."""
    rates = get_exchange_rates()
    cur = (source_currency or "USD").upper().strip()
    rate = rates.get(cur, 1.0)
    return round(amount * rate, 2)


def calculate_voyage_cost(
    distance_nm: float,
    transit_hours: float,
    vessel_type: str = "container",
    hourly_demurrage_usd: float = 2500.0,
    delay_hours: float = 0.0,
    weather_score: float = 0.2,
    fuel_price_per_ton_usd: float = 620.0,
) -> Dict[str, Any]:
    """
    Calculates total estimated operational and financial voyage cost in USD:
    Total Cost = Fuel Cost + Port Dues + Operational Opex + Delay Penalty + Risk Loss Exposure.
    """
    # Average fuel consumption based on vessel type (tons per hour at sea)
    burn_rates = {
        "container": 4.2,
        "feeder": 2.1,
        "tanker": 3.8,
        "bulk": 2.9,
    }
    v_norm = vessel_type.lower()
    tons_per_hour = burn_rates.get("container", 3.5)
    for k, v in burn_rates.items():
        if k in v_norm:
            tons_per_hour = v
            break

    fuel_consumed_tons = round(tons_per_hour * transit_hours, 1)
    fuel_cost_usd = round(fuel_consumed_tons * fuel_price_per_ton_usd, 2)

    # Port handling and quay dues (flat estimate)
    port_dues_usd = 8500.0 if "feeder" in v_norm else 16500.0

    # Daily operational crew & vessel amortized opex ($450/hour)
    opex_usd = round(transit_hours * 450.0, 2)

    # Delay / demurrage cost
    delay_cost_usd = round(delay_hours * hourly_demurrage_usd, 2)

    # Weather risk loss exposure (cargo insurance & heavy-weather wear buffer)
    risk_exposure_usd = round(weather_score * 12000.0, 2)

    total_cost_usd = round(
        fuel_cost_usd + port_dues_usd + opex_usd + delay_cost_usd + risk_exposure_usd, 2
    )

    return {
        "total_cost_usd": total_cost_usd,
        "breakdown": {
            "fuel_cost_usd": fuel_cost_usd,
            "port_dues_usd": port_dues_usd,
            "operational_opex_usd": opex_usd,
            "delay_demurrage_usd": delay_cost_usd,
            "weather_risk_exposure_usd": risk_exposure_usd,
        },
        "fuel_consumption_tons": fuel_consumed_tons,
        "delay_hours": delay_hours,
    }


def compare_routes_cost(
    curr_route_metrics: Dict[str, Any],
    alt_route_metrics: Dict[str, Any],
    vessel: Dict[str, Any],
    curr_weather_score: float,
    alt_weather_score: float,
) -> Dict[str, Any]:
    """
    Compares financial cost between current and alternate routes.
    Quantifies net savings from avoided delay & risk exposure.
    """
    v_type = vessel.get("vessel_type") or vessel.get("type") or "container"
    hourly_rate = float(vessel.get("hourly_rate_usd") or vessel.get("hourlyWaitingRateUSD") or 2800.0)
    cur = vessel.get("billing_currency") or vessel.get("billingCurrency") or "USD"

    # Current route has high expected weather delay if weather_score is high
    curr_delay_hours = round(max(0.0, curr_weather_score * 6.5), 1)
    alt_delay_hours = 0.5  # Minimal delay on clear deepwater corridor

    curr_cost = calculate_voyage_cost(
        distance_nm=curr_route_metrics["distance_nm"],
        transit_hours=curr_route_metrics["transit_hours"],
        vessel_type=v_type,
        hourly_demurrage_usd=hourly_rate,
        delay_hours=curr_delay_hours,
        weather_score=curr_weather_score,
    )

    alt_cost = calculate_voyage_cost(
        distance_nm=alt_route_metrics["distance_nm"],
        transit_hours=alt_route_metrics["transit_hours"],
        vessel_type=v_type,
        hourly_demurrage_usd=hourly_rate,
        delay_hours=alt_delay_hours,
        weather_score=alt_weather_score,
    )

    cost_diff_usd = round(alt_cost["total_cost_usd"] - curr_cost["total_cost_usd"], 2)
    expected_delay_loss_avoided_usd = round(
        (curr_cost["breakdown"]["delay_demurrage_usd"] + curr_cost["breakdown"]["weather_risk_exposure_usd"])
        - (alt_cost["breakdown"]["delay_demurrage_usd"] + alt_cost["breakdown"]["weather_risk_exposure_usd"]),
        2,
    )

    return {
        "billing_currency": cur,
        "current_route_cost_usd": curr_cost["total_cost_usd"],
        "alternate_route_cost_usd": alt_cost["total_cost_usd"],
        "net_cost_difference_usd": cost_diff_usd,
        "expected_delay_loss_avoided_usd": expected_delay_loss_avoided_usd,
        "cost_efficient_recommendation": "ALTERNATE" if expected_delay_loss_avoided_usd > abs(cost_diff_usd) else "CURRENT",
        "current_breakdown": curr_cost["breakdown"],
        "alternate_breakdown": alt_cost["breakdown"],
    }
