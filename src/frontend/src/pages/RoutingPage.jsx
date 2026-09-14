import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { useRole } from '../context/RoleContext.jsx'
import Badge from '../components/common/Badge.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

export default function RoutingPage() {
  const { routingRecommendations, applyDiversion, appliedDiversions, resetToNominal } = useOperationalContext()
  const { can, activeRole } = useRole()
  const [filterType, setFilterType] = useState('all') // 'all' | 'vessel_diversion' | 'gate_reroute' | 'anchorage_hold'

  const canApply = can('applyRecommendation')

  const filtered = routingRecommendations.filter((rec) => {
    if (filterType === 'all') return true
    return rec.type === filterType
  })

  // Aggregate impact metrics
  const totalHoursSaved = routingRecommendations.reduce(
    (acc, r) => acc + (r.metrics?.delayReductionHours || 0),
    0
  )
  const totalCostSaved = routingRecommendations.reduce(
    (acc, r) => acc + (r.metrics?.costSaved || 0),
    0
  )
  const appliedCount = appliedDiversions.length

  const typePills = [
    { id: 'all', label: 'All Alternates', count: routingRecommendations.length },
    {
      id: 'vessel_diversion',
      label: 'Quayside Vessel Diversions',
      count: routingRecommendations.filter((r) => r.type === 'vessel_diversion').length
    },
    {
      id: 'gate_reroute',
      label: 'Landside Gate Rerouting',
      count: routingRecommendations.filter((r) => r.type === 'gate_reroute').length
    },
    {
      id: 'anchorage_hold',
      label: 'Anchorage Tidal Holds',
      count: routingRecommendations.filter((r) => r.type === 'anchorage_hold').length
    }
  ]

  return (
    <AppShell crumb="Alternate Routing &amp; Diversion Engine">
      <div className="space-y-5 max-w-[1680px] mx-auto select-none font-sans">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Dynamic Incident Rerouting
              </span>
              <span className="text-xs text-inksoft font-medium">
                Real-Time Candidate Resource Discovery Loop
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Alternate Routing &amp; Quayside Diversion Strategies
            </h2>
            <p className="text-xs sm:text-sm text-inksoft mt-1 leading-relaxed">
              Automated algorithmic solver discovering idle berths, spare gate throughput, and tidal anchorage windows during congestion spikes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {appliedCount > 0 && (
              <button
                onClick={resetToNominal}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-line hover:bg-slate-100 dark:hover:bg-slate-800 text-inksoft hover:text-ink transition-colors cursor-pointer"
                title="Reset active diversions to baseline"
              >
                Reset Baseline
              </button>
            )}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-line">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0085db] animate-pulse" />
              <span className="text-xs font-bold text-ink">
                {appliedCount} of {routingRecommendations.length} Active
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Impact Stat Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface rounded-3xl p-5 border border-line shadow-xs">
            <span className="text-xs font-bold uppercase text-inksoft tracking-wider block mb-1">
              Identified Alternates
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-ink">
                {routingRecommendations.length} Strategies
              </span>
              <Badge variant="brand" size="sm">
                Live Solver
              </Badge>
            </div>
            <span className="text-xs text-inksoft mt-1.5 block font-medium">
              Quayside slips, gate corridors, and anchorage
            </span>
          </div>

          <div className="bg-surface rounded-3xl p-5 border border-line shadow-xs">
            <span className="text-xs font-bold uppercase text-inksoft tracking-wider block mb-1">
              Potential Delay Reduction
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                -{totalHoursSaved.toFixed(1)} Hours
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                -42% Queue Time
              </span>
            </div>
            <span className="text-xs text-inksoft mt-1.5 block font-medium">
              Direct avoidance of vessel demurrage grace limits
            </span>
          </div>

          <div className="bg-surface rounded-3xl p-5 border border-line shadow-xs">
            <span className="text-xs font-bold uppercase text-inksoft tracking-wider block mb-1">
              Demurrage Cost Mitigated
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#0085db]">
                ${totalCostSaved.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#0085db] bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                Saved
              </span>
            </div>
            <span className="text-xs text-inksoft mt-1.5 block font-medium">
              BIMCO charter delay &amp; drayage idling cost avoidance
            </span>
          </div>

          <div className="bg-surface rounded-3xl p-5 border border-line shadow-xs">
            <span className="text-xs font-bold uppercase text-inksoft tracking-wider block mb-1">
              Execution Authorization
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-ink truncate">
                {activeRole?.title}
              </span>
              <Badge variant={canApply ? 'ok' : 'warn'} size="sm">
                {canApply ? 'Authorized' : 'View Only'}
              </Badge>
            </div>
            <span className="text-xs text-inksoft mt-1.5 block font-medium">
              {canApply ? 'One-click operational dispatch enabled' : 'Requires Shift Supervisor or Admin'}
            </span>
          </div>
        </div>

        {/* Filter Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {typePills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                filterType === pill.id
                  ? 'bg-[#0085db] text-white shadow-xs'
                  : 'bg-surface border border-line text-inksoft hover:text-ink hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  filterType === pill.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-inksoft'
                }`}
              >
                {pill.count}
              </span>
            </button>
          ))}
        </div>

        {/* Recommendations Stream */}
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((rec) => {
              const isApplied = rec.status === 'applied'

              return (
                <motion.div
                  key={rec.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`rounded-3xl border p-6 transition-all bg-surface shadow-xs ${
                    isApplied
                      ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : rec.urgency === 'critical'
                      ? 'border-rose-200 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/10'
                      : 'border-amber-200 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    {/* Left details */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={rec.urgency === 'critical' ? 'crit' : 'warn'} size="sm" pulse={!isApplied}>
                          {rec.urgency === 'critical' ? 'Critical Bottleneck' : 'Elevated Load'}
                        </Badge>
                        <span className="text-xs font-bold uppercase tracking-wider text-inksoft bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-line">
                          {rec.targetZone}
                        </span>
                        {isApplied && (
                          <Badge variant="ok" size="sm">
                            ✓ Executed &amp; Dispatched
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-ink">
                        {rec.title}
                      </h3>

                      {/* Route Path Indicator: Source -> Target */}
                      <div className="flex items-center gap-2.5 text-xs flex-wrap">
                        <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-900">
                          {rec.sourceEntity}
                        </span>
                        <span className="text-[#0085db] font-extrabold text-sm">⟶</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-900">
                          {rec.targetEntity}
                        </span>
                      </div>

                      {/* Operator Rationale */}
                      <p className="text-xs sm:text-sm text-inksoft leading-relaxed max-w-4xl font-medium pt-1">
                        {rec.rationale}
                      </p>
                    </div>

                    {/* Right Impact Metrics & Action Button */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-4 lg:min-w-[280px] flex-none">
                      <div className="grid grid-cols-2 gap-2.5 w-full">
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line text-right">
                          <span className="text-xs font-bold text-inksoft uppercase block">
                            Delay Saved
                          </span>
                          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            -{rec.metrics.delayReductionHours}h
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line text-right">
                          <span className="text-xs font-bold text-inksoft uppercase block">
                            Cost Saved
                          </span>
                          <span className="text-base font-extrabold text-[#0085db]">
                            ${rec.metrics.costSaved.toLocaleString()}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line text-right">
                          <span className="text-xs font-bold text-inksoft uppercase block">
                            TEU Expedited
                          </span>
                          <span className="text-base font-extrabold text-ink">
                            {rec.metrics.teusExpedited.toLocaleString()}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line text-right">
                          <span className="text-xs font-bold text-inksoft uppercase block">
                            SLA Impact
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate block">
                            {rec.metrics.berthTurnaroundImprovement}
                          </span>
                        </div>
                      </div>

                      <div className="w-full">
                        {isApplied ? (
                          <div className="w-full text-center py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Diversion Operational</span>
                          </div>
                        ) : (
                          <motion.button
                            whileTap={buttonPressInteraction}
                            disabled={!canApply}
                            onClick={() => applyDiversion(rec.id)}
                            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                              canApply
                                ? 'bg-[#0085db] hover:bg-[#0074c2] text-white cursor-pointer'
                                : 'bg-slate-200 dark:bg-slate-800 text-inksoft/60 border border-line cursor-not-allowed'
                            }`}
                          >
                            <span>{canApply ? rec.actionLabel : 'Authorization Required'}</span>
                            <span>→</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  )
}
