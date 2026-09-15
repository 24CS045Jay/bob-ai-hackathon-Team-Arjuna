# 🚀 PortFlow AI — Intelligent Port Operations & Congestion Optimization Digital Twin

> Autonomous 72-hour maritime congestion prediction, algorithmic berth and crane scheduling, dynamic channel routing, Supabase cloud database synchronization, and grounded natural language AI Copilot for high-throughput container terminals.

---

## 👥 Team Details

| Field | Value |
|---|---|
| **Team Name** | **Team Arjuna** |
| **Track** | **AI (Artificial Intelligence & Operations Research)** |
| **Team Lead** | **Jay Ladva** (`24cs045@charusat.edu.in`) |
| **Team Members** | • **Jay Ladva** — Backend Architecture, AI Pipelines & API Orchestration<br>• **Param Shah** — Machine Learning Models & Constraint Optimization Solvers<br>• **Nishant Virani** — React Digital Twin Web UI, GIS Visualization & UX<br>• **Smit Bhesaniya** — Cloud Data Infrastructure, Supabase & Telemetry Integration |

---

## 🎯 Problem Statement & Justification

Modern high-density deepwater container terminals face severe, cascading operational congestion caused by:
1. **Unpredictable Vessel Arrival Delays:** Stochastic weather disruptions, canal chokepoints, and transshipment bottlenecks skew scheduled arrival windows.
2. **Dynamic Hydrographic Constraints:** Semi-diurnal tidal variations strictly govern Under-Keel Clearance (UKC); low-tide windows force deep-draft Ultra-Large Container Vessels (ULCVs) to wait offshore at anchor, consuming up to 35 metric tons of heavy fuel oil daily per vessel.
3. **Reactive, Spreadsheet-Based Resource Allocation:** Terminal superintendents manage multi-million-dollar berths, Ship-to-Shore (STS) gantry cranes, and yard stacks using fragmented spreadsheets and radio handoffs after gridlocks have already formed.

This lack of predictive foresight costs global maritime supply chains over **$10 Billion annually in demurrage penalties** and generates millions of tons of avoidable coastal greenhouse gas emissions.

---

## 💡 Solution Overview

**PortFlow AI** transforms reactive terminal operating procedures into an autonomous, proactive digital twin:
- **Predictive Congestion Forecasting:** Machine learning models forecast congestion scores (0–100) and identify bottleneck drivers across 6 operational zones up to 72 hours ahead.
- **Deterministic Priority Berth Allocation:** Algorithmic solver assigns incoming vessels to 12 berths, enforcing physical vessel length (LOA), draft + 1.0m UKC safety margins, and cargo type compatibility.
- **Earliest Deadline First (EDF) Crane Dispatch:** Allocates 7 STS gantry cranes based on departure deadlines, TEU workloads, and demurrage risks to maximize net throughput (moves/hour).
- **Dijkstra Navigational Waypoint Routing:** Guides vessels across 14 hydrographic waypoints, dynamically calculating safe passage depths during fluctuating tide cycles (+3.4m MHHW).
- **Supabase Cloud Database & RLS:** Cloud-native PostgreSQL persistence storing canonical vessels, berths, cranes, telemetry, and audit logs with Row Level Security.
- **Context-Grounded AI Operations Copilot:** Natural language assistant powered by IBM watsonx.ai Granite, Groq (Llama 3.3), or Google Gemini, with an offline deterministic engine that eliminates hallucinations by directly referencing live digital twin state.

---

## ✨ Key Features

- 🔮 **72-Hour Predictive Congestion Engine:** Random Forest regressor trained on 2,400 multi-zone operational observations, producing continuous congestion indices ($R^2 > 0.96$) and classifying risk tiers (Low, Medium, High, Critical).
- ⚓ **Priority Berth Allocation Optimizer:** Constraint satisfaction solver matching vessels to candidate berths while minimizing anchorage waiting time and vessel dwell hours.
- 🏗️ **Quay Crane Dispatcher (EDF):** Dynamic crane split scheduler optimizing 7 STS gantry cranes to eliminate idle quayside time.
- 🌊 **Tide-Aware Channel Navigator:** Graph-based Dijkstra algorithm recommending alternate maritime channels and pilotage paths when primary basins exceed congestion thresholds.
- 📅 **72-Hour Rolling Master Schedule:** 12 six-hour planning horizons forecasting vessel turnarounds, crane utilization, and yard capacity.
- 🗄️ **Supabase Cloud Database:** Full schema migrations, real-time table queries, and automated seeding for vessels, berths, cranes, and telemetry.
- 🤖 **Zero-Hallucination AI Copilot:** Specialized maritime dispatcher assistant strictly grounded in live terminal data. Handles fleet queries, berth vacancy checks, crane throughput, gate queues, and weather advisories without fabricating data.

