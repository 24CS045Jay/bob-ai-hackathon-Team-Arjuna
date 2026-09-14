import { useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { useRole } from '../context/RoleContext.jsx'
import Modal from '../components/common/Modal.jsx'
import Badge from '../components/common/Badge.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

const riskStyle = {
  low: 'border-line bg-surface hover:border-slate-300 dark:hover:border-slate-700 shadow-xs',
  elevated: 'border-amber-200 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/15 shadow-xs',
  critical: 'border-rose-200 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/15 shadow-xs'
}

export default function PlanPage() {
  const { activePlan, approvedPlanStamp, approveCurrentPlan, congestionHotspots, berths, weatherTide } = useOperationalContext()
  const { activeRole } = useRole()
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false)

  const canApprove = activeRole?.code === 'shift_supervisor' || activeRole?.code === 'admin'
  const isApproved = approvedPlanStamp && approvedPlanStamp.planVersion === activePlan.metadata.version

  const handleApprove = () => {
    if (!canApprove) return
    approveCurrentPlan(activeRole)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <AppShell crumb="72-Hour Operations Plan">
      <div className="space-y-5 max-w-[1680px] mx-auto select-none font-sans">
        {/* Plan Header Bento Card */}
        <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Rolling Master Schedule
              </span>
              <span className="text-xs text-inksoft font-medium">
                {activePlan.metadata.version} • {activePlan.metadata.generatedAt}
              </span>
              <Badge variant={activePlan.metadata.mitigationsCount > 0 ? 'ok' : 'brand'} size="sm">
                {activePlan.metadata.mitigationsCount > 0 ? `${activePlan.metadata.mitigationsCount} Diversions Factored` : 'Baseline Model'}
              </Badge>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              72-Hour Quayside, Berth &amp; Gate Master Plan
            </h2>
            <p className="text-xs sm:text-sm text-inksoft mt-1 leading-relaxed">
              {activePlan.metadata.simulationBaseline} • Projected Cargo Flow: <b className="text-ink">{activePlan.metadata.totalProjectedTeu.toLocaleString()} TEU</b>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Shift Handover Export Button */}
            <motion.button
              whileTap={buttonPressInteraction}
              onClick={() => setIsHandoverModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-line hover:bg-slate-100 dark:hover:bg-slate-800 text-ink text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Shift Handover Summary</span>
              <span>📄</span>
            </motion.button>

            {/* Approval Gate */}
            {isApproved ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-2 text-right">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Schedule Dispatched
                </div>
                <div className="text-xs font-bold text-ink">
                  {approvedPlanStamp.approvedBy} ({approvedPlanStamp.hash})
                </div>
                <div className="text-[11px] text-inksoft font-medium">
                  Timestamp: {approvedPlanStamp.timestamp}
                </div>
              </div>
            ) : canApprove ? (
              <motion.button
                whileTap={buttonPressInteraction}
                onClick={handleApprove}
                className="bg-[#0085db] hover:bg-[#0074c2] text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Authorize Shift Plan</span>
                <span>✓</span>
              </motion.button>
            ) : (
              <div className="text-right">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                  Authorization Requires Shift Supervisor or Admin
                </span>
                <span className="text-xs text-inksoft font-medium">
                  Current: {activeRole?.title} (Review Mode)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rolling 72-Hour Blocks Grid (12 consecutive 6-hour windows) */}
        <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-4">
            <div>
              <h3 className="text-base font-bold text-ink">
                12-Shift Rolling Horizon (Days 1–3)
              </h3>
              <p className="text-xs text-inksoft mt-0.5">
                Continuous 6-hour windows evaluating berth loads, crane move quotas, and gate overflow thresholds.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-inksoft">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Nominal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Elevated Load
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical Risk
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activePlan.blocks.map((b) => (
              <div
                key={b.id}
                className={`rounded-3xl border p-5 transition-all flex flex-col justify-between ${
                  riskStyle[b.risk] || riskStyle.low
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-ink">{b.label}</span>
                    <Badge
                      variant={b.risk === 'critical' ? 'crit' : b.risk === 'elevated' ? 'warn' : 'ok'}
                      size="sm"
                      pulse={b.risk === 'critical'}
                    >
                      {b.risk === 'critical' ? 'Critical' : b.risk === 'elevated' ? 'Elevated' : 'Nominal'}
                    </Badge>
                  </div>

                  <div className="space-y-2.5 text-xs my-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                      <span className="text-[11px] font-bold text-inksoft block uppercase">
                        Quayside Berths
                      </span>
                      <span className="font-bold text-ink text-xs mt-0.5 block">{b.berths}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                        <span className="text-[11px] font-bold text-inksoft block uppercase">STS Cranes</span>
                        <span className="text-ink font-semibold truncate block mt-0.5">{b.cranes}</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                        <span className="text-[11px] font-bold text-inksoft block uppercase">Move Target</span>
                        <span className="text-[#0085db] font-bold block mt-0.5">{b.movesTarget} GMPH</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                      <span className="text-[11px] font-bold text-inksoft block uppercase">
                        Gates &amp; Landside
                      </span>
                      <span className="text-ink font-bold text-xs mt-0.5 block">{b.gates}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-line text-xs text-inksoft font-medium italic">
                  {b.notes}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task 5: Shift Handover Summary Modal (Printable) */}
        {isHandoverModalOpen && (
          <Modal
            isOpen={isHandoverModalOpen}
            onClose={() => setIsHandoverModalOpen(false)}
            title="Shift Handover Briefing Dossier"
            subtitle={`Master Schedule ${activePlan.metadata.version} • Handover Window`}
            footer={
              <>
                <button
                  onClick={() => setIsHandoverModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-inksoft hover:text-ink transition-colors font-semibold"
                >
                  Close
                </button>
                <motion.button
                  whileTap={buttonPressInteraction}
                  onClick={handlePrint}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0085db] text-white hover:bg-[#0074c2] transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Print Briefing</span>
                  <span>🖨️</span>
                </motion.button>
              </>
            }
          >
            <div className="space-y-4 text-xs text-ink print:text-black">
              {/* Handover Metadata Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-inksoft font-medium">Outgoing Supervisor:</span>
                  <span className="text-ink font-bold">{activeRole?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-inksoft font-medium">Generating Timestamp:</span>
                  <span className="text-ink font-semibold">{activePlan.metadata.generatedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-inksoft font-medium">Baseline Weather &amp; Tides:</span>
                  <span className="text-ink font-semibold">
                    Tide: +{weatherTide?.currentTide?.heightMeters}m • Wind: {weatherTide?.wind?.speedKts} kts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-inksoft font-medium">Authorization Status:</span>
                  <span className={isApproved ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>
                    {isApproved ? `Authorized by ${approvedPlanStamp.approvedBy}` : 'Pending Shift Supervisor Signature'}
                  </span>
                </div>
              </div>

              {/* Critical Priority Hotspots */}
              <div className="space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                  1. Critical Priority Hotspots
                </span>
                <div className="space-y-2">
                  {congestionHotspots.slice(0, 3).map((h) => (
                    <div key={h.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line text-xs">
                      <div className="flex justify-between font-bold">
                        <span>{h.zone}</span>
                        <span className="text-rose-600 dark:text-rose-400">${h.estimatedDelayCost.toLocaleString()} exposure</span>
                      </div>
                      <p className="text-xs text-inksoft mt-1 font-medium">{h.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Quayside Berth Commitments */}
              <div className="space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-[#0085db] block">
                  2. Quayside Berth Commitments
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {berths.slice(0, 4).map((b) => (
                    <div key={b.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line">
                      <span className="font-bold text-ink block">{b.name}: {b.vessel}</span>
                      <span className="text-inksoft text-[11px] mt-0.5 block font-medium">
                        Crane {b.crane} • {b.movesPerHour} GMPH • ETD: {b.etaDeparture}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Handover Instructions */}
              <div className="p-3.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 text-xs leading-relaxed font-medium">
                <b>Incoming Shift Directives:</b> Ensure high-tide fairway clearance margin is preserved for MV Solvane Star. Maintain 50% Gate 3 truck diversion to Gate 2 until optical character recognition lane 2 returns to online calibration.
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  )
}
