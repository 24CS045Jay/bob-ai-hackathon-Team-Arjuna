"""
PortFlow AI — Database Seeding Script
Initializes SQLite database and populates canonical Port of Arjuna vessels, berths, cranes, and telemetry.
"""

from datetime import datetime, timedelta
try:
    from .database import engine, Base, SessionLocal
    from .models import VesselModel, BerthModel, CraneModel, ZoneTelemetryModel, OptimizationLogModel, UserModel
except (ImportError, ValueError):
    from database import engine, Base, SessionLocal
    from models import VesselModel, BerthModel, CraneModel, ZoneTelemetryModel, OptimizationLogModel, UserModel

CANONICAL_VESSELS = [
    {"vessel_id": "V-001", "name": "MSC Arjuna", "imo": "IMO9839438", "flag": "PA", "type": "Container Ship", "length_m": 399.9, "beam_m": 61.3, "draft_m": 15.5, "teu": 24000, "dwt": 228000, "status": "underway", "eta_utc": "2026-09-14T16:00:00Z", "etd_utc": "2026-09-16T08:00:00Z", "assigned_berth_id": "B01", "speed_knots": 14.2, "lat": 21.642, "lng": 72.465, "priority": 3},
    {"vessel_id": "V-002", "name": "Maersk Baroda", "imo": "IMO9725110", "flag": "DK", "type": "Container Ship", "length_m": 366.4, "beam_m": 48.2, "draft_m": 14.5, "teu": 15500, "dwt": 165000, "status": "moored", "eta_utc": "2026-09-14T10:00:00Z", "etd_utc": "2026-09-15T18:00:00Z", "assigned_berth_id": "B02", "speed_knots": 0.0, "lat": 21.722, "lng": 72.565, "priority": 2},
    {"vessel_id": "V-003", "name": "CMA CGM Gujarat", "imo": "IMO9694529", "flag": "FR", "type": "Container Ship", "length_m": 335.0, "beam_m": 45.6, "draft_m": 14.0, "teu": 11800, "dwt": 120000, "status": "anchored", "eta_utc": "2026-09-14T18:30:00Z", "etd_utc": "2026-09-16T02:00:00Z", "assigned_berth_id": "B03", "speed_knots": 0.1, "lat": 21.662, "lng": 72.495, "priority": 2},
    {"vessel_id": "V-004", "name": "Evergreen Narmada", "imo": "IMO9467251", "flag": "TW", "type": "Container Ship", "length_m": 300.0, "beam_m": 42.8, "draft_m": 13.5, "teu": 8500, "dwt": 98000, "status": "underway", "eta_utc": "2026-09-14T21:00:00Z", "etd_utc": "2026-09-15T22:00:00Z", "assigned_berth_id": None, "speed_knots": 11.8, "lat": 21.635, "lng": 72.440, "priority": 2},
    {"vessel_id": "V-005", "name": "COSCO Tapi", "imo": "IMO9352123", "flag": "HK", "type": "Container Ship", "length_m": 294.0, "beam_m": 32.2, "draft_m": 13.0, "teu": 7200, "dwt": 82000, "status": "anchored", "eta_utc": "2026-09-15T04:00:00Z", "etd_utc": "2026-09-16T14:00:00Z", "assigned_berth_id": None, "speed_knots": 0.0, "lat": 21.668, "lng": 72.502, "priority": 1},
    {"vessel_id": "V-006", "name": "Hapag-Lloyd Sabarmati", "imo": "IMO9283411", "flag": "DE", "type": "Container Ship", "length_m": 260.0, "beam_m": 32.2, "draft_m": 11.5, "teu": 4200, "dwt": 50000, "status": "underway", "eta_utc": "2026-09-14T23:30:00Z", "etd_utc": "2026-09-15T20:00:00Z", "assigned_berth_id": "B04", "speed_knots": 9.4, "lat": 21.650, "lng": 72.480, "priority": 2},
    {"vessel_id": "V-007", "name": "ONE Kathiawar", "imo": "IMO9198734", "flag": "JP", "type": "Container Ship", "length_m": 172.0, "beam_m": 27.6, "draft_m": 9.2, "teu": 1800, "dwt": 22000, "status": "moored", "eta_utc": "2026-09-14T08:00:00Z", "etd_utc": "2026-09-15T06:00:00Z", "assigned_berth_id": "B05", "speed_knots": 0.0, "lat": 21.716, "lng": 72.582, "priority": 1},
    {"vessel_id": "V-008", "name": "Wan Hai Porbandar", "imo": "IMO9587422", "flag": "SG", "type": "Container Ship", "length_m": 148.0, "beam_m": 23.0, "draft_m": 8.5, "teu": 1100, "dwt": 15000, "status": "underway", "eta_utc": "2026-09-15T02:00:00Z", "etd_utc": "2026-09-15T16:00:00Z", "assigned_berth_id": "B06", "speed_knots": 8.0, "lat": 21.690, "lng": 72.530, "priority": 1},
    {"vessel_id": "V-009", "name": "Bharat Pioneer", "imo": "IMO9621430", "flag": "IN", "type": "Crude Oil Tanker", "length_m": 333.0, "beam_m": 60.0, "draft_m": 16.0, "teu": 0, "dwt": 300000, "status": "anchored", "eta_utc": "2026-09-15T06:00:00Z", "etd_utc": "2026-09-17T00:00:00Z", "assigned_berth_id": "B07", "speed_knots": 0.2, "lat": 21.655, "lng": 72.470, "priority": 3},
    {"vessel_id": "V-010", "name": "Indian Oceanic", "imo": "IMO9432190", "flag": "LR", "type": "Oil Tanker", "length_m": 244.0, "beam_m": 42.0, "draft_m": 14.2, "teu": 0, "dwt": 115000, "status": "moored", "eta_utc": "2026-09-14T05:00:00Z", "etd_utc": "2026-09-15T12:00:00Z", "assigned_berth_id": "B08", "speed_knots": 0.0, "lat": 21.695, "lng": 72.575, "priority": 2},
    {"vessel_id": "V-011", "name": "Gujarat Chemist", "imo": "IMO9387654", "flag": "MH", "type": "Chemical Tanker", "length_m": 180.0, "beam_m": 28.0, "draft_m": 10.5, "teu": 0, "dwt": 45000, "status": "underway", "eta_utc": "2026-09-15T09:00:00Z", "etd_utc": "2026-09-16T04:00:00Z", "assigned_berth_id": None, "speed_knots": 10.5, "lat": 21.630, "lng": 72.420, "priority": 2},
    {"vessel_id": "V-012", "name": "Ganga Bulk", "imo": "IMO9512399", "flag": "SG", "type": "Bulk Carrier", "length_m": 292.0, "beam_m": 45.0, "draft_m": 15.0, "teu": 0, "dwt": 180000, "status": "anchored", "eta_utc": "2026-09-15T12:00:00Z", "etd_utc": "2026-09-17T18:00:00Z", "assigned_berth_id": "B09", "speed_knots": 0.0, "lat": 21.670, "lng": 72.515, "priority": 2},
    {"vessel_id": "V-013", "name": "Godavari Express", "imo": "IMO9345678", "flag": "CY", "type": "Bulk Carrier", "length_m": 225.0, "beam_m": 32.2, "draft_m": 12.8, "teu": 0, "dwt": 75000, "status": "moored", "eta_utc": "2026-09-14T02:00:00Z", "etd_utc": "2026-09-15T22:00:00Z", "assigned_berth_id": "B10", "speed_knots": 0.0, "lat": 21.705, "lng": 72.525, "priority": 1},
    {"vessel_id": "V-014", "name": "Saurashtra Star", "imo": "IMO9412356", "flag": "BS", "type": "Vehicles Carrier", "length_m": 199.9, "beam_m": 32.2, "draft_m": 9.8, "teu": 0, "dwt": 21000, "status": "moored", "eta_utc": "2026-09-14T07:30:00Z", "etd_utc": "2026-09-15T04:00:00Z", "assigned_berth_id": "B11", "speed_knots": 0.0, "lat": 21.735, "lng": 72.585, "priority": 2},
    {"vessel_id": "V-015", "name": "Mandovi Trader", "imo": "IMO9234567", "flag": "IN", "type": "General Cargo", "length_m": 165.0, "beam_m": 25.0, "draft_m": 8.8, "teu": 0, "dwt": 22000, "status": "underway", "eta_utc": "2026-09-15T01:30:00Z", "etd_utc": "2026-09-15T18:00:00Z", "assigned_berth_id": "B12", "speed_knots": 7.5, "lat": 21.680, "lng": 72.520, "priority": 1},
]

