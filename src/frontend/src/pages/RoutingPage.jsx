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
      <div className="space-y-4 max-w-[1680px] mx-auto select-none">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass p-4 sm:p-5 rounded-2xl border border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                Dynamic Incident Rerouting
              </span>
              <span className="text-xs text-inksoft font-mono">
                Real-Time Candidate Resource Discovery
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              Alternate Routing &amp; Quayside Diversion Strategies
            </h2>
            <p className="text-xs text-inksoft mt-0.5">
              Automated algorithmic solver discovering idle berths, spare gate throughput, and tidal anchorage windows during congestion spikes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {appliedCount > 0 && (
              <button
                onClick={resetToNominal}
                className="text-xs font-mono px-3 py-1.5 rounded-xl border border-line hover:border-lineSoft text-inksoft hover:text-ink transition-colors"
                title="Reset active diversions to baseline"
              >
                Reset Baseline
              </button>
            )}
            <div className="flex items-center gap-2 bg-obsidian-800/80 px-3 py-1.5 rounded-xl border border-line">
              <span className="w-2 h-2 rounded-full bg-brand-glow animate-pulseDot" />
              <span className="text-xs font-mono text-ink font-semibold">
                {appliedCount} of {routingRecommendations.length} Active
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Impact Stat Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="glass rounded-2xl p-4 border border-line">
            <span className="text-[11px] font-mono uppercase text-inksoft tracking-wider block mb-1">
              Identified Alternates
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-ink">
                {routingRecommendations.length} Strategies
              </span>
              <Badge variant="brand" size="sm">
                Live Solver
              </Badge>
            </div>
            <span className="text-[10.5px] text-inksoft mt-1 block">
              Quayside slips, gate corridors, and anchorage
            </span>
          </div>

          <div className="glass rounded-2xl p-4 border border-line">
            <span className="text-[11px] font-mono uppercase text-inksoft tracking-wider block mb-1">
              Potential Delay Reduction
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-ok">
                -{totalHoursSaved.toFixed(1)} Hours
              </span>
              <span className="text-xs font-mono text-ok bg-ok/10 px-2 py-0.5 rounded border border-ok/30">
                -42% Queue Time
              </span>
            </div>
            <span className="text-[10.5px] text-inksoft mt-1 block">
              Direct avoidance of vessel demurrage grace limits
            </span>
          </div>

          <div className="glass rounded-2xl p-4 border border-line">
            <span className="text-[11px] font-mono uppercase text-inksoft tracking-wider block mb-1">
              Financial Demurrage Mitigated
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-brand-glow">
                ${totalCostSaved.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-brand-glow bg-brand/10 px-2 py-0.5 rounded border border-brand/30">
                Saved
              </span>
            </div>
            <span className="text-[10.5px] text-inksoft mt-1 block">
              BIMCO charter delay &amp; drayage idling cost avoidance
            </span>
          </div>

          <div className="glass rounded-2xl p-4 border border-line">
            <span className="text-[11px] font-mono uppercase text-inksoft tracking-wider block mb-1">
              Execution Authorization
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold font-mono text-ink truncate">
                {activeRole?.title}
              </span>
              <Badge variant={canApply ? 'ok' : 'warn'} size="sm">
                {canApply ? 'Authorized' : 'View Only'}
              </Badge>
            </div>
            <span className="text-[10.5px] text-inksoft mt-1 block">
              {canApply ? 'One-click operational dispatch enabled' : 'Requires Shift Supervisor or Admin'}
            </span>
          </div>
        </div>

        {/* Filter Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {typePills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                filterType === pill.id
                  ? 'bg-brand text-white shadow-[0_0_12px_rgba(59,124,246,0.3)] font-semibold'
                  : 'glass border border-line text-inksoft hover:text-ink hover:border-lineSoft'
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  filterType === pill.id ? 'bg-white/20 text-white' : 'bg-obsidian-800 text-inksoft'
                }`}
              >
                {pill.count}
              </span>
            </button>
          ))}
        </div>

        {/* Recommendations Stream */}
        <div className="space-y-3.5">
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
                  className={`rounded-2xl border p-5 transition-all glass ${
                    isApplied
                      ? 'border-ok/40 bg-ok/[0.02]'
                      : rec.urgency === 'critical'
                      ? 'border-crit/40 bg-crit/[0.02]'
                      : 'border-amber/40 bg-amber/[0.02]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left details */}
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={rec.urgency === 'critical' ? 'crit' : 'warn'} size="sm" pulse={!isApplied}>
                          {rec.urgency === 'critical' ? 'Critical Bottleneck' : 'Elevated Load'}
                        </Badge>
                        <span className="text-[10.5px] font-mono uppercase tracking-wider text-inksoft bg-obsidian-800/80 px-2 py-0.5 rounded border border-line">
                          {rec.targetZone}
                        </span>
                        {isApplied && (
                          <Badge variant="ok" size="sm">
                            ✓ Executed &amp; Dispatched
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-ink">
                        {rec.title}
                      </h3>

                      {/* Route Path Indicator: Source -> Target */}
                      <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                        <span className="text-crit font-semibold bg-crit/10 px-2.5 py-1 rounded border border-crit/20">
                          {rec.sourceEntity}
                        </span>
                        <span className="text-brand-glow font-bold">⟶</span>
                        <span className="text-ok font-semibold bg-ok/10 px-2.5 py-1 rounded border border-ok/20">
                          {rec.targetEntity}
                        </span>
                      </div>

                      {/* Operator Rationale */}
                      <p className="text-xs text-ink/80 leading-relaxed font-sans max-w-4xl pt-1">
                        {rec.rationale}
                      </p>
                    </div>

                    {/* Right Impact Metrics & Action Button */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-4 lg:min-w-[260px] flex-none">
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 w-full">
                        <div className="p-2 rounded-xl bg-obsidian-800/80 border border-line text-right">
                          <span className="text-[10px] font-mono text-inksoft uppercase block">
                            Delay Saved
                          </span>
                          <span className="text-sm font-bold font-mono text-ok">
                            -{rec.metrics.delayReductionHours}h
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-obsidian-800/80 border border-line text-right">
                          <span className="text-[10px] font-mono text-inksoft uppercase block">
                            Cost Saved
                          </span>
                          <span className="text-sm font-bold font-mono text-brand-glow">
                            ${rec.metrics.costSaved.toLocaleString()}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-obsidian-800/80 border border-line text-right">
                          <span className="text-[10px] font-mono text-inksoft uppercase block">
                            TEU Expedited
                          </span>
                          <span className="text-sm font-bold font-mono text-ink">
                            {rec.metrics.teusExpedited.toLocaleString()}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-obsidian-800/80 border border-line text-right">
                          <span className="text-[10px] font-mono text-inksoft uppercase block">
                            SLA Impact
                          </span>
                          <span className="text-xs font-bold font-mono text-ok truncate block">
                            {rec.metrics.berthTurnaroundImprovement}
                          </span>
                        </div>
                      </div>

                      <div className="w-full">
                        {isApplied ? (
                          <div className="w-full text-center py-2 rounded-xl bg-ok/15 border border-ok/30 text-ok font-mono text-xs font-semibold flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulseDot" />
                            <span>Diversion Operational</span>
                          </div>
                        ) : (
                          <motion.button
                            whileTap={buttonPressInteraction}
                            disabled={!canApply}
                            onClick={() => applyDiversion(rec.id)}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold font-mono transition-all flex items-center justify-center gap-2 shadow-sm ${
                              canApply
                                ? 'bg-brand hover:bg-brand-deep text-white shadow-[0_0_14px_rgba(59,124,246,0.3)] cursor-pointer'
                                : 'bg-obsidian-800 text-inksoft/50 border border-line cursor-not-allowed'
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
