/**
 * Congestion Scoring Engine for Tideline Maritime Digital Twin
 *
 * Implements a deterministic, explainable scoring model (0–100 scale) for:
 * 1. Quayside Berth Zones: Overlapping vessel arrival windows vs. available berth-hours,
 *    effective crane GMPH, and tidal draft clearance margins.
 * 2. Landside Gate Corridors: Inbound truck flow vs. active lane capacity and OCR degradation penalty.
 * 3. Yard/Rail Stacks: TEU capacity utilization, dwell time velocity, and reefer power limits.
 *
 * Financial exposure models:
 * - Vessel Demurrage: $38,500/day ($1,604.17/hr) after 48h laytime SLA.
 * - Landside Drayage Idling: $95.00/hr per delayed truck past 45-minute gate SLA.
 * - Berth Capacity Loss: $42.00 per unperformed container move below GMPH target.
 */

export function computeCongestionHotspots({
  vessels = [],
  berths = [],
  cranes = [],
  gates = [],
  weatherTide = null,
  appliedDiversions = []
}) {
  const hotspots = []
  const tideHeight = weatherTide?.currentTide?.heightMeters ?? 2.4
  const channelCurrentKts = weatherTide?.seaState?.channelCurrentKts ?? 1.1
  const windSpeedKts = weatherTide?.wind?.speedKts ?? 18
  const windGustKts = weatherTide?.wind?.gustKts ?? 26

  // -------------------------------------------------------------
  // 1. Quayside Berth Zone Analytics (Berth 5-6 Quayside Zone)
  // -------------------------------------------------------------
  const berth5 = berths.find((b) => b.id === 'berth5') || { depthM: 15.0, lengthM: 350, movesPerHour: 22 }
  const berth6 = berths.find((b) => b.id === 'berth6') || { depthM: 14.5, lengthM: 320, movesPerHour: 0 }

  // Check incoming/queued vessels targeting berths or anchorage
  const queuedVessels = vessels.filter((v) => v.stage === 0 || v.stage === 1)
  const dockedVessels = vessels.filter((v) => v.stage === 2)

  // Draft restrictions check against current tide
  const deepDraftVessels = queuedVessels.filter((v) => v.draft > 14.0)
  const tidalClearancePenalty = deepDraftVessels.some((v) => v.draft > 13.0 + tideHeight) ? 22 : 8

  // Quayside Crane GMPH Deficit
  const assignedCrane4 = cranes.find((c) => c.id === 'C-04')
  const craneThrottlePenalty = assignedCrane4?.status === 'reduced_speed' ? 18 : 0

  // Check if vessel diversion to Berth 6 has been applied
  const berthDiversionApplied = appliedDiversions.some((d) => d.targetZone === 'Berth 5–6 Quayside' || d.id === 'div-berth-coral')

  // Calculate Berth 5-6 Zone Score
  let berthScore = 35 + (queuedVessels.length * 9) + tidalClearancePenalty + craneThrottlePenalty
  if (berthDiversionApplied) {
    berthScore = Math.max(24, berthScore - 38)
  }
  berthScore = Math.min(96, Math.max(15, berthScore))

  const berthSeverity = berthScore >= 75 ? 'crit' : berthScore >= 50 ? 'warn' : 'ok'
  const berthTeusAtRisk = queuedVessels.reduce((acc, v) => acc + (v.teu || 0), 0) || 2850
  const berthDelayHours = berthSeverity === 'crit' ? 6.2 : berthSeverity === 'warn' ? 3.4 : 0.8
  const berthDemurrageCost = Math.round((berthDelayHours / 24) * 38500 * (deepDraftVessels.length || 1) + (berthScore * 320))

  hotspots.push({
    id: 'c2',
    zone: 'Berth 5–6 Quayside',
    zoneType: 'berth',
    severity: berthSeverity,
    score: Math.round(berthScore),
    hoursToImpact: berthSeverity === 'crit' ? 4 : 8,
    confidence: 84,
    estimatedDelayCost: berthDemurrageCost,
    teusAtRisk: berthDiversionApplied ? Math.round(berthTeusAtRisk * 0.4) : berthTeusAtRisk,
    factors: [
      `${queuedVessels.length} container vessels queued for 2 active quayside berths (capacity deficit).`,
      deepDraftVessels.length > 0
        ? `Tidal draft restriction: ${deepDraftVessels[0]?.name || 'Ultra-large vessel'} draft (${deepDraftVessels[0]?.draft || 15.6}m) requires +${tideHeight}m high-tide datum window.`
        : 'Tidal window nominal.',
      assignedCrane4?.status === 'reduced_speed'
        ? `Crane C-04 operating at throttle-down (${assignedCrane4.movesPerHour} GMPH vs 34 target).`
        : 'Crane move velocity within SLA tolerance.',
      berthDiversionApplied ? 'Mitigation active: Vessel load split with Berth 6 open slot.' : 'No quayside diversion active.'
    ],
    recommendation: berthDiversionApplied
      ? 'Berth 6 diversion active. Maintain current crane deployment.'
      : 'Divert MV Coral Voyager to Berth 6 open slot and deploy standby Crane C-06 to clear backlog.'
  })

  // -------------------------------------------------------------
  // 2. Landside Gate 3 Corridor (Central Heavy Inbound)
  // -------------------------------------------------------------
  const gate3 = gates.find((g) => g.id === 'g3') || { queue: 41, waitMin: 78, ocrStatus: 'degraded', lanesOpen: 2, lanesTotal: 5 }
  const gate2 = gates.find((g) => g.id === 'g2') || { queue: 14, waitMin: 12, lanesOpen: 4, lanesTotal: 4 }

  const gateRerouteApplied = appliedDiversions.some((d) => d.targetZone === 'Gate 3 & Central Corridor' || d.id === 'div-gate-reroute')

  // Inbound arrival rate: ~55 trucks/hr. Nominal lane capacity: 20 trucks/hr/lane.
  // When OCR is degraded, capacity is 12 trucks/hr/lane.
  const ocrDegradedPenalty = gate3.ocrStatus === 'degraded' ? 32 : 0
  const queuePressure = (gate3.queue / 50) * 40
  let gate3Score = 20 + ocrDegradedPenalty + queuePressure
  if (gateRerouteApplied) {
    gate3Score = Math.max(22, gate3Score - 44)
  }
  gate3Score = Math.min(98, Math.max(12, gate3Score))

  const gate3Severity = gate3Score >= 70 ? 'crit' : gate3Score >= 45 ? 'warn' : 'ok'
  const effectiveQueue = gateRerouteApplied ? Math.round(gate3.queue * 0.35) : gate3.queue
  const gate3IdlingCost = Math.round(effectiveQueue * (gate3.waitMin / 60) * 95 * 8)

  hotspots.push({
    id: 'c1',
    zone: 'Gate 3 & Central Corridor',
    zoneType: 'gate',
    severity: gate3Severity,
    score: Math.round(gate3Score),
    hoursToImpact: gate3Severity === 'crit' ? 3 : 7,
    confidence: 89,
    estimatedDelayCost: gate3IdlingCost,
    teusAtRisk: effectiveQueue * 28,
    factors: [
      `Queue depth: ${effectiveQueue} drayage trucks waiting (SLA limit: 15 trucks).`,
      gate3.ocrStatus === 'degraded'
        ? 'OCR optical scanner degraded: Optical character recognition offline on lane OCR-2 (manual processing: 6.8 min/truck vs 1.4 min standard).'
        : 'OCR optical lanes fully online.',
      `Active lanes: ${gate3.lanesOpen} of ${gate3.lanesTotal} open (throughput throttled to ${gate3.throughputPerHour} trucks/hr).`,
      gateRerouteApplied ? 'Mitigation active: 50% inbound traffic diverted to Gate 2.' : 'No truck rerouting active.'
    ],
    recommendation: gateRerouteApplied
      ? 'Gate 2 diversion active. Monitor West Access queue stability.'
      : 'Reroute 50% inbound container trucks from Gate 3 to Gate 2 to balance landside pressure.'
  })

  // -------------------------------------------------------------
  // 3. Landside Gate 5 (South Pier Access & Empty Depot)
  // -------------------------------------------------------------
  const gate5 = gates.find((g) => g.id === 'g5') || { queue: 22, waitMin: 34, lanesOpen: 2, lanesTotal: 4 }
  const gate5Score = Math.min(85, Math.round(25 + (gate5.queue * 1.5) + (gate5.waitMin * 0.4)))
  const gate5Severity = gate5Score >= 60 ? 'warn' : 'ok'

  hotspots.push({
    id: 'c3',
    zone: 'Gate 5 (South Pier Access)',
    zoneType: 'gate',
    severity: gate5Severity,
    score: gate5Score,
    hoursToImpact: 9,
    confidence: 72,
    estimatedDelayCost: Math.round(gate5.queue * 450),
    teusAtRisk: gate5.queue * 20,
    factors: [
      `Empty container drop-off surge approaching 16:00 shipping line cutoff.`,
      `Secondary inspection lane 3 closed for pavement slab maintenance.`,
      `Average turnaround time: ${gate5.waitMin} min (SLA threshold: 25 min).`
    ],
    recommendation: 'Open auxiliary overflow lane 4 at Gate 5 for the 14:00–20:00 shift window.'
  })

  // -------------------------------------------------------------
  // 4. Yard Block D (Reefer Stacks & Auxiliary Power)
  // -------------------------------------------------------------
  const reeferVessels = vessels.filter((v) => v.teu > 8000)
  const yardDScore = 48 + (reeferVessels.length * 6)
  const yardDSeverity = yardDScore >= 65 ? 'warn' : 'ok'

  hotspots.push({
    id: 'c4',
    zone: 'Yard Block D (Reefer Stacks)',
    zoneType: 'yard',
    severity: yardDSeverity,
    score: Math.round(yardDScore),
    hoursToImpact: 14,
    confidence: 65,
    estimatedDelayCost: 14200,
    teusAtRisk: 420,
    factors: [
      'Reefer electrical power points operating at 91% continuous load.',
      'Customs inspection hold on 44 refrigerated import units from MV Kestrel Bay.',
      'Straddle carrier dispatch cycle extended +4.2 min due to cross-traffic at Block C.'
    ],
    recommendation: 'Prioritize Block D for dual-cycle straddle carrier clearance during night shift.'
  })

  // Sort hotspots by severity and score descending
  return hotspots.sort((a, b) => b.score - a.score)
}