CANONICAL_BERTHS = [
    {"berth_id": "B01", "zone_id": "B", "terminal": "Container Terminal 1", "max_length_m": 400.0, "max_draft_m": 16.5, "cargo_types": ["container"], "is_occupied": True, "current_vessel_id": "V-001"},
    {"berth_id": "B02", "zone_id": "B", "terminal": "Container Terminal 1", "max_length_m": 380.0, "max_draft_m": 16.0, "cargo_types": ["container"], "is_occupied": True, "current_vessel_id": "V-002"},
    {"berth_id": "B03", "zone_id": "B", "terminal": "Container Terminal 2", "max_length_m": 366.0, "max_draft_m": 15.5, "cargo_types": ["container"], "is_occupied": False, "current_vessel_id": None},
    {"berth_id": "B04", "zone_id": "B", "terminal": "Container Terminal 2", "max_length_m": 350.0, "max_draft_m": 15.0, "cargo_types": ["container"], "is_occupied": False, "current_vessel_id": None},
    {"berth_id": "B05", "zone_id": "C", "terminal": "Feeder Terminal", "max_length_m": 220.0, "max_draft_m": 12.0, "cargo_types": ["container", "general"], "is_occupied": True, "current_vessel_id": "V-007"},
    {"berth_id": "B06", "zone_id": "C", "terminal": "Feeder Terminal", "max_length_m": 200.0, "max_draft_m": 11.5, "cargo_types": ["container", "general"], "is_occupied": False, "current_vessel_id": None},
    {"berth_id": "B07", "zone_id": "D", "terminal": "Liquid Bulk / Tanker", "max_length_m": 280.0, "max_draft_m": 15.5, "cargo_types": ["tanker", "lng"], "is_occupied": False, "current_vessel_id": None},
    {"berth_id": "B08", "zone_id": "D", "terminal": "Chemical Pier", "max_length_m": 240.0, "max_draft_m": 14.0, "cargo_types": ["tanker", "chemical"], "is_occupied": True, "current_vessel_id": "V-010"},
    {"berth_id": "B09", "zone_id": "E", "terminal": "Dry Bulk Terminal", "max_length_m": 240.0, "max_draft_m": 13.0, "cargo_types": ["bulk"], "is_occupied": False, "current_vessel_id": None},
    {"berth_id": "B10", "zone_id": "E", "terminal": "Agri-Bulk Berth", "max_length_m": 225.0, "max_draft_m": 12.5, "cargo_types": ["bulk"], "is_occupied": True, "current_vessel_id": "V-013"},
    {"berth_id": "B11", "zone_id": "F", "terminal": "Ro-Ro & Ferry Terminal", "max_length_m": 200.0, "max_draft_m": 10.0, "cargo_types": ["roro", "ferry"], "is_occupied": True, "current_vessel_id": "V-014"},
    {"berth_id": "B12", "zone_id": "F", "terminal": "Multipurpose General", "max_length_m": 190.0, "max_draft_m": 9.5, "cargo_types": ["general", "roro"], "is_occupied": False, "current_vessel_id": None},
]

