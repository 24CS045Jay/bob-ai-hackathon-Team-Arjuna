import { useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { YARD_CAPACITY, YARD_BLOCKS } from '../data/berths.mock.js'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { useRole } from '../context/RoleContext.jsx'
import Modal from '../components/common/Modal.jsx'
import Badge from '../components/common/Badge.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

export default function BerthPlannerPage() {
  const {
    berths,
    cranes,
    weatherTide,
    optimizerProposal,
    acceptOptimizerAllocations,
    reassignBerthCrane
  } = useOperationalContext()
  const { can, activeRole } = useRole()

  const [modalBerth, setModalBerth] = useState(null)
  const [selectedCraneId, setSelectedCraneId] = useState('')
  const [flashId, setFlashId] = useState(null)
  const [optimizerAccepted, setOptimizerAccepted] = useState(false)

  const canReassign = can('applyRecommendation')
  const tideHeight = weatherTide?.currentTide?.heightMeters ?? 2.4

  const openReassignModal = (berth) => {
    if (!canReassign) return
    setModalBerth(berth)
    setSelectedCraneId(berth.crane)
  }

  const confirmReassignment = () => {
    if (!modalBerth || !selectedCraneId) return

    reassignBerthCrane(modalBerth.id, selectedCraneId)
    setFlashId(modalBerth.id)
    setTimeout(() => setFlashId(null), 1200)
    setModalBerth(null)
  }

  const handleAcceptOptimizer = () => {
    if (!canReassign) return
    acceptOptimizerAllocations()
    setOptimizerAccepted(true)
    setTimeout(() => setOptimizerAccepted(false), 3000)
  }

  return (
    <AppShell crumb="Berth &amp; Crane Allocation">
      <div className="space-y-4 max-w-[1680px] mx-auto select-none">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass p-4 sm:p-5 rounded-2xl border border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                Quayside Orchestration &amp; Solver
              </span>
              <span className="text-xs text-inksoft font-mono">
                {berths.length} Operational Berths · {cranes.length} STS Cranes · High Tide Margin: +{tideHeight}m
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              Berth Allocation Board &amp; Crane Move Velocity
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-inksoft">Mean Move Rate:</span>
            <span className="text-xs font-mono font-bold text-ok px-2.5 py-1 rounded-full bg-ok/10 border border-ok/30">
              34.8 GMPH (Target &gt; 32)
            </span>
          </div>
        </div>

        {/* Task 3: Algorithmic Berth & Crane Optimiser Action Bar */}
        <div className="rounded-2xl border border-brand/30 bg-brand/[0.04] p-4.5 glass space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                  {optimizerProposal.solverType}
                </span>
                <Badge variant="ok" size="sm">
                  Solver Status: {optimizerProposal.solverStatus}
                </Badge>
                <span className="text-xs font-mono text-inksoft">
                  Allocations Calculated: {optimizerProposal.allocations.length}
                </span>
              </div>
              <h3 className="text-sm font-bold text-ink">
                Suggested Allocation: Minimizes Total Vessel Waiting &amp; Demurrage Exposure
              </h3>
              <p className="text-xs text-inksoft">
                Satisfies physical draft constraints (Depth + Tide Margin), vessel length thresholds, and crane GMPH operational velocity.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="px-2.5 py-1.5 rounded-xl bg-obsidian-800/80 border border-line">
                  <span className="text-inksoft block text-[10px]">Delay Saved:</span>
                  <span className="font-bold text-ok">-{optimizerProposal.metrics.totalDelayHoursSaved}h</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl bg-obsidian-800/80 border border-line">
                  <span className="text-inksoft block text-[10px]">Demurrage Saved:</span>
                  <span className="font-bold text-brand-glow">+${optimizerProposal.metrics.totalDemurrageSaved.toLocaleString()}</span>
                </div>
              </div>

              {canReassign ? (
                <motion.button
                  whileTap={buttonPressInteraction}
                  onClick={handleAcceptOptimizer}
                  disabled={optimizerAccepted}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-2 shadow-sm ${
                    optimizerAccepted
                      ? 'bg-ok/20 border border-ok/40 text-ok cursor-default'
                      : 'bg-brand hover:bg-brand-deep text-white border border-brand shadow-[0_0_14px_rgba(59,124,246,0.35)] cursor-pointer'
                  }`}
                >
                  <span>{optimizerAccepted ? 'Allocations Confirmed ✓' : 'Accept Optimized Allocations'}</span>
                  {!optimizerAccepted && <span>⚡</span>}
                </motion.button>
              ) : (
                <span className="text-[11px] font-mono text-inksoft/40 border border-line/40 px-3 py-2 rounded-xl">
                  Accept Restricted ({activeRole?.tag})
                </span>
              )}
            </div>
          </div>

          {/* Optimizer Allocation Summary Diffs */}
          {optimizerProposal.allocations.length > 0 && (
            <div className="pt-2 border-t border-brand/20 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {optimizerProposal.allocations.map((alloc, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-obsidian-800/70 border border-line flex items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-ink font-mono">{alloc.vesselName}</span>
                    <span className="text-inksoft block text-[11px]">
                      Target: <b className="text-brand-glow">{alloc.berthName}</b> paired with <b>{alloc.craneName}</b>
                    </span>
                  </div>
                  <div className="text-right font-mono flex-none">
                    <span className="text-ok font-bold">-{alloc.delayReductionHours}h wait</span>
                    <span className="text-[10px] text-inksoft block">{alloc.draftClearanceMargin} draft clearance</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Quayside Berth Allocation Board */}
          <div className="lg:col-span-8 space-y-4">
            <div className="glass rounded-2xl p-5 border border-line space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Quayside Berthing Slips</h3>
                  <p className="text-xs text-inksoft">
                    Vessel moorings, assigned ship-to-shore (STS) cranes, and discharge progress.
                  </p>
                </div>
                <span className="text-[10.5px] font-mono text-inksoft bg-obsidian-800/80 px-2 py-1 rounded border border-line">
                  Fairway Depth: {(16.5 + tideHeight).toFixed(1)}m (Datum + Tide)
                </span>
              </div>

              {/* Berths Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {berths.map((b) => {
                  const isFlashing = flashId === b.id
                  const effectiveDepth = (b.depthM + tideHeight).toFixed(1)
                  return (
                    <div
                      key={b.id}
                      className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between ${
                        isFlashing
                          ? 'border-brand bg-brand/15 shadow-[0_0_20px_rgba(59,124,246,0.35)]'
                          : b.status === 'warn'
                          ? 'border-amber/40 bg-amber/[0.03] glass'
                          : 'border-line glass hover:border-lineSoft'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-ink">{b.name}</span>
                            <span className="text-[10px] font-mono text-inksoft">
                              {b.lengthM}m · {effectiveDepth}m max draft
                            </span>
                          </div>
                          <Badge variant={b.status === 'warn' ? 'warn' : 'ok'} size="sm">
                            {b.status === 'warn' ? 'Laytime Alert' : b.vessel?.includes('Unassigned') ? 'Open Slip' : 'Active Mooring'}
                          </Badge>
                        </div>

                        <div className="text-xs font-semibold text-ink mb-1 truncate font-mono">
                          {b.vessel}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-inksoft my-3 p-2.5 rounded-xl bg-obsidian-800/60 border border-line/40">
                          <div>
                            <span className="block text-[10px] text-inksoft">Assigned STS</span>
                            <b className="text-ink text-xs">{b.crane}</b>
                          </div>
                          <div>
                            <span className="block text-[10px] text-inksoft">Velocity</span>
                            <b className="text-brand-glow text-xs">{b.movesPerHour} GMPH</b>
                          </div>
                          <div>
                            <span className="block text-[10px] text-inksoft">Utilization</span>
                            <span className="text-ink">{b.utilization}%</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-inksoft">Est. Departure</span>
                            <span className="text-ink">{b.etaDeparture}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1 mb-4">
                          <div className="flex justify-between text-[10.5px] font-mono">
                            <span className="text-inksoft">Discharge Progress</span>
                            <span className="text-ink font-semibold">
                              {b.teuTarget > 0 ? Math.round((b.teuHandled / b.teuTarget) * 100) : 0}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-obsidian-700/60 overflow-hidden">
                            <div
                              className="h-full bg-brand rounded-full transition-all"
                              style={{
                                width: `${b.teuTarget > 0 ? Math.min(100, Math.round((b.teuHandled / b.teuTarget) * 100)) : 0}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Manual Override Action */}
                      <div className="pt-2 border-t border-line/40 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-inksoft">
                          Length: {b.lengthM}m
                        </span>
                        {canReassign ? (
                          <motion.button
                            whileTap={buttonPressInteraction}
                            onClick={() => openReassignModal(b)}
                            className="text-xs font-semibold text-brand-glow hover:underline flex items-center gap-1 font-mono cursor-pointer"
                          >
                            Manual Crane Override →
                          </motion.button>
                        ) : (
                          <span className="text-[10px] font-mono text-inksoft/40 cursor-not-allowed">
                            Dispatch Locked
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Yard Capacity & Block Breakdown */}
          <div className="lg:col-span-4 space-y-4">
            {/* Overall Yard Gauge */}
            <div className="glass rounded-2xl p-5 border border-line space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-ink">Yard Buffer Capacity</h3>
                <Badge variant="warn" size="sm" pulse>
                  Dwell Surge
                </Badge>
              </div>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-extrabold font-mono text-ink">
                  {Math.round(YARD_CAPACITY * 100)}%
                </span>
                <span className="text-xs font-mono text-inksoft">Total Yard Utilization</span>
              </div>

              <div className="h-2.5 rounded-full bg-obsidian-700/60 overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all"
                  style={{ width: `${YARD_CAPACITY * 100}%` }}
                />
              </div>

              <p className="text-xs text-inksoft leading-relaxed pt-1">
                Extended dwell times elevate yard stack pressure. Block D (Reefer &amp; Hazardous) is approaching safety threshold.
              </p>
            </div>

            {/* Yard Sectors Breakdown */}
            <div className="glass rounded-2xl p-5 border border-line space-y-3">
              <span className="text-xs font-semibold text-ink block">
                Yard Block Telemetry
              </span>

              <div className="space-y-3">
                {YARD_BLOCKS.map((yb) => (
                  <div key={yb.id} className="space-y-1.5 p-3 rounded-xl bg-obsidian-800/40 border border-line">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink">{yb.name}</span>
                      <span
                        className={`font-mono font-bold ${
                          yb.status === 'crit'
                            ? 'text-crit'
                            : yb.status === 'warn'
                            ? 'text-amber'
                            : 'text-ok'
                        }`}
                      >
                        {yb.capacityPct}%
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-obsidian-700/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          yb.status === 'crit'
                            ? 'bg-crit'
                            : yb.status === 'warn'
                            ? 'bg-amber'
                            : 'bg-ok'
                        }`}
                        style={{ width: `${yb.capacityPct}%` }}
                      />
                    </div>

                    <div className="text-[10px] font-mono text-inksoft flex justify-between">
                      <span>Stack Count:</span>
                      <span className="text-ink">{yb.teus} TEU</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reassignment Modal Flow (Manual Override) */}
        {modalBerth && (
          <Modal
            isOpen={!!modalBerth}
            onClose={() => setModalBerth(null)}
            title={`Manual Crane Override at ${modalBerth.name}`}
            subtitle={`Vessel: ${modalBerth.vessel} · Current Crane: ${modalBerth.crane}`}
            footer={
              <>
                <button
                  onClick={() => setModalBerth(null)}
                  className="px-4 py-2 rounded-lg text-xs text-inksoft hover:text-ink transition-colors font-mono"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={buttonPressInteraction}
                  onClick={confirmReassignment}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand text-white hover:bg-brand-deep transition-all shadow-[0_0_14px_rgba(59,124,246,0.35)] font-mono cursor-pointer"
                >
                  Confirm Manual Override
                </motion.button>
              </>
            }
          >
            <div className="space-y-4 text-xs text-inksoft">
              <p>
                Select an operational or standby STS crane to manually assign to this berth. The digital twin will immediately recompute move rates, turnaround times, and the 72h plan.
              </p>

              <div className="space-y-2">
                {cranes.map((crane) => (
                  <label
                    key={crane.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedCraneId === crane.id
                        ? 'border-brand bg-brand/15 text-ink'
                        : 'border-line glass hover:border-lineSoft'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="craneSelect"
                        value={crane.id}
                        checked={selectedCraneId === crane.id}
                        onChange={() => setSelectedCraneId(crane.id)}
                        className="accent-brand"
                      />
                      <div>
                        <div className="text-xs font-semibold text-ink">{crane.name}</div>
                        <div className="text-[10.5px] font-mono text-inksoft mt-0.5">
                          Throughput: {crane.movesPerHour} GMPH · Status: {crane.status}
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={
                        crane.status === 'operational'
                          ? 'ok'
                          : crane.status === 'reduced_speed'
                          ? 'warn'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {crane.status}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  )
}
