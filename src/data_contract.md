# PortFlow AI — Canonical Data Contract & Port State Seed
## Team Arjuna — Shared Ground Truth for ML, Optimisation, Backend & Frontend

This document defines the canonical port geography, vessel inventory, berth specifications, crane allocations, and waypoint graph for the **Port of Arjuna**. All components (ML training pipelines, discrete optimisation heuristics, SQLite seed routines, and frontend visualizations) conform strictly to these data models.

---

## 1. Port Geography — 6 Operational Zones

The Port of Arjuna is structured into 6 operational zones across the deepwater navigation channel:

```
Port of Arjuna — Zone Map Layout

  ┌──────────────────────────────────────────────────────────┐
  │  OUTER ANCHORAGE                                         │
  │  (Vessels wait at roads prior to channel transit)        │
  │                                                          │
  │     Zone A         Zone B         Zone C                 │
  │   [CONTAINER]    [CONTAINER]    [BULK CARGO]             │
  │   Berths A1-A3   Berths B1-B3   Berths C1-C2            │
  │                                                          │
  │     Zone D         Zone E         Zone F                 │
  │   [RO-RO]        [LIQUID BULK]  [SERVICE/REPAIR]        │
  │   Berths D1-D2   Berths E1-E2   Berth F1                │
  │                                                          │
  │  MAIN CHANNEL ════════════════════════════════════       │
  └──────────────────────────────────────────────────────────┘
```

### Zone Specifications Table

| Zone ID | Name | Cargo Type | Berths | Max Vessel Size | Quayside Equipment | Navigation Segment |
|---|---|---|---|---|---|---|
| **A** | North Container Terminal | Container | A1, A2, A3 | Large (>300m LOA) | 3 Super Post-Panamax Gantry (A-GC1..3) | North Deep Channel |
| **B** | South Container Terminal | Container | B1, B2, B3 | Medium (200–300m LOA)| 3 Post-Panamax Gantry (B-GC1..3) | North Channel |
| **C** | Dry Bulk Basin | Bulk Cargo | C1, C2 | Medium | 2 Continuous Bulk Unloaders (C-BC1..2) | Central Channel |
| **D** | Ro-Ro Vehicle Basin | RoRo Vehicles | D1, D2 | Medium | 0 (Ramp-based shore link) | South Basin |
| **E** | Liquid Petroleum Pier | Liquid Bulk | E1, E2 | Small (<200m LOA) | 0 (Marine loading arms / pipeline) | South Channel |
| **F** | Shipyard & Bunkering | Service/Repair | F1 | Small | 1 Mobile Harbor Crane (F-MC1) | South Slipway |

### Navigation Waypoint Adjacency Graph

Transit edge costs are computed as:
$$\text{Weight} = \text{base\_transit\_minutes} + (\text{zone\_congestion\_score} \times 0.5)$$

```
ANCHORAGE ──> Zone A <──> Zone B <──> Zone C
                │            │           │
              Zone D <──> Zone E <──> Zone F
```

---

## 2. Canonical Berths (12 Total)

```json
[
  { "berth_id": "A1", "zone_id": "A", "compatible_types": ["container"], "compatible_sizes": ["large", "medium"], "current_occupant": null, "available_at_hours_from_now": 0.0 },
  { "berth_id": "A2", "zone_id": "A", "compatible_types": ["container"], "compatible_sizes": ["large", "medium"], "current_occupant": null, "available_at_hours_from_now": 0.0 },
  { "berth_id": "A3", "zone_id": "A", "compatible_types": ["container"], "compatible_sizes": ["large", "medium"], "current_occupant": null, "available_at_hours_from_now": 4.0 },
  { "berth_id": "B1", "zone_id": "B", "compatible_types": ["container"], "compatible_sizes": ["medium", "small"], "current_occupant": null, "available_at_hours_from_now": 0.0 },
  { "berth_id": "B2", "zone_id": "B", "compatible_types": ["container"], "compatible_sizes": ["medium", "small"], "current_occupant": null, "available_at_hours_from_now": 2.0 },
  { "berth_id": "B3", "zone_id": "B", "compatible_types": ["container"], "compatible_sizes": ["medium", "small"], "current_occupant": null, "available_at_hours_from_now": 6.5 },
  { "berth_id": "C1", "zone_id": "C", "compatible_types": ["bulk"], "compatible_sizes": ["medium", "small"], "current_occupant": null, "available_at_hours_from_now": 1.0 },
  { "berth_id": "C2", "zone_id": "C", "compatible_types": ["bulk"], "compatible_sizes": ["medium", "small"], "current_occupant": null, "available_at_hours_from_now": 0.0 },
  { "berth_id": "D1", "zone_id": "D", "compatible_types": ["roro"], "compatible_sizes": ["medium", "small"], "current_occupant": null, "available_at_hours_from_now": 0.0 },
  { "berth_id": "D2", "zone_id": "D", "compatible_types": ["roro"], "compatible_sizes": ["medium", "small"], "current_occupant": null, "available_at_hours_from_now": 3.0 },
  { "berth_id": "E1", "zone_id": "E", "compatible_types": ["liquid"], "compatible_sizes": ["small"], "current_occupant": null, "available_at_hours_from_now": 0.0 },
  { "berth_id": "E2", "zone_id": "E", "compatible_types": ["liquid"], "compatible_sizes": ["small"], "current_occupant": null, "available_at_hours_from_now": 5.0 },
  { "berth_id": "F1", "zone_id": "F", "compatible_types": ["service"], "compatible_sizes": ["small"], "current_occupant": null, "available_at_hours_from_now": 0.0 }
]
```

