import { useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { EVENT_CASCADES } from '../data/eventCascades.mock.js'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { useRole } from '../context/RoleContext.jsx'
import Badge from '../components/common/Badge.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

const sevDot = { crit: 'bg-crit', warn: 'bg-amber', ok: 'bg-ok' }

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
      <div className="space-y-4 max-w-[1680px] mx-auto select-none">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass p-4 sm:p-5 rounded-2xl border border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                NeuBodhi Digital Twin Core
              </span>
              <span className="text-xs text-inksoft font-mono">
                Incident Ripple &amp; Downstream Delay Propagation
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              Incident Trigger &amp; Downstream Operational Cascade
            </h2>
          </div>

          <motion.button
            whileTap={buttonPressInteraction}
            onClick={() => simulateCascade(active)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/15 border border-brand/40 text-brand-glow hover:bg-brand/25 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(59,124,246,0.25)] font-mono"
          >
            <span>Replay Ripple Simulation</span>
            <span>▶</span>
          </motion.button>
        </div>

        {/* Incident Trigger Selector Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EVENT_CASCADES.map((c) => {
            const isSelected = active.id === c.id
            return (
              <motion.button
                whileTap={buttonPressInteraction}
                key={c.id}
                onClick={() => simulateCascade(c)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'border-brand bg-brand/15 shadow-[0_0_18px_rgba(59,124,246,0.25)] text-ink'
                    : 'border-line glass hover:border-lineSoft text-inksoft hover:text-ink'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-glow">
                    {c.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-crit">
                    Est. {c.estimatedCost}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-ink leading-snug">
                  {c.trigger}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Bento Grid: Causality Timeline + Downstream Bottlenecks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Animated Ripple Timeline */}
          <div className="lg:col-span-8 glass rounded-2xl p-5 sm:p-6 border border-line space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase text-inksoft tracking-wider block mb-0.5">
                  Primary Incident Trigger
                </span>
                <h3 className="text-sm sm:text-base font-bold text-ink">
                  {active.directImpact}
                </h3>
              </div>
              <Badge variant="warn" size="sm">
                {revealed} of {active.nodes.length} Nodes Simulated
              </Badge>
            </div>

            <p className="text-xs text-inksoft leading-relaxed font-sans">
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
                      opacity: isRevealed ? 1 : 0.15,
                      y: isRevealed ? 0 : 6
                    }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-4"
                  >
                    {/* Conduit Line and Dot */}
                    <div className="flex flex-col items-center flex-none">
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${sevDot[node.severity]} flex-none border-2 border-obsidian-900 ${
                          isLatest ? 'animate-pulseDot ring-2 ring-brand-glow/50' : ''
                        }`}
                      />
                      {i < active.nodes.length - 1 && (
                        <span
                          className={`w-[2px] flex-1 my-1 transition-colors duration-500 ${
                            isRevealed ? 'bg-brand/40' : 'bg-line'
                          }`}
                          style={{ minHeight: 48 }}
                        />
                      )}
                    </div>

                    {/* Node Content */}
                    <div className="pb-6 min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-obsidian-800 text-ink border border-line">
                          {node.entity}
                        </span>
                        <span className="text-xs font-mono font-bold text-brand-glow">
                          {node.delay}
                        </span>
                        <Badge variant={node.severity} size="sm">
                          {node.severity === 'crit' ? 'Critical' : node.severity === 'warn' ? 'Elevated' : 'Resolved'}
                        </Badge>
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-ink leading-relaxed font-sans">
                        {node.label}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Ripple Impact Metrics & Mitigation Trigger */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass rounded-2xl p-5 border border-line space-y-4">
              <span className="text-xs font-semibold text-ink block border-b border-line pb-2.5">
                Downstream Ripple Metrics
              </span>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-obsidian-800/40 border border-line">
                  <span className="text-[10.5px] font-mono text-inksoft block mb-1">
                    Total Quayside Delay Ripple
                  </span>
                  <span className="text-xl font-bold font-mono text-crit">
                    +110 Minutes
                  </span>
                  <span className="text-[10px] text-inksoft block mt-0.5">
                    Cascading onto 2 pending berth windows
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-obsidian-800/40 border border-line">
                  <span className="text-[10.5px] font-mono text-inksoft block mb-1">
                    Financial Exposure Impact
                  </span>
                  <span className="text-xl font-bold font-mono text-amber">
                    {active.estimatedCost}
                  </span>
                  <span className="text-[10px] text-inksoft block mt-0.5">
                    Demurrage accruals and truck idle fuel
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-obsidian-800/40 border border-line">
                  <span className="text-[10.5px] font-mono text-inksoft block mb-1">
                    Automated Intervention Buffer
                  </span>
                  <span className="text-xs font-medium text-ink leading-relaxed block font-sans">
                    Diverting secondary truck lanes and placing standby Crane C-06 on active standby halts further cascade.
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-line">
                {canMitigate ? (
                  <motion.button
                    whileTap={buttonPressInteraction}
                    onClick={handleMitigate}
                    disabled={mitigated}
                    className={`w-full text-xs font-semibold py-2.5 rounded-xl border transition-all font-mono ${
                      mitigated
                        ? 'border-ok/40 bg-ok/10 text-ok cursor-default'
                        : 'bg-brand hover:bg-brand-deep text-white border-brand shadow-[0_0_14px_rgba(59,124,246,0.35)]'
                    }`}
                  >
                    {mitigated ? 'Mitigation Buffer Deployed ✓' : 'Deploy Automated Mitigation'}
                  </motion.button>
                ) : (
                  <div className="text-center text-[11px] font-mono text-inksoft/50 p-2 border border-line/40 rounded-xl">
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