---

## 🛠️ Tech Stack & Technologies

| Layer | Technologies |
|---|---|
| **Frontend & UI** | React 18, Vite, Vanilla CSS Design System, TailwindCSS, Lucide Icons, Canvas Digital Twin, Recharts |
| **Backend & APIs** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2, RESTful Architecture |
| **Machine Learning** | Scikit-learn (RandomForestRegressor, StandardScaler), NumPy, Pandas, Joblib |
| **Discrete Optimization** | Pure Python Discrete Solvers, Dijkstra Graph Routing, Priority Queues, Earliest Deadline First (EDF) |
| **Databases** | **Supabase (PostgreSQL)** with PostgREST, SQLAlchemy 2.0 ORM, Local SQLite (`portflow.db`) fallback |
| **AI & LLM Services** | **IBM watsonx.ai** (`ibm/granite-3-8b-instruct`), **Groq Cloud** (`llama-3.3-70b-versatile`), **Google Gemini**, Deterministic Rule Engine |
| **DevOps & Deployment** | Docker, Docker Compose, GitHub Actions, Vercel |

---

## 🔑 API Keys & Environment Configuration

PortFlow AI supports both cloud services and 100% offline local development.

### Supabase Cloud Database Credentials
The project is pre-configured with the following Supabase instance:
- **Project URL:** `https://gmqrrnaktdzoigbquhsp.supabase.co`
- **Publishable / Anon API Key:** `sb_publishable_ZKrkMyN83WE1YuJKmDehcQ_BEh9_vwc`
- **Database Schema & Migration:** `src/backend/db/supabase_schema.sql`

### AI Copilot LLM Provider Keys (Choose any free key)
Configure these in `src/backend/.env`:

