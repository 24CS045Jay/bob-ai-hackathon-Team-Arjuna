"""
PortFlow AI — Supabase Integration Router
Provides API endpoints to verify Supabase connectivity, seed data, and sync records.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional, List

try:
    from ..db.supabase_client import (
        get_supabase_client,
        check_supabase_connection,
        seed_supabase_data,
        SUPABASE_URL,
        list_supabase_users,
        create_user_profile,
        authenticate_user,
    )
except (ImportError, ValueError):
    from db.supabase_client import (
        get_supabase_client,
        check_supabase_connection,
        seed_supabase_data,
        SUPABASE_URL,
        list_supabase_users,
        create_user_profile,
        authenticate_user,
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


# -----------------------------------------------------------------------------
# User Authentication & Personnel Directory Endpoints
# -----------------------------------------------------------------------------

class UserSignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role_code: Optional[str] = "shift_supervisor"
    title: Optional[str] = None
    department: Optional[str] = "Terminal Dispatch"
    shift: Optional[str] = "06:00 - 14:00 (Morning)"


class UserLoginRequest(BaseModel):
    email: str
    password: str


@router.get("/users", summary="List registered personnel from Supabase")
def get_all_users():
    """Fetches all registered personnel from Supabase public.users."""
    users = list_supabase_users()
    return {"count": len(users), "users": users}


@router.post("/signup", summary="Register new user profile in Supabase")
def signup_user(req: UserSignupRequest):
    """Registers a new user in Supabase public.users and sets operational role."""
    import time
    clean_email = req.email.strip().lower()
    user_id = f"usr-{int(time.time() * 1000) % 1000000}"

    # Generate initials avatar
    parts = req.name.strip().split()
    avatar = (parts[0][0] + (parts[1][0] if len(parts) > 1 else parts[0][1])).upper() if req.name else "OP"

    user_dict = {
        "id": user_id,
        "email": clean_email,
        "password_hash": req.password,
        "name": req.name.strip(),
        "title": req.title or f"{req.role_code.replace('_', ' ').title()} Operator",
        "role_code": req.role_code or "shift_supervisor",
        "department": req.department or "Terminal Dispatch",
        "shift": req.shift or "06:00 - 14:00 (Morning)",
        "avatar": avatar,
        "last_login": "Just now",
    }

    result = create_user_profile(user_dict)
    sanitized = {k: v for k, v in result.get("user", user_dict).items() if k != "password_hash"}
    return {
        "status": "success",
        "message": f"User account '{clean_email}' created successfully",
        "user": sanitized,
    }


@router.post("/login", summary="Authenticate credentials against Supabase")
def login_user(req: UserLoginRequest):
    """Verifies email and password against Supabase public.users records."""
    user = authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Please verify your email and passcode or register a new duty account.",
        )
    return {
        "status": "success",
        "message": f"Welcome back, {user.get('name')}!",
        "user": user,
    }

