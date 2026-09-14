import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { GATES, GATE_SUMMARY } from '../data/gates.mock.js'
import { useRole } from '../context/RoleContext.jsx'
import Modal from '../components/common/Modal.jsx'
import Badge from '../components/common/Badge.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

export default function GateControllerPage() {
  const { logAction } = useRole()
  const [gatesList, setGatesList] = useState(GATES)
  const [modalGate, setModalGate] = useState(null)
  const [diversionTarget, setDiversionTarget] = useState('g2')
  const [rerouted, setRerouted] = useState({})
  const [toastMessage, setToastMessage] = useState(null)

  const openRerouteModal = (gate) => {
    setModalGate(gate)
    setDiversionTarget(gate.diversionTarget || 'g2')
  }

  const confirmReroute = () => {
    if (!modalGate) return

    const targetGate = gatesList.find((g) => g.id === diversionTarget)

    setGatesList((prev) =>
      prev.map((g) => {
        if (g.id === modalGate.id) {
          return {
            ...g,
            queue: Math.max(8, g.queue - 24),
            waitMin: Math.max(14, g.waitMin - 40),
            status: 'ok'
          }
        }
        if (g.id === diversionTarget) {
          return {
            ...g,
            queue: g.queue + 18,
            waitMin: g.waitMin + 12
          }
        }
        return g
      })
    )

    setRerouted((prev) => ({ ...prev, [modalGate.id]: true }))

    logAction({
      action: 'GATE_REROUTE',
      target: modalGate.name,
      details: `Diverted 24 commercial drayage trucks from ${modalGate.name} to ${targetGate?.name || 'Gate 2'} for 4-hour relief window.`
    })

    setToastMessage(`Traffic from ${modalGate.name} diverted to ${targetGate?.name || 'Gate 2'}.`)
    setTimeout(() => setToastMessage(null), 4000)
    setModalGate(null)
  }

  return (
    <AppShell crumb="Gate &amp; Landside Traffic">
      <div className="space-y-4 max-w-[1680px] mx-auto select-none">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass p-4 sm:p-5 rounded-2xl border border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                Landside Traffic Flow
              </span>
              <span className="text-xs text-inksoft font-mono">
                OCR Gates · RFID Turnaround Telemetry · Inbound Arterials
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              Gate Portals &amp; Drayage Turnaround Control
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-inksoft">Mean Gate Turnaround:</span>
            <span className="text-xs font-mono font-bold text-crit px-2.5 py-1 rounded-full bg-crit/10 border border-crit/30">
              {GATE_SUMMARY.overallAvgWaitMin} min (SLA &lt; {GATE_SUMMARY.tatTargetMin}m)
            </span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Gate Cards Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs font-semibold text-inksoft uppercase tracking-wider px-1 font-mono">
              Access Portals ({gatesList.length} Active Corridors)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {gatesList.map((g) => {
                const isCrit = g.status === 'crit'
                const isWarn = g.status === 'warn'
                const hasRerouted = !!rerouted[g.id]

                return (
                  <div
                    key={g.id}
                    className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between glass ${
                      isCrit
                        ? 'border-crit/40 bg-crit/[0.04]'
                        : isWarn
                        ? 'border-amber/40 bg-amber/[0.03]'
                        : 'border-line hover:border-lineSoft'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-ink truncate pr-2">
                          {g.name}
                        </span>
                        <Badge
                          variant={isCrit ? 'crit' : isWarn ? 'warn' : 'ok'}
                          size="sm"
                          pulse={isCrit}
                        >
                          {isCrit ? 'Bottleneck' : isWarn ? 'Elevated Queue' : 'Normal Flow'}
                        </Badge>
                      </div>

                      {/* Queue & Wait Numbers */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2.5 rounded-xl bg-obsidian-800/60 border border-line/40">
                          <span className="text-[10px] font-mono text-inksoft block">
                            Queued Trucks
                          </span>
                          <span
                            className={`text-2xl font-bold font-mono ${
                              isCrit ? 'text-crit' : isWarn ? 'text-amber' : 'text-ink'
                            }`}
                          >
                            {g.queue}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-obsidian-800/60 border border-line/40">
                          <span className="text-[10px] font-mono text-inksoft block">
                            Estimated Wait
                          </span>
                          <span
                            className={`text-2xl font-bold font-mono ${
                              isCrit ? 'text-crit' : isWarn ? 'text-amber' : 'text-ok'
                            }`}
                          >
                            ~{g.waitMin}m
                          </span>
                        </div>
                      </div>

                      {/* Lane & OCR Telemetry */}
                      <div className="space-y-1.5 text-xs text-inksoft font-mono mb-4">
                        <div className="flex justify-between">
                          <span>OCR Scanner State:</span>
                          <span
                            className={`font-semibold ${
                              g.ocrStatus === 'degraded'
                                ? 'text-crit'
                                : 'text-ok'
                            }`}
                          >
                            {g.ocrStatus.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Lanes:</span>
                          <span className="text-ink">
                            {g.lanesOpen} of {g.lanesTotal} open
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Throughput:</span>
                          <span className="text-brand-glow">
                            {g.throughputPerHour} trucks/hr
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-line/40 flex items-center justify-between">
                      {hasRerouted ? (
                        <span className="text-[11px] font-mono text-ok font-semibold">
                          Active Diversion Enabled ✓
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-mono text-inksoft">
                          TAT: {g.avgTatMin} min
                        </span>
                      )}

                      <motion.button
                        whileTap={buttonPressInteraction}
                        onClick={() => openRerouteModal(g)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all font-mono ${
                          isCrit
                            ? 'bg-crit text-white border-crit hover:bg-crit/80 shadow-[0_0_12px_rgba(229,73,61,0.4)]'
                            : 'glass border-line hover:border-brand/50 text-ink hover:text-brand-glow'
                        }`}
                      >
                        Reroute Queue →
                      </motion.button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Drayage SLA & Corridor Benchmarks */}
          <div className="lg:col-span-4 space-y-4">
            {/* Turnaround Time SLA Card */}
            <div className="glass rounded-2xl p-5 border border-line space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-ink">Turnaround Time (TAT) SLA</h3>
                <span className="text-[10px] font-mono text-amber bg-amber/10 px-1.5 py-0.5 rounded border border-amber/30">
                  +16.5m Over Target
                </span>
              </div>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-extrabold font-mono text-crit">
                  48.5 min
                </span>
                <span className="text-xs font-mono text-inksoft">
                  Target SLA: 32.0 min
                </span>
              </div>

              <div className="h-2 rounded-full bg-obsidian-700/60 overflow-hidden">
                <div
                  className="h-full bg-crit rounded-full"
                  style={{ width: '85%' }}
                />
              </div>

              <p className="text-xs text-inksoft leading-relaxed pt-1">
                Gate 3 optical reader failure is backing up queues onto Arterial Route 4. Rerouting traffic relieves highway spillover.
              </p>
            </div>

            {/* Inbound Arterial Corridors */}
            <div className="glass rounded-2xl p-5 border border-line space-y-3">
              <span className="text-xs font-semibold text-ink block">
                Arterial Highway Corridors
              </span>

              <div className="space-y-2.5">
                {[
                  { name: 'Corridor Route 4 (North Central)', status: 'Choked', delay: '+28m delay', sev: 'crit' },
                  { name: 'Interstate 80 Port Spur', status: 'Moderate', delay: '+8m delay', sev: 'warn' },
                  { name: 'Harbor Belt Rail Crossing', status: 'Clear', delay: 'Nominal', sev: 'ok' },
                  { name: 'West Commercial Bypass', status: 'Clear', delay: 'Nominal', sev: 'ok' }
                ].map((corridor) => (
                  <div
                    key={corridor.name}
                    className="p-3 rounded-xl bg-obsidian-800/40 border border-line flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-ink">{corridor.name}</div>
                      <div className="text-[10.5px] font-mono text-inksoft">{corridor.delay}</div>
                    </div>
                    <Badge variant={corridor.sev} size="sm">
                      {corridor.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Reroute Confirmation Modal */}
        {modalGate && (
          <Modal
            isOpen={!!modalGate}
            onClose={() => setModalGate(null)}
            title={`Reroute Commercial Traffic: ${modalGate.name}`}
            subtitle={`Current queue: ${modalGate.queue} trucks · Estimated wait: ${modalGate.waitMin} min`}
            footer={
              <>
                <button
                  onClick={() => setModalGate(null)}
                  className="px-4 py-2 rounded-lg text-xs text-inksoft hover:text-ink transition-colors font-mono"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={buttonPressInteraction}
                  onClick={confirmReroute}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand text-white hover:bg-brand-deep transition-all shadow-[0_0_14px_rgba(59,124,246,0.35)] font-mono"
                >
                  Authorize Diversion
                </motion.button>
              </>
            }
          >
            <div className="space-y-4 text-xs text-inksoft">
              <p>
                Diverting traffic transmits automated reroute instructions to drayage telematics and variable message signs (VMS) for the 4-hour relief window.
              </p>

              <div>
                <label className="text-xs font-semibold text-ink block mb-2 font-mono">
                  Select Diversion Target Gate:
                </label>
                <div className="space-y-2">
                  {gatesList
                    .filter((g) => g.id !== modalGate.id)
                    .map((target) => (
                      <label
                        key={target.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          diversionTarget === target.id
                            ? 'border-brand bg-brand/15 text-ink'
                            : 'border-line glass hover:border-lineSoft'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="diversionSelect"
                            value={target.id}
                            checked={diversionTarget === target.id}
                            onChange={() => setDiversionTarget(target.id)}
                            className="accent-brand"
                          />
                          <div>
                            <div className="text-xs font-semibold text-ink">{target.name}</div>
                            <div className="text-[10.5px] font-mono text-inksoft mt-0.5">
                              Queue: {target.queue} trucks · Wait: ~{target.waitMin}m
                            </div>
                          </div>
                        </div>

                        <Badge variant={target.status === 'ok' ? 'ok' : 'warn'} size="sm">
                          {target.status === 'ok' ? 'Recommended' : 'Moderate'}
                        </Badge>
                      </label>
                    ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-brand/5 border border-brand/30 text-[11px] text-ink leading-relaxed font-sans">
                <b>Modeled Impact:</b> Relieves ~24 drayage trucks from {modalGate.name}, reducing turn time from {modalGate.waitMin}m to under 30 minutes.
              </div>
            </div>
          </Modal>
        )}

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="fixed bottom-6 right-6 z-50 glass-strong border-l-4 border-ok rounded-xl p-4 shadow-2xl text-xs text-ink flex items-center gap-3 font-mono"
            >
              <span className="w-2 h-2 rounded-full bg-ok animate-pulseDot flex-none" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
