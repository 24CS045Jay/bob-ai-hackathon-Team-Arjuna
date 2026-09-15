# ⚙️ Setup & Installation Guide — PortFlow AI Digital Twin

> Step-by-step instructions to install, configure, train, and run the PortFlow AI platform locally, via Supabase cloud, or using Docker.

---

## 1. System Requirements

Ensure the following runtimes are installed on your system:
- **Python:** Version 3.11 or higher
- **Node.js:** Version 18.x or higher with npm
- **Git:** Version 2.30 or higher
- **Docker & Docker Compose (Optional):** For containerized execution

---

## 2. Environment Variables & API Key Setup

PortFlow AI comes pre-configured with active Supabase credentials and supports multiple free LLM providers as well as offline deterministic execution.

### Backend Environment Configuration
Navigate to `src/backend/` and verify or edit `.env`:

```bash
cd src/backend
# Copy template if .env does not exist:
cp .env.example .env
```

Key configuration parameters inside `src/backend/.env`:

```env
# ── Supabase Cloud Database ───────────────────────────────────────────────────
SUPABASE_URL=https://gmqrrnaktdzoigbquhsp.supabase.co
SUPABASE_KEY=sb_publishable_ZKrkMyN83WE1YuJKmDehcQ_BEh9_vwc
DB_PATH=portflow.db

# ── AI Copilot Configuration ──────────────────────────────────────────────────
# Set to false to use external LLM APIs with live digital twin context
DEMO_MODE=false

# Plug in any FREE API key below (Groq is recommended for lightning-fast responses):
# 1. Groq (Free at https://console.groq.com):
GROQ_API_KEY=

# 2. OpenRouter (Free models at https://openrouter.ai/keys):
OPENROUTER_API_KEY=

# 3. Google Gemini (Free tier at https://aistudio.google.com/app/apikey):
GEMINI_API_KEY=

# 4. IBM watsonx.ai (Optional enterprise foundation models):
WATSONX_API_KEY=
WATSONX_PROJECT_ID=
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

> **Note on Zero-Hallucination Fallback:** If no LLM API key is provided or if `DEMO_MODE=true`, the AI Copilot automatically runs our built-in **Deterministic Grounded Engine**, answering all maritime questions accurately directly from the database without external API calls.

---

## 3. Local Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/24CS045Jay/bob-ai-hackathon-Team-Arjuna.git
cd bob-ai-hackathon-Team-Arjuna
```

### Step 2: Setup Python Virtual Environment & Dependencies
```bash
# Create and activate virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux / macOS:
source .venv/bin/activate

# Install backend and machine learning dependencies
pip install -r src/backend/requirements.txt
pip install -r src/ml/requirements.txt
```

### Step 3: Train Machine Learning Model & Seed Local Database
```bash
# 1. Train the Random Forest Congestion Regressor on 2,400 operational observations
python src/ml/train.py

# 2. Seed canonical Port of Arjuna vessels, berths, cranes, and telemetry
python src/backend/db/seed.py
```

### Step 4: Install Frontend Dependencies
```bash
cd src/frontend
npm install
cd ../..
```

---

## 4. Setting Up Supabase Cloud Database (One-Click)

To connect your Supabase cloud project with the full Port of Arjuna schema:
1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard/project/gmqrrnaktdzoigbquhsp).
2. Click on **SQL Editor** in the left navigation sidebar.
3. Click **New Query**.
4. Open [`src/backend/db/supabase_schema.sql`](../src/backend/db/supabase_schema.sql) in your code editor, copy the entire content, and paste it into the Supabase SQL editor.
5. Click **Run**.
6. All 5 tables (`vessels`, `berths`, `cranes`, `zone_telemetry`, `optimization_logs`), Row Level Security policies, and 15 canonical vessels will be initialized instantly.

---

## 5. Running the Application

### Method A: Local Development (Two Terminals)

**Terminal 1 — FastAPI Backend:**
```bash
cd src/backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`
- **Supabase Cloud Health Check:** `http://localhost:8000/api/supabase/status`
- **Backend Health Probe:** `http://localhost:8000/health`

**Terminal 2 — React Operations Digital Twin UI:**
```bash
cd src/frontend
npm run dev
```
- **Operations Dashboard:** `http://localhost:5173/`

### Method B: Docker Compose (One-Command Deployment)

```bash
cd src
docker-compose up --build
```
- Web UI: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 6. Verification & Self-Test Suite

Run these quick CLI commands to verify all system components:

```bash
# 1. Verify ML Inference Engine (Contract A)
python src/ml/predict.py

# 2. Verify Discrete Optimization Solvers (Contract B)
python src/optimisation/berth_assignment.py
python src/optimisation/crane_assignment.py
python src/optimisation/routing.py
python src/optimisation/planner_72h.py

# 3. Test Backend Health Probe
curl http://localhost:8000/health

# 4. Test Supabase Cloud Status
curl http://localhost:8000/api/supabase/status

# 5. Verify Frontend Production Build
cd src/frontend && npm run build
```
