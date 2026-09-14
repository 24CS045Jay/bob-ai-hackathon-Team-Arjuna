# PortFlow AI — Container Congestion Predictor & Port Operations Optimiser
## Implementation Plan for Team Arjuna — 3-Day Hackathon (v3 — Approved)

---

## 1. Top-Level Overview

**Goal:** Build a working prototype of PortFlow AI that predicts container port congestion,
identifies hotspots, recommends alternate routes, optimises berth and crane assignments,
generates a 72-hour operations plan, and provides a grounded AI Copilot that explains
everything using live system context — all within 3 days.

**Track:** AI

**Decisions locked:**
- `DEMO_MODE=true` is the primary development path. watsonx.ai/Granite can be enabled
  later by setting env vars. The app must work fully in DEMO_MODE.
- Fictional 6-zone port layout (Port of Arjuna). No real port geography.
- AI Copilot lives inside the FastAPI backend. No separate MCP server.
- Demo dataset: 10–20 vessels. No hard-coded architectural cap.
- Optimisation: simplest correct approach first. Constraints, objective and algorithm
  documented explicitly.
- MVP scope frozen: congestion prediction, hotspot identification, berth assignment,
  crane assignment, alternate routing, 72-hour plan, grounded copilot, dashboard.
- Real team member names and emails used in `submission.yaml` from the first commit.
- All four members participate in the contract/scaffolding session before any
  implementation begins. The session is time-boxed to keep it short.
- No `develop` branch. Branch model: `main` + four `feature/*` branches only.
- Implementation on feature branches starts only after the shared scaffolding
  commit (contracts + skeleton) is pushed and merged to `main`.
- The hackathon validation workflow and all required submission files are preserved
  exactly as they exist in the template — no modifications to `.github/workflows/validate.yml`.

---

## 2. Final Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser (Port :5173)                        │
│                                                                       │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────────┐ │
│  │  Dashboard   │  │   Operations     │  │  72h Planning          │ │
│  │  (map +      │  │  (berth board +  │  │  (timeline +           │ │
│  │   chart)     │  │   crane table +  │  │   vessel schedule)     │ │
│  │              │  │   routing panel) │  │                        │ │
│  └──────────────┘  └──────────────────┘  └────────────────────────┘ │
│                ↕ Copilot sidebar (global, all pages)                 │
└─────────────────────────────────────────────────────────────────────┘
                             │ REST  (axios)
                             ▼  Port :8000
