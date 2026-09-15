-- =============================================================================
-- PortFlow AI — Supabase Database Migration & Canonical Seeding Schema
-- Target Project: https://gmqrrnaktdzoigbquhsp.supabase.co
-- Run this SQL in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- =============================================================================

-- 1. Create Vessels Table
CREATE TABLE IF NOT EXISTS public.vessels (
    vessel_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    imo VARCHAR(32) NOT NULL,
    flag VARCHAR(32) DEFAULT 'PA',
    type VARCHAR(64) DEFAULT 'Container Ship',
    length_m DOUBLE PRECISION NOT NULL,
    beam_m DOUBLE PRECISION DEFAULT 32.0,
    draft_m DOUBLE PRECISION NOT NULL,
    teu INTEGER DEFAULT 0,
    dwt INTEGER DEFAULT 0,
    status VARCHAR(64) DEFAULT 'anchored',
    eta_utc VARCHAR(64),
    etd_utc VARCHAR(64),
    assigned_berth_id VARCHAR(32),
    speed_knots DOUBLE PRECISION DEFAULT 0.0,
    lat DOUBLE PRECISION DEFAULT 21.66,
    lng DOUBLE PRECISION DEFAULT 72.49,
    destination VARCHAR(64) DEFAULT 'Port of Arjuna',
    priority INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Create Berths Table
CREATE TABLE IF NOT EXISTS public.berths (
    berth_id VARCHAR(32) PRIMARY KEY,
    zone_id VARCHAR(8) NOT NULL,
    terminal VARCHAR(128) NOT NULL,
    max_length_m DOUBLE PRECISION NOT NULL,
    max_draft_m DOUBLE PRECISION NOT NULL,
    cargo_types JSONB DEFAULT '[]'::jsonb,
    is_occupied BOOLEAN DEFAULT false,
    current_vessel_id VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Create Cranes Table
CREATE TABLE IF NOT EXISTS public.cranes (
    crane_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    zone_id VARCHAR(8) NOT NULL,
    compatible_berths JSONB DEFAULT '[]'::jsonb,
    moves_per_hour INTEGER DEFAULT 30,
    status VARCHAR(32) DEFAULT 'operational',
    assigned_vessel_id VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. Create Zone Telemetry Table
CREATE TABLE IF NOT EXISTS public.zone_telemetry (
    id BIGSERIAL PRIMARY KEY,
    zone_id VARCHAR(8) NOT NULL,
    timestamp_utc VARCHAR(64) DEFAULT timezone('utc'::text, now())::text,
    vessel_count INTEGER DEFAULT 5,
    avg_draft_m DOUBLE PRECISION DEFAULT 12.0,
    wind_knots DOUBLE PRECISION DEFAULT 12.0,
    visibility_nm DOUBLE PRECISION DEFAULT 8.0,
    tide_m DOUBLE PRECISION DEFAULT 3.0,
    crane_util DOUBLE PRECISION DEFAULT 0.6,
    yard_occ DOUBLE PRECISION DEFAULT 0.65,
    congestion_index DOUBLE PRECISION DEFAULT 45.0,
    risk_level VARCHAR(32) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. Create Optimization Logs Table
CREATE TABLE IF NOT EXISTS public.optimization_logs (
    id BIGSERIAL PRIMARY KEY,
    run_at VARCHAR(64) DEFAULT timezone('utc'::text, now())::text,
    optimization_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'success',
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- -----------------------------------------------------------------------------
-- Indexes for Performance
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_vessels_status ON public.vessels(status);
CREATE INDEX IF NOT EXISTS idx_vessels_assigned_berth ON public.vessels(assigned_berth_id);
CREATE INDEX IF NOT EXISTS idx_berths_zone ON public.berths(zone_id);
CREATE INDEX IF NOT EXISTS idx_cranes_zone ON public.cranes(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_telemetry_zone ON public.zone_telemetry(zone_id);

-- -----------------------------------------------------------------------------
-- Enable Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cranes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_logs ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon / service role access
DO $$
BEGIN
    -- Vessels Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessels' AND policyname = 'Allow public select vessels') THEN
        CREATE POLICY "Allow public select vessels" ON public.vessels FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessels' AND policyname = 'Allow public insert vessels') THEN
        CREATE POLICY "Allow public insert vessels" ON public.vessels FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessels' AND policyname = 'Allow public update vessels') THEN
        CREATE POLICY "Allow public update vessels" ON public.vessels FOR UPDATE USING (true);
    END IF;

    -- Berths Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'berths' AND policyname = 'Allow public select berths') THEN
        CREATE POLICY "Allow public select berths" ON public.berths FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'berths' AND policyname = 'Allow public insert berths') THEN
        CREATE POLICY "Allow public insert berths" ON public.berths FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'berths' AND policyname = 'Allow public update berths') THEN
        CREATE POLICY "Allow public update berths" ON public.berths FOR UPDATE USING (true);
    END IF;

    -- Cranes Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cranes' AND policyname = 'Allow public select cranes') THEN
        CREATE POLICY "Allow public select cranes" ON public.cranes FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cranes' AND policyname = 'Allow public insert cranes') THEN
        CREATE POLICY "Allow public insert cranes" ON public.cranes FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cranes' AND policyname = 'Allow public update cranes') THEN
        CREATE POLICY "Allow public update cranes" ON public.cranes FOR UPDATE USING (true);
    END IF;

    -- Zone Telemetry Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'zone_telemetry' AND policyname = 'Allow public select zone_telemetry') THEN
        CREATE POLICY "Allow public select zone_telemetry" ON public.zone_telemetry FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'zone_telemetry' AND policyname = 'Allow public insert zone_telemetry') THEN
        CREATE POLICY "Allow public insert zone_telemetry" ON public.zone_telemetry FOR INSERT WITH CHECK (true);
    END IF;

    -- Optimization Logs Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'optimization_logs' AND policyname = 'Allow public select optimization_logs') THEN
        CREATE POLICY "Allow public select optimization_logs" ON public.optimization_logs FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'optimization_logs' AND policyname = 'Allow public insert optimization_logs') THEN
        CREATE POLICY "Allow public insert optimization_logs" ON public.optimization_logs FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- Seed Canonical Data (15 Vessels, 12 Berths, 7 Cranes, Initial Telemetry)
