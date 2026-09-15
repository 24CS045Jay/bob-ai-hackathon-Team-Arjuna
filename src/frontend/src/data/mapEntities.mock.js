export const STATUS_COLORS = {
  ok: '#10b981',
  warn: '#f59e0b',
  crit: '#ef4444'
}

export const MAP_ENTITIES = [
  // Vessels
  {
    id: 'ent-v1',
    type: 'vessel',
    status: 'ok',
    x: 420,
    y: 190,
    label: 'MSC Arjuna (24,000 TEU)',
    sub1: 'Berthed at B01 · 64% Discharged',
    sub2: 'Draft 15.5m · Speed 0.0 kts'
  },
  {
    id: 'ent-v2',
    type: 'vessel',
    status: 'ok',
    x: 460,
    y: 210,
    label: 'Maersk Baroda (15,500 TEU)',
    sub1: 'Berthed at B02 · 78% Discharged',
    sub2: 'Draft 14.5m · Speed 0.0 kts'
  },
  {
    id: 'ent-v3',
    type: 'vessel',
    status: 'warn',
    x: 210,
    y: 130,
    label: 'CMA CGM Gujarat (11,800 TEU)',
    sub1: 'Anchored Anchorage Slip A1',
    sub2: 'Draft 14.0m · Awaiting Tidal Window'
  },
  {
    id: 'ent-v4',
    type: 'vessel',
    status: 'crit',
    x: 520,
    y: 250,
    label: 'MV Coral Voyager (4,500 TEU)',
    sub1: 'Berthed at B05 · Demurrage Alert',
    sub2: 'Draft 11.4m · Crane C-04 Throttled'
  },
  {
    id: 'ent-v5',
    type: 'vessel',
    status: 'ok',
    x: 140,
    y: 80,
    label: 'Evergreen Narmada (8,500 TEU)',
    sub1: 'Inbound Transit Fairway WP02',
    sub2: 'Draft 13.5m · Speed 11.8 kts'
  },
  {
    id: 'ent-v6',
    type: 'vessel',
    status: 'ok',
    x: 290,
    y: 160,
    label: 'COSCO Tapi (7,200 TEU)',
    sub1: 'Navigation Channel WP04',
    sub2: 'Draft 13.0m · Speed 9.4 kts'
  },

  // Berths
  {
    id: 'ent-b1',
    type: 'berth',
    status: 'ok',
    x: 410,
    y: 175,
    label: 'Berth 1 (CT-1 Deepwater)',
    sub1: 'Depth 16.5m · Max Length 400m',
    sub2: 'Crane CR-01 Active (35 GMPH)'
  },
  {
    id: 'ent-b2',
    type: 'berth',
    status: 'ok',
    x: 450,
    y: 195,
    label: 'Berth 2 (CT-1 Super Post-Panamax)',
    sub1: 'Depth 16.0m · Max Length 380m',
    sub2: 'Crane CR-02 Active (35 GMPH)'
  },
  {
    id: 'ent-b3',
    type: 'berth',
    status: 'ok',
    x: 490,
    y: 215,
    label: 'Berth 3 (CT-2 Post-Panamax)',
    sub1: 'Depth 15.5m · Max Length 366m',
    sub2: 'Open Slot · Crane CR-03 Standby'
  },
  {
    id: 'ent-b5',
    type: 'berth',
    status: 'crit',
    x: 530,
    y: 235,
    label: 'Berth 5 (Feeder Terminal North)',
    sub1: 'Depth 15.0m · Capacity Saturation',
    sub2: 'Crane CR-04 (22 GMPH vs 34 Target)'
  },
  {
    id: 'ent-b6',
    type: 'berth',
    status: 'ok',
    x: 570,
    y: 255,
    label: 'Berth 6 (Feeder Terminal South)',
    sub1: 'Depth 14.5m · Max Length 320m',
    sub2: 'Available for Diversion Slot'
  },

  // Gates
  {
    id: 'ent-g1',
    type: 'gate',
    status: 'ok',
    x: 710,
    y: 120,
    label: 'Gate 1 (North Terminal Ingress)',
    sub1: '4 of 4 Lanes Open · Turnaround 18m',
    sub2: 'Throughput 110 trucks/hr'
  },
  {
    id: 'ent-g2',
    type: 'gate',
    status: 'ok',
    x: 750,
    y: 220,
    label: 'Gate 2 (East Logistics Arterial)',
    sub1: '4 of 4 Lanes Open · Turnaround 22m',
    sub2: 'Throughput 135 trucks/hr (Diversion Sink)'
  },
  {
    id: 'ent-g3',
    type: 'gate',
    status: 'crit',
    x: 720,
    y: 350,
    label: 'Gate 3 (South Container Inbound)',
    sub1: '44 Queued Trucks · Turnaround 68m',
    sub2: 'OCR Degradation on Lane 2 & 3'
  },
  {
    id: 'ent-g4',
    type: 'gate',
    status: 'warn',
    x: 640,
    y: 410,
    label: 'Gate 4 (Rail Intermodal Transfer)',
    sub1: '24 Queued Trucks · Turnaround 34m',
    sub2: 'Throughput 80 trucks/hr'
  }
]
