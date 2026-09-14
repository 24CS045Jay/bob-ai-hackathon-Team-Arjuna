# Setup & Installation Guide — PortFlow AI

> Complete step-by-step instructions to install, train, and run the PortFlow AI Digital Twin platform locally or via Docker.

---

## Prerequisites

Ensure the following tools are installed on your workstation:

- **Python:** Version 3.11 or higher
- **Node.js:** Version 18.x or higher with npm
- **Git:** Version 2.30 or higher
- **Docker & Docker Compose (Optional):** For containerized deployment

---

## Environment Variables

PortFlow AI comes pre-configured to work out of the box with zero external API keys in `DEMO_MODE=true`.

Copy `.env.example` to create your local `.env`:

```bash
cp src/.env.example src/.env
```

| Variable | Description | Default | Required |
|---|---|---|---|
| `APP_PORT` | Port for FastAPI backend service | `8000` | Yes |
| `DEMO_MODE` | Deterministic context-grounded AI copilot flag | `true` | Yes |
| `DB_PATH` | Path to SQLite database file | `src/backend/portflow.db` | Yes |
| `WATSONX_APIKEY` | IBM Cloud / watsonx.ai API Key | (optional) | No (used if DEMO_MODE=false) |
| `WATSONX_PROJECT_ID` | IBM watsonx.ai Project ID | (optional) | No (used if DEMO_MODE=false) |
| `WATSONX_URL` | IBM watsonx.ai endpoint URL | `https://us-south.ml.cloud.ibm.com` | No |
| `VITE_API_BASE_URL` | Base API URL consumed by React frontend | `http://localhost:8000` | Yes |

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/24CS045Jay/bob-ai-hackathon-Team-Arjuna.git
cd bob-ai-hackathon-Team-Arjuna
```

### 2. Python Environment Setup

```bash
# Create and activate virtual environment (optional but recommended)
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install ML and Backend dependencies
pip install -r src/ml/requirements.txt
pip install -r src/backend/requirements.txt
```

### 3. Train ML Model & Initialize Database

```bash
# Train the Random Forest congestion model on 2,400 synthetic observations
python src/ml/train.py

# Initialize SQLite tables and seed canonical Port of Arjuna vessels & berths
python -m src.backend.db.seed
```

### 4. Install Frontend Dependencies

```bash
cd src/frontend
npm install
cd ../..
```

---

## Running the Application

### Method A: Local Development (Two Terminals)

**Terminal 1 — FastAPI Backend:**
```bash
python -m uvicorn src.backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/health`

**Terminal 2 — React Digital Twin UI:**
```bash
cd src/frontend
npm run dev
```
- Dashboard UI: `http://localhost:5173/`

### Method B: Docker Compose

```bash
cd src
docker-compose up --build
```
- Web UI: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## Running Verification Tests

Run the following commands to verify all modules:

```bash
# 1. Test ML inference engine (Contract A)
python src/ml/predict.py

# 2. Test Discrete Optimization solvers (Contract B)
python src/optimisation/berth_assignment.py
python src/optimisation/crane_assignment.py
python src/optimisation/routing.py
python src/optimisation/planner_72h.py

# 3. Test Backend Health Probe
curl http://127.0.0.1:8000/health

# 4. Verify Frontend Production Build
cd src/frontend && npm run build
```