-- -----------------------------------------------------------------------------
INSERT INTO public.vessels (vessel_id, name, imo, flag, type, length_m, beam_m, draft_m, teu, dwt, status, eta_utc, etd_utc, assigned_berth_id, speed_knots, lat, lng, destination, priority)
VALUES
('V-001', 'MSC Arjuna', 'IMO9839438', 'PA', 'Container Ship', 399.9, 61.3, 15.5, 24000, 228000, 'underway', '2026-09-14T16:00:00Z', '2026-09-16T08:00:00Z', 'B01', 14.2, 21.642, 72.465, 'Port of Arjuna', 3),
('V-002', 'Maersk Baroda', 'IMO9725110', 'DK', 'Container Ship', 366.4, 48.2, 14.5, 15500, 165000, 'moored', '2026-09-14T10:00:00Z', '2026-09-15T18:00:00Z', 'B02', 0.0, 21.722, 72.565, 'Port of Arjuna', 2),
('V-003', 'CMA CGM Gujarat', 'IMO9694529', 'FR', 'Container Ship', 335.0, 45.6, 14.0, 11800, 120000, 'anchored', '2026-09-14T18:30:00Z', '2026-09-16T02:00:00Z', 'B03', 0.1, 21.662, 72.495, 'Port of Arjuna', 2),
('V-004', 'Evergreen Narmada', 'IMO9467251', 'TW', 'Container Ship', 300.0, 42.8, 13.5, 8500, 98000, 'underway', '2026-09-14T21:00:00Z', '2026-09-15T22:00:00Z', NULL, 11.8, 21.635, 72.440, 'Port of Arjuna', 2),
('V-005', 'COSCO Tapi', 'IMO9352123', 'HK', 'Container Ship', 294.0, 32.2, 13.0, 7200, 82000, 'anchored', '2026-09-15T04:00:00Z', '2026-09-16T14:00:00Z', NULL, 0.0, 21.668, 72.502, 'Port of Arjuna', 1),
('V-006', 'Hapag-Lloyd Sabarmati', 'IMO9283411', 'DE', 'Container Ship', 260.0, 32.2, 11.5, 4200, 50000, 'underway', '2026-09-14T23:30:00Z', '2026-09-15T20:00:00Z', 'B04', 9.4, 21.650, 72.480, 'Port of Arjuna', 2),
('V-007', 'ONE Kathiawar', 'IMO9198734', 'JP', 'Container Ship', 172.0, 27.6, 9.2, 1800, 22000, 'moored', '2026-09-14T08:00:00Z', '2026-09-15T06:00:00Z', 'B05', 0.0, 21.716, 72.582, 'Port of Arjuna', 1),
('V-008', 'Wan Hai Porbandar', 'IMO9587422', 'SG', 'Container Ship', 148.0, 23.0, 8.5, 1100, 15000, 'underway', '2026-09-15T02:00:00Z', '2026-09-15T16:00:00Z', 'B06', 8.0, 21.690, 72.530, 'Port of Arjuna', 1),
('V-009', 'Bharat Pioneer', 'IMO9621430', 'IN', 'Crude Oil Tanker', 333.0, 60.0, 16.0, 0, 300000, 'anchored', '2026-09-15T06:00:00Z', '2026-09-17T00:00:00Z', 'B07', 0.2, 21.655, 72.470, 'Port of Arjuna', 3),
('V-010', 'Indian Oceanic', 'IMO9432190', 'LR', 'Oil Tanker', 244.0, 42.0, 14.2, 0, 115000, 'moored', '2026-09-14T05:00:00Z', '2026-09-15T12:00:00Z', 'B08', 0.0, 21.695, 72.575, 'Port of Arjuna', 2),
('V-011', 'Gujarat Chemist', 'IMO9387654', 'MH', 'Chemical Tanker', 180.0, 28.0, 10.5, 0, 45000, 'underway', '2026-09-15T09:00:00Z', '2026-09-16T04:00:00Z', NULL, 10.5, 21.630, 72.420, 'Port of Arjuna', 2),
('V-012', 'Ganga Bulk', 'IMO9512399', 'SG', 'Bulk Carrier', 292.0, 45.0, 15.0, 0, 180000, 'anchored', '2026-09-15T12:00:00Z', '2026-09-17T18:00:00Z', 'B09', 0.0, 21.670, 72.515, 'Port of Arjuna', 2),
('V-013', 'Godavari Express', 'IMO9345678', 'CY', 'Bulk Carrier', 225.0, 32.2, 12.8, 0, 75000, 'moored', '2026-09-14T02:00:00Z', '2026-09-15T22:00:00Z', 'B10', 0.0, 21.705, 72.525, 'Port of Arjuna', 1),
('V-014', 'Saurashtra Star', 'IMO9412356', 'BS', 'Vehicles Carrier', 199.9, 32.2, 9.8, 0, 21000, 'moored', '2026-09-14T07:30:00Z', '2026-09-15T04:00:00Z', 'B11', 0.0, 21.735, 72.585, 'Port of Arjuna', 2),
('V-015', 'Mandovi Trader', 'IMO9234567', 'IN', 'General Cargo', 165.0, 25.0, 8.8, 0, 22000, 'underway', '2026-09-15T01:30:00Z', '2026-09-15T18:00:00Z', 'B12', 7.5, 21.680, 72.520, 'Port of Arjuna', 1)
ON CONFLICT (vessel_id) DO NOTHING;

