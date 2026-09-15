// 12 blocks x 6 hours = 72 hours
export const PLAN_METADATA = {
  version: 'REV-2026.09-B',
  generatedAt: '10:00 UTC (Digital Twin Model Run #448)',
  validUntil: '72 hours forward',
  baseRisk: 'Elevated (Block 3 critical window identified)',
  simulationBaseline: 'Active Tidal Window + Wind Forecast Model',
  totalProjectedTeu: 48600
}

export const PLAN_BLOCKS = [
  { id: 'b1', label: 'Day 1 · 00:00–06:00', risk: 'low', berths: 'Berths 1, 4, 7 active', cranes: 'C-01, C-03, C-05', gates: 'Gate 2, 4 open', movesTarget: 180, notes: 'Off-peak smooth operations' },
  { id: 'b2', label: 'Day 1 · 06:00–12:00', risk: 'elevated', berths: 'Berths 1, 4, 5, 7 active', cranes: 'C-01, C-03, C-04, C-05', gates: 'All gates open', movesTarget: 340, notes: 'Morning drayage pickup surge' },
  { id: 'b3', label: 'Day 1 · 12:00–18:00', risk: 'critical', berths: 'Berths 4, 5, 6, 7 active', cranes: 'C-03, C-04, C-06', gates: 'Gate 3 overflow lane', movesTarget: 390, notes: 'Simultaneous 3-vessel tide transit' },
  { id: 'b4', label: 'Day 1 · 18:00–24:00', risk: 'elevated', berths: 'Berths 1, 5, 7 active', cranes: 'C-01, C-04, C-05', gates: 'Gate 2, 3, 5 open', movesTarget: 290, notes: 'Evening clearance shift' },
  { id: 'b5', label: 'Day 2 · 00:00–06:00', risk: 'low', berths: 'Berths 1, 4 active', cranes: 'C-01, C-03', gates: 'Gate 2, 4 open', movesTarget: 160, notes: 'Intermodal train load-out' },
  { id: 'b6', label: 'Day 2 · 06:00–12:00', risk: 'elevated', berths: 'Berths 1, 4, 6, 7 active', cranes: 'C-01, C-03, C-05, C-06', gates: 'All gates open', movesTarget: 360, notes: 'Export cutoff wave' },
  { id: 'b7', label: 'Day 2 · 12:00–18:00', risk: 'low', berths: 'Berths 1, 7 active', cranes: 'C-01, C-05', gates: 'Gate 2, 4, 5 open', movesTarget: 220, notes: 'Midday transition' },
  { id: 'b8', label: 'Day 2 · 18:00–24:00', risk: 'elevated', berths: 'Berths 4, 5, 6 active', cranes: 'C-03, C-04, C-06', gates: 'Gate 3 overflow lane', movesTarget: 310, notes: 'Feeder vessel berthing' },
  { id: 'b9', label: 'Day 3 · 00:00–06:00', risk: 'low', berths: 'Berths 1, 4 active', cranes: 'C-01, C-03', gates: 'Gate 2, 4 open', movesTarget: 150, notes: 'Routine maintenance window' },
  { id: 'b10', label: 'Day 3 · 06:00–12:00', risk: 'low', berths: 'Berths 1, 4, 7 active', cranes: 'C-01, C-03, C-05', gates: 'All gates open', movesTarget: 280, notes: 'Standard morning throughput' },
  { id: 'b11', label: 'Day 3 · 12:00–18:00', risk: 'elevated', berths: 'Berths 4, 5, 7 active', cranes: 'C-03, C-04, C-05', gates: 'Gate 3, 5 open', movesTarget: 330, notes: 'Outbound rail connection load' },
  { id: 'b12', label: 'Day 3 · 18:00–24:00', risk: 'low', berths: 'Berths 1, 7 active', cranes: 'C-01, C-05', gates: 'Gate 2, 4 open', movesTarget: 200, notes: 'Shift handover stabilization' }
]
