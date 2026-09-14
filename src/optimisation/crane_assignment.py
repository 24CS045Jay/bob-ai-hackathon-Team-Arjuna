"""
PortFlow AI — Crane Assignment Scheduler (Contract B)
Earliest Deadline First (EDF) algorithm allocating 7 STS cranes to berthed container & bulk vessels.
Optimizes crane moves per hour, crane gang balance, and minimizes demurrage risk.
"""

from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

CANONICAL_CRANES = [
    {"crane_id": "CR-01", "name": "Gantry-1 Super Post-Panamax", "zone_id": "B", "compatible_berths": ["B01", "B02"], "moves_per_hour": 35, "status": "operational"},
    {"crane_id": "CR-02", "name": "Gantry-2 Super Post-Panamax", "zone_id": "B", "compatible_berths": ["B01", "B02"], "moves_per_hour": 35, "status": "operational"},
    {"crane_id": "CR-03", "name": "Gantry-3 Post-Panamax", "zone_id": "B", "compatible_berths": ["B03", "B04"], "moves_per_hour": 32, "status": "operational"},
    {"crane_id": "CR-04", "name": "Gantry-4 Post-Panamax", "zone_id": "B", "compatible_berths": ["B03", "B04"], "moves_per_hour": 30, "status": "operational"},
    {"crane_id": "CR-05", "name": "Gantry-5 Panamax STS", "zone_id": "C", "compatible_berths": ["B05", "B06"], "moves_per_hour": 28, "status": "operational"},
    {"crane_id": "CR-06", "name": "Gantry-6 Panamax STS", "zone_id": "C", "compatible_berths": ["B05", "B06"], "moves_per_hour": 26, "status": "operational"},
    {"crane_id": "CR-07", "name": "Mobile Harbor Crane MHC-1", "zone_id": "E", "compatible_berths": ["B09", "B10"], "moves_per_hour": 22, "status": "operational"},
]


def optimize_crane_assignments(
    berth_assignments: List[Dict[str, Any]],
    cranes: Optional[List[Dict[str, Any]]] = None,
    current_time_iso: Optional[str] = None,
) -> Dict[str, Any]:
    """
    EDF Crane Scheduler.
    Takes active/scheduled berth assignments and allocates compatible STS cranes.
    Returns:
      crane_allocations: list of assignments {crane_id, vessel_id, berth_id, moves_per_hour, moves_allocated}
      vessel_schedules: estimated work completion time per vessel
      metrics: total_throughput_moves_per_hr, active_cranes_pct
    """
    if cranes is None:
        cranes = [dict(c) for c in CANONICAL_CRANES]

    if current_time_iso:
        base_time = datetime.fromisoformat(current_time_iso.replace("Z", "+00:00"))
    else:
        base_time = datetime.now(timezone.utc)

    # Sort vessels by Earliest Deadline First (scheduled_end ASC)
    sorted_berth_tasks = sorted(
        [b for b in berth_assignments if b.get("berth_id")],
        key=lambda x: x.get("scheduled_end", "9999-12-31"),
    )

    available_cranes = {c["crane_id"]: c for c in cranes if c.get("status") == "operational"}
    assigned_cranes = set()
    crane_allocations = []
    vessel_gang_counts: Dict[str, List[str]] = {}

    for task in sorted_berth_tasks:
        b_id = task["berth_id"]
        v_id = task["vessel_id"]
        teu = float(task.get("teu", 1200) or 1200)

        # Container terminal berths can take up to 2 cranes simultaneously
        max_cranes_for_berth = 2 if b_id in ["B01", "B02", "B03", "B04"] else 1
        compatible_free_cranes = [
            c for cid, c in available_cranes.items()
            if cid not in assigned_cranes and b_id in c["compatible_berths"]
        ]

        assigned_for_vessel = []
        for cr in compatible_free_cranes[:max_cranes_for_berth]:
            assigned_cranes.add(cr["crane_id"])
            assigned_for_vessel.append(cr)
            crane_allocations.append({
                "crane_id": cr["crane_id"],
                "crane_name": cr["name"],
                "vessel_id": v_id,
                "vessel_name": task.get("vessel_name", "Unknown"),
                "berth_id": b_id,
                "moves_per_hour": cr["moves_per_hour"],
                "status": "active_discharge",
            })

        vessel_gang_counts[v_id] = [c["crane_id"] for c in assigned_for_vessel]

    # Calculate throughput & duration for each vessel
    vessel_summaries = []
    total_moves_hr = 0
    for task in sorted_berth_tasks:
        v_id = task["vessel_id"]
        cr_list = vessel_gang_counts.get(v_id, [])
        combined_moves_hr = sum(available_cranes[cid]["moves_per_hour"] for cid in cr_list)
        total_moves_hr += combined_moves_hr
        teu_moves = float(task.get("teu", 1200) or 1200)
        est_work_hours = round(teu_moves / max(20, combined_moves_hr), 1) if combined_moves_hr > 0 else round(task.get("dwell_hours", 12.0), 1)

        vessel_summaries.append({
            "vessel_id": v_id,
            "vessel_name": task.get("vessel_name", "Unknown"),
            "berth_id": task["berth_id"],
            "assigned_cranes": cr_list,
            "net_moves_per_hour": combined_moves_hr,
            "estimated_operation_hours": est_work_hours,
        })

    active_pct = round((len(assigned_cranes) / max(1, len(cranes))) * 100.0, 1)

    return {
        "allocations": crane_allocations,
        "vessel_crane_schedules": vessel_summaries,
        "metrics": {
            "total_cranes": len(cranes),
            "allocated_cranes": len(assigned_cranes),
            "crane_utilization_pct": active_pct,
            "total_throughput_moves_per_hr": total_moves_hr,
        },
    }


if __name__ == "__main__":
    b_sample = [
        {"vessel_id": "V-001", "vessel_name": "MSC Arjuna", "berth_id": "B01", "teu": 22000, "scheduled_end": "2026-09-15T12:00:00Z"},
        {"vessel_id": "V-002", "vessel_name": "Maersk Baroda", "berth_id": "B02", "teu": 14000, "scheduled_end": "2026-09-15T08:00:00Z"},
        {"vessel_id": "V-003", "vessel_name": "CMA CGM Surat", "berth_id": "B05", "teu": 4200, "scheduled_end": "2026-09-15T18:00:00Z"},
    ]
    c_res = optimize_crane_assignments(b_sample)
    print("Crane allocations:", len(c_res["allocations"]), "Throughput:", c_res["metrics"]["total_throughput_moves_per_hr"])