CANONICAL_CRANES = [
    {"crane_id": "CR-01", "name": "Gantry-1 Super Post-Panamax", "zone_id": "B", "compatible_berths": ["B01", "B02"], "moves_per_hour": 35, "status": "operational", "assigned_vessel_id": "V-001"},
    {"crane_id": "CR-02", "name": "Gantry-2 Super Post-Panamax", "zone_id": "B", "compatible_berths": ["B01", "B02"], "moves_per_hour": 35, "status": "operational", "assigned_vessel_id": "V-002"},
    {"crane_id": "CR-03", "name": "Gantry-3 Post-Panamax", "zone_id": "B", "compatible_berths": ["B03", "B04"], "moves_per_hour": 32, "status": "operational", "assigned_vessel_id": None},
    {"crane_id": "CR-04", "name": "Gantry-4 Post-Panamax", "zone_id": "B", "compatible_berths": ["B03", "B04"], "moves_per_hour": 30, "status": "operational", "assigned_vessel_id": None},
    {"crane_id": "CR-05", "name": "Gantry-5 Panamax STS", "zone_id": "C", "compatible_berths": ["B05", "B06"], "moves_per_hour": 28, "status": "operational", "assigned_vessel_id": "V-007"},
    {"crane_id": "CR-06", "name": "Gantry-6 Panamax STS", "zone_id": "C", "compatible_berths": ["B05", "B06"], "moves_per_hour": 26, "status": "operational", "assigned_vessel_id": None},
    {"crane_id": "CR-07", "name": "Mobile Harbor Crane MHC-1", "zone_id": "E", "compatible_berths": ["B09", "B10"], "moves_per_hour": 22, "status": "operational", "assigned_vessel_id": "V-013"},
]

