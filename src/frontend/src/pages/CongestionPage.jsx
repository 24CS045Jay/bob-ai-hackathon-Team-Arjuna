import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { useRole } from '../context/RoleContext.jsx'
import Badge from '../components/common/Badge.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

export default function CongestionPage() {
  const { congestionHotspots, costMetrics, applyDiversion, appliedDiversions, routingRecommendations } = useOperationalContext()
  const { activeRole, can, logAction } = useRole()
  const [selectedId, setSelectedId] = useState(null)

  const canApply = can('applyRecommendation')
  const canSeeCost = activeRole?.code === 'admin' || activeRole?.code === 'viewer' || activeRole?.code === 'shift_supervisor'

  // Current selected zone (default to first hotspot)
  const selectedZone = (selectedId ? congestionHotspots.find((h) => h.id === selectedId) : null) || congestionHotspots[0]

  // Port stress index: weighted average of all computed hotspot scores
  const portStressIndex = Math.round(
    congestionHotspots.reduce((acc, h) => acc + h.score, 0) / (congestionHotspots.length || 1)
  )

  // Find matching routing recommendation for selected zone if available
  const matchingRec = routingRecommendations.find((r) => r.targetZone === selectedZone?.zone)
  const isApplied = matchingRec ? appliedDiversions.some((d) => d.id === matchingRec.id) : false

  const handleApply = () => {
    if (!canApply || !matchingRec) return
    applyDiversion(matchingRec.id)
  }

  return (
    <AppShell crumb="Congestion &amp; Laytime Analytics">
      <div className="space-y-4 max-w-[1680px] mx-auto select-none">
        {/* Executive Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass p-4 sm:p-5 rounded-2xl border border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                Predictive Telemetry Engine
              </span>
              <span className="text-xs text-inksoft font-mono">
                Model Horizon: 24h Forward Lookahead · Live Computational Loop
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              Congestion Bottleneck Risk &amp; Demurrage Exposure
            </h2>
            <p className="text-xs text-inksoft mt-0.5">
              Live scoring of quayside berth-hour overload, crane move deficits, gate OCR degradation, and tidal transit clearance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/routing"
              className="text-xs font-mono px-3 py-1.5 rounded-xl border border-brand/40 bg-brand/10 text-brand-glow hover:bg-brand/20 transition-all flex items-center gap-1.5"
            >
              <span>View Alternate Diversions</span>
              <span>→</span>
            </Link>
            <div className="flex items-center gap-2 bg-obsidian-800/80 px-3 py-1.5 rounded-xl border border-line">
              <span className="text-xs font-mono text-inksoft">Port Stress Index:</span>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  portStressIndex >= 70
                    ? 'text-crit bg-crit/10 border-crit/30'
                    : portStressIndex >= 50
                    ? 'text-amber bg-amber/10 border-amber/30'
                    : 'text-ok bg-ok/10 border-ok/30'
                }`}
              >
                {portStressIndex >= 70 ? 'CRITICAL' : portStressIndex >= 50 ? 'ELEVATED' : 'NOMINAL'} ({portStressIndex}/100)
              </span>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Dominant Hero Bento Card: Selected Hotspot Deep Analysis */}
          {selectedZone && (
            <div className="lg:col-span-7 glass rounded-2xl p-5 border border-line flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-[11px] font-mono uppercase text-inksoft tracking-wider mb-1">
                      Priority Bottleneck Zone
                    </div>
                    <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                      {selectedZone.zone}
                      <Badge variant={selectedZone.severity === 'crit' ? 'crit' : selectedZone.severity === 'warn' ? 'warn' : 'ok'} size="sm" pulse={selectedZone.severity === 'crit'}>
                        {selectedZone.severity === 'crit' ? 'Critical Bottleneck' : selectedZone.severity === 'warn' ? 'Elevated Load' : 'Nominal'}
                      </Badge>
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-ink">
                      T-{selectedZone.hoursToImpact}h to Peak Delay
                    </div>
                    <div className="text-[11px] font-mono text-brand-glow">
                      Score: {selectedZone.score}/100 · {selectedZone.confidence}% confidence
                    </div>
                  </div>
                </div>

                {/* Contributing Factors with Animated Causality Sequence */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-ink mb-2.5 flex items-center justify-between">
                    <span>Mathematical Factor Breakdown (Ground Truth)</span>
                    <span className="text-[10px] font-mono text-inksoft">Live Telemetry Inputs</span>
                  </div>
                  <div className="space-y-2">
                    {selectedZone.factors.map((factor, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08, duration: 0.2 }}
                        className="p-3 rounded-xl glass border border-line/60 flex items-start gap-3"
                      >
                        <span className="w-5 h-5 rounded-md bg-obsidian-800 border border-line text-inksoft font-mono text-[10px] font-bold flex items-center justify-center flex-none">
                          0{idx + 1}
                        </span>
                        <div className="text-xs text-ink leading-relaxed font-sans">
                          {factor}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Economic Exposure */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3.5 glass rounded-xl border border-line">
                    <span className="text-[10.5px] font-mono text-inksoft block mb-1">
                      Calculated Delay Exposure
                    </span>
                    <span className="text-lg font-bold font-mono text-crit">
                      ${selectedZone.estimatedDelayCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3.5 glass rounded-xl border border-line">
                    <span className="text-[10.5px] font-mono text-inksoft block mb-1">
                      Vulnerable Container Volume
                    </span>
                    <span className="text-lg font-bold font-mono text-amber">
                      {selectedZone.teusAtRisk.toLocaleString()} TEU
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation Box & Action Gated by Role */}
              <div className="p-4 rounded-xl bg-brand/5 border border-brand/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[10.5px] font-mono uppercase tracking-wider text-brand-glow font-semibold mb-0.5">
                    Recommended Corrective Action
                  </div>
                  <p className="text-xs text-ink font-medium leading-relaxed font-sans">
                    {selectedZone.recommendation}
                  </p>
                </div>

                {matchingRec ? (
                  canApply ? (
                    <motion.button
                      whileTap={buttonPressInteraction}
                      onClick={handleApply}
                      disabled={isApplied}
                      className={`flex-none text-xs font-semibold px-4 py-2 rounded-xl border transition-all font-mono ${
                        isApplied
                          ? 'border-ok/40 bg-ok/10 text-ok cursor-default'
                          : 'bg-brand hover:bg-brand-deep text-white border-brand shadow-[0_0_12px_rgba(59,124,246,0.35)] cursor-pointer'
                      }`}
                    >
                      {isApplied ? 'Diversion Active ✓' : 'Execute Diversion'}
                    </motion.button>
                  ) : (
                    <span
                      title="Role permission: Current perspective cannot apply operational recommendations"
                      className="flex-none text-[11px] font-mono text-inksoft/40 border border-line/40 px-3 py-1.5 rounded-lg cursor-not-allowed"
                    >
                      Action Restricted ({activeRole?.tag})
                    </span>
                  )
                ) : (
                  <Link
                    to="/routing"
                    className="flex-none text-xs font-semibold px-3 py-1.5 rounded-xl border border-line text-inksoft hover:text-ink transition-colors font-mono"
                  >
                    View in Routing →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Supporting Bento Cards: All Hotspots List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-semibold text-inksoft uppercase tracking-wider px-1 font-mono flex items-center justify-between">
              <span>Active Congestion Hotspots ({congestionHotspots.length})</span>
              <span className="text-[10px] text-brand-glow font-normal">Recomputes live</span>
            </div>

            {congestionHotspots.map((p) => {
              const isSelected = selectedZone?.id === p.id
              const matching = routingRecommendations.find((r) => r.targetZone === p.zone)
              const applied = matching ? appliedDiversions.some((d) => d.id === matching.id) : false

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`p-4 rounded-2xl glass border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand bg-brand/[0.08] shadow-[0_0_16px_rgba(59,124,246,0.2)]'
                      : 'border-line hover:border-lineSoft hover:bg-obsidian-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-ink">
                        {p.zone}
                      </span>
                      <Badge variant={p.severity === 'crit' ? 'crit' : p.severity === 'warn' ? 'warn' : 'ok'} size="sm">
                        {p.severity === 'crit' ? 'Critical' : p.severity === 'warn' ? 'Elevated' : 'Nominal'}
                      </Badge>
                    </div>
                    <span className="text-[11px] font-mono text-inksoft">
                      Score {p.score}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-inksoft mt-2 pt-2 border-t border-line/40">
                    <span className="font-mono text-brand-glow">
                      in {p.hoursToImpact}h · {p.confidence}% conf
                    </span>
                    <span className="font-mono text-ink font-medium">
                      Est. ${p.estimatedDelayCost.toLocaleString()}
                    </span>
                    {applied && <span className="text-ok font-semibold text-[11px] font-mono">Mitigated ✓</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cost-of-Congestion Executive Report Module */}
        {canSeeCost && (
          <div className="glass rounded-2xl p-5 border border-line space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                    Laytime Intelligence
                  </span>
                  <span className="text-xs text-ink font-semibold">
                    Cost-of-Congestion &amp; Demurrage Exposure Ledger
                  </span>
                </div>
                <p className="text-xs text-inksoft">
                  Real-time financial exposure derived from active vessel laytime SLAs, drayage truck queues, and crane move rates.
                </p>
              </div>

              <div className="flex items-baseline gap-4">
                <div className="text-right">
                  <span className="text-[10.5px] font-mono text-inksoft block">Current Shift Exposure</span>
                  <span className="text-xl font-bold font-mono text-crit">
                    ${costMetrics.currentShiftTotalCost.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10.5px] font-mono text-inksoft block">Projected 24h Exposure</span>
                  <span className="text-xl font-bold font-mono text-ink">
                    ${costMetrics.projected24hCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Sub-grid: Cost Breakdown + Dwell Benchmarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cost Category Breakdown */}
              <div className="p-4 rounded-xl glass border border-line space-y-3">
                <span className="text-xs font-semibold text-ink block">
                  Demurrage &amp; Idle Cost Distribution
                </span>

                <div className="space-y-2.5">
                  {costMetrics.breakdown.map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-ink font-medium">{item.category}</span>
                        <span className="font-mono text-ink font-semibold">
                          ${item.cost.toLocaleString()} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-obsidian-700/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-inksoft block">
                        {item.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benchmark comparison card */}
              <div className="p-4 rounded-xl glass border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink block">
                    Operational Laytime Benchmarks
                  </span>
                  <span className="text-[10.5px] font-mono text-inksoft">
                    SLA Baseline: $85,000/shift
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-obsidian-800/40 border border-line flex items-center justify-between">
                    <div>
                      <span className="text-xs text-ink font-medium block">
                        Charter Demurrage Variance
                      </span>
                      <span className="text-[10.5px] font-mono text-inksoft">
                        Target: &lt; $40,000 / shift
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-crit">
                        ${costMetrics.breakdown[0]?.cost.toLocaleString() || '0'}
                      </span>
                      <span className="text-[10px] font-mono text-crit block">Over Threshold</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-obsidian-800/40 border border-line flex items-center justify-between">
                    <div>
                      <span className="text-xs text-ink font-medium block">
                        Drayage Turnaround Delay
                      </span>
                      <span className="text-[10.5px] font-mono text-inksoft">
                        Target: &lt; 35 min / truck
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-amber">
                        ${costMetrics.breakdown[1]?.cost.toLocaleString() || '0'}
                      </span>
                      <span className="text-[10px] font-mono text-amber block">Gate 3 Idle Delay</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-obsidian-800/40 border border-line flex items-center justify-between">
                    <div>
                      <span className="text-xs text-ink font-medium block">
                        Net Savings if All Diversions Applied
                      </span>
                      <span className="text-[10.5px] font-mono text-inksoft">
                        Quayside + Landside routing
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-ok">
                        -$62,700
                      </span>
                      <span className="text-[10px] font-mono text-ok block">Recoverable Cost</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
