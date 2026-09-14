import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { STAGES } from '../data/vessels.mock.js'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import Badge from '../components/common/Badge.jsx'
import Input from '../components/common/Input.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

export default function VesselTrackingPage() {
  const { vessels, adjustVesselSchedule } = useOperationalContext()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'arriving' | 'queued' | 'docked' | 'departing'
  const [selectedId, setSelectedId] = useState(null)

  const selected = (selectedId ? vessels.find((v) => v.id === selectedId) : null) || vessels[0]

  const filtered = vessels.filter((v) => {
    const matchesQuery = (
      v.name +
      v.imo +
      v.container +
      v.line +
      (v.callsign || '')
    )
      .toLowerCase()
      .includes(query.toLowerCase())

    if (!matchesQuery) return false
    if (statusFilter === 'all') return true
    if (statusFilter === 'arriving') return v.stage === 0
    if (statusFilter === 'queued') return v.stage === 1
    if (statusFilter === 'docked') return v.stage === 2
    if (statusFilter === 'departing') return v.stage === 3
    return true
  })

  const trendStyles = {
    improving: { text: 'text-ok', bg: 'bg-ok/10', border: 'border-ok/30', label: 'Improving ETA' },
    on_schedule: { text: 'text-brand-glow', bg: 'bg-brand/10', border: 'border-brand/30', label: 'On Schedule' },
    delayed: { text: 'text-crit', bg: 'bg-crit/10', border: 'border-crit/30', label: 'Delayed Schedule' }
  }

  return (
    <AppShell crumb="Vessel Tracking &amp; Ocean Visibility">
      <div className="space-y-4 max-w-[1680px] mx-auto animate-fadeUp select-none">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass p-4 sm:p-5 rounded-2xl border border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                project44 Ocean Visibility
              </span>
              <span className="text-xs text-inksoft font-mono">
                Satellite AIS Transponder + Berthing Window Intel
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              Vessel Telemetry &amp; Predictive ETA Intelligence
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-inksoft">
            <span>Tracked Fleet:</span>
            <span className="text-ink font-bold">{vessels.length} Vessels</span>
            <span className="text-lineSoft">·</span>
            <span className="text-crit font-semibold">2 At Risk</span>
          </div>
        </div>

        {/* Bento Grid: Search & Filter Rail (4 cols) + Dominant Vessel Dossier (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Searchable Vessel List (4 cols) */}
          <div className="lg:col-span-4 glass rounded-2xl border border-line flex flex-col overflow-hidden">
            <div className="p-3.5 border-b border-line space-y-2.5 bg-obsidian-800/40">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vessel, IMO, line, container…"
                mono
              />

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-0.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'arriving', label: 'Arriving' },
                  { id: 'queued', label: 'Queued' },
                  { id: 'docked', label: 'Docked' },
                  { id: 'departing', label: 'Departing' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                      statusFilter === st.id
                        ? 'bg-brand text-white font-semibold shadow-sm'
                        : 'text-inksoft hover:text-ink hover:bg-line/20'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[640px] divide-y divide-line/40">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-xs text-inksoft">
                  No vessels matching query
                </div>
              ) : (
                filtered.map((v) => {
                  const isSelected = selected.id === v.id
                  const trend = trendStyles[v.etaTrend] || trendStyles.on_schedule

                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      className={`w-full text-left p-3.5 transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-brand/15 border-l-2 border-brand text-ink'
                          : 'hover:bg-line/20 text-inksoft'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-semibold text-ink truncate">
                            {v.name}
                          </span>
                          {v.transshipment && (
                            <span className="text-[9px] font-mono text-amber bg-amber/10 px-1 py-0.2 rounded border border-amber/30">
                              Transship
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-inksoft truncate">
                          {v.imo} · {v.line}
                        </div>
                        <div className="text-[10px] font-mono text-inksoft/70 mt-1">
                          Box: {v.container}
                        </div>
                      </div>

                      <div className="text-right flex-none">
                        <span
                          className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${trend.bg} ${trend.text} ${trend.border}`}
                        >
                          {v.etaDelta}
                        </span>
                        <div className="text-[10px] font-mono text-inksoft mt-1">
                          {v.confidence ? `${v.confidence}% conf` : 'Berthed'}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Column: Dominant Vessel Intelligence Dossier (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Top Vessel Hero Card */}
            <div className="glass rounded-2xl p-5 sm:p-6 border border-line space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-line pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                      {selected.line}
                    </span>
                    <span className="text-xs font-mono text-inksoft">
                      Callsign: {selected.callsign || 'N/A'}
                    </span>
                    <span className="text-xs font-mono text-inksoft">
                      Draft: {selected.draft}m
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
                    {selected.name}
                  </h3>
                  <div className="text-xs text-inksoft font-mono mt-0.5">
                    {selected.imo} · Container ID {selected.container}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selected.transshipment && (
                    <Badge variant="warn" size="sm">
                      Urgent Transshipment
                    </Badge>
                  )}
                  <Badge
                    variant={
                      selected.stage === 2 ? 'ok' : selected.stage === 1 ? 'warn' : 'brand'
                    }
                    size="sm"
                    pulse
                  >
                    {STAGES[selected.stage]}
                  </Badge>
                </div>
              </div>

              {/* Exception Alert Banner if present */}
              {selected.exceptionAlert && (
                <div className="p-3.5 rounded-xl bg-crit/10 border border-crit/30 flex items-start gap-3 animate-fadeUp">
                  <span className="text-crit text-base flex-none">⚠️</span>
                  <div>
                    <span className="text-xs font-bold text-crit uppercase font-mono tracking-wide block mb-0.5">
                      Operational Exception Alert
                    </span>
                    <p className="text-xs text-ink/90 leading-relaxed">
                      {selected.exceptionAlert}
                    </p>
                  </div>
                </div>
              )}

              {/* Lifecycle Stage Tracker */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-inksoft">
                  <span className="font-semibold text-ink">Vessel Voyage Lifecycle</span>
                  <span className="font-mono text-[11px]">
                    Current Stage: {selected.stage + 1} of 4
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STAGES.map((st, i) => {
                    const isCompleted = i < selected.stage
                    const isCurrent = i === selected.stage
                    return (
                      <div
                        key={st}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-brand/20 border-brand text-ink shadow-[0_0_12px_rgba(59,124,246,0.3)]'
                            : isCompleted
                            ? 'glass border-ok/30 text-ink/80'
                            : 'glass border-line/40 text-inksoft/40'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCurrent
                                ? 'bg-brand-glow animate-pulseDot'
                                : isCompleted
                                ? 'bg-ok'
                                : 'bg-inksoft/30'
                            }`}
                          />
                          <span className="text-[10px] font-mono">Stage 0{i + 1}</span>
                        </div>
                        <div className="text-xs font-semibold leading-tight">{st}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Route & Quayside Origin/Destination Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl glass border border-line">
                  <span className="text-[10px] font-mono text-inksoft uppercase block mb-1">
                    Port of Origin
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-ink">
                    {selected.origin}
                  </span>
                </div>
                <div className="p-3 rounded-xl glass border border-line">
                  <span className="text-[10px] font-mono text-inksoft uppercase block mb-1">
                    Terminal Destination &amp; Berth
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-brand-glow">
                    {selected.destination} ({selected.berth || 'Anchorage Assignment'})
                  </span>
                </div>
              </div>

              {/* Live Operational Loop: ETA / Delay Shift Controller */}
              <div className="p-3.5 rounded-xl bg-brand/5 border border-brand/25 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-glow font-bold block">
                      Live Operational Loop: Voyage Schedule Perturbation
                    </span>
                    <span className="text-[11px] text-inksoft">
                      Simulate arrival delay/advance to test the reactive ripple through Congestion, Routing, and 72h Master Plan.
                    </span>
                  </div>

                  <Link
                    to="/congestion"
                    className="text-[11px] font-mono text-brand-glow hover:underline whitespace-nowrap flex items-center gap-1"
                  >
                    <span>Observe Downstream Ripple</span>
                    <span>→</span>
                  </Link>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1 font-mono text-xs">
                  <span className="text-[10px] text-inksoft uppercase">Inject Schedule Delta:</span>
                  {[
                    { label: '-1.0h Early', delta: -1.0, color: 'text-ok hover:bg-ok/15 border-ok/30' },
                    { label: '+1.5h Delay', delta: 1.5, color: 'text-amber hover:bg-amber/15 border-amber/30' },
                    { label: '+3.0h Delay', delta: 3.0, color: 'text-crit hover:bg-crit/15 border-crit/30' },
                    { label: '+5.0h Severe', delta: 5.0, color: 'text-crit font-bold hover:bg-crit/20 border-crit/40' }
                  ].map((btn) => (
                    <motion.button
                      key={btn.label}
                      whileTap={buttonPressInteraction}
                      onClick={() => adjustVesselSchedule(selected.id, btn.delta)}
                      className={`px-2.5 py-1 rounded-lg border bg-obsidian-800/80 transition-all cursor-pointer ${btn.color}`}
                    >
                      {btn.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento Sub-row: ETA Intelligence + Dwell Time Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ETA Confidence & Trend Intelligence (Section 6.2) */}
              <div className="glass rounded-2xl p-5 border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">
                    Predicted ETA Intelligence
                  </span>
                  <Badge
                    variant={
                      selected.etaTrend === 'delayed'
                        ? 'crit'
                        : selected.etaTrend === 'improving'
                        ? 'ok'
                        : 'brand'
                    }
                    size="sm"
                  >
                    {trendStyles[selected.etaTrend]?.label || 'On Schedule'}
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-bold font-mono text-ink">
                      {selected.eta || 'At Berth'}
                    </span>
                    <span className="text-xs font-mono text-inksoft block mt-0.5">
                      Schedule Delta: <b className={trendStyles[selected.etaTrend]?.text}>{selected.etaDelta}</b>
                    </span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-lg font-bold text-brand-glow">
                      {selected.confidence || 95}%
                    </span>
                    <span className="text-[10.5px] text-inksoft block">Model Confidence</span>
                  </div>
                </div>

                {/* Confidence Meter */}
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-obsidian-800 border border-line/30 overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all"
                      style={{ width: `${selected.confidence || 95}%` }}
                    />
                  </div>
                  <span className="text-[10.5px] text-inksoft">
                    Historical arrival accuracy within ±20 min: 94.2%
                  </span>
                </div>
              </div>

              {/* Dwell Time & Discharge Operations */}
              <div className="glass rounded-2xl p-5 border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">
                    Laytime &amp; Dwell Analytics
                  </span>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      selected.dwellDays > 2.5
                        ? 'text-crit'
                        : selected.dwellDays > 1.2
                        ? 'text-amber'
                        : 'text-ok'
                    }`}
                  >
                    {selected.dwellDays > 2.5
                      ? 'Demurrage Penalty Active'
                      : selected.dwellDays > 1.2
                      ? 'Approaching Laytime Limit'
                      : 'Laytime Nominal'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span
                      className={`text-2xl font-bold font-mono ${
                        selected.dwellDays > 2.5 ? 'text-crit' : 'text-ink'
                      }`}
                    >
                      {selected.dwellDays} Days
                    </span>
                    <span className="text-xs font-mono text-inksoft block mt-0.5">
                      Total Capacity: {selected.teu.toLocaleString()} TEU
                    </span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-lg font-bold text-ink">
                      {selected.dischargeProgress}%
                    </span>
                    <span className="text-[10.5px] text-inksoft block">Discharge Completed</span>
                  </div>
                </div>

                {/* Discharge Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-obsidian-800 border border-line/30 overflow-hidden">
                    <div
                      className="h-full bg-ok rounded-full transition-all"
                      style={{ width: `${selected.dischargeProgress}%` }}
                    />
                  </div>
                  <span className="text-[10.5px] text-inksoft">
                    Assigned Crane: <b className="text-ink">{selected.craneAssigned}</b>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
