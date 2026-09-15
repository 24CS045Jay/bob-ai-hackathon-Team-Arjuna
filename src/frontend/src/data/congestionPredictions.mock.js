export const CONGESTION_PREDICTIONS = [
  {
    id: 'c1',
    zone: 'Gate 3 & Central Corridor',
    severity: 'crit',
    hoursToImpact: 4,
    confidence: 87,
    estimatedDelayCost: 48500,
    teusAtRisk: 1420,
    factors: [
      'Vessel bunching at Berth 5-6 creating concentrated import pickup wave',
      'Gate 3 optical character reader lane OCR-2 degraded to manual inspection',
      'Rail Yard R2 rake delay cascading 40+ extra drayage trucks to road gates'
    ],
    recommendation: 'Reroute inbound trucks from Gate 3 to Gate 2 for the next 6 hours to balance landside pressure.'
  },
  {
    id: 'c2',
    zone: 'Berth 5–6 Quayside',
    severity: 'crit',
    hoursToImpact: 6,
    confidence: 79,
    estimatedDelayCost: 64200,
    teusAtRisk: 2850,
    factors: [
      'Three container vessels arriving within a 90-minute tide window',
      'Crane C-04 operating at 92% utilization with hoist temperature warning',
      'Yard Block A buffer capacity exceeding 84% dwell threshold'
    ],
    recommendation: 'Hold MV Coral Voyager at Anchorage South for 2h; reassign Crane C-06 from Berth 6 standby pool.'
  },
  {
    id: 'c3',
    zone: 'Gate 5 (South Pier Access)',
    severity: 'warn',
    hoursToImpact: 9,
    confidence: 68,
    estimatedDelayCost: 19800,
    teusAtRisk: 640,
    factors: [
      'Surge of empty container return drop-offs before 16:00 line cut-off',
      'One secondary inspection lane restricted for pavement maintenance'
    ],
    recommendation: 'Activate auxiliary overflow lane 4 at Gate 5 during the 14:00–20:00 shift window.'
  },
  {
    id: 'c4',
    zone: 'Yard Block D (Reefer Stacks)',
    severity: 'warn',
    hoursToImpact: 14,
    confidence: 58,
    estimatedDelayCost: 10350,
    teusAtRisk: 420,
    factors: [
      'Export dwell time trending up +0.4 days week-over-week',
      'Reefer monitoring power points reaching 92% continuous plug capacity'
    ],
    recommendation: 'Flag Block D for priority straddle carrier clearance during the upcoming night shift.'
  }
]