┌─────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend                               │
│                                                                       │
│  /api/predictions/*   /api/optimisation/*   /api/planning/*          │
│  /api/copilot/chat                                                   │
│                                                                       │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────────┐   │
│  │  ml_client    │  │  optimiser     │  │  copilot_service      │   │
│  │  (wraps ML)   │  │  (wraps OPT)  │  │  (DEMO_MODE or        │   │
│  │               │  │               │  │   watsonx Granite)    │   │
│  └───────┬───────┘  └───────┬───────┘  └──────────────────────┘   │
│          │                  │                    │                   │
│  ┌───────▼───────┐  ┌───────▼───────┐           │                  │
│  │  SQLite DB    │  │  SQLite DB    │           │                  │
│  │  (port state) │  │  (port state) │           ▼                  │
│  └───────────────┘  └───────────────┘    ┌─────────────┐          │
└─────────────────────────────────────────┤ watsonx.ai  │          │
                                           │ (optional)  │          │
┌─────────────────────────────────────────┤─────────────┘          │
│                  ML Layer               │                          │
│  data_generator → feature_engineering  │                          │
│  → train.py → congestion_model.pkl     │                          │
│  → predict.py [predict_congestion()]   │                          │
└─────────────────────────────────────────                          │
                                                                      │
┌─────────────────────────────────────────────────────────────────── │
│             Optimisation Layer                                        │
│  berth_assignment → crane_assignment → routing → planner_72h        │
└─────────────────────────────────────────────────────────────────── ─
```

---

## 3. Fictional Port Layout — Port of Arjuna

Six zones, each with defined berths and characteristics. This is the canonical map
used by ML (zone features), optimisation (berth lists), and frontend (Leaflet overlay).

```
Port of Arjuna — Zone Map

  ┌──────────────────────────────────────────────────────────┐
  │  OUTER ANCHORAGE                                         │
  │  (vessels wait here before entering)                     │
  │                                                          │
  │     Zone A         Zone B         Zone C                 │
  │   [CONTAINER]    [CONTAINER]    [BULK CARGO]             │
  │   Berths A1-A3   Berths B1-B3   Berths C1-C2            │
  │                                                          │
  │     Zone D         Zone E         Zone F                 │
  │   [RO-RO]        [LIQUID BULK]  [SERVICE/REPAIR]        │
  │   Berths D1-D2   Berths E1-E2   Berths F1               │
  │                                                          │
  │  MAIN CHANNEL ════════════════════════════════════       │
  └──────────────────────────────────────────────────────────┘
```

| Zone | Type | Berths | Max Vessel Size | Cranes | Channel Segment |
|---|---|---|---|---|---|
| A | Container | A1, A2, A3 | Large (>300m) | 3 gantry | North |
| B | Container | B1, B2, B3 | Medium (200-300m) | 3 gantry | North |
| C | Bulk Cargo | C1, C2 | Medium | 2 bulk | Central |
| D | RoRo | D1, D2 | Medium | 0 (ramp-based) | South |
| E | Liquid Bulk | E1, E2 | Small (<200m) | 0 (pipelines) | South |
| F | Service | F1 | Small | 1 mobile | South |

**Waypoint graph for routing** (used by alternate routing recommender):

```
ANCHORAGE → A ↔ B ↔ C
                ↕       ↕
              D ↔ E ↔ F
```

Edge weights are: base_transit_time + congestion_penalty(zone).

---

## 4. Final Folder Structure

```
bob-ai-hackathon-Team-Arjuna/
├── submission.yaml                    ← fill with team metadata
├── README.md                          ← fill with project details
├── CONTRIBUTING.md                    ← DO NOT MODIFY (template)
├── .gitignore                         ← DO NOT MODIFY (template)
├── .github/workflows/validate.yml     ← DO NOT MODIFY (template)
│
├── docs/
│   ├── problem-statement.md           ← rewrite with domain content
│   ├── solution-overview.md           ← rewrite with solution content
│   ├── architecture.md                ← rewrite with real diagram
│   ├── setup-guide.md                 ← rewrite with exact commands
│   └── template-guide.md              ← DO NOT MODIFY (reference only)
│
├── demo/
│   ├── demo-video-link.txt            ← update with real URL (Day 3)
│   ├── live-demo-url.txt              ← write NOT DEPLOYED
│   └── screenshots/                   ← add 3+ screenshots (Day 3)
│
├── presentation/
│   └── slides.pdf                     ← create on Day 3
│
└── src/
    ├── .env.example                   ← expand with all project vars
    ├── README.md                      ← rewrite with src/ layout
    ├── docker-compose.yml             ← single-command startup
    ├── data_contract.md               ← NEW: JSON shapes agreed by all members
    │
    ├── backend/                       ← Member 3 owns
    │   ├── requirements.txt
    │   ├── main.py                    ← FastAPI app entry point
    │   ├── routers/
    │   │   ├── __init__.py
    │   │   ├── predictions.py         ← GET /api/predictions/congestion
    │   │   │                             GET /api/predictions/hotspots
    │   │   ├── optimisation.py        ← GET /api/optimisation/berths
    │   │   │                             GET /api/optimisation/cranes
    │   │   │                             GET /api/optimisation/routes
    │   │   ├── planning.py            ← GET /api/planning/72h
    │   │   └── copilot.py             ← POST /api/copilot/chat
    │   ├── services/
    │   │   ├── __init__.py
    │   │   ├── ml_client.py           ← wraps ml/predict.py
    │   │   ├── optimiser_client.py    ← wraps optimisation/*.py
    │   │   ├── planner_client.py      ← wraps optimisation/planner_72h.py
    │   │   └── copilot_service.py     ← DEMO_MODE engine OR watsonx bridge
    │   ├── models/
    │   │   ├── __init__.py
    │   │   └── schemas.py             ← ALL Pydantic request/response models
    │   └── db/
    │       ├── __init__.py
    │       ├── database.py            ← SQLAlchemy setup (SQLite)
    │       ├── models.py              ← SQLAlchemy ORM models
    │       └── seed.py                ← seed 10-20 vessels + port state at startup
    │
    ├── ml/                            ← Member 1 owns
    │   ├── requirements.txt
    │   ├── data_generator.py          ← synthetic port event dataset
    │   ├── feature_engineering.py     ← feature pipeline (returns DataFrame)
    │   ├── train.py                   ← trains model, saves pkl + feature_importance
    │   ├── predict.py                 ← PUBLIC INTERFACE: predict_congestion()
    │   └── models/
    │       ├── .gitkeep               ← keeps folder in git
    │       ├── congestion_model.pkl   ← generated by train.py (gitignored if large)
    │       └── feature_importance.json← generated by train.py
    │
    ├── optimisation/                  ← Member 2 owns
    │   ├── requirements.txt
    │   ├── berth_assignment.py        ← PUBLIC INTERFACE: assign_berths()
    │   ├── crane_assignment.py        ← PUBLIC INTERFACE: assign_cranes()
    │   ├── routing.py                 ← PUBLIC INTERFACE: recommend_routes()
    │   └── planner_72h.py             ← PUBLIC INTERFACE: build_72h_plan()
    │
    └── frontend/                      ← Member 4 owns
        ├── package.json
        ├── tsconfig.json
        ├── vite.config.ts
        ├── tailwind.config.ts
        ├── index.html
        └── src/
            ├── main.tsx
            ├── App.tsx
            ├── types/
            │   └── api.ts             ← TypeScript types mirroring schemas.py
            ├── api/
            │   └── client.ts          ← typed axios client (4 function groups)
            ├── components/
            │   ├── PortMap.tsx        ← Leaflet + zone colour overlays
            │   ├── CongestionChart.tsx← Recharts 72h forecast
            │   ├── BerthBoard.tsx     ← Recharts Gantt / assignment table
            │   ├── CraneTable.tsx     ← crane assignments table
            │   ├── RoutePanel.tsx     ← alternate routing recommendations
            │   ├── PlanTimeline.tsx   ← 72h scrollable timeline
            │   ├── SummaryCards.tsx   ← KPI cards (vessel count, util%, etc.)
            │   └── Copilot.tsx        ← chat sidebar (POST /api/copilot/chat)
            └── pages/
                ├── Dashboard.tsx      ← map + chart + summary cards
                ├── Operations.tsx     ← berth + crane + routing
                └── Planning.tsx       ← 72h timeline + vessel schedule
```

---

## 5. Component Contracts

These contracts are the team's handshake. **No member may change a contract without
notifying all members who depend on it.**

### Contract A — ML Inference Interface
**Owner:** Member 1 | **Consumer:** Member 3 (ml_client.py)

**File:** `src/ml/predict.py`

```python
def predict_congestion(
    zone_features: list[dict]
) -> list[dict]:
    """
    Input — list of zone feature dicts, one per zone:
    {
        "zone_id": str,           # "A" | "B" | "C" | "D" | "E" | "F"
        "hour_of_day": int,       # 0-23
        "day_of_week": int,       # 0=Mon, 6=Sun
        "vessel_count_in_queue": int,
        "avg_dwell_hours": float,
        "berth_utilisation_pct": float,  # 0.0 - 1.0
        "tide_level": float,      # 0.0 - 1.0 normalised
        "weather_delay_flag": int # 0 or 1
    }

    Output — list of zone prediction dicts:
    {
        "zone_id": str,
        "congestion_score": float,     # 0.0 - 100.0
        "severity": str,               # "low" | "medium" | "high" | "critical"
        "contributing_factors": list[str]  # top 3 feature names
    }
    """
```

**Notes:**
- The `contributing_factors` list feeds the AI Copilot's explanations — it MUST be populated.
- Function must work without a trained model present by returning synthetic outputs
  (so Member 3 can develop against it before Member 1 finishes training).
- If `ml/models/congestion_model.pkl` exists, use it. Otherwise return rule-based estimates.

---

### Contract B — Optimisation Interfaces
**Owner:** Member 2 | **Consumer:** Member 3 (optimiser_client.py)

**File:** `src/optimisation/berth_assignment.py`

```python
def assign_berths(
    vessels: list[dict],
    berths: list[dict],
    congestion_scores: list[dict]   # output of predict_congestion()
) -> list[dict]:
    """
    Input vessels item:
    {
        "vessel_id": str,
        "vessel_name": str,
        "type": str,               # "container" | "bulk" | "roro" | "liquid" | "service"
        "size_class": str,         # "large" | "medium" | "small"
        "eta_hours_from_now": float,
        "cargo_tons": float,
        "expected_handling_hours": float
    }

    Input berths item:
    {
        "berth_id": str,           # "A1"-"F1"
        "zone_id": str,            # "A"-"F"
        "compatible_types": list[str],
        "compatible_sizes": list[str],
        "current_occupant": str | None,    # vessel_id or null
        "available_at_hours_from_now": float
    }

    Output item:
    {
        "vessel_id": str,
        "vessel_name": str,
        "berth_id": str,
        "zone_id": str,
        "assigned_start_hours_from_now": float,
        "assigned_end_hours_from_now": float,
        "waiting_hours": float,
        "assignment_reason": str   # human-readable, used by Copilot
    }
    """
```

**File:** `src/optimisation/crane_assignment.py`

```python
def assign_cranes(
    berth_assignments: list[dict],  # output of assign_berths()
    cranes: list[dict]
) -> list[dict]:
    """
    Input cranes item:
    {
        "crane_id": str,           # "A-GC1", "B-GC1", etc.
        "zone_id": str,
        "type": str,               # "gantry" | "bulk" | "mobile"
        "current_status": str,     # "available" | "busy"
        "available_at_hours_from_now": float
    }

    Output item:
    {
        "crane_id": str,
        "vessel_id": str,
        "berth_id": str,
        "start_hours_from_now": float,
        "end_hours_from_now": float,
        "assignment_reason": str
    }
    """
```

**File:** `src/optimisation/routing.py`

```python
def recommend_routes(
    congestion_scores: list[dict],  # output of predict_congestion()
    vessels_in_queue: list[dict]    # subset of vessels not yet assigned
) -> list[dict]:
    """
    Output item:
    {
        "vessel_id": str,
        "vessel_name": str,
        "recommended_zone": str,
        "avoided_zones": list[str],
        "reason": str,
        "estimated_wait_saving_hours": float
    }
    """
```

**File:** `src/optimisation/planner_72h.py`

```python
def build_72h_plan(
    vessels: list[dict],
    berths: list[dict],
    cranes: list[dict],
    predict_fn: callable   # inject predict_congestion — avoids import coupling
) -> dict:
    """
    Output:
    {
        "generated_at": str,         # ISO timestamp
        "horizon_hours": 72,
        "time_slices": [             # one entry per 6-hour slice (12 total)
            {
                "slice_index": int,
                "start_hour": int,
                "end_hour": int,
                "congestion_forecast": list[dict],   # predict_congestion output
                "berth_assignments": list[dict],
                "crane_assignments": list[dict],
                "vessels_in_port": list[str],
                "vessels_departing": list[str],
                "vessels_arriving": list[str]
            }
        ],
        "summary": {
            "total_vessels_handled": int,
            "avg_berth_utilisation_pct": float,
            "peak_congestion_zone": str,
            "peak_congestion_hour": int
        }
    }
    """
```

**Notes:**
- `planner_72h.py` accepts `predict_fn` as a parameter so it can be tested independently
  without importing the ML layer directly.
- All `_reason` / `assignment_reason` fields are required — they feed the Copilot.

---

### Contract C — REST API (Backend → Frontend)
**Owner:** Member 3 | **Consumer:** Member 4

**Base URL:** `http://localhost:8000`

All responses include `Content-Type: application/json`.
All timestamps are ISO 8601. All floats to 2 decimal places.

---

#### `GET /api/predictions/congestion`

Response:
```json
{
  "timestamp": "2024-01-15T08:00:00Z",
  "zones": [
    {
      "zone_id": "A",
      "congestion_score": 78.5,
      "severity": "high",
      "vessel_count": 4,
      "berth_utilisation_pct": 0.92,
      "contributing_factors": ["vessel_count_in_queue", "avg_dwell_hours", "berth_utilisation_pct"]
    }
  ],
  "overall_port_congestion": 62.3,
  "hotspots": ["A", "B"]
}
```

---

#### `GET /api/optimisation/berths`

Response:
```json
{
  "timestamp": "2024-01-15T08:00:00Z",
  "assignments": [
    {
      "vessel_id": "V001",
      "vessel_name": "MV Arjuna Star",
      "berth_id": "A1",
      "zone_id": "A",
      "assigned_start_hours_from_now": 0.5,
      "assigned_end_hours_from_now": 8.5,
      "waiting_hours": 0.5,
      "assignment_reason": "Best fit: large container vessel to Zone A gantry berth"
    }
  ],
  "unassigned_vessels": [],
  "berth_utilisation": {
    "A1": {"status": "assigned", "vessel_id": "V001"},
    "A2": {"status": "available", "vessel_id": null}
  }
}
```

---

#### `GET /api/optimisation/cranes`

Response:
```json
{
  "timestamp": "2024-01-15T08:00:00Z",
  "assignments": [
    {
      "crane_id": "A-GC1",
      "vessel_id": "V001",
      "berth_id": "A1",
      "start_hours_from_now": 0.5,
      "end_hours_from_now": 8.5,
      "assignment_reason": "Zone A gantry crane, earliest available"
    }
  ],
  "crane_utilisation": {
    "A-GC1": {"status": "assigned", "vessel_id": "V001"},
    "A-GC2": {"status": "available", "vessel_id": null}
  }
}
```

---

#### `GET /api/optimisation/routes`

Response:
```json
{
  "timestamp": "2024-01-15T08:00:00Z",
  "recommendations": [
    {
      "vessel_id": "V005",
      "vessel_name": "MV Bhima",
      "recommended_zone": "B",
      "avoided_zones": ["A"],
      "reason": "Zone A congestion score 78.5 (high). Zone B available with score 31.2 (low).",
      "estimated_wait_saving_hours": 3.5
    }
  ]
}
```

---

#### `GET /api/planning/72h`

Response:
```json
{
  "generated_at": "2024-01-15T08:00:00Z",
  "horizon_hours": 72,
  "time_slices": [
    {
      "slice_index": 0,
      "start_hour": 0,
      "end_hour": 6,
      "congestion_forecast": [...],
      "berth_assignments": [...],
      "crane_assignments": [...],
      "vessels_in_port": ["V001", "V002"],
      "vessels_departing": [],
      "vessels_arriving": ["V003"]
    }
  ],
  "summary": {
    "total_vessels_handled": 18,
    "avg_berth_utilisation_pct": 0.74,
    "peak_congestion_zone": "A",
    "peak_congestion_hour": 14
  }
}
```

---

#### `POST /api/copilot/chat`

Request:
```json
{
  "message": "Why is Zone A congested right now?",
  "context_snapshot": null
}
```

Response:
```json
{
  "reply": "Zone A is currently showing high congestion (score: 78.5) primarily due to...",
  "context_used": {
    "zones_referenced": ["A"],
    "vessels_referenced": ["V001", "V002"],
    "plan_slice_referenced": null
  },
  "mode": "demo"
}
```
`mode` is `"demo"` or `"watsonx"` — tells the frontend which badge to show.

---

### Contract D — Data Contract (Shared State)
**Owner:** all members agree | **File:** `src/data_contract.md`

Defines the canonical JSON shapes for the 10–20 demo vessels, 12 berths, 7 cranes,
and 6 zones used in `db/seed.py`. **Member 1 and Member 2 must both read this before
writing any code that consumes port state data.**

The canonical seed data objects are:

**Vessels (10–20):**
```json
{
  "vessel_id": "V001",
  "vessel_name": "MV Arjuna Star",
  "type": "container",
  "size_class": "large",
  "eta_hours_from_now": 2.5,
  "cargo_tons": 45000,
  "expected_handling_hours": 8.0,
  "current_position": "anchorage"
}
```

**Berths (12 total: A1-A3, B1-B3, C1-C2, D1-D2, E1-E2, F1):**
```json
{
  "berth_id": "A1",
  "zone_id": "A",
  "compatible_types": ["container"],
  "compatible_sizes": ["large", "medium"],
  "current_occupant": null,
  "available_at_hours_from_now": 0.0
}
```

**Cranes (7 total: A-GC1..3, B-GC1..3, C-BC1..2, F-MC1):**
```json
{
  "crane_id": "A-GC1",
  "zone_id": "A",
  "type": "gantry",
  "current_status": "available",
  "available_at_hours_from_now": 0.0
}
```

**Zones (6):** same as the port layout table in Section 3.

---

## 6. Optimisation Approach (Member 2)

### Objective
Minimise total vessel waiting time while respecting all hard constraints.

### Hard Constraints
1. A vessel can only be assigned to a berth compatible with its type and size class.
2. No two vessels may occupy the same berth simultaneously.
3. A crane can only serve the zone it is assigned to (except F-MC1 which is mobile within 1 zone).
4. No two vessels may use the same crane simultaneously.

### Soft Objectives (weighted penalty)
- Prefer zones with lower congestion score (reduces further congestion).
- Prefer berths that minimise waiting time (`available_at` closest to vessel ETA).
- Prefer cranes with earliest availability.

### Algorithm
**Priority Queue Greedy Assignment:**
1. Sort vessels by `eta_hours_from_now` ascending (earliest-arriving first).
2. For each vessel:
   a. Filter berths to compatible only.
   b. Score each compatible berth: `score = waiting_penalty + congestion_penalty`.
      - `waiting_penalty = max(0, berth.available_at - vessel.eta)`
      - `congestion_penalty = zone_congestion_score * 0.1`
   c. Assign the lowest-score berth.
   d. Update `berth.available_at = assigned_start + expected_handling_hours`.
3. After berth assignment, run crane assignment similarly (EDF per zone).
4. Unassignable vessels go to `unassigned_vessels` list — not an error, just
   reported to the frontend.

**Why this approach:** Simple, deterministic, correct for the L1 constraints,
runs in milliseconds for 20 vessels, easy to explain to judges.

### Routing Algorithm
Dijkstra on the 6-node waypoint graph with edge weights:
`weight = base_transit_minutes + (zone_congestion_score * congestion_weight)`
Recommend alternate route when the primary zone congestion score ≥ 60.

---

## 7. AI Copilot Architecture

### DEMO_MODE (primary path)
The copilot service holds a set of **template response generators** — Python functions,
not canned strings. Each function receives the live system context snapshot and produces
a specific, data-grounded reply.

The context snapshot injected into every response:
```python
{
    "congestion": [... current predict_congestion output ...],
    "berth_assignments": [... current assign_berths output ...],
    "crane_assignments": [... current assign_cranes output ...],
    "routing_recommendations": [... current recommend_routes output ...],
    "plan_summary": {... 72h plan summary ...},
    "hotspots": ["A", "B"],
    "overall_congestion": 62.3
}
```

Response generation logic (DEMO_MODE examples):
- "Why is Zone X congested?" → look up zone X in context, extract contributing_factors,
  format: "Zone X has congestion score {score} ({severity}). Main drivers are:
  {contributing_factors}. Currently {vessel_count} vessels in queue with
  {berth_utilisation_pct}% berth utilisation."
- "Which berth is assigned to vessel Y?" → look up vessel Y in berth_assignments,
  format assignment details and reason.
- "What does the 72-hour plan show for peak congestion?" → use plan_summary.peak*.
- Default/fallback → summarise overall port status from context.

This means every DEMO_MODE reply is **specific to real current data**, not generic.

### watsonx.ai path (enabled when DEMO_MODE=false)
The same context snapshot is serialised to a compact JSON string and injected
into the Granite prompt as a system message:

```
System: You are PortFlow AI, a port operations assistant.
Current port state: {compact_context_json}
Rules: Base all answers strictly on the data above. Be specific with numbers.
Do not invent data not present in the context.

User: {user_message}
```

Model: `ibm/granite-3-8b-instruct`
SDK: `ibm-watsonx-ai`
Config env vars: `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, `WATSONX_URL`, `WATSONX_MODEL_ID`

### Enabling watsonx later
Set in `.env`:
```
DEMO_MODE=false
WATSONX_API_KEY=<key>
WATSONX_PROJECT_ID=<project_id>
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
```
No code changes required. The `copilot_service.py` branches on `DEMO_MODE` at runtime.

---

## 8. Environment Variables

All variables defined in `src/.env.example`:

```bash
# ── App ────────────────────────────────────────────────────────────────────────
APP_PORT=8000
APP_ENV=development
DEMO_MODE=true          # true = use template copilot; false = use watsonx

# ── Database ───────────────────────────────────────────────────────────────────
DB_PATH=./portflow.db   # SQLite file path (relative to backend/)

# ── watsonx.ai (only required when DEMO_MODE=false) ────────────────────────────
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct

# ── Frontend (Vite) ────────────────────────────────────────────────────────────
VITE_API_BASE_URL=http://localhost:8000
```

---

## 9. Exact Tasks Per Team Member

### Member 1 — Data + ML (`feature/ml-pipeline`)

**Deliverables:**
- `src/ml/data_generator.py`
- `src/ml/feature_engineering.py`
- `src/ml/train.py`
- `src/ml/predict.py` ← **public interface, Contract A**
- `src/ml/models/congestion_model.pkl` (generated artifact, not committed)
- `src/ml/models/feature_importance.json` (committed — used by Copilot)
- `src/ml/requirements.txt`

**Tasks in order:**
1. Read `src/data_contract.md` (after Sub-Task 0 creates it)
2. Write `data_generator.py` — generates 2000-row dataset with all Contract A features
   plus congestion_score labels (0–100). Use seasonality, vessel type, and zone
   type to make labels realistic.
3. Write `feature_engineering.py` — StandardScaler pipeline, returns (X, y) numpy arrays
4. Write `train.py` — fit RandomForestRegressor, save pkl and feature_importance.json
5. Write `predict.py` implementing Contract A exactly.
   - If pkl exists: use model.
   - If pkl absent: use rule-based fallback (vessel_count * 15 + berth_utilisation * 40 +
     weather_flag * 10, clipped to 0–100). This lets Member 3 develop independently.
6. Add `requirements.txt` (scikit-learn, pandas, numpy, joblib)
7. Test: run `python train.py` then `python predict.py` with sample input

**Interface boundary:** Member 1 ONLY exports `predict_congestion()` from `predict.py`.
Member 3 imports nothing else from `ml/`.

---

### Member 2 — Optimisation + Routing + 72h Planning (`feature/optimisation`)

**Deliverables:**
- `src/optimisation/berth_assignment.py` ← **public interface, Contract B**
- `src/optimisation/crane_assignment.py` ← **public interface, Contract B**
- `src/optimisation/routing.py` ← **public interface, Contract B**
- `src/optimisation/planner_72h.py` ← **public interface, Contract B**
- `src/optimisation/requirements.txt`

**Tasks in order:**
1. Read `src/data_contract.md` (after Sub-Task 0 creates it)
2. Write `berth_assignment.py` — priority queue greedy (see Section 6).
   Implement `assign_berths(vessels, berths, congestion_scores) -> list[dict]`
3. Write `crane_assignment.py` — EDF scheduler per zone.
   Implement `assign_cranes(berth_assignments, cranes) -> list[dict]`
4. Write `routing.py` — 6-node waypoint graph (hard-coded adjacency from port layout),
   Dijkstra with congestion weights.
   Implement `recommend_routes(congestion_scores, vessels_in_queue) -> list[dict]`
5. Write `planner_72h.py` — time loop over 12 × 6-hour slices, calling injected
   predict_fn each slice.
   Implement `build_72h_plan(vessels, berths, cranes, predict_fn) -> dict`
6. Add `requirements.txt` (no heavy deps needed — pure Python)
7. Test each function with synthetic dicts matching data_contract.md

**Interface boundary:** Member 2 ONLY exports the four public functions.
Member 3 imports nothing else from `optimisation/`. The `predict_fn` injection
in `planner_72h` is mandatory — no direct import of `ml/predict.py`.

---

### Member 3 — Backend + AI Copilot (`feature/backend-api`)

**Deliverables:**
- `src/backend/main.py`
- `src/backend/models/schemas.py` ← **Contract C owner**
- `src/backend/routers/predictions.py`
- `src/backend/routers/optimisation.py`
- `src/backend/routers/planning.py`
- `src/backend/routers/copilot.py`
- `src/backend/services/ml_client.py`
- `src/backend/services/optimiser_client.py`
- `src/backend/services/planner_client.py`
- `src/backend/services/copilot_service.py`
- `src/backend/db/database.py`, `db/models.py`, `db/seed.py`
- `src/docker-compose.yml`
- `src/backend/requirements.txt`

**Tasks in order:**
1. Write `schemas.py` — Pydantic models for all 6 API response shapes (Contract C)
   **before writing any routers**. Share with Member 4 immediately.
2. Write `db/seed.py` — creates 15 vessels and full berth/crane/zone state matching
   data_contract.md. This is the canonical demo dataset.
3. Write `main.py` — FastAPI app, CORS (`*` for dev), router includes,
   startup event calling `seed.py`, health check at `GET /health`
4. Write all 4 routers as **stubs returning mock data** that matches schemas.py.
   This lets Member 4 develop immediately.
5. Write `services/ml_client.py` — calls `predict_congestion()` from `ml/predict.py`,
   transforms result to `CongestionResponse` schema.
6. Write `services/optimiser_client.py` — calls `assign_berths()`, `assign_cranes()`,
   `recommend_routes()` from optimisation layer.
7. Write `services/planner_client.py` — calls `build_72h_plan()` with `predict_fn` injected.
8. Write `services/copilot_service.py` — DEMO_MODE branch first.
   The context assembler gathers live data from all services and builds the snapshot.
   Template response generators respond to key question patterns using real context.
   watsonx branch: add ibm-watsonx-ai SDK call, branching on `DEMO_MODE` env var.
9. Replace router stubs with real service calls.
10. Write `docker-compose.yml` — backend service.
11. Test all endpoints with `curl` or Swagger UI at `http://localhost:8000/docs`.

**Interface boundary:** Member 3 imports `predict_congestion` from `ml.predict` and
the four public functions from `optimisation.*`. Nothing else.

---

### Member 4 — Frontend + Integration (`feature/frontend-ui`)

**Deliverables:**
- `src/frontend/` — complete Vite + React + TypeScript app
- All pages, components, API client
- Integration testing on Day 3

**Tasks in order:**
1. Scaffold Vite + React + TypeScript: `npm create vite@latest frontend -- --template react-ts`
2. Install: `axios react-router-dom recharts leaflet @types/leaflet react-leaflet tailwindcss`
3. Write `types/api.ts` — mirror `schemas.py` Pydantic models as TypeScript interfaces.
   **Read Member 3's schemas.py as soon as it exists.** Until then use the Contract C
   JSON shapes in this plan document.
4. Write `api/client.ts` — typed axios client with:
   - `getCongestion(): Promise<CongestionResponse>`
   - `getBerthAssignments(): Promise<BerthOptimisationResponse>`
   - `getCraneAssignments(): Promise<CraneOptimisationResponse>`
   - `getRouteRecommendations(): Promise<RoutingResponse>`
   - `get72hPlan(): Promise<PlanResponse>`
   - `postCopilotChat(message: string): Promise<CopilotResponse>`
5. Build `App.tsx` — React Router with 3 routes + global Copilot sidebar
6. Build `Dashboard.tsx` — calls `getCongestion()`, renders `PortMap` + `CongestionChart`
   + `SummaryCards`
7. Build `PortMap.tsx` — Leaflet map, 6 rectangular zone overlays positioned on a
   simple coordinate system (no real geo data needed), colour by congestion severity
8. Build `CongestionChart.tsx` — Recharts LineChart showing 72h congestion forecast
   per zone (data from `get72hPlan()`)
9. Build `Operations.tsx` — calls `getBerthAssignments()` + `getCraneAssignments()`
   + `getRouteRecommendations()`; renders `BerthBoard`, `CraneTable`, `RoutePanel`
10. Build `Planning.tsx` — calls `get72hPlan()`; renders `PlanTimeline` + vessel table
11. Build `Copilot.tsx` — chat UI, calls `postCopilotChat()`, displays `mode` badge
12. Day 3: pull merged `main`, fix any schema mismatches, add loading/error states,
    take screenshots

**Interface boundary:** Member 4 talks ONLY to the REST API. No direct imports from
`ml/`, `optimisation/`, or `backend/`.

---

## 10. Recommended Implementation Order

### Phase 0 — Shared Scaffolding Commit (ALL FOUR MEMBERS, time-boxed to ~90 min)

All four members meet synchronously to:
1. Agree on the 15 seed vessels — their names, types, sizes, ETAs
2. Agree on berth compatibility rules (which vessel types/sizes go where)
3. Agree on crane pool details
4. Review and sign off on Contracts A, B, C in this document
5. One member (team lead or Member 3) executes Sub-Task 0:
   fills `submission.yaml` with real names/emails, creates the `src/` skeleton,
   writes `data_contract.md`, commits, and pushes to `main`

**Gate: No member creates their feature branch or writes implementation code
until the scaffolding commit is on `main`.**

After `main` is updated:
- Member 1 → `git checkout -b feature/ml-pipeline`
- Member 2 → `git checkout -b feature/optimisation`
- Member 3 → `git checkout -b feature/backend-api`
- Member 4 → `git checkout -b feature/frontend-ui`

All four branches start from the same scaffolding commit.

---

### Phase 1 — Day 1 Afternoon (PARALLEL on feature branches)

```
Member 1: data_generator + feature_engineering + train.py stub
Member 2: berth_assignment + crane_assignment (no routing yet)
Member 3: schemas.py → main.py → router stubs with mock data → db/seed.py
          Push schemas.py stub to branch; share file path with Member 4
Member 4: Vite scaffold → api/client.ts → page shells with mock data
          Pull schemas.py from Member 3's branch to verify types
```

### Phase 2 — Day 2 (PARALLEL on feature branches)

```
Member 1: train.py complete → predict.py with rule-based fallback → push; notify Member 3
Member 2: routing.py → planner_72h.py → push; notify Member 3
Member 3: Wire ml_client → optimiser_client → planner_client → copilot_service
          Replace stubs with real calls
Member 4: Build all components against mock data → switch to real API endpoint by endpoint
```

### Phase 3 — Day 3 Morning (INTEGRATION)

```
Members 1, 2, 3: open PRs to main (M1 first, M2 second, M3 third to avoid conflicts)
Member 4: pull updated main, run full stack, identify and fix schema mismatches
```

### Phase 4 — Day 3 Afternoon (POLISH + SUBMISSION)

```
Member 4: loading states, error states, screenshots (3+)
Member 3: docker compose up clean-clone test, write setup-guide.md
Member 1: write problem-statement.md
Member 2: write solution-overview.md + architecture.md
All:      slide deck, demo video recording, verify GitHub Actions ✅ green, submit
```

---

## 11. 3-Day Schedule

### Day 1 — Foundation

| Time | What | Who |
|---|---|---|
| Morning — Phase 0 (≤90 min) | All four agree on seed data, review contracts A/B/C, team lead executes Sub-Task 0, pushes to `main` | ALL |
| Morning — gate cleared | Each member creates their feature branch from the fresh `main` scaffolding commit | ALL |
| Afternoon | `feature/ml-pipeline`: data_generator + feature_engineering + train.py stub | Member 1 |
| Afternoon | `feature/optimisation`: berth_assignment + crane_assignment | Member 2 |
| Afternoon | `feature/backend-api`: schemas.py → main.py → router stubs → db/seed.py | Member 3 |
| Afternoon | `feature/frontend-ui`: Vite scaffold → api/client.ts → page shells (mock data) | Member 4 |
| End-of-day goals | train.py runs; assign_berths/cranes return correct shapes; uvicorn starts with mock JSON; pages render | All |

---

### Day 2 — Core Build

| Time | Member 1 | Member 2 | Member 3 | Member 4 |
|---|---|---|---|---|
| All day | train.py final → predict.py with fallback → notify M3 | routing.py → planner_72h.py → notify M3 | Wire ml_client → optimiser_client → planner_client → copilot_service | PortMap.tsx → CongestionChart.tsx → BerthBoard.tsx → Copilot.tsx |
| End-of-day goal | predict_congestion() works and tested | all 4 optimisation functions work end-to-end | all real endpoints return real data | all components show data (mix of mock + real) |

---

### Day 3 — Integration + Submission

| Time | All members |
|---|---|
| 09:00–11:00 | PRs: M1 → main, M2 → main, M3 → main. M4 pulls + integration test |
| 11:00–13:00 | Fix integration bugs. M4: full UI polish |
| 13:00–15:00 | Record demo video. Take screenshots. docker compose up clean test |
| 15:00–17:00 | Write docs. Build slide deck. Push. Verify GitHub Actions green. Submit. |

---

## 12. Git Workflow Rules

| Rule | Detail |
|---|---|
| Branch model | `main` + `feature/ml-pipeline` + `feature/optimisation` + `feature/backend-api` + `feature/frontend-ui`. No other branches. |
| Feature branch creation | Only after Sub-Task 0 scaffolding commit is on `main`. All branches start from the same commit. |
| Protected files | `.github/workflows/validate.yml`, `CONTRIBUTING.md`, `.gitignore`, `submission.yaml` structure, all `docs/` filenames. Do not delete or rename these. |
| Merge order (Day 3) | M1 → main first; M2 → main second; M3 → main third; M4 pulls main and integrates on their branch, then final PR. |
| PR rule | Each feature branch requires at least one other member to read the diff before merge. |
| Commit messages | `feat:`, `fix:`, `data:`, `docs:` prefixes. Reference sub-task number in first commit per task. |
| No force-push | Never force-push to `main`. |

---

## 13. Scoring Rubric Alignment

| Criterion | Points | How We Address It |
|---|---|---|
| Technical Implementation Quality | 25 | Real ML model + correct constraint solver + full REST API + React SPA |
| Innovation & Differentiation | 25 | AI Copilot explains its own reasoning using live system context; 72h planning horizon; grounded natural language |
| Problem Depth & Vision | 15 | Detailed problem-statement.md with port domain framing and economic impact |
| Working Demo & Functionality | 15 | `docker compose up` → full working app; demo video; seed data makes it look operational |
| IBM Bob Integration | 10 | watsonx.ai Granite is the production copilot path; DEMO_MODE ensures judges see a working copilot regardless |
| Documentation & Reproducibility | 10 | setup-guide.md tested end-to-end; docker compose; .env.example complete |

---

## 14. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| watsonx.ai credentials unavailable | High (primary risk) | Low — DEMO_MODE is fully functional | DEMO_MODE is the primary path. Document watsonx as "production upgrade path". |
| Frontend-backend schema mismatch on Day 3 | Medium | High | schemas.py published on Day 1 morning. Member 4 reviews it before writing a single component. |
| planner_72h too slow (iterates 12 slices × ML call) | Low | Medium | ML fallback returns instantly. Cap plan slices to 12 × 6h. Pre-compute and cache on startup. |
| Docker networking on Windows | Medium | Medium | Test on Day 2 afternoon. Provide fallback manual-run instructions in setup-guide.md. |
| Leaflet map looks empty / confusing | Low | Low | Use rectangles on a simple SVG-sized coordinate system. No real geo needed. Show zone labels clearly. |
| Member blocked by another member's contract change | Medium | High | Contracts in this document are frozen after Day 1 morning. Changes require group agreement. |
| Scope creep | Low (now mitigated) | High | MVP scope frozen in Section 1. Team lead enforces it. |

---

## 15. Sub-Tasks for Agent Mode Execution

Each sub-task is independently implementable by one team member.

---

### Sub-Task 0 — Repository Scaffolding & Contracts
**Status:** [ ] pending
**Branch:** `main`
**Who executes:** Team lead (or Member 3), after all four members have reviewed
and agreed on seed data, port layout, and Contracts A/B/C in a joint session
(time-boxed to ≤90 min). This commit is the gate that unblocks all feature branches.

**IMPORTANT — Preserved template files (do not modify):**
- `.github/workflows/validate.yml`
- `CONTRIBUTING.md`
- `.gitignore`
- `docs/template-guide.md`
- `demo/screenshots/README.md`
- `presentation/README.md`

**Intent:** Create the project skeleton and all interface contracts before any business
logic is written. Every other sub-task depends on this single commit.

**Expected Outcomes:**
- `submission.yaml` valid, all REQUIRED fields filled with real team names and emails
- `README.md` has no `[placeholder]` text — GitHub Actions validator check passes
- `src/` folder structure exists with stub files — CI "src/ is not empty" check passes
- `src/data_contract.md` fully written with all 15 vessel records, 12 berths, 7 cranes
- `src/.env.example` contains all variables from Section 8
- `src/docker-compose.yml` skeleton exists
- `demo/live-demo-url.txt` updated to "NOT DEPLOYED"
- All four members have read and agreed to Contracts A, B, C before this commit is pushed

**Todo List:**
1. (Joint session) All four members review Section 5 Contracts A, B, C and Section 3
   port layout. Agree on exact vessel names, types, and ETAs for the 15 seed records.
   Record any changes to data shapes before implementation begins.
2. Fill `submission.yaml` with real team names/emails — team.name, track="AI",
   lead.name, lead.email, all member names/emails, title="PortFlow AI",
   problem_statement, solution_summary, key_features (5), tech_stack
3. Rewrite `README.md` — replace all `[placeholder]` text with PortFlow AI content:
   project title, team, problem, solution, features, tech stack, how to run,
   demo links, known limitations, what we're most proud of
4. Create directory stubs: `src/ml/.gitkeep`, `src/optimisation/.gitkeep`,
   `src/backend/.gitkeep`, `src/frontend/.gitkeep`
   (These satisfy the CI "src/ has source files" check and let members create branches)
5. Write `src/data_contract.md` — Section 3 port layout, all 15 agreed vessel records,
   12 berth records, 7 crane records using schemas in Section 5 Contract D.
   This is the canonical ground truth for Members 1 and 2.
6. Rewrite `src/.env.example` with all variables from Section 8
7. Write `src/docker-compose.yml` skeleton — backend service stub
   (frontend served by Vite dev server; add frontend service to compose on Day 3)
8. Update `demo/live-demo-url.txt` → first line: "NOT DEPLOYED — see docs/setup-guide.md"
9. Commit message: `feat(scaffold): initial project skeleton, contracts, and team metadata`
10. Push to `main`. Verify GitHub Actions run is green (or yellow only on video URL check).
11. Announce to team: "Scaffolding is on main. Create your feature branches now."

**Relevant Context:**
- [`submission.yaml`](bob-ai-hackathon-Team-Arjuna/submission.yaml)
- [`README.md`](bob-ai-hackathon-Team-Arjuna/README.md)
- [`.github/workflows/validate.yml`](bob-ai-hackathon-Team-Arjuna/.github/workflows/validate.yml)
- Section 3 (port layout), Section 5 Contract D (seed data shapes), Section 8 (env vars)

---

### Sub-Task 1 — ML Layer
**Status:** [ ] pending
**Branch:** `feature/ml-pipeline` | **Owner:** Member 1

**Intent:** Deliver the congestion prediction engine and the `predict_congestion()` public
interface. The fallback path means Member 3 is never blocked.

**Expected Outcomes:**
- `python src/ml/train.py` completes without error, produces `congestion_model.pkl`
  and `feature_importance.json`
- `predict_congestion(sample_input)` returns correct-shaped output matching Contract A
- Fallback works when pkl absent
- `feature_importance.json` has at least 5 named feature weights

**Todo List:**
1. Create `src/ml/requirements.txt`
2. Write `data_generator.py` — 2000 rows, 8 features from Contract A + congestion_score label
   Make labels realistic: Zone A (container) higher baseline than Zone E (liquid)
3. Write `feature_engineering.py` — StandardScaler, return (X_train, X_test, y_train, y_test)
4. Write `train.py` — RandomForestRegressor(n_estimators=100), save pkl + feature_importance.json
5. Write `predict.py` — Contract A implementation, pkl + fallback paths
6. Test end-to-end

**Relevant Context:**
- Section 5 Contract A (exact function signature and dict shapes)
- `src/data_contract.md` (zone IDs, seed data shapes)

---

### Sub-Task 2 — Optimisation Layer
**Status:** [ ] pending
**Branch:** `feature/optimisation` | **Owner:** Member 2

**Intent:** Deliver all four optimisation functions. The 72h planner chains them using
dependency injection to avoid coupling with the ML layer.

**Expected Outcomes:**
- `assign_berths()` correctly assigns vessels to compatible berths, minimises waiting time,
  no conflicts, populates `assignment_reason`
- `assign_cranes()` assigns cranes by zone EDF, no conflicts, populates `assignment_reason`
- `recommend_routes()` recommends alternate zones for vessels when congestion ≥ 60
- `build_72h_plan()` produces a 12-slice output with summary matching Contract B

**Todo List:**
1. Create `src/optimisation/requirements.txt` (pure Python, no heavy deps)
2. Write `berth_assignment.py` — Section 6 priority queue greedy algorithm.
   Handle: no compatible berth found → vessel goes to unassigned list.
3. Write `crane_assignment.py` — EDF per zone. Handle: zone D and E have no cranes
   (RoRo ramp, pipelines) — return empty assignments for those vessels.
4. Write `routing.py` — hard-code 6-node adjacency from Section 3.
   Implement Dijkstra. Recommend route only when congestion ≥ 60.
5. Write `planner_72h.py` — 12 × 6-hour slices. Accept `predict_fn: callable`.
   Simulate vessel arrivals and departures across slices.
   Produce summary statistics.
6. Test all four functions with data matching data_contract.md seed records

**Relevant Context:**
- Section 5 Contract B (all function signatures and output shapes)
- Section 6 (objective, constraints, algorithm)
- `src/data_contract.md` (canonical vessel/berth/crane data)

---

### Sub-Task 3 — Backend + AI Copilot
**Status:** [ ] pending
**Branch:** `feature/backend-api` | **Owner:** Member 3

**Intent:** Build the FastAPI app that orchestrates ML + Optimisation + Copilot and
exposes the REST API. Stubs go out on Day 1 so Member 4 is never blocked.

**Expected Outcomes:**
- `uvicorn backend.main:app --reload` starts cleanly
- All 6 endpoints return data matching Contract C schemas
- Copilot in DEMO_MODE gives specific, context-grounded answers (not generic)
- `DEMO_MODE=false` + valid watsonx env vars routes to Granite (optional, tested if
  credentials arrive)
- `docker compose up` starts the backend service

**Todo List:**
1. Create `src/backend/requirements.txt`
   (fastapi, uvicorn, sqlalchemy, pydantic, python-dotenv, ibm-watsonx-ai)
2. Write `schemas.py` — ALL Pydantic response models from Contract C.
   Share the file path with Member 4 immediately (push branch, send link).
   Member 4 must read this before writing `types/api.ts`.
3. Write `db/database.py` + `db/models.py` — SQLAlchemy SQLite setup
4. Write `db/seed.py` — inserts the 15 vessels + 12 berths + 7 cranes from
   data_contract.md at app startup
5. Write `main.py` — FastAPI app, CORS, include routers, startup event, `/health`
6. Write all 4 routers as **stubs** returning mock data matching schemas — push this
   to the branch immediately so Member 4 can start
7. Write `services/ml_client.py` — calls `predict_congestion()`, maps to schemas
8. Write `services/optimiser_client.py` — calls all 3 optimisation functions
9. Write `services/planner_client.py` — calls `build_72h_plan()`, injects ml_client
   as the predict_fn
10. Write `services/copilot_service.py` — DEMO_MODE context assembler + template
    response generators (Section 7). watsonx branch behind `DEMO_MODE` check.
11. Replace router stubs with real service calls
12. Write `docker-compose.yml` with backend service
13. Test all endpoints

**Relevant Context:**
- Section 5 Contract C (all endpoint schemas)
- Section 7 (AI Copilot architecture, DEMO_MODE, watsonx)
- Section 8 (env vars)
- `src/data_contract.md`

---

### Sub-Task 4 — Frontend
**Status:** [ ] pending
**Branch:** `feature/frontend-ui` | **Owner:** Member 4

**Intent:** Build the React SPA that makes the system visible to judges.
Develop against mock data and the Contract C shapes until the real API is available.

**Expected Outcomes:**
- `npm run dev` starts at `localhost:5173`
- Dashboard shows port map with coloured zone overlays and 72h congestion chart
- Operations page shows berth assignments, crane assignments, routing recommendations
- Planning page shows 72h timeline and vessel schedule
- Copilot sidebar answers questions using real backend responses
- No TypeScript errors

**Todo List:**
1. Scaffold Vite + React + TypeScript in `src/frontend/`
2. Install dependencies (listed in Section 4)
3. Configure Tailwind CSS
4. Write `types/api.ts` — TypeScript interfaces mirroring all Contract C JSON shapes
5. Write `api/client.ts` — 6 typed functions (see Section 9, Member 4 tasks)
   Point at `VITE_API_BASE_URL` env var. Return mock data when API is unreachable.
6. Write `App.tsx` — React Router (3 routes), global Copilot sidebar layout
7. Build `SummaryCards.tsx` — 4 KPI cards: total vessels, overall congestion %, hotspot
   zones, berth utilisation %
8. Build `PortMap.tsx` — Leaflet map, 6 coloured rectangles on a fixed bounding box
   (no real coordinates), severity colour legend
9. Build `CongestionChart.tsx` — Recharts LineChart, 6 coloured series (one per zone),
   72h x-axis
10. Build `Dashboard.tsx` — assembles map + chart + summary cards
11. Build `BerthBoard.tsx` — table or Recharts bar showing berth assignments (vessel,
    berth, start, end, wait time)
12. Build `CraneTable.tsx` — table of crane assignments
13. Build `RoutePanel.tsx` — cards per route recommendation
14. Build `Operations.tsx` — assembles berth + crane + route panels
15. Build `PlanTimeline.tsx` — scrollable 12-slice timeline
16. Build `Planning.tsx` — assembles timeline + vessel schedule
17. Build `Copilot.tsx` — slide-in chat, message history, mode badge ("DEMO" / "watsonx")
18. Day 3: wire to real API, add loading spinners + error states, take 3 screenshots

**Relevant Context:**
- Section 5 Contract C (API response shapes — the source of truth for types/api.ts)
- Section 3 (port layout — zone names, types, for PortMap labels)
- Member 3's `schemas.py` (read as soon as available to verify type parity)

---

### Sub-Task 5 — Documentation + Demo + Submission
**Status:** [ ] pending
**Branch:** `main` (each member merges their doc changes via their feature branch or directly)
**Owner:** All members, responsibilities assigned by initials below

**Intent:** Complete all submission template documents, record demo, create slides,
pass GitHub Actions validator.

**Expected Outcomes:**
- All placeholder text gone from all template files
- `docker compose up` works on a clean clone
- Demo video recorded and link updated
- `presentation/slides.pdf` present
- 3+ screenshots present
- GitHub Actions ✅ green

**Todo List:**
1. (M1) Rewrite `docs/problem-statement.md` — port congestion domain, who is affected,
   economic cost of congestion, why existing tools fall short
2. (M2) Rewrite `docs/solution-overview.md` — how PortFlow AI works, ML + optimisation
   + copilot mechanism, key design decisions, IBM technologies used
3. (M2) Rewrite `docs/architecture.md` — real Mermaid diagram showing all 5 layers,
   component table, data flow numbered steps, security notes (env vars, no auth for prototype)
4. (M3) Rewrite `docs/setup-guide.md` — prerequisites (Docker Desktop, or Python 3.11 +
   Node 18), env var table, `docker compose up` command, verify steps, troubleshooting table
5. (M4) Take screenshots: `01-dashboard.png`, `02-operations.png`, `03-copilot.png`
6. (M3) Test clean clone + `docker compose up` on a fresh terminal
7. (M4) Record 3–5 min demo video: startup → dashboard → operations → copilot question
8. Update `demo/demo-video-link.txt` with real video URL
9. (All) Build `presentation/slides.pdf` — 8 slides per `presentation/README.md`
10. Verify GitHub Actions ✅ green
11. Submit entry form

**Relevant Context:**
- [`docs/template-guide.md`](bob-ai-hackathon-Team-Arjuna/docs/template-guide.md) — scoring rubric at section 7
- [`.github/workflows/validate.yml`](bob-ai-hackathon-Team-Arjuna/.github/workflows/validate.yml) — exact CI checks
- [`presentation/README.md`](bob-ai-hackathon-Team-Arjuna/presentation/README.md) — 8-slide structure

---

*Plan v3 — approved. Implementation begins after Sub-Task 0 scaffolding commit is pushed to `main`.*
