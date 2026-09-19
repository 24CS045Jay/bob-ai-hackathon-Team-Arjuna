"""
PortFlow AI — Berth Assignment Optimizer (Contract B)
Greedy Priority Queue algorithm assigning inbound vessels to terminal berths based on:
- Vessel draft + minimum 1.0m Under-Keel Clearance (UKC)
- Vessel Length Overall (LOA) <= Berth Length
- Terminal cargo type compatibility
- Priority weighting (ultra-large container vessels / reefers prioritized)
"""

import heapq
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

# Canonical berths definition (Port of Arjuna)
CANONICAL_BERTHS = [
    {"berth_id": "B01", "zone_id": "B", "terminal": "Container Terminal 1", "max_length_m": 400.0, "max_draft_m": 16.5, "cargo_types": ["container"]},
    {"berth_id": "B02", "zone_id": "B", "terminal": "Container Terminal 1", "max_length_m": 380.0, "max_draft_m": 16.0, "cargo_types": ["container"]},
    {"berth_id": "B03", "zone_id": "B", "terminal": "Container Terminal 2", "max_length_m": 366.0, "max_draft_m": 15.5, "cargo_types": ["container"]},
    {"berth_id": "B04", "zone_id": "B", "terminal": "Container Terminal 2", "max_length_m": 350.0, "max_draft_m": 15.0, "cargo_types": ["container"]},
    {"berth_id": "B05", "zone_id": "C", "terminal": "Feeder Terminal", "max_length_m": 220.0, "max_draft_m": 12.0, "cargo_types": ["container", "general"]},
    {"berth_id": "B06", "zone_id": "C", "terminal": "Feeder Terminal", "max_length_m": 200.0, "max_draft_m": 11.5, "cargo_types": ["container", "general"]},
    {"berth_id": "B07", "zone_id": "D", "terminal": "Liquid Bulk / Tanker", "max_length_m": 280.0, "max_draft_m": 15.5, "cargo_types": ["tanker", "lng"]},
    {"berth_id": "B08", "zone_id": "D", "terminal": "Chemical Pier", "max_length_m": 240.0, "max_draft_m": 14.0, "cargo_types": ["tanker", "chemical"]},
    {"berth_id": "B09", "zone_id": "E", "terminal": "Dry Bulk Terminal", "max_length_m": 240.0, "max_draft_m": 13.0, "cargo_types": ["bulk"]},
    {"berth_id": "B10", "zone_id": "E", "terminal": "Agri-Bulk Berth", "max_length_m": 225.0, "max_draft_m": 12.5, "cargo_types": ["bulk"]},
    {"berth_id": "B11", "zone_id": "F", "terminal": "Ro-Ro & Ferry Terminal", "max_length_m": 200.0, "max_draft_m": 10.0, "cargo_types": ["roro", "ferry"]},
    {"berth_id": "B12", "zone_id": "F", "terminal": "Multipurpose General", "max_length_m": 190.0, "max_draft_m": 9.5, "cargo_types": ["general", "roro"]},
]


def is_compatible(vessel_type: str, berth_cargo_types: List[str]) -> bool:
    """Checks if vessel cargo type matches berth facilities."""
    v_norm = (vessel_type or "container").lower().strip()
    for allowed in berth_cargo_types:
        if allowed in v_norm or v_norm in allowed:
            return True
    return False


def estimate_dwell_hours(vessel: Dict[str, Any]) -> float:
    """Estimates berth dwell hours based on TEU/cargo size."""
    teu = vessel.get("teu", 0) or (vessel.get("dwt", 0) / 25.0) or 1200
    # Average 65 TEU moves per vessel-hour across available cranes
    hours = max(4.0, min(48.0, teu / 65.0))
    return round(hours, 1)


