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
      <div className="space-y-5 max-w-[1680px] mx-auto select-none font-sans">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Landside Traffic Flow
              </span>
              <span className="text-xs text-inksoft font-medium">
                OCR Gates • RFID Turnaround Telemetry • Inbound Arterials
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Gate Portals &amp; Drayage Turnaround Control
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-line">
            <span className="text-xs font-semibold text-inksoft">Mean Gate Turnaround:</span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900">
              {GATE_SUMMARY.overallAvgWaitMin} min (SLA &lt; {GATE_SUMMARY.tatTargetMin}m)
            </span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Gate Cards Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs font-bold text-inksoft uppercase tracking-wider px-1">
              Access Portals ({gatesList.length} Active Corridors)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gatesList.map((g) => {
                const isCrit = g.status === 'crit'
                const isWarn = g.status === 'warn'
                const hasRerouted = !!rerouted[g.id]

                return (
                  <div
                    key={g.id}
                    className={`rounded-3xl border p-5 transition-all flex flex-col justify-between bg-surface shadow-xs ${
                      isCrit
                        ? 'border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20'
                        : isWarn
                        ? 'border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20'
                        : 'border-line hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-bold text-ink truncate pr-2">
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
                      <div className="grid grid-cols-2 gap-3 mb-3.5">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                          <span className="text-xs font-bold text-inksoft block mb-1">
                            Queued Trucks
                          </span>
                          <span
                            className={`text-2xl font-extrabold ${
                              isCrit ? 'text-rose-600 dark:text-rose-400' : isWarn ? 'text-amber-600 dark:text-amber-400' : 'text-ink'
                            }`}
                          >
                            {g.queue}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                          <span className="text-xs font-bold text-inksoft block mb-1">
                            Estimated Wait
                          </span>
                          <span
                            className={`text-2xl font-extrabold ${
                              isCrit ? 'text-rose-600 dark:text-rose-400' : isWarn ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            ~{g.waitMin}m
                          </span>
                        </div>
                      </div>

                      {/* Lane & OCR Telemetry */}
                      <div className="space-y-2 text-xs text-inksoft mb-4">
                        <div className="flex justify-between font-medium">
                          <span>OCR Scanner State:</span>
                          <span
                            className={`font-bold ${
                              g.ocrStatus === 'degraded'
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {g.ocrStatus.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Active Lanes:</span>
                          <span className="text-ink font-semibold">
                            {g.lanesOpen} of {g.lanesTotal} open
                          </span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Throughput:</span>
                          <span className="text-[#0085db] font-bold">
                            {g.throughputPerHour} trucks/hr
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-line flex items-center justify-between">
                      {hasRerouted ? (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          Active Diversion Enabled ✓
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-inksoft">
                          TAT: {g.avgTatMin} min
                        </span>
                      )}

                      <motion.button
                        whileTap={buttonPressInteraction}
                        onClick={() => openRerouteModal(g)}
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                          isCrit
                            ? 'bg-rose-500 text-white border-transparent hover:bg-rose-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 border-line text-ink hover:bg-slate-200 dark:hover:bg-slate-700'
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
          <div className="lg:col-span-4 space-y-5">
            {/* Turnaround Time SLA Card */}
            <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">Turnaround Time (TAT) SLA</h3>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  +16.5m Over Target
                </span>
              </div>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                  48.5 min
                </span>
                <span className="text-xs font-semibold text-inksoft">
                  Target SLA: 32.0 min
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: '85%' }}
                />
              </div>

              <p className="text-xs text-inksoft leading-relaxed pt-1 font-medium">
                Gate 3 optical reader failure is backing up queues onto Arterial Route 4. Rerouting traffic relieves highway spillover.
              </p>
            </div>

            {/* Inbound Arterial Corridors */}
            <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-4">
              <span className="text-sm font-bold text-ink block">
                Arterial Highway Corridors
              </span>

              <div className="space-y-3">
                {[
                  { name: 'Corridor Route 4 (North Central)', status: 'Choked', delay: '+28m delay', sev: 'crit' },
                  { name: 'Interstate 80 Port Spur', status: 'Moderate', delay: '+8m delay', sev: 'warn' },
                  { name: 'Harbor Belt Rail Crossing', status: 'Clear', delay: 'Nominal', sev: 'ok' },
                  { name: 'West Commercial Bypass', status: 'Clear', delay: 'Nominal', sev: 'ok' }
                ].map((corridor) => (
                  <div
                    key={corridor.name}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-ink">{corridor.name}</div>
                      <div className="text-xs text-inksoft font-medium">{corridor.delay}</div>
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
            subtitle={`Current queue: ${modalGate.queue} trucks • Estimated wait: ${modalGate.waitMin} min`}
            footer={
              <>
                <button
                  onClick={() => setModalGate(null)}
                  className="px-4 py-2 rounded-xl text-xs text-inksoft hover:text-ink transition-colors font-semibold"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={buttonPressInteraction}
                  onClick={confirmReroute}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0085db] text-white hover:bg-[#0074c2] transition-all shadow-md cursor-pointer"
                >
                  Authorize Diversion
                </motion.button>
              </>
            }
          >
            <div className="space-y-4 text-xs text-inksoft font-medium">
              <p>
                Diverting traffic transmits automated reroute instructions to drayage telematics and variable message signs (VMS) for the 4-hour relief window.
              </p>

              <div>
                <label className="text-xs font-bold text-ink block mb-2">
                  Select Diversion Target Gate:
                </label>
                <div className="space-y-2.5">
                  {gatesList
                    .filter((g) => g.id !== modalGate.id)
                    .map((target) => (
                      <label
                        key={target.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          diversionTarget === target.id
                            ? 'border-[#0085db] bg-sky-50 dark:bg-sky-950/40 text-ink ring-1 ring-[#0085db]/20'
                            : 'border-line bg-surface hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="diversionSelect"
                            value={target.id}
                            checked={diversionTarget === target.id}
                            onChange={() => setDiversionTarget(target.id)}
                            className="accent-[#0085db]"
                          />
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-ink">{target.name}</div>
                            <div className="text-xs text-inksoft mt-0.5">
                              Queue: {target.queue} trucks • Wait: ~{target.waitMin}m
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

              <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 text-xs text-ink leading-relaxed">
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
              className="fixed bottom-6 right-6 z-50 bg-surface border-l-4 border-emerald-500 rounded-2xl p-4 shadow-2xl text-xs text-ink flex items-center gap-3 font-semibold border border-line"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping flex-none" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
