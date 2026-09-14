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
      <div className="space-y-5 max-w-[1680px] mx-auto select-none font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Quayside Orchestration &amp; Solver
              </span>
              <span className="text-xs text-inksoft font-medium">
                {berths.length} Operational Berths • {cranes.length} STS Cranes • High Tide Margin: +{tideHeight}m
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Berth Allocation Board &amp; Crane Move Velocity
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-inksoft">Mean Move Rate:</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
              34.8 GMPH (Target &gt; 32)
            </span>
          </div>
        </div>

        {/* Task 3: Algorithmic Berth & Crane Optimiser Action Bar */}
        <div className="rounded-3xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold text-[#0085db] bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-sky-200 dark:border-slate-700">
                  {optimizerProposal.solverType}
                </span>
                <Badge variant="ok" size="sm">
                  Solver Status: {optimizerProposal.solverStatus}
                </Badge>
                <span className="text-xs text-inksoft font-medium">
                  Allocations Calculated: {optimizerProposal.allocations.length}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-ink">
                Suggested Allocation: Minimizes Total Vessel Waiting &amp; Demurrage Exposure
              </h3>
              <p className="text-xs text-inksoft leading-relaxed">
                Satisfies physical draft constraints (Depth + Tide Margin), vessel length thresholds, and crane GMPH operational velocity.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <div className="px-3 py-2 rounded-2xl bg-surface border border-line shadow-xs">
                  <span className="text-inksoft block text-[11px] font-medium">Delay Saved:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">-{optimizerProposal.metrics.totalDelayHoursSaved}h</span>
                </div>
                <div className="px-3 py-2 rounded-2xl bg-surface border border-line shadow-xs">
                  <span className="text-inksoft block text-[11px] font-medium">Demurrage Saved:</span>
                  <span className="font-bold text-[#0085db]">+${optimizerProposal.metrics.totalDemurrageSaved.toLocaleString()}</span>
                </div>
              </div>

              {canReassign ? (
                <motion.button
                  whileTap={buttonPressInteraction}
                  onClick={handleAcceptOptimizer}
                  disabled={optimizerAccepted}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                    optimizerAccepted
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-700 dark:text-emerald-300 cursor-default'
                      : 'bg-[#0085db] hover:bg-[#0074c2] text-white border-transparent'
                  }`}
                >
                  <span>{optimizerAccepted ? 'Allocations Confirmed ✓' : 'Accept Optimized Allocations'}</span>
                  {!optimizerAccepted && <span>⚡</span>}
                </motion.button>
              ) : (
                <span className="text-xs font-bold text-inksoft/60 border border-line px-3.5 py-2 rounded-xl bg-surface">
                  Accept Restricted ({activeRole?.tag})
                </span>
              )}
            </div>
          </div>

          {/* Optimizer Allocation Summary Diffs */}
          {optimizerProposal.allocations.length > 0 && (
            <div className="pt-3 border-t border-sky-200 dark:border-sky-900/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {optimizerProposal.allocations.map((alloc, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-surface border border-line shadow-xs flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-ink text-xs">{alloc.vesselName}</span>
                    <span className="text-inksoft block text-xs mt-0.5">
                      Target: <b className="text-[#0085db]">{alloc.berthName}</b> paired with <b>{alloc.craneName}</b>
                    </span>
                  </div>
                  <div className="text-right flex-none">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{alloc.delayReductionHours}h wait</span>
                    <span className="text-[11px] text-inksoft block font-medium">{alloc.draftClearanceMargin} draft clearance</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Quayside Berth Allocation Board */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <h3 className="text-base font-bold text-ink">Quayside Berthing Slips</h3>
                  <p className="text-xs text-inksoft mt-0.5">
                    Vessel moorings, assigned ship-to-shore (STS) cranes, and discharge progress.
                  </p>
                </div>
                <span className="text-xs font-semibold text-inksoft bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-line">
                  Fairway Depth: {(16.5 + tideHeight).toFixed(1)}m (Datum + Tide)
                </span>
              </div>

              {/* Berths Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {berths.map((b) => {
                  const isFlashing = flashId === b.id
                  const effectiveDepth = (b.depthM + tideHeight).toFixed(1)
                  return (
                    <div
                      key={b.id}
                      className={`rounded-3xl border p-5 transition-all flex flex-col justify-between shadow-xs ${
                        isFlashing
                          ? 'border-[#0085db] bg-sky-50 dark:bg-sky-950/40 ring-2 ring-[#0085db]/30'
                          : b.status === 'warn'
                          ? 'border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20'
                          : 'border-line bg-surface hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-ink">{b.name}</span>
                            <span className="text-xs text-inksoft font-medium">
                              {b.lengthM}m • {effectiveDepth}m max draft
                            </span>
                          </div>
                          <Badge variant={b.status === 'warn' ? 'warn' : 'ok'} size="sm">
                            {b.status === 'warn' ? 'Laytime Alert' : b.vessel?.includes('Unassigned') ? 'Open Slip' : 'Active Mooring'}
                          </Badge>
                        </div>

                        <div className="text-sm font-bold text-ink mb-1 truncate">
                          {b.vessel}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-inksoft my-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                          <div>
                            <span className="block text-[11px] text-inksoft font-medium">Assigned STS</span>
                            <b className="text-ink font-bold">{b.crane}</b>
                          </div>
                          <div>
                            <span className="block text-[11px] text-inksoft font-medium">Velocity</span>
                            <b className="text-[#0085db] font-bold">{b.movesPerHour} GMPH</b>
                          </div>
                          <div>
                            <span className="block text-[11px] text-inksoft font-medium">Utilization</span>
                            <span className="text-ink font-semibold">{b.utilization}%</span>
                          </div>
                          <div>
                            <span className="block text-[11px] text-inksoft font-medium">Est. Departure</span>
                            <span className="text-ink font-semibold">{b.etaDeparture}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5 mb-4">
                          <div className="flex justify-between text-xs">
                            <span className="text-inksoft font-medium">Discharge Progress</span>
                            <span className="text-ink font-bold">
                              {b.teuTarget > 0 ? Math.round((b.teuHandled / b.teuTarget) * 100) : 0}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-[#0085db] rounded-full transition-all"
                              style={{
                                width: `${b.teuTarget > 0 ? Math.min(100, Math.round((b.teuHandled / b.teuTarget) * 100)) : 0}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Manual Override Action */}
                      <div className="pt-3 border-t border-line flex items-center justify-between">
                        <span className="text-xs font-semibold text-inksoft">
                          Length: {b.lengthM}m
                        </span>
                        {canReassign ? (
                          <motion.button
                            whileTap={buttonPressInteraction}
                            onClick={() => openReassignModal(b)}
                            className="text-xs font-bold text-[#0085db] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            Manual Crane Override →
                          </motion.button>
                        ) : (
                          <span className="text-xs font-semibold text-inksoft/40 cursor-not-allowed">
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
          <div className="lg:col-span-4 space-y-5">
            {/* Overall Yard Gauge */}
            <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">Yard Buffer Capacity</h3>
                <Badge variant="warn" size="sm" pulse>
                  Dwell Surge
                </Badge>
              </div>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-extrabold text-ink">
                  {Math.round(YARD_CAPACITY * 100)}%
                </span>
                <span className="text-xs font-semibold text-inksoft">Total Yard Utilization</span>
              </div>

              <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-[#0085db] rounded-full transition-all"
                  style={{ width: `${YARD_CAPACITY * 100}%` }}
                />
              </div>

              <p className="text-xs text-inksoft leading-relaxed pt-1 font-medium">
                Extended dwell times elevate yard stack pressure. Block D (Reefer &amp; Hazardous) is approaching safety threshold.
              </p>
            </div>

            {/* Yard Sectors Breakdown */}
            <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-4">
              <span className="text-sm font-bold text-ink block">
                Yard Block Telemetry
              </span>

              <div className="space-y-3">
                {YARD_BLOCKS.map((yb) => (
                  <div key={yb.id} className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                      <span className="text-ink">{yb.name}</span>
                      <span
                        className={`${
                          yb.status === 'crit'
                            ? 'text-rose-600 dark:text-rose-400'
                            : yb.status === 'warn'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {yb.capacityPct}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          yb.status === 'crit'
                            ? 'bg-rose-500'
                            : yb.status === 'warn'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${yb.capacityPct}%` }}
                      />
                    </div>

                    <div className="text-xs text-inksoft flex justify-between font-medium">
                      <span>Stack Count:</span>
                      <span className="text-ink font-bold">{yb.teus} TEU</span>
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
            subtitle={`Vessel: ${modalBerth.vessel} • Current Crane: ${modalBerth.crane}`}
            footer={
              <>
                <button
                  onClick={() => setModalBerth(null)}
                  className="px-4 py-2 rounded-xl text-xs text-inksoft hover:text-ink transition-colors font-semibold"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={buttonPressInteraction}
                  onClick={confirmReassignment}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0085db] text-white hover:bg-[#0074c2] transition-all shadow-md cursor-pointer"
                >
                  Confirm Manual Override
                </motion.button>
              </>
            }
          >
            <div className="space-y-4 text-xs text-inksoft font-medium">
              <p>
                Select an operational or standby STS crane to manually assign to this berth. The digital twin will immediately recompute move rates, turnaround times, and the 72h plan.
              </p>

              <div className="space-y-2.5">
                {cranes.map((crane) => (
                  <label
                    key={crane.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedCraneId === crane.id
                        ? 'border-[#0085db] bg-sky-50 dark:bg-sky-950/40 text-ink ring-1 ring-[#0085db]/20'
                        : 'border-line bg-surface hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="craneSelect"
                        value={crane.id}
                        checked={selectedCraneId === crane.id}
                        onChange={() => setSelectedCraneId(crane.id)}
                        className="accent-[#0085db]"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-ink">{crane.name}</div>
                        <div className="text-xs text-inksoft mt-0.5">
                          Throughput: {crane.movesPerHour} GMPH • Status: {crane.status}
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