---

## 3. Canonical Cranes & Handling Equipment (7 Total)

```json
[
  { "crane_id": "A-GC1", "zone_id": "A", "type": "gantry", "current_status": "available", "available_at_hours_from_now": 0.0 },
  { "crane_id": "A-GC2", "zone_id": "A", "type": "gantry", "current_status": "available", "available_at_hours_from_now": 0.0 },
  { "crane_id": "A-GC3", "zone_id": "A", "type": "gantry", "current_status": "available", "available_at_hours_from_now": 3.5 },
  { "crane_id": "B-GC1", "zone_id": "B", "type": "gantry", "current_status": "available", "available_at_hours_from_now": 0.0 },
  { "crane_id": "B-GC2", "zone_id": "B", "type": "gantry", "current_status": "available", "available_at_hours_from_now": 1.5 },
  { "crane_id": "B-GC3", "zone_id": "B", "type": "gantry", "current_status": "available", "available_at_hours_from_now": 0.0 },
  { "crane_id": "C-BC1", "zone_id": "C", "type": "bulk", "current_status": "available", "available_at_hours_from_now": 0.0 },
  { "crane_id": "C-BC2", "zone_id": "C", "type": "bulk", "current_status": "available", "available_at_hours_from_now": 2.0 },
  { "crane_id": "F-MC1", "zone_id": "F", "type": "mobile", "current_status": "available", "available_at_hours_from_now": 0.0 }
]
```

---

## 4. Canonical Seed Vessels (15 Fleet Vessels)

```json
[
  { "vessel_id": "V001", "vessel_name": "MV Arjuna Star", "type": "container", "size_class": "large", "eta_hours_from_now": 1.5, "cargo_tons": 54000, "expected_handling_hours": 8.0, "current_position": "anchorage" },
  { "vessel_id": "V002", "vessel_name": "MV Bhima Titan", "type": "container", "size_class": "large", "eta_hours_from_now": 2.0, "cargo_tons": 62000, "expected_handling_hours": 9.5, "current_position": "anchorage" },
  { "vessel_id": "V003", "vessel_name": "MV Karna Express", "type": "container", "size_class": "medium", "eta_hours_from_now": 3.0, "cargo_tons": 32000, "expected_handling_hours": 6.0, "current_position": "approaching" },
  { "vessel_id": "V004", "vessel_name": "MV Nakula Voyager", "type": "container", "size_class": "medium", "eta_hours_from_now": 4.5, "cargo_tons": 28000, "expected_handling_hours": 5.5, "current_position": "approaching" },
  { "vessel_id": "V005", "vessel_name": "MV Sahadeva Pioneer", "type": "container", "size_class": "medium", "eta_hours_from_now": 6.0, "cargo_tons": 31000, "expected_handling_hours": 6.0, "current_position": "approaching" },
  { "vessel_id": "V006", "vessel_name": "MV Drona Ore Carrier", "type": "bulk", "size_class": "medium", "eta_hours_from_now": 2.5, "cargo_tons": 45000, "expected_handling_hours": 10.0, "current_position": "anchorage" },
  { "vessel_id": "V007", "vessel_name": "MV Kripa Minerals", "type": "bulk", "size_class": "medium", "eta_hours_from_now": 5.0, "cargo_tons": 41000, "expected_handling_hours": 8.5, "current_position": "approaching" },
  { "vessel_id": "V008", "vessel_name": "MV Gandhari Transporter", "type": "roro", "size_class": "medium", "eta_hours_from_now": 1.0, "cargo_tons": 18000, "expected_handling_hours": 4.5, "current_position": "anchorage" },
  { "vessel_id": "V009", "vessel_name": "MV Kunti Highway", "type": "roro", "size_class": "medium", "eta_hours_from_now": 7.5, "cargo_tons": 19500, "expected_handling_hours": 5.0, "current_position": "approaching" },
  { "vessel_id": "V010", "vessel_name": "MV Krishna Petro", "type": "liquid", "size_class": "small", "eta_hours_from_now": 3.5, "cargo_tons": 14000, "expected_handling_hours": 7.0, "current_position": "anchorage" },
  { "vessel_id": "V011", "vessel_name": "MV Balarama Spirit", "type": "liquid", "size_class": "small", "eta_hours_from_now": 8.0, "cargo_tons": 16000, "expected_handling_hours": 7.5, "current_position": "approaching" },
  { "vessel_id": "V012", "vessel_name": "MV Vidura Support", "type": "service", "size_class": "small", "eta_hours_from_now": 0.5, "cargo_tons": 2500, "expected_handling_hours": 4.0, "current_position": "docked" },
  { "vessel_id": "V013", "vessel_name": "MV Abhimanyu Star", "type": "container", "size_class": "large", "eta_hours_from_now": 12.0, "cargo_tons": 58000, "expected_handling_hours": 9.0, "current_position": "scheduled" },
  { "vessel_id": "V014", "vessel_name": "MV Ghatotkacha", "type": "bulk", "size_class": "medium", "eta_hours_from_now": 14.5, "cargo_tons": 49000, "expected_handling_hours": 11.0, "current_position": "scheduled" },
  { "vessel_id": "V015", "vessel_name": "MV Draupadi Logistics", "type": "container", "size_class": "medium", "eta_hours_from_now": 18.0, "cargo_tons": 33000, "expected_handling_hours": 6.5, "current_position": "scheduled" }
]
```
