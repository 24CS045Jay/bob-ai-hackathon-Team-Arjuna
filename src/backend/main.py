"""
PortFlow AI — FastAPI Application Entrypoint
Hosts ML Congestion Predictions, Discrete Optimization Solvers, 72-Hour Horizon Planner,
and Grounded watsonx.ai Copilot.
"""

from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .routers import predictions, optimisation, planning, copilot, supabase_router
    from .db.database import engine, Base
    from .db.seed import seed_database
    from .db.supabase_client import check_supabase_connection
except (ImportError, ValueError):
    from routers import predictions, optimisation, planning, copilot, supabase_router
    from db.database import engine, Base
    from db.seed import seed_database
    from db.supabase_client import check_supabase_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite / PostgreSQL database and seed canonical data
    Base.metadata.create_all(bind=engine)
    seed_database()
    # Check Supabase Cloud Database connection status
    try:
        supa_status = check_supabase_connection()
        print(f"[Supabase] Status: {supa_status.get('status')} | Connected: {supa_status.get('connected')} | URL: {supa_status.get('supabase_url')}")
    except Exception as e:
        print(f"[Supabase] Health check warning: {e}")
    yield


app = FastAPI(
    title="PortFlow AI — Digital Twin & Terminal Operations Optimization API",
    description="Deterministic Discrete Optimization & ML Maritime Intelligence Suite for Port of Arjuna",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend and cross-origin tools
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(predictions.router)
app.include_router(optimisation.router)
app.include_router(planning.router)
app.include_router(copilot.router)
app.include_router(supabase_router.router)


@app.get("/")
def root():
    return {
        "service": "PortFlow AI Operations Backend",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/health",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "portflow-ai-backend",
        "version": "1.0.0",
        "timestamp_utc": datetime.utcnow().isoformat(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
