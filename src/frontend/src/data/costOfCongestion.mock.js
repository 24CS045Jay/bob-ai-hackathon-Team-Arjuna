/**
 * Cost of Congestion dataset inspired by project44 Port Intel:
 * - Estimated financial cost of current delays across shifts
 * - Vessel charter demurrage rates ($38,500/day avg)
 * - Truck wait idle fuel & driver costs
 * - Port-to-port dwell time benchmarking
 */
export const COST_OF_CONGESTION = {
  currentShiftTotalCost: 142850,
  projected24hCost: 318400,
  deltaPercent: '+14.2%',
  benchmarkTargetCost: 85000,
  breakdown: [
    {
      category: 'Vessel Demurrage Exposure',
      cost: 84600,
      percentage: 59,
      detail: '2 ultra-large container vessels exceeding 48h laytime grace period'
    },
    {
      category: 'Landside Drayage Idling',
      cost: 32450,
      percentage: 23,
      detail: '142 drayage trucks delayed past 45-minute SLA at Gate 3 and North Pier'
    },
    {
      category: 'Berth Idle Capacity Loss',
      cost: 16800,
      percentage: 12,
      detail: 'STS-2 crane hydraulic throttle down; berth move efficiency decreased 22%'
    },
    {
      category: 'Reefer Auxiliary Power Dwell',
      cost: 9000,
      percentage: 6,
      detail: 'Extended plug-in holding in Yard Block D pending customs clearance'
    }
  ],
  dwellBenchmarks: [
    { metric: 'Median Vessel Turnaround', current: '34.2h', benchmark: '28.0h', status: 'warn' },
    { metric: 'Mean Yard Dwell (Import TEU)', current: '4.1 days', benchmark: '3.0 days', status: 'crit' },
    { metric: 'Mean Yard Dwell (Transshipment)', current: '1.8 days', benchmark: '2.2 days', status: 'ok' },
    { metric: 'Truck Turn Time (Gate to Crane)', current: '48.5 min', benchmark: '32.0 min', status: 'warn' }
  ],
  historicalTrend7Days: [
    { day: 'Mon', cost: 92000, dwellDays: 3.1 },
    { day: 'Tue', cost: 98500, dwellDays: 3.3 },
    { day: 'Wed', cost: 104000, dwellDays: 3.5 },
    { day: 'Thu', cost: 118000, dwellDays: 3.8 },
    { day: 'Fri', cost: 135000, dwellDays: 4.0 },
    { day: 'Sat', cost: 142850, dwellDays: 4.1 },
    { day: 'Sun (proj)', cost: 128000, dwellDays: 3.9 }
  ]
}