/**
 * Calculates real-time financial congestion exposure summary.
 */
export function computeCostOfCongestion({ hotspots = [], vessels = [], gates = [] }) {
  const totalCost = hotspots.reduce((acc, h) => acc + (h.estimatedDelayCost || 0), 0)
  const demurrageCost = hotspots.filter((h) => h.zoneType === 'berth').reduce((acc, h) => acc + h.estimatedDelayCost, 0)
  const drayageCost = hotspots.filter((h) => h.zoneType === 'gate').reduce((acc, h) => acc + h.estimatedDelayCost, 0)
  const yardCost = hotspots.filter((h) => h.zoneType === 'yard').reduce((acc, h) => acc + h.estimatedDelayCost, 0)

  return {
    currentShiftTotalCost: totalCost,
    projected24hCost: Math.round(totalCost * 2.2),
    benchmarkTargetCost: 85000,
    deltaPercent: totalCost > 85000 ? `+${Math.round(((totalCost - 85000) / 85000) * 100)}%` : '-12%',
    breakdown: [
      {
        category: 'Vessel Demurrage Exposure',
        cost: demurrageCost,
        percentage: totalCost > 0 ? Math.round((demurrageCost / totalCost) * 100) : 0,
        detail: 'Charter demurrage on vessels delayed past free laytime SLA ($38,500/vessel-day).'
      },
      {
        category: 'Landside Drayage Idling',
        cost: drayageCost,
        percentage: totalCost > 0 ? Math.round((drayageCost / totalCost) * 100) : 0,
        detail: 'Delayed container trucks waiting beyond the 45-minute terminal SLA ($95/truck-hr).'
      },
      {
        category: 'Quayside Capacity Loss',
        cost: Math.round(totalCost * 0.12),
        percentage: 12,
        detail: 'Crane move rate deficit below contractual 32 GMPH benchmark.'
      },
      {
        category: 'Reefer Auxiliary Power Dwell',
        cost: yardCost || Math.round(totalCost * 0.08),
        percentage: totalCost > 0 ? Math.max(5, Math.round((yardCost / totalCost) * 100)) : 8,
        detail: 'Reefer container power connection and yard storage dwell surcharge.'
      }
    ]
  }
}
