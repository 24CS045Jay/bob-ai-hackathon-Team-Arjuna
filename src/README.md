# 📦 PortFlow AI Source Codebase

This directory contains the complete source code, machine learning pipelines, discrete optimization algorithms, and digital twin user interface for **PortFlow AI**.

---

## Directory Organization

```
src/
├── backend/                 # FastAPI REST services & Copilot integration
│   ├── db/                  # Hybrid persistence layer (Supabase PostgreSQL + SQLite)
│   │   ├── database.py      # SQLAlchemy connection engine with auto-fallback
│   │   ├── models.py        # Canonical ORM models (Vessel, Berth, Crane, Telemetry)
│   │   ├── seed.py          # Database seeding script for canonical Port of Arjuna data
│   │   ├── supabase_client.py # Supabase REST client, table health checks & sync
│   │   └── supabase_schema.sql# Complete Supabase PostgreSQL DDL migration script
│   ├── models/schemas.py    # Pydantic v2 validation contracts (Contracts C, D & Maritime)
│   ├── routers/             # FastAPI modular routing endpoints
│   │   ├── maritime_router.py # AIS telemetry, weather, recommendations, route decision
│   │   ├── predictions.py   # Congestion & hotspot inference endpoints
│   │   ├── optimisation.py  # Discrete berth, crane & routing endpoints
│   │   ├── planning.py      # 72-hour multi-horizon operational matrix
│   │   ├── copilot.py       # Grounded maritime dispatcher natural language chat
│   │   └── supabase_router.py # Supabase connection status & cloud data sync
│   ├── services/            # Service orchestrators & client wrappers
│   │   ├── ais_service.py   # Live AIS telemetry stream & seaward coordinate clamping
│   │   ├── weather_service.py # Open-Meteo Marine Weather API & ocean current sampler
│   │   ├── rerouting_service.py # 100% Oceanic Certified Fairways (zero land traversal)
│   │   ├── recommendation_service.py # Explainable route acceptance & Why Accept/Decline
│   │   ├── cost_service.py  # Multi-currency demurrage valuation (USD, EUR, GBP, etc.)
│   │   ├── copilot_service.py # Multi-LLM provider + zero-hallucination engine
│   │   ├── ml_client.py     # Random Forest model inference wrapper
│   │   ├── optimiser_client.py# Deterministic solvers wrapper
│   │   └── planner_client.py# 72-hour planning engine wrapper
│   ├── requirements.txt     # Python backend dependencies
│   └── main.py              # Application entrypoint & CORS middleware
├── frontend/                # React 18 + Vite digital twin operations web UI
│   ├── src/
│   │   ├── pages/
│   │   │   ├── WorldMapPage.jsx # High-res oceanic map, AIS telemetry, storm bypass & route modal
│   │   │   ├── Dashboard.jsx    # Port situational map, congestion heatmaps & KPIs
│   │   │   ├── Operations.jsx   # Berth allocations, crane scheduling & gate queues
│   │   │   └── Planning.jsx     # 72-hour horizon timeline & vessel turnaround Gantt
│   │   ├── components/      # UI widgets, Leaflet canvas, Copilot drawer & route modal
│   │   └── api/client.js    # Axios client connecting all backend REST endpoints
│   ├── public/              # Static maritime assets & video feeds
│   └── package.json         # Node.js frontend dependencies
├── ml/                      # Machine Learning Training & Inference (Contract A)
│   ├── data_generator.py    # Synthetic generator producing 2,400 operational records
│   ├── feature_engineering.py# Normalization pipeline & StandardScaler
│   ├── train.py             # Random Forest regressor training script (R² > 0.96)
│   ├── predict.py           # Real-time zone congestion scoring
│   ├── eta_model.py         # Gradient Boosting ETA Regressor under adverse marine conditions
│   ├── risk_model.py        # Random Forest Route Risk Classifier
│   ├── requirements.txt     # ML specific dependencies (scikit-learn, joblib)
│   └── models/              # Serialized models (.pkl) & feature importance JSON
├── optimisation/            # Operational Discrete Optimization Solvers (Contract B)
│   ├── berth_assignment.py  # Priority-queue berth allocator (LOA & UKC checks)
│   ├── crane_assignment.py  # Earliest Deadline First (EDF) crane scheduler
│   ├── routing.py           # Dijkstra UKC dynamic fairway routing (14 waypoints)
│   └── planner_72h.py       # 12-slice multi-horizon operational engine
├── data_contract.md         # Canonical maritime operational specifications
├── docker-compose.yml       # Production/local multi-container deployment
└── .env.example             # Comprehensive environment configuration template
```

---

## Key Contracts & Interfaces

- **Contract A (ML Predictions):** Standardized input vectors (`ZoneFeatureItem`) and outputs (`ZonePredictionResult`) providing zone-level congestion indices and contributing factors.
- **Contract B (Deterministic Solvers):** Algorithmic solvers enforcing strict physical maritime constraints:
  $$\text{Draft} + 1.0\text{m UKC} \le \text{Berth Max Draft}$$
- **Contract C & D (FastAPI REST & Copilot):** Endpoints serving predictions, solver solutions, and natural language dispatch reasoning grounded in live terminal telemetry.
- **Maritime AI & Oceanic Rerouting Interface:** High-throughput endpoints serving live AIS coordinates, marine meteorological telemetry, oceanic route bypass waypoints (zero land crossing), and transparent operator acceptance trade-off dossiers.

---

## Running Backend & Frontend Together

```bash
# 1. Start FastAPI Backend (Port 8000)
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 2. Start React Digital Twin UI (Port 5173)
cd ../frontend
npm run dev
```
