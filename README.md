# 🚀 PortFlow AI — Intelligent Port Operations & Congestion Optimization Digital Twin

> Autonomous 72-hour maritime congestion prediction, algorithmic berth and crane scheduling, dynamic channel routing, and watsonx-grounded natural language co-pilot for high-throughput container terminals.

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | Team Arjuna |
| **Track** | AI |
| **Team Lead** | Arjuna Lead — team-arjuna@bob-ai.local |
| **Members** | Jay, Team Arjuna Engineers |

---

## 🎯 Problem Statement

Modern high-density container ports face severe, cascading congestion caused by unpredictable vessel arrival delays, variable tidal draft windows, and reactive, manual spreadsheet-based dispatching of scarce quay cranes and deep-water berths. When delays cascade, ships wait offshore in anchorages consuming up to 35 tons of marine fuel daily while terminal yard congestion peaks, costing global supply chains over $10B annually and producing millions of tons of avoidable carbon emissions.

---

## 💡 Solution

PortFlow AI is an end-to-end digital twin and AI orchestration engine specifically engineered for container ports. It couples a Random Forest machine learning pipeline predicting 72-hour zone-level congestion indices with a deterministic discrete optimization engine for priority berth assignment, Earliest Deadline First (EDF) crane scheduling, and draft-constrained channel routing. Operations directors interact with the twin through an operational dashboard and a grounded AI Copilot powered by IBM watsonx.ai (with deterministic offline demo fallbacks).

---

## ✨ Key Features

- **72-Hour Predictive Congestion Engine:** Random Forest regressor predicting congestion scores (0–100), risk tiers, and bottleneck factors across 6 operational port zones in 6-hour time steps.
- **Priority Berth Allocation Optimizer:** Greedy priority queue assigning vessels to 12 berths based on draft limits, vessel length (LOA), TEU workload, and priority flags.
- **Earliest Deadline First (EDF) Crane Dispatcher:** Dynamic assignment of 7 STS (Ship-to-Shore) container gantry cranes minimizing vessel dwell time and demurrage fines.
- **Draft & Tide Constrained Vessel Routing:** Graph-based Dijkstra navigation through 14 port waypoints enforcing minimum under-keel clearance (UKC) and dynamic tidal heights.
- **watsonx.ai Grounded Maritime Copilot:** Natural language operations advisor integrating live terminal state, berth queues, and weather telemetry to provide actionable dispatch decisions.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11+, JavaScript (ES2022) |
| **Frameworks** | FastAPI, React 18, Vite |
| **IBM Technologies** | IBM watsonx.ai (`ibm/granite-3-8b-instruct`), IBM Cloud |
| **Optimisation & ML** | Scikit-learn, NumPy, Pandas, Joblib, Dijkstra Graph Routing, Priority Queues |
| **Databases** | SQLite (SQLAlchemy ORM) with canonical Port of Arjuna seed data |
| **Styling & Visualization** | Vanilla CSS Design System, Tailwind CSS, Lucide Icons, Canvas Digital Twin |
| **DevOps & Containers** | Docker, Docker Compose, GitHub Actions CI/CD |

---

## 📁 Repository Structure

```
├── src/
│   ├── ml/                      # Machine learning training, inference & synthetic data
│   │   ├── data_generator.py    # 2,000 synthetic observations for zones A-F
│   │   ├── feature_engineering.py# Feature transforms & StandardScaler
│   │   ├── train.py             # Random Forest regressor trainer & metrics
│   │   ├── predict.py           # Contract A inference engine with fallback
│   │   └── models/              # Trained pkl and feature importance JSON
│   ├── optimisation/            # Contract B deterministic operational algorithms
│   │   ├── berth_assignment.py  # Priority queue berth allocator
│   │   ├── crane_assignment.py  # EDF crane scheduler
│   │   ├── routing.py           # Dijkstra channel waypoint navigator
│   │   └── planner_72h.py       # 12-slice multi-horizon operational engine
│   ├── backend/                 # FastAPI REST services & watsonx Copilot
│   │   ├── db/                  # SQLite models and canonical Port of Arjuna seed
│   │   ├── models/schemas.py    # Pydantic v2 schemas
│   │   ├── services/            # ML, Optimiser, and Copilot service clients
│   │   ├── routers/             # Predictions, Optimisation, Planning, Copilot
│   │   └── main.py              # Application entrypoint & CORS
│   ├── frontend/                # React 18 + Vite digital twin operations web UI
│   │   └── src/                 # Oceanic UI, Copilot sidebar, and live charts
│   ├── data_contract.md         # Canonical zones, berths, cranes & vessels
│   ├── docker-compose.yml       # Production/local multi-container deployment
│   └── .env.example             # Documented environment variables
├── docs/                        # Comprehensive technical documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                        # Hackathon evaluation artifacts
│   ├── screenshots/             # Production UI captures
│   ├── demo-video-link.txt      # Video walk-through URL
│   └── live-demo-url.txt        # Deployed application URL
├── presentation/                # Slide decks & executive overview
└── submission.yaml              # Validated hackathon submission metadata
```

---

## ⚡ How to Run

### Option A: Local Development (Quickstart)

```bash
# 1. Clone the repository
git clone https://github.com/24CS045Jay/bob-ai-hackathon-Team-Arjuna.git
cd bob-ai-hackathon-Team-Arjuna

# 2. Setup Python environment and install dependencies
cd src
pip install -r ml/requirements.txt
pip install -r backend/requirements.txt

# 3. Train the ML model and seed the database
python ml/train.py
python backend/db/seed.py

# 4. Start FastAPI backend (Terminal 1)
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# 5. Start Frontend UI (Terminal 2)
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Option B: Docker Compose

```bash
cd src
docker-compose up --build
# Access UI at http://localhost:5173 and API at http://localhost:8000/docs
```

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pdf](presentation/) |

---

## ⚠️ Known Limitations

- **AIS Telemetry Stream:** Live AIS satellite stream is simulated in DEMO_MODE using realistic 15-minute kinematic updates rather than a paid commercial terrestrial AIS feed.
- **Tidal Table Scope:** Dynamic tidal predictions are currently calibrated for the Port of Arjuna hydrographic zone; international port transfers require local harmonic constituent tables.
- **Offline LLM Operation:** When IBM watsonx credentials are not provided, Copilot falls back to deterministic context-grounded reasoning without hallucination.

---

## 🏅 What We're Most Proud Of

- **Zero-Hallucination Grounded AI:** The Copilot synthesizes live numerical state directly from the discrete optimization solver and ML prediction vectors, answering operational questions with exact berth IDs, tidal heights, and vessel names.
- **Rigorous Multi-Horizon Optimization:** The 72-hour planning engine combines stochastic ML congestion forecasts with mathematical constraints (draft, LOA, crane availability), ensuring berth allocations are hydraulically and physically feasible.
- **Production-Ready Maritime UX:** A responsive, oceanic-themed digital twin dashboard equipped with role-based access, dark/light modes, interactive Gantt schedules, and high-density situational maps.
