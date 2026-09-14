import { useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { useRole } from '../context/RoleContext.jsx'
import Badge from '../components/common/Badge.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

export default function SimulationPage() {
  const { applyDiversion } = useOperationalContext()
  const { can, activeRole, logAction } = useRole()

  const [type, setType] = useState('Gate closure')
  const [severity, setSeverity] = useState('Moderate (3–5h multi-zone cascade)')
  const [zone, setZone] = useState('Gate 3 (Central Heavy)')
  const [durationHours, setDurationHours] = useState('4')
  const [running, setRunning] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [mitigationApplied, setMitigationApplied] = useState(false)

  const canApply = can('applyRecommendation')

  const runSimulation = () => {
    setRunning(true)
    setResult(null)
    setMitigationApplied(false)
    setStepIndex(0)

    // Progressive causality animation
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= 3) {
          clearInterval(interval)
          setRunning(false)
          setResult(generateSimulationOutcome())
          return 3
        }
        return prev + 1
      })
    }, 600)

    logAction({
      action: 'SIMULATION_EXECUTED',
      target: `${type} @ ${zone}`,
      details: `Executed ${durationHours}h disruption model with ${severity}.`
    })
  }

  const generateSimulationOutcome = () => {
    const hours = parseInt(durationHours, 10) || 4
    const isGate = type.toLowerCase().includes('gate')
    const isCrane = type.toLowerCase().includes('crane')

    return {
      delayHours: (hours * 1.35).toFixed(1),
      affectedVessels: isCrane ? 3 : 1,
      containersImpacted: hours * 215,
      financialCost: hours * 14850,
      steps: [
        `01: Initial disruption localized at ${zone} reduces throughput by 65%.`,
        `02: Inbound drayage trucks backlog onto Arterial Route 4 (+${hours * 8} vehicles queued).`,
        `03: Quayside STS crane gang idle rate increases by 24% awaiting container pickup.`,
        `04: Estimated charter demurrage penalty threshold breached at T+${hours}h.`
      ],
      mitigation: isGate
        ? 'Reroute incoming drayage to Gate 2 and extend Gate 1 operating window by 2 hours.'
        : isCrane
        ? 'Reassign standby Crane C-06 from Berth 5 to relieve working queue.'
        : 'Authorize anchorage tidal window hold until high water transit at 14:00 UTC.'
    }
  }

  const applyMitigation = () => {
    if (!canApply) return
    setMitigationApplied(true)
    applyDiversion('rec-01')
    logAction({
      action: 'SIMULATION_MITIGATION_APPLIED',
      target: zone,
      details: `Operator enacted recommended mitigation scenario for ${type}.`
    })
  }

  return (
    <AppShell crumb="Scenario Simulation Builder">
      <div className="space-y-5 max-w-[1680px] mx-auto select-none font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                What-If Digital Twin
              </span>
              <span className="text-xs text-inksoft font-medium">
                Discrete Operational Simulation Model
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Disruption Projection &amp; Downstream Impact Builder
            </h2>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-line">
            <span className="text-xs font-semibold text-inksoft">Model Status:</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Twin Synchronized
            </span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Configuration Form */}
          <div className="lg:col-span-4 bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-ink mb-1">
                Configure Scenario
              </h3>
              <p className="text-xs text-inksoft leading-relaxed">
                Inject operational disruptions into the digital twin to forecast bottlenecks before shifting equipment.
              </p>
            </div>

            <div className="space-y-4 pt-2 text-xs">
              <div>
                <label className="text-xs font-bold text-ink block mb-1.5 uppercase tracking-wider">
                  Incident Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-[#0085db]"
                >
                  <option>Gate closure</option>
                  <option>Crane failure</option>
                  <option>Weather &amp; Channel Fog delay</option>
                  <option>Rail intermodal rake delay</option>
                  <option>Labor gang shift shortage</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5 uppercase tracking-wider">
                  Severity Scope
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-[#0085db]"
                >
                  <option>Minor (1–2h localized delay)</option>
                  <option>Moderate (3–5h multi-zone cascade)</option>
                  <option>Severe (6h+ laytime &amp; demurrage breach)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5 uppercase tracking-wider">
                  Terminal Zone
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-[#0085db]"
                >
                  <option>Gate 3 (Central Heavy)</option>
                  <option>Gate 5 (South Pier Access)</option>
                  <option>Berth 5–6 Quayside</option>
                  <option>Berth 1 (Deepwater Terminal)</option>
                  <option>Rail Yard R2 Intermodal Portal</option>
                  <option>Fairway Navigation Channel</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5 uppercase tracking-wider">
                  Disruption Window
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['2', '4', '8'].map((hr) => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => setDurationHours(hr)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        durationHours === hr
                          ? 'bg-[#0085db] text-white border-transparent shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-line text-inksoft hover:text-ink'
                      }`}
                    >
                      {hr} Hours
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={buttonPressInteraction}
                type="button"
                onClick={runSimulation}
                disabled={running}
                className="w-full mt-4 bg-[#0085db] hover:bg-[#0074c2] text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {running ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Computing Twin Ripple…</span>
                  </>
                ) : (
                  <>
                    <span>Run Scenario Projection</span>
                    <span>▶</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Right Column: Simulation Results */}
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <h3 className="text-base font-bold text-ink">
                    Simulation Projection vs. Active Baseline
                  </h3>
                  <p className="text-xs text-inksoft mt-0.5">
                    Downstream operational delta modeled against quayside and gate schedules.
                  </p>
                </div>
                {result && !running && (
                  <Badge variant={result.delayHours > 4 ? 'crit' : 'warn'} size="sm">
                    Projection Complete
                  </Badge>
                )}
              </div>

              {/* Running State */}
              {running && (
                <div className="py-14 px-4 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-3 border-[#0085db] border-t-transparent animate-spin mx-auto" />
                  <div className="text-xs font-bold text-[#0085db]">
                    Step {stepIndex + 1} of 4: {result?.steps?.[stepIndex] || 'Simulating physical twin model…'}
                  </div>
                  <p className="text-xs text-inksoft max-w-sm mx-auto font-medium">
                    Computing laytime demurrage, drayage bottlenecks, and container buffer shifts.
                  </p>
                </div>
              )}

              {/* Results View */}
              {result && !running && (
                <div className="space-y-5">
                  {/* High Level Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                      <span className="text-xs font-bold text-inksoft uppercase block mb-1">
                        Predicted Delay
                      </span>
                      <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                        +{result.delayHours}h
                      </span>
                      <span className="text-[11px] text-inksoft font-medium block mt-0.5">
                        Baseline: 0.0h
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                      <span className="text-xs font-bold text-inksoft uppercase block mb-1">
                        Vessels Affected
                      </span>
                      <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                        {result.affectedVessels}
                      </span>
                      <span className="text-[11px] text-inksoft font-medium block mt-0.5">
                        Laytime extended
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                      <span className="text-xs font-bold text-inksoft uppercase block mb-1">
                        TEU Backlog
                      </span>
                      <span className="text-2xl font-extrabold text-ink">
                        {result.containersImpacted.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-inksoft font-medium block mt-0.5">
                        Containers queued
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                      <span className="text-xs font-bold text-inksoft uppercase block mb-1">
                        Financial Impact
                      </span>
                      <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                        ${result.financialCost.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-inksoft font-medium block mt-0.5">
                        Demurrage + Idle cost
                      </span>
                    </div>
                  </div>

                  {/* Causality Step Projection Chain */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Downstream Propagation Sequence
                    </span>
                    <div className="space-y-2 text-xs font-medium">
                      {result.steps.map((st, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-line flex items-center gap-3 text-ink"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#0085db] flex-none" />
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mitigation Action Box */}
                  <div className="p-4.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0085db] mb-1">
                        Operational Recommendation
                      </div>
                      <p className="text-xs sm:text-sm text-ink font-semibold leading-relaxed">
                        {result.mitigation}
                      </p>
                    </div>

                    {canApply ? (
                      <motion.button
                        whileTap={buttonPressInteraction}
                        onClick={applyMitigation}
                        disabled={mitigationApplied}
                        className={`flex-none text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                          mitigationApplied
                            ? 'border-emerald-300 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-default'
                            : 'bg-[#0085db] hover:bg-[#0074c2] text-white border-transparent shadow-md'
                        }`}
                      >
                        {mitigationApplied ? 'Mitigation Enacted ✓' : 'Enact Mitigation Plan'}
                      </motion.button>
                    ) : (
                      <span
                        title="Role permission: Current perspective cannot enact operational recommendations"
                        className="flex-none text-xs font-semibold text-inksoft/50 border border-line px-3.5 py-2 rounded-xl bg-surface cursor-not-allowed"
                      >
                        Action Restricted ({activeRole?.tag})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
