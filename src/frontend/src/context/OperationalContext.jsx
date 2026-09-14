import { createContext, useContext, useState, useMemo } from 'react'
import { VESSELS as SEED_VESSELS } from '../data/vessels.mock.js'
import { BERTHS as SEED_BERTHS, AVAILABLE_CRANES as SEED_CRANES } from '../data/berths.mock.js'
import { GATES as SEED_GATES } from '../data/gates.mock.js'
import { WEATHER_TIDE as SEED_WEATHER } from '../data/weatherTide.mock.js'
import { computeCongestionHotspots, computeCostOfCongestion } from '../lib/congestionEngine.js'
import { computeRoutingRecommendations } from '../lib/routingEngine.js'
import { runBerthCraneAllocationOptimizer } from '../lib/berthCraneOptimizer.js'
import { generateSeventyTwoHourPlan } from '../lib/planGenerator.js'
import { useRole } from './RoleContext.jsx'

const OperationalContext = createContext(null)

export function OperationalProvider({ children }) {
  const { logAction, addNotification } = useRole()

  // Live operational data stores
  const [vessels, setVessels] = useState(SEED_VESSELS)
  const [berths, setBerths] = useState(SEED_BERTHS)
  const [cranes, setCranes] = useState(SEED_CRANES)
  const [gates, setGates] = useState(SEED_GATES)
  const [weatherTide, setWeatherTide] = useState(SEED_WEATHER)
  const [appliedDiversions, setAppliedDiversions] = useState([])
  const [approvedPlanStamp, setApprovedPlanStamp] = useState(null)
  const [activeDisruption, setActiveDisruption] = useState(null)

  // -------------------------------------------------------------
  // Pure Computational Engine Pipelines (Live Reactive Loop)
  // -------------------------------------------------------------

  // 1. Congestion Hotspots (Task 1)
  const congestionHotspots = useMemo(() => {
    return computeCongestionHotspots({
      vessels,
      berths,
      cranes,
      gates,
      weatherTide,
      appliedDiversions
    })
  }, [vessels, berths, cranes, gates, weatherTide, appliedDiversions])

  // 2. Real-time Cost Breakdown
  const costMetrics = useMemo(() => {
    return computeCostOfCongestion({
      hotspots: congestionHotspots,
      vessels,
      gates
    })
  }, [congestionHotspots, vessels, gates])

  // 3. Alternate Routing / Diversion Recommendations (Task 2)
  const routingRecommendations = useMemo(() => {
    return computeRoutingRecommendations({
      vessels,
      berths,
      cranes,
      gates,
      weatherTide,
      appliedDiversions
    })
  }, [vessels, berths, cranes, gates, weatherTide, appliedDiversions])

  // 4. Berth & Crane Assignment Optimiser (Task 3)
  const optimizerProposal = useMemo(() => {
    return runBerthCraneAllocationOptimizer({
      vessels,
      berths,
      cranes,
      weatherTide
    })
  }, [vessels, berths, cranes, weatherTide])

  // 5. Dynamic 72-Hour Port Operations Plan (Task 4)
  const activePlan = useMemo(() => {
    return generateSeventyTwoHourPlan({
      vessels,
      berths,
      cranes,
      gates,
      weatherTide,
      appliedDiversions,
      congestionHotspots
    })
  }, [vessels, berths, cranes, gates, weatherTide, appliedDiversions, congestionHotspots])

  // -------------------------------------------------------------
  // Live State Mutators
  // -------------------------------------------------------------

  /**
   * Adjusts a vessel's ETA/delay to demonstrate the live ripple loop.
   */
  const adjustVesselSchedule = (vesselId, deltaHours) => {
    setVessels((prev) =>
      prev.map((v) => {
        if (v.id !== vesselId) return v
        const isDelayed = deltaHours > 0
        const deltaLabel = deltaHours > 0 ? `+${deltaHours}h 00m` : `${deltaHours}h 00m`
        const newTrend = isDelayed ? 'delayed' : 'improving'
        const newConfidence = Math.max(65, v.confidence - (deltaHours * 4))

        return {
          ...v,
          etaDelta: deltaLabel,
          etaTrend: newTrend,
          confidence: newConfidence,
          dwellDays: isDelayed ? Number((v.dwellDays + (deltaHours / 24)).toFixed(1)) : v.dwellDays,
          exceptionAlert: isDelayed
            ? `Voyage schedule delayed by ${deltaHours}h; laytime SLA buffer impacted.`
            : null
        }
      })
    )

    const targetVessel = vessels.find((v) => v.id === vesselId)
    logAction({
      action: 'VESSEL_ETA_ADJUSTED',
      target: targetVessel?.name || vesselId,
      details: `Voyage schedule delta shifted by ${deltaHours > 0 ? '+' : ''}${deltaHours}h`
    })

    addNotification({
      title: `ETA Delta: ${targetVessel?.name} shifted by ${deltaHours > 0 ? '+' : ''}${deltaHours}h`,
      type: 'vessel',
      path: '/vessels'
    })
  }

  /**
   * Authorizes and applies a computed alternate routing strategy.
   */
  const applyDiversion = (recommendationId) => {
    const rec = routingRecommendations.find((r) => r.id === recommendationId)
    if (!rec) return

    setAppliedDiversions((prev) => [...prev.filter((d) => d.id !== rec.id), rec])

    // Mutate underlying state based on the specific diversion type
    if (rec.id === 'div-berth-coral') {
      // Reassign MV Coral Voyager to Berth 6
      setBerths((prev) =>
        prev.map((b) => {
          if (b.id === 'berth6') {
            return {
              ...b,
              vessel: 'MV Coral Voyager',
              vesselId: 'v4',
              crane: 'C-06',
              craneCount: 2,
              movesPerHour: 32,
              status: 'ok',
              utilization: 84,
              etaDeparture: '14h 30m',
              teuHandled: 420,
              teuTarget: 4500
            }
          }
          if (b.id === 'berth5') {
            return {
              ...b,
              vessel: 'Berth Clearance in Progress',
              status: 'ok',
              etaDeparture: '03h 15m'
            }
          }
          return b
        })
      )

      setVessels((prev) =>
        prev.map((v) =>
          v.id === 'v4'
            ? {
                ...v,
                berth: 'Berth 6',
                destination: 'Tideline Terminal Berth 6',
                stage: 2,
                status: 'docked',
                craneAssigned: 'STS-6',
                exceptionAlert: 'Diverted to Berth 6; discharging underway.'
              }
            : v
        )
      )

      setCranes((prev) =>
        prev.map((c) => (c.id === 'C-06' ? { ...c, status: 'operational' } : c))
      )
    }

    if (rec.id === 'div-gate-reroute') {
      // Relieve Gate 3 queue and divert to Gate 2
      setGates((prev) =>
        prev.map((g) => {
          if (g.id === 'g3') {
            return {
              ...g,
              queue: 16,
              waitMin: 24,
              status: 'warn'
            }
          }
          if (g.id === 'g2') {
            return {
              ...g,
              queue: 19,
              waitMin: 16
            }
          }
          return g
        })
      )
    }

    if (rec.id === 'div-crane-redeploy') {
      setCranes((prev) =>
        prev.map((c) => (c.id === 'C-06' ? { ...c, status: 'operational' } : c))
      )
    }

    if (rec.id === 'div-anchorage-hold') {
      setVessels((prev) =>
        prev.map((v) =>
          v.id === 'v2'
            ? {
                ...v,
                status: 'anchored',
                exceptionAlert: 'High-tide transit window locked (+2.4m datum crest at T+2.5h).'
              }
            : v
        )
      )
    }

    logAction({
      action: 'ROUTING_DIVERSION_APPLIED',
      target: rec.title,
      details: `Dispatched diversion: saved ${rec.metrics.delayReductionHours}h delay, $${rec.metrics.costSaved.toLocaleString()} demurrage.`
    })

    addNotification({
      title: `Diversion Executed: ${rec.title}`,
      type: 'routing',
      path: '/routing'
    })
  }

  /**
   * Accepts and applies the optimizer's allocation proposal.
   */
  const acceptOptimizerAllocations = () => {
    if (!optimizerProposal?.proposedBerths) return

    setBerths(optimizerProposal.proposedBerths)

    optimizerProposal.allocations.forEach((alloc) => {
      setVessels((prev) =>
        prev.map((v) =>
          v.id === alloc.vesselId
            ? {
                ...v,
                berth: alloc.berthName,
                destination: `Tideline Terminal ${alloc.berthName}`,
                craneAssigned: alloc.craneId,
                stage: 2,
                status: 'docked'
              }
            : v
        )
      )
    })

    logAction({
      action: 'OPTIMIZER_SCHEDULE_ACCEPTED',
      target: 'Quayside Berth Board',
      details: `Accepted ${optimizerProposal.allocations.length} optimized berth/crane allocations; saved ${optimizerProposal.metrics.totalDelayHoursSaved}h delay.`
    })

    addNotification({
      title: `Optimized Berth Schedule Confirmed (${optimizerProposal.allocations.length} vessels allocated)`,
      type: 'berth',
      path: '/berths'
    })
  }

  /**
   * Manually reassigns a quayside crane to a berth.
   */
  const reassignBerthCrane = (berthId, craneId) => {
    const crane = cranes.find((c) => c.id === craneId)
    setBerths((prev) =>
      prev.map((b) =>
        b.id === berthId
          ? {
              ...b,
              crane: craneId,
              movesPerHour: crane ? crane.movesPerHour : b.movesPerHour,
              status: 'ok'
            }
          : b
      )
    )

    const targetBerth = berths.find((b) => b.id === berthId)
    logAction({
      action: 'CRANE_MANUAL_REASSIGNMENT',
      target: targetBerth?.name || berthId,
      details: `Manually assigned STS Crane ${craneId} (${crane?.name || ''})`
    })
  }

  /**
   * Authorizes the currently generated 72-hour master plan.
   */
  const approveCurrentPlan = (signer) => {
    const now = new Date()
    const stamp = {
      approvedBy: signer.title,
      roleCode: signer.code,
      timestamp: `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')} UTC`,
      hash: 'SIG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      planVersion: activePlan.metadata.version,
      projectedTeu: activePlan.metadata.totalProjectedTeu
    }

    setApprovedPlanStamp(stamp)

    logAction({
      action: 'PLAN_APPROVED',
      target: `72h Plan ${activePlan.metadata.version}`,
      details: `Authorized rolling master operations schedule by ${signer.title} (${stamp.hash})`
    })

    addNotification({
      title: `72-Hour Operations Plan (${activePlan.metadata.version}) Approved`,
      type: 'plan',
      path: '/plan'
    })

    return stamp
  }

  /**
   * Injects a scenario disruption to demonstrate what-if simulation live impact.
   */
  const simulateDisruption = ({ type, zone, severity, durationHours }) => {
    setActiveDisruption({ type, zone, severity, durationHours, timestamp: new Date() })

    if (zone.includes('Gate 3') || type.toLowerCase().includes('gate')) {
      setGates((prev) =>
        prev.map((g) =>
          g.id === 'g3'
            ? {
                ...g,
                queue: severity === 'Severe' ? 58 : 46,
                waitMin: severity === 'Severe' ? 95 : 82,
                ocrStatus: 'degraded',
                status: 'crit'
              }
            : g
        )
      )
    }

    if (zone.includes('Berth') || type.toLowerCase().includes('vessel') || type.toLowerCase().includes('crane')) {
      setCranes((prev) =>
        prev.map((c) => (c.id === 'C-04' ? { ...c, status: 'reduced_speed', movesPerHour: 18 } : c))
      )
    }

    logAction({
      action: 'SIMULATION_DISRUPTION_INJECTED',
      target: `${type} @ ${zone}`,
      details: `Injected ${severity} disruption scenario (${durationHours}h duration). Models recomputing.`
    })
  }

  /**
   * Resets the digital twin to default nominal state.
   */
  const resetToNominal = () => {
    setVessels(SEED_VESSELS)
    setBerths(SEED_BERTHS)
    setCranes(SEED_CRANES)
    setGates(SEED_GATES)
    setWeatherTide(SEED_WEATHER)
    setAppliedDiversions([])
    setApprovedPlanStamp(null)
    setActiveDisruption(null)

    logAction({
      action: 'SYSTEM_RESET_NOMINAL',
      target: 'Tideline Digital Twin Core',
      details: 'Restored nominal baseline vessel, berth, and gate parameters.'
    })
  }

  return (
    <OperationalContext.Provider
      value={{
        // Live data state
        vessels,
        berths,
        cranes,
        gates,
        weatherTide,
        appliedDiversions,
        approvedPlanStamp,
        activeDisruption,

        // Live computed models
        congestionHotspots,
        costMetrics,
        routingRecommendations,
        optimizerProposal,
        activePlan,

        // Mutators
        adjustVesselSchedule,
        applyDiversion,
        acceptOptimizerAllocations,
        reassignBerthCrane,
        approveCurrentPlan,
        simulateDisruption,
        resetToNominal
      }}
    >
      {children}
    </OperationalContext.Provider>
  )
}

export function useOperationalContext() {
  const ctx = useContext(OperationalContext)
  if (!ctx) {
    throw new Error('useOperationalContext must be used within an OperationalProvider')
  }
  return ctx
}
