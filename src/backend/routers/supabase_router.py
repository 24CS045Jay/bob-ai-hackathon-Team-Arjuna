"""
PortFlow AI — Supabase Integration Router
Provides API endpoints to verify Supabase connectivity, seed data, and sync records.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any

try:
    from ..db.supabase_client import (
        get_supabase_client,
        check_supabase_connection,
        seed_supabase_data,
        SUPABASE_URL,
    )
except (ImportError, ValueError):
    from db.supabase_client import (
        get_supabase_client,
        check_supabase_connection,
        seed_supabase_data,
        SUPABASE_URL,
    )

router = APIRouter(prefix="/api/supabase", tags=["Supabase Cloud Database"])


@router.get("/status", summary="Check Supabase connection health & table schema status")
def get_supabase_status():
    """
    Checks if the backend is connected to the Supabase project,
    whether required tables exist, and returns counts of records.
    """
    return check_supabase_connection()


@router.post("/seed", summary="Seed canonical port data into Supabase tables")
def trigger_supabase_seed():
    """
    Inserts or updates canonical vessels, berths, cranes, and telemetry
    directly into Supabase tables via the Python client.
    """
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase client could not be initialized")

    result = seed_supabase_data()
    if not result.get("success"):
        return {
            "status": "partial_or_failed",
            "message": "Some tables could not be seeded. Ensure the SQL schema was executed in Supabase first.",
            "details": result,
        }
    return {
        "status": "success",
        "message": "Canonical maritime data seeded successfully into Supabase.",
        "details": result,
    }


@router.get("/vessels", summary="Fetch vessels directly from Supabase")
def list_supabase_vessels():
    """Fetches all vessel records directly from Supabase public.vessels."""
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase client unavailable")
    try:
        res = client.table("vessels").select("*").execute()
        return {"count": len(res.data), "vessels": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to query Supabase: {e}")


@router.get("/berths", summary="Fetch berths directly from Supabase")
def list_supabase_berths():
    """Fetches all berth records directly from Supabase public.berths."""
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase client unavailable")
    try:
        res = client.table("berths").select("*").execute()
        return {"count": len(res.data), "berths": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to query Supabase: {e}")


@router.get("/cranes", summary="Fetch cranes directly from Supabase")
def list_supabase_cranes():
    """Fetches all crane records directly from Supabase public.cranes."""
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase client unavailable")
    try:
        res = client.table("cranes").select("*").execute()
        return {"count": len(res.data), "cranes": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to query Supabase: {e}")


@router.get("/telemetry", summary="Fetch telemetry directly from Supabase")
def list_supabase_telemetry():
    """Fetches recent zone telemetry directly from Supabase public.zone_telemetry."""
    client = get_supabase_client()
    if client is None:
        raise HTTPException(status_code=500, detail="Supabase client unavailable")
    try:
        res = client.table("zone_telemetry").select("*").order("id", desc=True).limit(20).execute()
        return {"count": len(res.data), "telemetry": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to query Supabase: {e}")