INSERT INTO public.berths (berth_id, zone_id, terminal, max_length_m, max_draft_m, cargo_types, is_occupied, current_vessel_id)
VALUES
('B01', 'B', 'Container Terminal 1', 400.0, 16.5, '["container"]'::jsonb, true, 'V-001'),
('B02', 'B', 'Container Terminal 1', 380.0, 16.0, '["container"]'::jsonb, true, 'V-002'),
('B03', 'B', 'Container Terminal 2', 366.0, 15.5, '["container"]'::jsonb, false, NULL),
('B04', 'B', 'Container Terminal 2', 350.0, 15.0, '["container"]'::jsonb, false, NULL),
('B05', 'C', 'Feeder Terminal', 220.0, 12.0, '["container", "general"]'::jsonb, true, 'V-007'),
('B06', 'C', 'Feeder Terminal', 200.0, 11.5, '["container", "general"]'::jsonb, false, NULL),
('B07', 'D', 'Liquid Bulk / Tanker', 280.0, 15.5, '["tanker", "lng"]'::jsonb, false, NULL),
('B08', 'D', 'Chemical Pier', 240.0, 14.0, '["tanker", "chemical"]'::jsonb, true, 'V-010'),
('B09', 'E', 'Dry Bulk Terminal', 240.0, 13.0, '["bulk"]'::jsonb, false, NULL),
('B10', 'E', 'Agri-Bulk Berth', 225.0, 12.5, '["bulk"]'::jsonb, true, 'V-013'),
('B11', 'F', 'Ro-Ro & Ferry Terminal', 200.0, 10.0, '["roro", "ferry"]'::jsonb, true, 'V-014'),
('B12', 'F', 'Multipurpose General', 190.0, 9.5, '["general", "roro"]'::jsonb, false, NULL)
ON CONFLICT (berth_id) DO NOTHING;

