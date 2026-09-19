export const ALERTS = [
  {
    id: 'alt-1',
    sev: 'red',
    category: 'Landside',
    zone: 'Gate 3 Ingress Corridor',
    msg: 'Gate 3 queue length breached 44 trucks with degraded OCR optical scanner.',
    rootCause: 'Optical Character Recognition lens fogging on Lane 2 & 3; turnaround time spiked to 68 min.',
    meta: 'SLA Breach: 38 min past allowable turnaround threshold.',
    time: '4m ago',
    actionLabel: 'Divert Drayage to Gate 2'
  },
  {
    id: 'alt-2',
    sev: 'red',
    category: 'Quayside',
    zone: 'Zone B (Berth B05)',
    msg: 'Demurrage Warning: MV Coral Voyager anchored 9h with laytime expiring.',
    rootCause: 'Crane C-04 operating at reduced speed (22 GMPH vs 34 target).',
    meta: 'Financial Exposure: $38,500/day demurrage penalty active in 3.5h.',
    time: '8m ago',
    actionLabel: 'Assign Standby Crane C-06'
  },
  {
    id: 'alt-3',
    sev: 'amber',
    category: 'Quayside',
    zone: 'Berth B01-B02 Deepwater Quay',
    msg: 'Zone B Yard Occupancy reached 84% with 88% quay crane saturation.',
    rootCause: 'Dual ultra-large container vessels discharging simultaneously.',
    meta: 'Stack buffer threshold exceeded by 9% in Block B.',
    time: '18m ago',
    actionLabel: 'Rebalance Yard Blocks'
  },
  {
    id: 'alt-4',
    sev: 'amber',
    category: 'Weather',
    zone: 'Outer Fairway Approach WP02',
    msg: 'Wind gust telemetry reaching 26 knots from WSW.',
    rootCause: 'Monsoon sea breeze convergence along outer approach channel.',
    meta: 'Under-keel clearance window constrained to high-tide datum (+2.8m).',
    time: '32m ago',
    actionLabel: 'Monitor UKC Windows'
  },
  {
    id: 'alt-5',
    sev: 'blue',
    category: 'Vessel',
    zone: 'Navigation Waypoint WP04',
    msg: 'COSCO Tapi entered fairway navigation corridor on schedule.',
    rootCause: 'Vessel verified through automated AIS transponder radar ping.',
    meta: 'Draft: 13.0m · Pilot aboard · Expected berth window confirmed.',
    time: '45m ago',
    actionLabel: 'View Telemetry Dossier'
  }
]
