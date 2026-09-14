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
  const { activeRole, can } = useRole()
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
      <div className="space-y-5 max-w-[1680px] mx-auto select-none font-sans">
        {/* Executive Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Predictive Telemetry Engine
              </span>
              <span className="text-xs text-inksoft font-medium">
                Model Horizon: 24h Forward Lookahead • Live Computational Loop
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Congestion Bottleneck Risk &amp; Demurrage Exposure
            </h2>
            <p className="text-xs sm:text-sm text-inksoft mt-1 leading-relaxed">
              Real-time computational scoring of quayside berth-hour overload, crane move deficits, gate OCR degradation, and tidal transit clearance.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/routing"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-sky-50 dark:bg-slate-800 text-[#0085db] hover:bg-sky-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 border border-sky-100 dark:border-slate-700"
            >
              <span>View Alternate Diversions</span>
              <span>→</span>
            </Link>
            <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-line">
              <span className="text-xs font-semibold text-inksoft">Port Stress Index:</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  portStressIndex >= 70
                    ? 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900'
                    : portStressIndex >= 50
                    ? 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'
                    : 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
                }`}
              >
                {portStressIndex >= 70 ? 'Critical' : portStressIndex >= 50 ? 'Elevated' : 'Nominal'} ({portStressIndex}/100)
              </span>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Dominant Hero Bento Card: Selected Hotspot Deep Analysis */}
          {selectedZone && (
            <div className="lg:col-span-7 bg-surface rounded-3xl p-6 border border-line shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <span className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1">
                      Priority Bottleneck Zone
                    </span>
                    <h3 className="text-xl font-extrabold text-ink flex items-center gap-2.5">
                      {selectedZone.zone}
                      <Badge variant={selectedZone.severity === 'crit' ? 'crit' : selectedZone.severity === 'warn' ? 'warn' : 'ok'} size="sm" pulse={selectedZone.severity === 'crit'}>
                        {selectedZone.severity === 'crit' ? 'Critical Bottleneck' : selectedZone.severity === 'warn' ? 'Elevated Load' : 'Nominal'}
                      </Badge>
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-ink">
                      T-{selectedZone.hoursToImpact}h to Peak Delay
                    </div>
                    <div className="text-xs font-semibold text-[#0085db] mt-0.5">
                      Risk Score: {selectedZone.score}/100 • {selectedZone.confidence}% confidence
                    </div>
                  </div>
                </div>

                {/* Contributing Factors */}
                <div className="mb-6">
                  <div className="text-xs font-bold text-ink mb-3 flex items-center justify-between">
                    <span>Contributing Factors (Ground Truth)</span>
                    <span className="text-xs text-inksoft font-medium">Live Telemetry Inputs</span>
                  </div>
                  <div className="space-y-2.5">
                    {selectedZone.factors.map((factor, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.2 }}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-[#0085db] text-xs font-bold flex items-center justify-center flex-none">
                          {idx + 1}
                        </span>
                        <div className="text-xs sm:text-sm text-ink leading-relaxed font-medium">
                          {factor}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Economic Exposure */}
                <div className="grid grid-cols-2 gap-3.5 mb-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-line">
                    <span className="text-xs font-bold text-inksoft block mb-1">
                      Calculated Delay Exposure
                    </span>
                    <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                      ${selectedZone.estimatedDelayCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-line">
                    <span className="text-xs font-bold text-inksoft block mb-1">
                      Vulnerable Container Volume
                    </span>
                    <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                      {selectedZone.teusAtRisk.toLocaleString()} TEU
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation Box & Action Gated by Role */}
              <div className="p-4.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0085db] block mb-1">
                    Recommended Corrective Action
                  </span>
                  <p className="text-xs sm:text-sm text-ink font-semibold leading-relaxed">
                    {selectedZone.recommendation}
                  </p>
                </div>

                {matchingRec ? (
                  canApply ? (
                    <motion.button
                      whileTap={buttonPressInteraction}
                      onClick={handleApply}
                      disabled={isApplied}
                      className={`flex-none text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                        isApplied
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-default'
                          : 'bg-[#0085db] hover:bg-[#0074c2] text-white border-transparent shadow-md'
                      }`}
                    >
                      {isApplied ? 'Diversion Active ✓' : 'Execute Diversion'}
                    </motion.button>
                  ) : (
                    <span
                      title="Role permission: Current perspective cannot apply operational recommendations"
                      className="flex-none text-xs font-bold text-inksoft/60 border border-line px-3.5 py-2 rounded-xl cursor-not-allowed bg-surface"
                    >
                      Action Restricted ({activeRole?.tag})
                    </span>
                  )
                ) : (
                  <Link
                    to="/routing"
                    className="flex-none text-xs font-bold px-3.5 py-2 rounded-xl border border-line text-ink hover:bg-surface transition-colors bg-white dark:bg-slate-800"
                  >
                    View in Routing →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Supporting Bento Cards: All Hotspots List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-inksoft uppercase tracking-wider px-1 flex items-center justify-between">
              <span>Active Congestion Hotspots ({congestionHotspots.length})</span>
              <span className="text-xs text-[#0085db] font-semibold">Recomputes live</span>
            </div>

            {congestionHotspots.map((p) => {
              const isSelected = selectedZone?.id === p.id
              const matching = routingRecommendations.find((r) => r.targetZone === p.zone)
              const applied = matching ? appliedDiversions.some((d) => d.id === matching.id) : false

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`p-4 rounded-2xl bg-surface border cursor-pointer transition-all shadow-xs ${
                    isSelected
                      ? 'border-[#0085db] ring-2 ring-[#0085db]/20 bg-sky-50/40 dark:bg-sky-950/30'
                      : 'border-line hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink">
                        {p.zone}
                      </span>
                      <Badge variant={p.severity === 'crit' ? 'crit' : p.severity === 'warn' ? 'warn' : 'ok'} size="sm">
                        {p.severity === 'crit' ? 'Critical' : p.severity === 'warn' ? 'Elevated' : 'Nominal'}
                      </Badge>
                    </div>
                    <span className="text-xs font-bold text-inksoft">
                      Score {p.score}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-inksoft mt-2 pt-2 border-t border-line">
                    <span className="font-semibold text-[#0085db]">
                      in {p.hoursToImpact}h • {p.confidence}% conf
                    </span>
                    <span className="text-ink font-bold">
                      Est. ${p.estimatedDelayCost.toLocaleString()}
                    </span>
                    {applied && <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">Mitigated ✓</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cost-of-Congestion Executive Report Module */}
        {canSeeCost && (
          <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                    Laytime Intelligence
                  </span>
                  <span className="text-sm font-bold text-ink">
                    Cost-of-Congestion &amp; Demurrage Exposure Ledger
                  </span>
                </div>
                <p className="text-xs text-inksoft leading-relaxed">
                  Real-time financial exposure derived from active vessel laytime SLAs, drayage truck queues, and crane move rates.
                </p>
              </div>

              <div className="flex items-baseline gap-6">
                <div className="text-right">
                  <span className="text-xs font-bold text-inksoft block">Current Shift Exposure</span>
                  <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                    ${costMetrics.currentShiftTotalCost.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-inksoft block">Projected 24h Exposure</span>
                  <span className="text-2xl font-extrabold text-ink">
                    ${costMetrics.projected24hCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Sub-grid: Cost Breakdown + Dwell Benchmarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Cost Category Breakdown */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line space-y-4">
                <span className="text-sm font-bold text-ink block">
                  Demurrage &amp; Idle Cost Distribution
                </span>

                <div className="space-y-3">
                  {costMetrics.breakdown.map((item) => (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex justify-between text-xs sm:text-sm font-semibold">
                        <span className="text-ink">{item.category}</span>
                        <span className="text-ink font-bold">
                          ${item.cost.toLocaleString()} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0085db] rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-inksoft block font-medium">
                        {item.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benchmark comparison card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-ink block">
                    Operational Laytime Benchmarks
                  </span>
                  <span className="text-xs font-bold text-inksoft">
                    SLA Baseline: $85,000/shift
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-xs sm:text-sm text-ink font-bold block">
                        Charter Demurrage Variance
                      </span>
                      <span className="text-xs text-inksoft font-medium">
                        Target: &lt; $40,000 / shift
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                        ${costMetrics.breakdown[0]?.cost.toLocaleString() || '0'}
                      </span>
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">Over Threshold</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-xs sm:text-sm text-ink font-bold block">
                        Drayage Turnaround Delay
                      </span>
                      <span className="text-xs text-inksoft font-medium">
                        Target: &lt; 35 min / truck
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                        ${costMetrics.breakdown[1]?.cost.toLocaleString() || '0'}
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">Gate 3 Idle Delay</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-xs sm:text-sm text-ink font-bold block">
                        Net Savings if All Diversions Applied
                      </span>
                      <span className="text-xs text-inksoft font-medium">
                        Quayside + Landside routing
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        -$62,700
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">Recoverable Cost</span>
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
