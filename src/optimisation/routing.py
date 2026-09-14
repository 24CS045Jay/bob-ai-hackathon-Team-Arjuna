"""
PortFlow AI — Dynamic Channel Routing (Contract B)
Dijkstra shortest-path algorithm across 14 port waypoints enforcing Under-Keel Clearance (UKC)
and dynamic tidal water level constraints.
"""

import heapq
import math
from typing import List, Dict, Any, Optional, Tuple

WAYPOINTS = {
    "WP01": {"name": "Outer Pilot Station", "lat": 21.650, "lng": 72.480, "zone": "A"},
    "WP02": {"name": "Outer Anchorage Bravo", "lat": 21.662, "lng": 72.495, "zone": "A"},
    "WP03": {"name": "Fairway Buoy Alpha", "lat": 21.675, "lng": 72.510, "zone": "A"},
    "WP04": {"name": "Main Approach Gate", "lat": 21.688, "lng": 72.525, "zone": "A"},
    "WP05": {"name": "Outer Channel Inbound", "lat": 21.700, "lng": 72.540, "zone": "B"},
    "WP06": {"name": "Turning Basin North", "lat": 21.715, "lng": 72.555, "zone": "B"},
    "WP07": {"name": "Container Berth B01-02 Spur", "lat": 21.722, "lng": 72.565, "zone": "B"},
    "WP08": {"name": "Container Berth B03-04 Spur", "lat": 21.728, "lng": 72.570, "zone": "B"},
    "WP09": {"name": "Feeder Terminal Cut", "lat": 21.710, "lng": 72.570, "zone": "C"},
    "WP10": {"name": "Feeder Berth B05-06 Access", "lat": 21.716, "lng": 72.582, "zone": "C"},
    "WP11": {"name": "Tanker Basin Deep Channel", "lat": 21.690, "lng": 72.560, "zone": "D"},
    "WP12": {"name": "Liquid Berth B07-08 Jetty", "lat": 21.695, "lng": 72.575, "zone": "D"},
    "WP13": {"name": "Bulk Terminal Channel", "lat": 21.705, "lng": 72.525, "zone": "E"},
    "WP14": {"name": "General & Ro-Ro Pier Line", "lat": 21.735, "lng": 72.585, "zone": "F"},
}

# Graph edges: (u, v, distance_nm, base_depth_m)
NAUTICAL_EDGES = [
    ("WP01", "WP02", 1.2, 18.0),
    ("WP01", "WP03", 2.1, 17.5),
    ("WP02", "WP03", 1.4, 16.5),
    ("WP03", "WP04", 1.8, 16.0),
    ("WP04", "WP05", 1.6, 15.5),
    ("WP05", "WP06", 1.5, 15.0),
    ("WP06", "WP07", 0.9, 16.5),
    ("WP07", "WP08", 0.8, 15.5),
    ("WP05", "WP09", 1.7, 12.5),
    ("WP09", "WP10", 0.9, 12.0),
    ("WP04", "WP11", 2.0, 16.0),
    ("WP11", "WP12", 1.1, 15.5),
    ("WP04", "WP13", 1.5, 13.5),
    ("WP06", "WP14", 1.8, 10.5),
    ("WP08", "WP14", 1.2, 10.5),
]


def build_adjacency_graph():
    graph = {wp: [] for wp in WAYPOINTS}
    for u, v, dist, depth in NAUTICAL_EDGES:
        graph[u].append({"to": v, "distance_nm": dist, "base_depth_m": depth})
        graph[v].append({"to": u, "distance_nm": dist, "base_depth_m": depth})
    return graph


GRAPH = build_adjacency_graph()


def plan_vessel_route(
    start_wp: str,
    end_wp: str,
    draft_m: float,
    tide_height_m: float = 3.0,
    min_ukc_m: float = 1.2,
) -> Dict[str, Any]:
    """
    Dijkstra shortest path respecting draft + minimum Under-Keel Clearance (UKC).
    effective_depth = base_depth_m + tide_height_m
    Constraint: effective_depth >= draft_m + min_ukc_m
    """
    if start_wp not in WAYPOINTS:
        start_wp = "WP01"
    if end_wp not in WAYPOINTS:
        end_wp = "WP07"

    required_water_depth = draft_m + min_ukc_m

    # Dijkstra priority queue: (distance, current_wp, path, min_ukc_encountered)
    pq = [(0.0, start_wp, [start_wp], float("inf"))]
    visited = {}

    while pq:
        dist, curr, path, min_ukc = heapq.heappop(pq)

        if curr in visited and visited[curr] <= dist:
            continue
        visited[curr] = dist

        if curr == end_wp:
            # Reached destination safely
            waypoints_detail = []
            for wp_code in path:
                info = dict(WAYPOINTS[wp_code])
                info["waypoint_id"] = wp_code
                waypoints_detail.append(info)

            est_speed_knots = 10.0
            transit_time_minutes = round((dist / est_speed_knots) * 60.0, 1)

            return {
                "route_status": "optimal_safe",
                "start_waypoint": start_wp,
                "end_waypoint": end_wp,
                "total_distance_nm": round(dist, 2),
                "estimated_transit_minutes": transit_time_minutes,
                "path": path,
                "waypoints": waypoints_detail,
                "tide_height_m": tide_height_m,
                "vessel_draft_m": draft_m,
                "minimum_under_keel_clearance_m": round(min_ukc, 2) if min_ukc != float("inf") else 2.5,
                "advisories": (
                    ["Low tide fairway restriction active; route verified for UKC compliance"]
                    if tide_height_m < 2.0
                    else ["Nominal fairway navigation draft clearance"]
                ),
            }

        for edge in GRAPH[curr]:
            nxt = edge["to"]
            effective_depth = edge["base_depth_m"] + tide_height_m
            edge_ukc = effective_depth - draft_m

            if effective_depth < required_water_depth:
                # Violates UKC safety constraint
                continue

            new_dist = dist + edge["distance_nm"]
            new_min_ukc = min(min_ukc, edge_ukc)

            if nxt not in visited or new_dist < visited[nxt]:
                heapq.heappush(pq, (new_dist, nxt, path + [nxt], new_min_ukc))

    # If no path found due to depth constraints
    return {
        "route_status": "blocked_insufficient_depth",
        "start_waypoint": start_wp,
        "end_waypoint": end_wp,
        "total_distance_nm": None,
        "estimated_transit_minutes": None,
        "path": [],
        "waypoints": [],
        "tide_height_m": tide_height_m,
        "vessel_draft_m": draft_m,
        "minimum_under_keel_clearance_m": 0.0,
        "advisories": [
            f"Draft {draft_m}m + UKC {min_ukc_m}m exceeds channel capacity at current tide ({tide_height_m}m).",
            "Hold at Outer Anchorage Bravo (WP02) until high water window.",
        ],
    }


if __name__ == "__main__":
    r1 = plan_vessel_route("WP01", "WP07", draft_m=14.5, tide_height_m=3.2)
    print("Deep vessel route:", r1["route_status"], "Path:", r1["path"], "Dist:", r1["total_distance_nm"])
    r2 = plan_vessel_route("WP01", "WP14", draft_m=13.0, tide_height_m=1.0)
    print("Shallow channel route with low tide:", r2["route_status"])