| Provider | Environment Variable | Where to get free key |
|---|---|---|
| **Groq (Recommended)** | `GROQ_API_KEY` | Free at [console.groq.com](https://console.groq.com) |
| **OpenRouter** | `OPENROUTER_API_KEY` | Free models at [openrouter.ai](https://openrouter.ai/keys) |
| **Google Gemini** | `GEMINI_API_KEY` | Free tier at [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **IBM watsonx.ai** | `WATSONX_API_KEY` + `WATSONX_PROJECT_ID` | [cloud.ibm.com](https://cloud.ibm.com) |
| **Deterministic Mode** | `DEMO_MODE=true` | Zero external API keys needed (built-in offline engine) |

---

## 📁 Repository Structure

```
├── src/
│   ├── backend/                 # FastAPI REST API & Copilot service
│   │   ├── db/                  # Database connections, models & schemas
│   │   │   ├── database.py      # SQLAlchemy ORM (PostgreSQL & SQLite fallback)
│   │   │   ├── models.py        # Vessel, Berth, Crane, Telemetry ORM models
│   │   │   ├── seed.py          # Canonical Port of Arjuna dataset seed
│   │   │   ├── supabase_client.py # Supabase REST client & sync service
│   │   │   └── supabase_schema.sql # Complete Supabase PostgreSQL DDL migration
│   │   ├── models/schemas.py    # Pydantic v2 request/response contracts
│   │   ├── routers/             # Predictions, Optimisation, Planning, Copilot, Supabase
│   │   ├── services/            # ML inference, Discrete solvers, Copilot engine
│   │   ├── requirements.txt     # Python backend dependencies
│   │   └── main.py              # Application entrypoint & CORS middleware
│   ├── frontend/                # React 18 + Vite Operations Digital Twin
│   │   ├── src/                 # Oceanic UI, Copilot drawer, Gantt & GIS maps
│   │   └── package.json         # Frontend dependencies
│   ├── ml/                      # Machine Learning Training & Inference
│   │   ├── data_generator.py    # 2,400 synthetic operational observations
│   │   ├── feature_engineering.py# Normalization & feature encoding
│   │   ├── train.py             # Random Forest regressor trainer
│   │   └── predict.py           # Real-time zone congestion scoring
│   ├── optimisation/            # Operational Discrete Optimization Solvers
│   │   ├── berth_assignment.py  # Priority-queue berth allocator
│   │   ├── crane_assignment.py  # Earliest Deadline First (EDF) crane scheduler
│   │   ├── routing.py           # Dijkstra UKC dynamic fairway routing
│   │   └── planner_72h.py       # 12-slice multi-horizon operational engine
│   ├── data_contract.md         # Canonical maritime operational specifications
│   ├── docker-compose.yml       # Containerized multi-service deployment
│   └── .env.example             # Comprehensive environment template
├── docs/                        # Complete technical documentation suite
│   ├── problem-statement.md     # Deep dive into maritime port congestion
│   ├── solution-overview.md     # Architectural walkthrough & solver principles
│   ├── architecture.md          # Multi-tier system architecture diagrams
│   └── setup-guide.md           # Step-by-step installation & deployment guide
├── demo/                        # Submission demonstration assets
│   ├── demo-video-link.txt      # Video walk-through URL (add manually)
│   ├── live-demo-url.txt        # Deployed application URL (add manually)
│   └── screenshots/             # Production UI captures
├── presentation/                # Slide decks & executive briefing
│   ├── slides.pdf               # Presentation deck (add manually)
│   └── README.md                # Presentation guide
└── submission.yaml              # Verified hackathon submission metadata
```

---

## ⚡ Quickstart & How to Run

### Step 1: Clone Repository & Setup Environment
```bash
git clone https://github.com/24CS045Jay/bob-ai-hackathon-Team-Arjuna.git
cd bob-ai-hackathon-Team-Arjuna

# Configure backend environment
cd src/backend
cp .env.example .env
# Edit .env to add your free GROQ_API_KEY or use DEMO_MODE=true
```

### Step 2: Install Python Dependencies & Train ML Model
```bash
# In src/backend
pip install -r requirements.txt
pip install -r ../ml/requirements.txt

# Train Random Forest Congestion Model
python ../ml/train.py

# Initialize local SQLite database
python db/seed.py
```

### Step 3: Run Backend API
```bash
# From src/backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Supabase Cloud Status:** [http://localhost:8000/api/supabase/status](http://localhost:8000/api/supabase/status)
- **Health Probe:** [http://localhost:8000/health](http://localhost:8000/health)

### Step 4: Run React Digital Twin UI
```bash
# In a new terminal
cd src/frontend
npm install
npm run dev
```
- **Operations Dashboard:** [http://localhost:5173](http://localhost:5173)

---

## 🗄️ Setting Up Supabase Database (One-Click)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/gmqrrnaktdzoigbquhsp).
2. Navigate to **SQL Editor** -> **New Query**.
3. Copy the entire contents of [`src/backend/db/supabase_schema.sql`](src/backend/db/supabase_schema.sql).
4. Click **Run**.
5. All 5 tables (`vessels`, `berths`, `cranes`, `zone_telemetry`, `optimization_logs`), RLS policies, and 15 canonical vessels will be created instantly!
6. Verify live status anytime via `GET http://localhost:8000/api/supabase/status`.

---

## 🖥️ Submission Deliverables

| Deliverable | Location / Link | Status |
|---|---|---|
| 📹 **Demo Video** | [`demo/demo-video-link.txt`](demo/demo-video-link.txt) | *Add URL manually* |
| 🌐 **Live Deployed App** | [`demo/live-demo-url.txt`](demo/live-demo-url.txt) | *Add URL manually* |
| 📊 **Presentation Slides** | [`presentation/slides.pdf`](presentation/) | *Add file manually* |
| 🖼️ **Screenshots** | [`demo/screenshots/`](demo/screenshots/) | Available in folder |

---

## 🏅 What We're Most Proud Of

- **Zero-Hallucination AI Copilot:** By feeding live database state into the LLM system prompt and providing a high-precision deterministic fallback, the Copilot answers complex dispatch queries with exact real-world numbers without fabricating answers.
- **Physical Safety Constraints in Optimization:** The berth and crane solvers strictly enforce draft + 1.0m Under-Keel Clearance, vessel LOA, and crane compatibility, guaranteeing that every schedule generated is physically feasible.
- **Robust Multi-Provider AI Architecture:** Supports IBM watsonx.ai, Groq, Google Gemini, OpenRouter, and offline mode with automatic fallback.
