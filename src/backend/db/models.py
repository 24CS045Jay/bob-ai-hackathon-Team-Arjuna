"""
PortFlow AI — SQLAlchemy ORM Data Models
Represents canonical vessels, berths, cranes, telemetry, and optimization audit records.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON
from .database import Base


class VesselModel(Base):
    __tablename__ = "vessels"

    vessel_id = Column(String(32), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    imo = Column(String(32), nullable=False)
    flag = Column(String(32), default="PA")
    type = Column(String(64), default="Container Ship")
    length_m = Column(Float, nullable=False)
    beam_m = Column(Float, default=32.0)
    draft_m = Column(Float, nullable=False)
    teu = Column(Integer, default=0)
    dwt = Column(Integer, default=0)
    status = Column(String(64), default="anchored")
    eta_utc = Column(String(64), nullable=True)
    etd_utc = Column(String(64), nullable=True)
    assigned_berth_id = Column(String(32), nullable=True)
    speed_knots = Column(Float, default=0.0)
    lat = Column(Float, default=21.66)
    lng = Column(Float, default=72.49)
    destination = Column(String(64), default="Port of Arjuna")
    priority = Column(Integer, default=2)


class BerthModel(Base):
    __tablename__ = "berths"

    berth_id = Column(String(32), primary_key=True, index=True)
    zone_id = Column(String(8), nullable=False)
    terminal = Column(String(128), nullable=False)
    max_length_m = Column(Float, nullable=False)
    max_draft_m = Column(Float, nullable=False)
    cargo_types = Column(JSON, default=list)
    is_occupied = Column(Boolean, default=False)
    current_vessel_id = Column(String(32), nullable=True)


class CraneModel(Base):
    __tablename__ = "cranes"

    crane_id = Column(String(32), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    zone_id = Column(String(8), nullable=False)
    compatible_berths = Column(JSON, default=list)
    moves_per_hour = Column(Integer, default=30)
    status = Column(String(32), default="operational")
    assigned_vessel_id = Column(String(32), nullable=True)


class ZoneTelemetryModel(Base):
    __tablename__ = "zone_telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    zone_id = Column(String(8), nullable=False, index=True)
    timestamp_utc = Column(String(64), default=lambda: datetime.utcnow().isoformat())
    vessel_count = Column(Integer, default=5)
    avg_draft_m = Column(Float, default=12.0)
    wind_knots = Column(Float, default=12.0)
    visibility_nm = Column(Float, default=8.0)
    tide_m = Column(Float, default=3.0)
    crane_util = Column(Float, default=0.6)
    yard_occ = Column(Float, default=0.65)
    congestion_index = Column(Float, default=45.0)
    risk_level = Column(String(32), default="medium")


class OptimizationLogModel(Base):
    __tablename__ = "optimization_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_at = Column(String(64), default=lambda: datetime.utcnow().isoformat())
    optimization_type = Column(String(64), nullable=False)
    status = Column(String(32), default="success")
    summary = Column(Text, nullable=True)


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    name = Column(String(128), nullable=False)
    title = Column(String(128), nullable=True)
    role_code = Column(String(64), default="shift_supervisor", index=True)
    department = Column(String(128), default="Terminal Dispatch")
    shift = Column(String(64), default="06:00 - 14:00 (Morning)")
    avatar = Column(String(8), default="OP")
    last_login = Column(String(64), nullable=True)
    created_at = Column(String(64), default=lambda: datetime.utcnow().isoformat())

