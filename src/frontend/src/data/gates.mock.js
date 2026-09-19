export const GATES = [
  {
    id: 'g1',
    name: 'Gate 1 - North Terminal Ingress',
    status: 'ok',
    queue: 12,
    waitMin: 18,
    ocrStatus: 'normal',
    lanesOpen: 4,
    lanesTotal: 4,
    throughputPerHour: 110,
    diversionTarget: 'g2'
  },
  {
    id: 'g2',
    name: 'Gate 2 - East Logistics Arterial',
    status: 'ok',
    queue: 16,
    waitMin: 22,
    ocrStatus: 'normal',
    lanesOpen: 4,
    lanesTotal: 4,
    throughputPerHour: 135,
    diversionTarget: 'g1'
  },
  {
    id: 'g3',
    name: 'Gate 3 - South Container Inbound',
    status: 'crit',
    queue: 44,
    waitMin: 68,
    ocrStatus: 'degraded',
    lanesOpen: 2,
    lanesTotal: 4,
    throughputPerHour: 55,
    diversionTarget: 'g2'
  },
  {
    id: 'g4',
    name: 'Gate 4 - Rail Intermodal Transfer',
    status: 'warn',
    queue: 24,
    waitMin: 34,
    ocrStatus: 'normal',
    lanesOpen: 3,
    lanesTotal: 4,
    throughputPerHour: 80,
    diversionTarget: 'g2'
  }
]

export const GATE_SUMMARY = {
  overallAvgWaitMin: 38,
  tatTargetMin: 30,
  totalQueuedTrucks: 96,
  activeLanes: 13,
  totalLanes: 16
}
