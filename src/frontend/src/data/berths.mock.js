export const BERTHS = [
  {
    id: 'berth1',
    name: 'Berth 1 - Deepwater Container',
    terminal: 'Container Terminal 1',
    vessel: 'MSC Arjuna',
    vesselId: 'v1',
    crane: 'C-01',
    depthM: 16.5,
    lengthM: 400.0,
    movesPerHour: 35,
    status: 'active'
  },
  {
    id: 'berth2',
    name: 'Berth 2 - Super Post-Panamax Quay',
    terminal: 'Container Terminal 1',
    vessel: 'Maersk Baroda',
    vesselId: 'v2',
    crane: 'C-02',
    depthM: 16.0,
    lengthM: 380.0,
    movesPerHour: 35,
    status: 'active'
  },
  {
    id: 'berth3',
    name: 'Berth 3 - Post-Panamax Quay',
    terminal: 'Container Terminal 2',
    vessel: 'Unassigned (Available)',
    vesselId: null,
    crane: 'C-03',
    depthM: 15.5,
    lengthM: 366.0,
    movesPerHour: 32,
    status: 'available'
  },
  {
    id: 'berth4',
    name: 'Berth 4 - Post-Panamax Quay',
    terminal: 'Container Terminal 2',
    vessel: 'Unassigned (Available)',
    vesselId: null,
    crane: 'Standby',
    depthM: 15.0,
    lengthM: 350.0,
    movesPerHour: 30,
    status: 'available'
  },
  {
    id: 'berth5',
    name: 'Berth 5 - North Quay Container',
    terminal: 'Feeder Terminal',
    vessel: 'ONE Kathiawar',
    vesselId: 'v7',
    crane: 'C-04',
    depthM: 15.0,
    lengthM: 350.0,
    movesPerHour: 22,
    status: 'active'
  },
  {
    id: 'berth6',
    name: 'Berth 6 - South Quayside Slip',
    terminal: 'Feeder Terminal',
    vessel: 'Wan Hai Porbandar (departing)',
    vesselId: 'v8',
    crane: 'C-05',
    depthM: 14.5,
    lengthM: 320.0,
    movesPerHour: 28,
    status: 'available'
  },
  {
    id: 'berth7',
    name: 'Berth 7 - Liquid Bulk / Tanker Pier',
    terminal: 'Liquid Bulk Terminal',
    vessel: 'Unassigned (Available)',
    vesselId: null,
    crane: 'Fixed Arm',
    depthM: 15.5,
    lengthM: 280.0,
    movesPerHour: 0,
    status: 'available'
  },
  {
    id: 'berth8',
    name: 'Berth 8 - Chemical Terminal',
    terminal: 'Chemical Pier',
    vessel: 'Indian Oceanic',
    vesselId: 'v-chem',
    crane: 'Fixed Arm',
    depthM: 14.0,
    lengthM: 240.0,
    movesPerHour: 0,
    status: 'active'
  },
  {
    id: 'berth9',
    name: 'Berth 9 - Dry Bulk Pier',
    terminal: 'Dry Bulk Terminal',
    vessel: 'Godavari Express',
    vesselId: 'v-bulk',
    crane: 'C-07',
    depthM: 13.0,
    lengthM: 240.0,
    movesPerHour: 22,
    status: 'active'
  }
]

export const AVAILABLE_CRANES = [
  {
    id: 'C-01',
    name: 'STS Gantry-1 Super Post-Panamax',
    berth: 'Berth 1',
    movesPerHour: 35,
    status: 'operational'
  },
  {
    id: 'C-02',
    name: 'STS Gantry-2 Super Post-Panamax',
    berth: 'Berth 2',
    movesPerHour: 35,
    status: 'operational'
  },
  {
    id: 'C-03',
    name: 'STS Gantry-3 Post-Panamax',
    berth: 'Berth 3',
    movesPerHour: 32,
    status: 'operational'
  },
  {
    id: 'C-04',
    name: 'STS Gantry-4 Post-Panamax',
    berth: 'Berth 5',
    movesPerHour: 22,
    status: 'reduced_speed'
  },
  {
    id: 'C-05',
    name: 'STS Gantry-5 Panamax STS',
    berth: 'Berth 6',
    movesPerHour: 28,
    status: 'operational'
  },
  {
    id: 'C-06',
    name: 'STS Gantry-6 Standby STS',
    berth: 'Standby Pier 3',
    movesPerHour: 30,
    status: 'standby'
  },
  {
    id: 'C-07',
    name: 'MHC-1 Mobile Harbor Crane',
    berth: 'Berth 9',
    movesPerHour: 22,
    status: 'operational'
  },
  {
    id: 'C-08',
    name: 'STS Gantry-8 Post-Panamax',
    berth: 'Maintenance Bay',
    movesPerHour: 0,
    status: 'maintenance'
  }
]

export const YARD_CAPACITY = 0.78

export const YARD_BLOCKS = [
  { id: 'yb-a', name: 'Block A (Dry Inbound)', capacityPct: 74, status: 'ok', teus: 1420 },
  { id: 'yb-b', name: 'Block B (Export Staging)', capacityPct: 84, status: 'warn', teus: 2180 },
  { id: 'yb-c', name: 'Block C (Transshipment Hub)', capacityPct: 71, status: 'ok', teus: 1890 },
  { id: 'yb-d', name: 'Block D (Reefer & Hazmat)', capacityPct: 89, status: 'crit', teus: 940 },
  { id: 'yb-e', name: 'Block E (Empty Repositioning)', capacityPct: 62, status: 'ok', teus: 1100 }
]
