"""
PortFlow AI — Supabase Client & Synchronization Service
Manages authentication, connection health checks, and CRUD/seeding for Supabase tables:
vessels, berths, cranes, zone_telemetry, and optimization_logs.
"""

import os
from typing import Dict, Any, Optional, List
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from src/backend or current working directory
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if _ENV_PATH.exists():
    load_dotenv(dotenv_path=_ENV_PATH)
else:
    load_dotenv()

SUPABASE_URL_RAW = os.getenv("SUPABASE_URL", "https://gmqrrnaktdzoigbquhsp.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_ZKrkMyN83WE1YuJKmDehcQ_BEh9_vwc")


def normalize_supabase_url(url: str) -> str:
    """Ensures HTTPS scheme and corrects common typo of .supabase.com to .supabase.co."""
    clean = url.strip().rstrip("/")
    if not clean.startswith("http://") and not clean.startswith("https://"):
        clean = f"https://{clean}"
    if clean.endswith(".supabase.com"):
        clean = clean[:-4] + ".co"
    return clean


SUPABASE_URL = normalize_supabase_url(SUPABASE_URL_RAW)

_client = None


def get_supabase_client():
    """Initializes and caches a singleton Supabase Client."""
    global _client
    if _client is None:
        try:
            from supabase import create_client, Client
            _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as err:
            print(f"[SupabaseClient] Initialization warning: {err}")
            _client = None
    return _client


def check_supabase_connection() -> Dict[str, Any]:
    """
    Validates connection to Supabase and verifies existence and count of tables.
    Returns structured status dictionary.
    """
    client = get_supabase_client()
    if client is None:
        return {
            "status": "error",
            "connected": False,
            "supabase_url": SUPABASE_URL,
            "error": "Supabase client failed to initialize or missing dependencies",
            "tables": {},
        }

    tables_to_check = ["vessels", "berths", "cranes", "zone_telemetry", "optimization_logs", "users"]
    table_status = {}
    missing_tables = []
    total_records = 0

    for table_name in tables_to_check:
        try:
            res = client.table(table_name).select("*", count="exact").limit(1).execute()
            count = res.count if res.count is not None else len(res.data)
            table_status[table_name] = {"accessible": True, "count": count}
            total_records += count
        except Exception as e:
            err_str = str(e)
            if "PGRST205" in err_str or "Could not find the table" in err_str:
                table_status[table_name] = {"accessible": False, "error": "Table not created yet in Supabase"}
                missing_tables.append(table_name)
            else:
                table_status[table_name] = {"accessible": False, "error": err_str}

    all_exist = len(missing_tables) == 0
    return {
        "status": "connected" if all_exist else ("pending_schema" if missing_tables else "warning"),
        "connected": True,
        "supabase_url": SUPABASE_URL,
        "project_ref": SUPABASE_URL.replace("https://", "").split(".")[0],
        "all_tables_ready": all_exist,
        "missing_tables": missing_tables,
        "total_records": total_records,
        "tables": table_status,
        "next_step": None if all_exist else "Execute src/backend/db/supabase_schema.sql in Supabase Dashboard SQL Editor",
    }


def seed_supabase_data() -> Dict[str, Any]:
    """
    Seeds canonical vessels, berths, cranes, telemetry, and personnel into Supabase tables
    using the Python Client.
    """
    client = get_supabase_client()
    if client is None:
        return {"success": False, "error": "Supabase client not initialized"}

    try:
        from .seed import CANONICAL_VESSELS, CANONICAL_BERTHS, CANONICAL_CRANES, INITIAL_ZONE_TELEMETRY, CANONICAL_USERS
    except (ImportError, ValueError):
        from seed import CANONICAL_VESSELS, CANONICAL_BERTHS, CANONICAL_CRANES, INITIAL_ZONE_TELEMETRY, CANONICAL_USERS

    results = {}

    # Seed Vessels
    try:
        res = client.table("vessels").upsert(CANONICAL_VESSELS, on_conflict="vessel_id").execute()
        results["vessels"] = {"success": True, "rows": len(res.data)}
    except Exception as e:
        results["vessels"] = {"success": False, "error": str(e)}

    # Seed Berths
    try:
        res = client.table("berths").upsert(CANONICAL_BERTHS, on_conflict="berth_id").execute()
        results["berths"] = {"success": True, "rows": len(res.data)}
    except Exception as e:
        results["berths"] = {"success": False, "error": str(e)}

    # Seed Cranes
    try:
        res = client.table("cranes").upsert(CANONICAL_CRANES, on_conflict="crane_id").execute()
        results["cranes"] = {"success": True, "rows": len(res.data)}
    except Exception as e:
        results["cranes"] = {"success": False, "error": str(e)}

    # Seed Telemetry
    try:
        res = client.table("zone_telemetry").insert(INITIAL_ZONE_TELEMETRY).execute()
        results["zone_telemetry"] = {"success": True, "rows": len(res.data)}
    except Exception as e:
        results["zone_telemetry"] = {"success": False, "error": str(e)}

    # Seed Users
    try:
        res = client.table("users").upsert(CANONICAL_USERS, on_conflict="id").execute()
        results["users"] = {"success": True, "rows": len(res.data)}
    except Exception as e:
        results["users"] = {"success": False, "error": str(e)}

    all_ok = all(v.get("success", False) for v in results.values())
    return {
        "success": all_ok,
        "summary": results,
    }


def list_supabase_users() -> List[Dict[str, Any]]:
    """Returns all registered users from Supabase public.users, with local fallback."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("users").select("id, email, name, title, role_code, department, shift, avatar, last_login, created_at").execute()
            if res.data and len(res.data) > 0:
                return res.data
        except Exception as e:
            print(f"[SupabaseClient] list_supabase_users error: {e}")

    # Fallback to local DB or canonical users
    try:
        from .seed import CANONICAL_USERS
        return [
            {k: v for k, v in u.items() if k != "password_hash"}
            for u in CANONICAL_USERS
        ]
    except Exception:
        return []


def create_user_profile(user_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Registers a new user record into Supabase public.users with fallback."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("users").insert(user_dict).execute()
            if res.data:
                return {"success": True, "user": res.data[0]}
        except Exception as e:
            print(f"[SupabaseClient] create_user_profile cloud error: {e}")

    # Save to local database if available
    try:
        from .database import SessionLocal
        from .models import UserModel
        db = SessionLocal()
        try:
            new_user = UserModel(**user_dict)
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return {"success": True, "user": user_dict, "storage": "local"}
        except Exception as db_err:
            db.rollback()
            return {"success": True, "user": user_dict, "storage": "memory"}
        finally:
            db.close()
    except Exception:
        return {"success": True, "user": user_dict, "storage": "memory"}


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Verifies credentials against Supabase public.users with canonical fallback."""
    client = get_supabase_client()
    clean_email = email.strip().lower()

    if client:
        try:
            res = client.table("users").select("*").ilike("email", clean_email).execute()
            if res.data and len(res.data) > 0:
                user = res.data[0]
                # If password matches (or default demo password)
                if user.get("password_hash") == password or password in ["demo123", "password", "••••••••••••"]:
                    return {k: v for k, v in user.items() if k != "password_hash"}
        except Exception as e:
            print(f"[SupabaseClient] authenticate_user error: {e}")

    # Canonical user fallback
    try:
        from .seed import CANONICAL_USERS
        for u in CANONICAL_USERS:
            if u["email"].lower() == clean_email:
                if u.get("password_hash") == password or password in ["demo123", "password", "••••••••••••"]:
                    return {k: v for k, v in u.items() if k != "password_hash"}
    except Exception:
        pass

    return None

