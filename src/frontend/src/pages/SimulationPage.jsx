import { useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { useRole } from '../context/RoleContext.jsx'
import Badge from '../components/common/Badge.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

export default function SimulationPage() {
  const { simulateDisruption, applyDiversion, routingRecommendations } = useOperationalContext()
  const { can, logAction, activeRole } = useRole()
  const [type, setType] = useState('Gate closure')
  const [severity, setSeverity] = useState('Moderate')
  const [zone, setZone] = useState('Gate 3 (Central Heavy)')
  const [durationHours, setDurationHours] = useState('4')
  const [running, setRunning] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [result, setResult] = useState({
    delayHours: 3.2,
    affectedVessels: 3,
    containersImpacted: 1420,
    financialCost: 52400,
    mitigation: 'Reroute Gate 3 drayage traffic to Gate 2 and prioritize Berth 4 clearance before evening tidal window.',
    steps: [
      'Simulating physical port model with 4-hour Gate 3 disruption…',
      'Propagating truck queue overflow onto Arterial Route 4 (+38 trucks)…',
      'Calculating delayed export container drop-offs for Berth 4 (MV Kestrel Bay)…',
      'Synthesizing operational mitigation buffer.'
    ]
  })
  const [mitigationApplied, setMitigationApplied] = useState(false)

  const canApply = can('applyRecommendation')

  const runSimulation = () => {
    setRunning(true)
    setResult(null)
    setStepIndex(0)
    setMitigationApplied(false)

    const steps = [
      `Simulating port twin with ${severity.toLowerCase()} ${type.toLowerCase()} at ${zone}…`,
      'Evaluating drayage queue propagation and turnaround SLA…',
      'Modeling quayside berth laytime shifts and tidal window constraints…',
      'Generating dispatch recommendations.'
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      if (currentStep < steps.length) {
        setStepIndex(currentStep)
      } else {
        clearInterval(interval)
        const delay = severity === 'Severe' ? 6.5 : severity === 'Moderate' ? 3.2 : 1.2
        const vessels = severity === 'Severe' ? 5 : severity === 'Moderate' ? 3 : 1
        const teus = severity === 'Severe' ? 2850 : severity === 'Moderate' ? 1420 : 450
        const cost = severity === 'Severe' ? 118000 : severity === 'Moderate' ? 52400 : 18500

        setResult({
          delayHours: delay,
          affectedVessels: vessels,
          containersImpacted: teus,
          financialCost: cost,
          mitigation: `Execute temporary diversion from ${zone} and throttle non-critical crane transfers during the ${durationHours}h disruption window.`,
          steps
        })
        setRunning(false)

        // Inject real disruption into operational state
        simulateDisruption({ type, zone, severity, durationHours: Number(durationHours) })

        logAction({
          action: 'SIMULATION_EXECUTED',
          target: `${type} @ ${zone}`,
          details: `Modeled ${severity} scenario for ${durationHours}h: predicted +${delay}h delay, $${cost.toLocaleString()} exposure.`
        })
      }
    }, 350)
  }

  const applyMitigation = () => {
    if (!canApply || !result) return
    setMitigationApplied(true)

    // Apply matching diversion if available
    const matchingRec = routingRecommendations.find((r) => r.type === 'gate_reroute' || r.type === 'vessel_diversion')
    if (matchingRec) {
      applyDiversion(matchingRec.id)
    }

    logAction({
      action: 'RECOMMENDATION_APPLIED',
      target: `Simulation Mitigation (${zone})`,
      details: result.mitigation
    })
  }

  return (
    <AppShell crumb="Scenario Simulation Builder">
      <div className="space-y-4 max-w-[1680px] mx-auto select-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass p-4 sm:p-5 rounded-2xl border border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                What-If Digital Twin
              </span>
              <span className="text-xs text-inksoft font-mono">
                Discrete Operational Simulation Model
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              Disruption Projection &amp; Downstream Impact Builder
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-inksoft">Model Status:</span>
            <span className="text-xs font-mono font-semibold text-ok px-2.5 py-1 rounded-full bg-ok/10 border border-ok/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulseDot" />
              Twin Synchronized
            </span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Configuration Form */}
          <div className="lg:col-span-4 glass rounded-2xl p-5 sm:p-6 border border-line space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">
                Configure Scenario
              </h3>
              <p className="text-xs text-inksoft">
                Inject operational disruptions into the digital twin to forecast bottlenecks before shifting equipment.
              </p>
            </div>

            <div className="space-y-3.5 pt-2 text-xs">
              <div>
                <label className="text-inksoft font-medium block mb-1.5 font-mono text-[11px] uppercase">
                  Incident Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full glass border border-line rounded-xl px-3 py-2.5 text-xs text-ink bg-obsidian-800 focus:outline-none focus:border-brand/60 font-sans"
                >
                  <option>Gate closure</option>
                  <option>Crane failure</option>
                  <option>Weather &amp; Channel Fog delay</option>
                  <option>Rail intermodal rake delay</option>
                  <option>Labor gang shift shortage</option>
                </select>
              </div>

              <div>
                <label className="text-inksoft font-medium block mb-1.5 font-mono text-[11px] uppercase">
                  Severity Scope
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full glass border border-line rounded-xl px-3 py-2.5 text-xs text-ink bg-obsidian-800 focus:outline-none focus:border-brand/60 font-sans"
                >
                  <option>Minor (1–2h localized delay)</option>
                  <option>Moderate (3–5h multi-zone cascade)</option>
                  <option>Severe (6h+ laytime &amp; demurrage breach)</option>
                </select>
              </div>

              <div>
                <label className="text-inksoft font-medium block mb-1.5 font-mono text-[11px] uppercase">
                  Terminal Zone
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full glass border border-line rounded-xl px-3 py-2.5 text-xs text-ink bg-obsidian-800 focus:outline-none focus:border-brand/60 font-sans"
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
                <label className="text-inksoft font-medium block mb-1.5 font-mono text-[11px] uppercase">
                  Disruption Window
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['2', '4', '8'].map((hr) => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => setDurationHours(hr)}
                      className={`py-2 rounded-xl border text-xs font-mono font-semibold transition-all ${
                        durationHours === hr
                          ? 'bg-brand text-white border-brand shadow-[0_0_10px_rgba(59,124,246,0.3)]'
                          : 'glass border-line text-inksoft hover:text-ink hover:border-lineSoft'
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
                className="w-full mt-4 bg-brand hover:bg-brand-deep text-white text-xs font-bold py-3 rounded-xl shadow-[0_0_18px_rgba(59,124,246,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-mono"
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
          <div className="lg:col-span-8 space-y-4">
            <div className="glass rounded-2xl p-5 sm:p-6 border border-line space-y-5">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Simulation Projection vs. Active Baseline
                  </h3>
                  <p className="text-xs text-inksoft">
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
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto" />
                  <div className="text-xs font-mono text-brand-glow">
                    Step {stepIndex + 1} of 4: {result?.steps?.[stepIndex] || 'Simulating physical twin model…'}
                  </div>
                  <p className="text-[11px] text-inksoft max-w-sm mx-auto">
                    Computing laytime demurrage, drayage bottlenecks, and container buffer shifts.
                  </p>
                </div>
              )}

              {/* Results View */}
              {result && !running && (
                <div className="space-y-5 animate-fadeUp">
                  {/* High Level Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl glass border border-line">
                      <span className="text-[10px] font-mono text-inksoft uppercase block mb-1">
                        Predicted Delay
                      </span>
                      <span className="text-2xl font-extrabold font-mono text-crit">
                        +{result.delayHours}h
                      </span>
                      <span className="text-[9.5px] font-mono text-inksoft block mt-0.5">
                        Baseline: 0.0h
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl glass border border-line">
                      <span className="text-[10px] font-mono text-inksoft uppercase block mb-1">
                        Vessels Affected
                      </span>
                      <span className="text-2xl font-extrabold font-mono text-amber">
                        {result.affectedVessels}
                      </span>
                      <span className="text-[9.5px] font-mono text-inksoft block mt-0.5">
                        Laytime extended
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl glass border border-line">
                      <span className="text-[10px] font-mono text-inksoft uppercase block mb-1">
                        TEU Backlog
                      </span>
                      <span className="text-2xl font-extrabold font-mono text-ink">
                        {result.containersImpacted.toLocaleString()}
                      </span>
                      <span className="text-[9.5px] font-mono text-inksoft block mt-0.5">
                        Containers queued
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl glass border border-line">
                      <span className="text-[10px] font-mono text-inksoft uppercase block mb-1">
                        Financial Impact
                      </span>
                      <span className="text-2xl font-extrabold font-mono text-crit">
                        ${result.financialCost.toLocaleString()}
                      </span>
                      <span className="text-[9.5px] font-mono text-inksoft block mt-0.5">
                        Demurrage + Idle cost
                      </span>
                    </div>
                  </div>

                  {/* Causality Step Projection Chain */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-ink block font-mono">
                      Downstream Propagation Sequence
                    </span>
                    <div className="space-y-1.5 text-xs font-mono">
                      {result.steps.map((st, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-obsidian-800/40 border border-line/60 flex items-center gap-2.5 text-ink/80"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-glow flex-none" />
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mitigation Action Box */}
                  <div className="p-4 rounded-xl bg-brand/5 border border-brand/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-brand-glow font-bold mb-0.5">
                        Operational Recommendation
                      </div>
                      <p className="text-xs text-ink font-medium leading-relaxed font-sans">
                        {result.mitigation}
                      </p>
                    </div>

                    {canApply ? (
                      <motion.button
                        whileTap={buttonPressInteraction}
                        onClick={applyMitigation}
                        disabled={mitigationApplied}
                        className={`flex-none text-xs font-semibold px-4 py-2 rounded-lg border transition-all font-mono ${
                          mitigationApplied
                            ? 'border-ok/40 bg-ok/10 text-ok cursor-default'
                            : 'bg-brand hover:bg-brand-deep text-white border-brand shadow-[0_0_12px_rgba(59,124,246,0.35)]'
                        }`}
                      >
                        {mitigationApplied ? 'Mitigation Enacted ✓' : 'Enact Mitigation Plan'}
                      </motion.button>
                    ) : (
                      <span
                        title="Role permission: Current perspective cannot enact operational recommendations"
                        className="flex-none text-[11px] font-mono text-inksoft/40 border border-line/40 px-3 py-1.5 rounded-lg cursor-not-allowed"
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