def optimize_berth_assignments(
    vessels: List[Dict[str, Any]],
    berths: Optional[List[Dict[str, Any]]] = None,
    current_time_iso: Optional[str] = None,
    commercial_strategy: str = "revenue_max",  # "revenue_max" (hold USD vessel) or "cost_min" (clear USD vessel first)
) -> Dict[str, Any]:
    """
    Greedy priority queue berth allocation with commercial currency tariff weighting.
    Returns:
      assignments: list of assigned vessels with berth_id, start_time, end_time, dwell_hours
      waitlist: vessels waiting in anchorage
      metrics: berth_utilization_pct, avg_waiting_time_hours, commercial_strategy
    """
    if berths is None:
        berths = [dict(b) for b in CANONICAL_BERTHS]

    # Track berth availability schedule: berth_id -> next available datetime
    if current_time_iso:
        base_time = datetime.fromisoformat(current_time_iso.replace("Z", "+00:00"))
    else:
        base_time = datetime.now(timezone.utc)
    berth_available = {b["berth_id"]: base_time for b in berths}
    berth_map = {b["berth_id"]: b for b in berths}

    # Queue of vessels prioritized by:
    # Priority rank (high=3, normal=2, low=1) inverted for min-heap
    # Commercial currency waiting rate
    # Arrival time
    # TEU descending
    pq = []
    for idx, v in enumerate(vessels):
        prio = v.get("priority", 2)
        # Priority mapping: 3 -> high, 2 -> med, 1 -> low
        prio_weight = 4 - prio  # 1 is highest priority

        # Currency-based waiting tariff (USD vs VND)
        waiting_rate = float(v.get("hourly_waiting_rate_usd", 1500) or 1500)
        if commercial_strategy == "revenue_max":
            # Port earns higher dollar fees while American ship waits; berth lower-tariff ships first
            currency_weight = waiting_rate
        else:
            # Minimize expensive demurrage penalties; berth USD ship first
            currency_weight = -waiting_rate

        try:
            arr_str = str(v.get("eta_utc", base_time.isoformat())).replace("Z", "+00:00")
            arr_dt = datetime.fromisoformat(arr_str)
            if arr_dt.tzinfo is None:
                arr_dt = arr_dt.replace(tzinfo=timezone.utc)
        except Exception:
            arr_dt = base_time + timedelta(hours=idx * 2)

        teu = float(v.get("teu", 1000) or 1000)
        # item in heap: (prio_weight, currency_weight, arrival_timestamp, -teu, index, vessel, arr_dt)
        heapq.heappush(pq, (prio_weight, currency_weight, arr_dt.timestamp(), -teu, idx, v, arr_dt))

    assigned_records = []
    unassigned = []
    total_wait_hours = 0.0

    while pq:
        _, _, _, _, _, vessel, arr_dt = heapq.heappop(pq)
        v_draft = float(vessel.get("draft_m", 10.0))
        v_len = float(vessel.get("length_m", 200.0))
        v_type = vessel.get("cargo_type", "container")

        # Find best compatible berth that is free earliest
        candidate_berths = []
        for b in berths:
            # Physical safety constraints:
            # 1. Berth draft must accommodate vessel draft + 1.0m UKC
            if b["max_draft_m"] < (v_draft + 1.0):
                continue
            # 2. Berth length must accommodate vessel LOA
            if b["max_length_m"] < v_len:
                continue
            # 3. Cargo compatibility
            if not is_compatible(v_type, b["cargo_types"]):
                continue

            avail_dt = berth_available[b["berth_id"]]
            earliest_start = max(arr_dt, avail_dt)
            wait_hrs = max(0.0, (earliest_start - arr_dt).total_seconds() / 3600.0)
            candidate_berths.append((wait_hrs, earliest_start, b["berth_id"]))

        if candidate_berths:
            candidate_berths.sort(key=lambda x: (x[0], x[2]))
            chosen_wait, start_dt, chosen_berth_id = candidate_berths[0]
            dwell = estimate_dwell_hours(vessel)
            end_dt = start_dt + timedelta(hours=dwell)

            # Update berth availability
            berth_available[chosen_berth_id] = end_dt
            total_wait_hours += chosen_wait

            assigned_records.append({
                "vessel_id": vessel.get("vessel_id", f"V-{idx}"),
                "vessel_name": vessel.get("name", "Unknown"),
                "berth_id": chosen_berth_id,
                "zone_id": berth_map[chosen_berth_id]["zone_id"],
                "terminal": berth_map[chosen_berth_id]["terminal"],
                "scheduled_start": start_dt.isoformat(),
                "scheduled_end": end_dt.isoformat(),
                "dwell_hours": dwell,
                "wait_hours": round(chosen_wait, 1),
                "ukc_clearance_m": round(berth_map[chosen_berth_id]["max_draft_m"] - v_draft, 2),
                "status": "assigned" if chosen_wait < 0.1 else "scheduled_with_queue",
            })
        else:
            unassigned.append({
                "vessel_id": vessel.get("vessel_id", f"V-{idx}"),
                "vessel_name": vessel.get("name", "Unknown"),
                "reason": "No compatible berth meeting draft + 1.0m UKC and LOA constraints",
                "draft_m": v_draft,
                "length_m": v_len,
            })

    utilization_pct = round((len(assigned_records) / max(1, len(berths))) * 100.0, 1)
    avg_wait = round(total_wait_hours / max(1, len(assigned_records)), 1)

    return {
        "assignments": assigned_records,
        "unassigned_or_waiting": unassigned,
        "metrics": {
            "total_vessels": len(vessels),
            "assigned_count": len(assigned_records),
            "unassigned_count": len(unassigned),
            "berth_utilization_pct": min(100.0, utilization_pct),
            "average_wait_time_hours": avg_wait,
        },
    }


if __name__ == "__main__":
    sample_vessels = [
        {"vessel_id": "V-001", "name": "MSC Arjuna", "length_m": 399.9, "draft_m": 15.2, "teu": 24000, "cargo_type": "container", "priority": 3},
        {"vessel_id": "V-002", "name": "Maersk Baroda", "length_m": 366.0, "draft_m": 14.2, "teu": 15500, "cargo_type": "container", "priority": 2},
        {"vessel_id": "V-003", "name": "CMA CGM Surat", "length_m": 294.0, "draft_m": 11.5, "teu": 5000, "cargo_type": "container", "priority": 1},
        {"vessel_id": "V-004", "name": "Bharat Pioneer", "length_m": 274.0, "draft_m": 14.5, "dwt": 115000, "cargo_type": "tanker", "priority": 2},
    ]
    res = optimize_berth_assignments(sample_vessels)
    print("Assigned:", len(res["assignments"]), "Metrics:", res["metrics"])