INITIAL_ZONE_TELEMETRY = [
    {"zone_id": "A", "vessel_count": 8, "avg_draft_m": 14.8, "wind_knots": 15.0, "visibility_nm": 8.0, "tide_m": 3.4, "crane_util": 0.35, "yard_occ": 0.42, "congestion_index": 38.5, "risk_level": "medium"},
    {"zone_id": "B", "vessel_count": 13, "avg_draft_m": 14.2, "wind_knots": 18.0, "visibility_nm": 7.5, "tide_m": 3.4, "crane_util": 0.88, "yard_occ": 0.84, "congestion_index": 82.4, "risk_level": "high"},
    {"zone_id": "C", "vessel_count": 6, "avg_draft_m": 10.5, "wind_knots": 14.0, "visibility_nm": 8.5, "tide_m": 3.4, "crane_util": 0.60, "yard_occ": 0.58, "congestion_index": 54.0, "risk_level": "medium"},
    {"zone_id": "D", "vessel_count": 4, "avg_draft_m": 15.0, "wind_knots": 16.0, "visibility_nm": 8.0, "tide_m": 3.4, "crane_util": 0.30, "yard_occ": 0.48, "congestion_index": 44.0, "risk_level": "medium"},
    {"zone_id": "E", "vessel_count": 5, "avg_draft_m": 11.5, "wind_knots": 13.0, "visibility_nm": 9.0, "tide_m": 3.4, "crane_util": 0.45, "yard_occ": 0.50, "congestion_index": 42.0, "risk_level": "medium"},
    {"zone_id": "F", "vessel_count": 4, "avg_draft_m": 9.2, "wind_knots": 12.0, "visibility_nm": 9.0, "tide_m": 3.4, "crane_util": 0.25, "yard_occ": 0.38, "congestion_index": 31.0, "risk_level": "low"},
]

CANONICAL_USERS = [
    {"id": "usr-1", "email": "admin@portflow.ai", "password_hash": "admin123", "name": "Captain Rajesh Sharma", "title": "Harbor Master & Operations Lead", "role_code": "admin", "department": "Marine Operations", "shift": "06:00 - 14:00 (Morning)", "avatar": "RS", "last_login": "12 min ago"},
    {"id": "usr-2", "email": "supervisor@portflow.ai", "password_hash": "supervisor123", "name": "Ananya Patel", "title": "Senior Shift Supervisor", "role_code": "shift_supervisor", "department": "Terminal Dispatch", "shift": "14:00 - 22:00 (Evening)", "avatar": "AP", "last_login": "34 min ago"},
    {"id": "usr-3", "email": "planner@portflow.ai", "password_hash": "planner123", "name": "Vikram Mehta", "title": "Quayside Berth Allocation Engineer", "role_code": "berth_planner", "department": "Berth Operations", "shift": "06:00 - 14:00 (Morning)", "avatar": "VM", "last_login": "1 hour ago"},
    {"id": "usr-4", "email": "gate@portflow.ai", "password_hash": "gate123", "name": "Sunil Verma", "title": "Drayage & Gate Portal Coordinator", "role_code": "gate_controller", "department": "Landside Logistics", "shift": "22:00 - 06:00 (Night)", "avatar": "SV", "last_login": "2 hours ago"},
    {"id": "usr-5", "email": "viewer@portflow.ai", "password_hash": "viewer123", "name": "Dr. Devendra Joshi", "title": "Maritime Authority Executive Director", "role_code": "viewer", "department": "Executive Board", "shift": "General Hours", "avatar": "DJ", "last_login": "Yesterday"},
]


def seed_database(db=None):
    close_db = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    try:
        # Check if already seeded
        existing_vessels = db.query(VesselModel).count()
        if existing_vessels == 0:
            print("Seeding 15 canonical vessels...")
            for v_data in CANONICAL_VESSELS:
                v = VesselModel(**v_data)
                db.add(v)

        existing_berths = db.query(BerthModel).count()
        if existing_berths == 0:
            print("Seeding 12 canonical berths...")
            for b_data in CANONICAL_BERTHS:
                b = BerthModel(**b_data)
                db.add(b)

        existing_cranes = db.query(CraneModel).count()
        if existing_cranes == 0:
            print("Seeding 7 canonical cranes...")
            for c_data in CANONICAL_CRANES:
                c = CraneModel(**c_data)
                db.add(c)

        existing_telem = db.query(ZoneTelemetryModel).count()
        if existing_telem == 0:
            print("Seeding initial zone telemetry...")
            for z_data in INITIAL_ZONE_TELEMETRY:
                t = ZoneTelemetryModel(**z_data)
                db.add(t)

        existing_users = db.query(UserModel).count()
        if existing_users == 0:
            print("Seeding 5 canonical users...")
            for u_data in CANONICAL_USERS:
                u = UserModel(**u_data)
                db.add(u)

        db.commit()
        print("Database seeding completed successfully.")
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_database()
