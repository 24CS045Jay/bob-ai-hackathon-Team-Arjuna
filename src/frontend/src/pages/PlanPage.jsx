import { useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { useRole } from '../context/RoleContext.jsx'
import Modal from '../components/common/Modal.jsx'
import Badge from '../components/common/Badge.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

const riskStyle = {
  low: 'border-line/80 hover:border-lineSoft glass',
  elevated: 'border-amber/40 bg-amber/[0.03] glass',
  critical: 'border-crit/50 bg-crit/[0.04] glass shadow-[0_0_16px_rgba(229,73,61,0.12)]'
}

export default function PlanPage() {
  const { activePlan, approvedPlanStamp, approveCurrentPlan, congestionHotspots, berths, vessels, weatherTide } = useOperationalContext()
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
      <div className="space-y-4 max-w-[1680px] mx-auto select-none">
        {/* Plan Header Bento Card */}
        <div className="glass rounded-2xl p-5 sm:p-6 border border-line flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                Rolling Master Schedule
              </span>
              <span className="text-xs font-mono text-inksoft">
                {activePlan.metadata.version} · {activePlan.metadata.generatedAt}
              </span>
              <Badge variant={activePlan.metadata.mitigationsCount > 0 ? 'ok' : 'brand'} size="sm">
                {activePlan.metadata.mitigationsCount > 0 ? `${activePlan.metadata.mitigationsCount} Diversions Factored` : 'Baseline Model'}
              </Badge>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              72-Hour Quayside, Berth &amp; Gate Master Plan
            </h2>
            <p className="text-xs text-inksoft mt-1">
              {activePlan.metadata.simulationBaseline} · Projected Cargo Flow: <b className="text-ink">{activePlan.metadata.totalProjectedTeu.toLocaleString()} TEU</b>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Shift Handover Export Button */}
            <motion.button
              whileTap={buttonPressInteraction}
              onClick={() => setIsHandoverModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-line hover:border-lineSoft bg-obsidian-800/80 hover:bg-obsidian-700/60 text-ink text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Shift Handover Summary</span>
              <span>📄</span>
            </motion.button>

            {/* Approval Gate */}
            {isApproved ? (
              <div className="glass-strong border border-ok/40 rounded-xl px-4 py-2 text-right">
                <div className="text-[10px] font-mono uppercase text-ok flex items-center gap-1.5 justify-end">
                  <span className="w-2 h-2 rounded-full bg-ok animate-pulseDot" />
                  Schedule Dispatched
                </div>
                <div className="text-xs font-mono font-bold text-ink">
                  {approvedPlanStamp.approvedBy} ({approvedPlanStamp.hash})
                </div>
                <div className="text-[10px] text-inksoft font-mono">
                  Timestamp: {approvedPlanStamp.timestamp}
                </div>
              </div>
            ) : canApprove ? (
              <motion.button
                whileTap={buttonPressInteraction}
                onClick={handleApprove}
                className="bg-brand hover:bg-brand-deep text-white font-semibold text-xs rounded-xl px-5 py-2.5 shadow-[0_0_16px_rgba(59,124,246,0.35)] transition-all flex items-center gap-2 font-mono cursor-pointer"
              >
                <span>Authorize Shift Plan</span>
                <span>✓</span>
              </motion.button>
            ) : (
              <div className="text-right">
                <span className="text-[11px] font-mono text-amber block">
                  Authorization Requires Shift Supervisor or Admin
                </span>
                <span className="text-[10px] text-inksoft">
                  Current: {activeRole?.title} (Review Mode)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rolling 72-Hour Blocks Grid (12 consecutive 6-hour windows) */}
        <div className="glass rounded-2xl p-5 border border-line space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                12-Shift Rolling Horizon (Days 1–3)
              </h3>
              <p className="text-xs text-inksoft">
                Continuous 6-hour windows evaluating berth loads, crane move quotas, and gate overflow thresholds.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-inksoft">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ok" /> Nominal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber" /> Elevated Load
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-crit" /> Critical Risk
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {activePlan.blocks.map((b) => (
              <div
                key={b.id}
                className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between ${
                  riskStyle[b.risk] || riskStyle.low
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-ink font-mono">{b.label}</span>
                    <Badge
                      variant={b.risk === 'critical' ? 'crit' : b.risk === 'elevated' ? 'warn' : 'ok'}
                      size="sm"
                      pulse={b.risk === 'critical'}
                    >
                      {b.risk === 'critical' ? 'Critical Bottleneck' : b.risk === 'elevated' ? 'Elevated Pressure' : 'Nominal'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs my-3">
                    <div className="p-2 rounded-xl bg-obsidian-800/50 border border-line/40">
                      <span className="text-[10px] font-mono text-inksoft block uppercase">
                        Quayside Berths
                      </span>
                      <span className="font-semibold text-ink text-xs">{b.berths}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded-xl bg-obsidian-800/50 border border-line/40">
                        <span className="text-[10px] text-inksoft block uppercase">STS Cranes</span>
                        <span className="text-ink truncate block">{b.cranes}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-obsidian-800/50 border border-line/40">
                        <span className="text-[10px] text-inksoft block uppercase">Move Target</span>
                        <span className="text-brand-glow font-bold">{b.movesTarget} GMPH</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-obsidian-800/50 border border-line/40">
                      <span className="text-[10px] font-mono text-inksoft block uppercase">
                        Gates &amp; Landside
                      </span>
                      <span className="text-ink text-xs">{b.gates}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-line/40 text-[11px] text-inksoft italic">
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
            subtitle={`Master Schedule ${activePlan.metadata.version} · Handover Window`}
            footer={
              <>
                <button
                  onClick={() => setIsHandoverModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-inksoft hover:text-ink transition-colors font-mono"
                >
                  Close
                </button>
                <motion.button
                  whileTap={buttonPressInteraction}
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand text-white hover:bg-brand-deep transition-all shadow-[0_0_14px_rgba(59,124,246,0.35)] font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Print Briefing</span>
                  <span>🖨️</span>
                </motion.button>
              </>
            }
          >
            <div className="space-y-4 text-xs text-ink print:text-black">
              {/* Handover Metadata Banner */}
              <div className="p-3.5 rounded-xl bg-obsidian-800/60 border border-line space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-inksoft">Outgoing Supervisor:</span>
                  <span className="text-ink font-bold">{activeRole?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-inksoft">Generating Timestamp:</span>
                  <span className="text-ink">{activePlan.metadata.generatedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-inksoft">Baseline Weather &amp; Tides:</span>
                  <span className="text-ink">
                    Tide: +{weatherTide?.currentTide?.heightMeters}m · Wind: {weatherTide?.wind?.speedKts} kts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-inksoft">Authorization Status:</span>
                  <span className={isApproved ? 'text-ok font-bold' : 'text-amber font-bold'}>
                    {isApproved ? `Authorized by ${approvedPlanStamp.approvedBy}` : 'Pending Shift Supervisor Signature'}
                  </span>
                </div>
              </div>

              {/* Critical Priority Hotspots */}
              <div className="space-y-1.5">
                <span className="font-bold text-xs uppercase tracking-wider text-crit font-mono block">
                  1. Critical Priority Hotspots
                </span>
                <div className="space-y-1.5">
                  {congestionHotspots.slice(0, 3).map((h) => (
                    <div key={h.id} className="p-2.5 rounded-lg bg-obsidian-800/40 border border-line text-xs">
                      <div className="flex justify-between font-semibold">
                        <span>{h.zone}</span>
                        <span className="font-mono text-crit">${h.estimatedDelayCost.toLocaleString()} exposure</span>
                      </div>
                      <p className="text-[11px] text-inksoft mt-0.5">{h.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Quayside Berth Commitments */}
              <div className="space-y-1.5">
                <span className="font-bold text-xs uppercase tracking-wider text-brand-glow font-mono block">
                  2. Quayside Berth Commitments
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  {berths.slice(0, 4).map((b) => (
                    <div key={b.id} className="p-2 rounded-lg bg-obsidian-800/40 border border-line">
                      <span className="font-bold text-ink block">{b.name}: {b.vessel}</span>
                      <span className="text-inksoft text-[10px]">
                        Crane {b.crane} · {b.movesPerHour} GMPH · ETD: {b.etaDeparture}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Handover Instructions */}
              <div className="p-3 rounded-xl bg-brand/5 border border-brand/30 text-[11px] leading-relaxed">
                <b>Incoming Shift Directives:</b> Ensure high-tide fairway clearance margin is preserved for MV Solvane Star. Maintain 50% Gate 3 truck diversion to Gate 2 until optical character recognition lane 2 returns to online calibration.
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  )
}