INSERT INTO public.cranes (crane_id, name, zone_id, compatible_berths, moves_per_hour, status, assigned_vessel_id)
VALUES
('CR-01', 'Gantry-1 Super Post-Panamax', 'B', '["B01", "B02"]'::jsonb, 35, 'operational', 'V-001'),
('CR-02', 'Gantry-2 Super Post-Panamax', 'B', '["B01", "B02"]'::jsonb, 35, 'operational', 'V-002'),
('CR-03', 'Gantry-3 Post-Panamax', 'B', '["B03", "B04"]'::jsonb, 32, 'operational', NULL),
('CR-04', 'Gantry-4 Post-Panamax', 'B', '["B03", "B04"]'::jsonb, 30, 'operational', NULL),
('CR-05', 'Gantry-5 Panamax STS', 'C', '["B05", "B06"]'::jsonb, 28, 'operational', 'V-007'),
('CR-06', 'Gantry-6 Panamax STS', 'C', '["B05", "B06"]'::jsonb, 26, 'operational', NULL),
('CR-07', 'Mobile Harbor Crane MHC-1', 'E', '["B09", "B10"]'::jsonb, 22, 'operational', 'V-013')
ON CONFLICT (crane_id) DO NOTHING;

INSERT INTO public.zone_telemetry (zone_id, vessel_count, avg_draft_m, wind_knots, visibility_nm, tide_m, crane_util, yard_occ, congestion_index, risk_level)
VALUES
('A', 8, 14.8, 15.0, 8.0, 3.4, 0.35, 0.42, 38.5, 'medium'),
('B', 13, 14.2, 18.0, 7.5, 3.4, 0.88, 0.84, 82.4, 'high'),
('C', 6, 10.5, 14.0, 8.5, 3.4, 0.60, 0.58, 54.0, 'medium'),
('D', 4, 15.0, 16.0, 8.0, 3.4, 0.30, 0.48, 44.0, 'medium'),
('E', 5, 11.5, 13.0, 9.0, 3.4, 0.45, 0.50, 42.0, 'medium'),
('F', 4, 9.2, 12.0, 9.0, 3.4, 0.25, 0.38, 31.0, 'low');
