import { useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { EVENT_CASCADES } from '../data/eventCascades.mock.js'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { useRole } from '../context/RoleContext.jsx'
import Badge from '../components/common/Badge.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

const sevDot = { crit: 'bg-rose-500', warn: 'bg-amber-500', ok: 'bg-emerald-500' }

export default function EventCascadePage() {
  const { applyDiversion, routingRecommendations } = useOperationalContext()
  const { can, logAction, activeRole } = useRole()
  const [active, setActive] = useState(EVENT_CASCADES[0])
  const [revealed, setRevealed] = useState(active.nodes.length)
  const [mitigated, setMitigated] = useState(false)

  const canMitigate = can('applyRecommendation')

  const simulateCascade = (cascade) => {
    setActive(cascade)
    setRevealed(0)
    setMitigated(false)
    cascade.nodes.forEach((_, i) => {
      setTimeout(() => setRevealed((r) => Math.max(r, i + 1)), (i + 1) * 320)
    })
  }

  const handleMitigate = () => {
    if (!canMitigate) return
    setMitigated(true)

    // Trigger matching live diversion if available
    const rec = routingRecommendations.find((r) =>
      r.targetZone.toLowerCase().includes(active.category.toLowerCase()) ||
      active.trigger.toLowerCase().includes(r.type.toLowerCase())
    )
    if (rec) {
      applyDiversion(rec.id)
    }

    logAction({
      action: 'CASCADE_MITIGATION_APPLIED',
      target: active.trigger,
      details: `Dispatched automated mitigation buffer for ${active.category}`
    })
  }

  return (
    <AppShell crumb="Event Cascade Causality">
      <div className="space-y-5 max-w-[1680px] mx-auto select-none font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                NeuBodhi Digital Twin Core
              </span>
              <span className="text-xs text-inksoft font-medium">
                Incident Ripple &amp; Downstream Delay Propagation
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Incident Trigger &amp; Downstream Operational Cascade
            </h2>
          </div>

          <motion.button
            whileTap={buttonPressInteraction}
            onClick={() => simulateCascade(active)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0085db] text-white hover:bg-[#0074c2] text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <span>Replay Ripple Simulation</span>
            <span>▶</span>
          </motion.button>
        </div>

        {/* Incident Trigger Selector Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EVENT_CASCADES.map((c) => {
            const isSelected = active.id === c.id
            return (
              <motion.button
                whileTap={buttonPressInteraction}
                key={c.id}
                onClick={() => simulateCascade(c)}
                className={`p-5 rounded-3xl text-left border transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'border-[#0085db] ring-2 ring-[#0085db]/20 bg-sky-50/50 dark:bg-sky-950/40 text-ink'
                    : 'border-line bg-surface hover:border-slate-300 dark:hover:border-slate-700 text-inksoft hover:text-ink'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0085db]">
                    {c.category}
                  </span>
                  <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                    Est. {c.estimatedCost}
                  </span>
                </div>
                <div className="text-sm font-bold text-ink leading-snug">
                  {c.trigger}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Bento Grid: Causality Timeline + Downstream Bottlenecks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Animated Ripple Timeline */}
          <div className="lg:col-span-8 bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-inksoft tracking-wider block mb-1">
                  Primary Incident Trigger
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-ink">
                  {active.directImpact}
                </h3>
              </div>
              <Badge variant="warn" size="sm">
                {revealed} of {active.nodes.length} Nodes Simulated
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-inksoft leading-relaxed font-medium">
              {active.rippleSummary}
            </p>

            {/* Cascade Sequential Nodes */}
            <div className="pt-2 space-y-0 relative">
              {active.nodes.map((node, i) => {
                const isRevealed = i < revealed
                const isLatest = i === revealed - 1

                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{
                      opacity: isRevealed ? 1 : 0.2,
                      y: isRevealed ? 0 : 6
                    }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-4"
                  >
                    {/* Conduit Line and Dot */}
                    <div className="flex flex-col items-center flex-none">
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${sevDot[node.severity]} flex-none ring-4 ring-surface ${
                          isLatest ? 'animate-ping' : ''
                        }`}
                      />
                      {i < active.nodes.length - 1 && (
                        <span
                          className={`w-[2px] flex-1 my-1.5 transition-colors duration-500 ${
                            isRevealed ? 'bg-[#0085db]/40' : 'bg-line'
                          }`}
                          style={{ minHeight: 52 }}
                        />
                      )}
                    </div>

                    {/* Node Content */}
                    <div className="pb-6 min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-ink border border-line">
                          {node.entity}
                        </span>
                        <span className="text-xs font-bold text-[#0085db]">
                          {node.delay}
                        </span>
                        <Badge variant={node.severity} size="sm">
                          {node.severity === 'crit' ? 'Critical' : node.severity === 'warn' ? 'Elevated' : 'Resolved'}
                        </Badge>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-ink leading-relaxed">
                        {node.label}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Ripple Impact Metrics & Mitigation Trigger */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-4">
              <span className="text-sm font-bold text-ink block border-b border-line pb-3">
                Downstream Ripple Metrics
              </span>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line">
                  <span className="text-xs font-bold text-inksoft uppercase block mb-1">
                    Total Quayside Delay Ripple
                  </span>
                  <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                    +110 Minutes
                  </span>
                  <span className="text-[11px] text-inksoft block mt-1 font-medium">
                    Cascading onto 2 pending berth windows
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line">
                  <span className="text-xs font-bold text-inksoft uppercase block mb-1">
                    Financial Exposure Impact
                  </span>
                  <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                    {active.estimatedCost}
                  </span>
                  <span className="text-[11px] text-inksoft block mt-1 font-medium">
                    Demurrage accruals and truck idle fuel
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line">
                  <span className="text-xs font-bold text-inksoft uppercase block mb-1">
                    Automated Intervention Buffer
                  </span>
                  <span className="text-xs font-medium text-ink leading-relaxed block mt-1">
                    Diverting secondary truck lanes and placing standby Crane C-06 on active standby halts further cascade.
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-line">
                {canMitigate ? (
                  <motion.button
                    whileTap={buttonPressInteraction}
                    onClick={handleMitigate}
                    disabled={mitigated}
                    className={`w-full text-xs font-bold py-3 px-4 rounded-xl border transition-all cursor-pointer shadow-md ${
                      mitigated
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-default'
                        : 'bg-[#0085db] hover:bg-[#0074c2] text-white border-transparent'
                    }`}
                  >
                    {mitigated ? 'Mitigation Buffer Deployed ✓' : 'Deploy Automated Mitigation'}
                  </motion.button>
                ) : (
                  <div className="text-center text-xs font-semibold text-inksoft/60 p-2.5 border border-line rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    Mitigation Restricted for {activeRole?.tag}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
