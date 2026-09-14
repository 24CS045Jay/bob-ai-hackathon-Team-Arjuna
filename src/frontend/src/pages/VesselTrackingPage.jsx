import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import Badge from '../components/common/Badge.jsx'
import Input from '../components/common/Input.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

const STAGES = ['Inbound Transit', 'Anchorage Queue', 'Berthed & Working', 'Departed']

export default function VesselTrackingPage() {
  const { vessels, adjustVesselSchedule } = useOperationalContext()
  const [selectedId, setSelectedId] = useState(vessels[0]?.id || 'v-01')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'arriving' | 'queued' | 'docked' | 'departing'

  const selected = vessels.find((v) => v.id === selectedId) || vessels[0]

  // Filter vessels based on query & status
  const filtered = vessels.filter((v) => {
    const matchesQuery =
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v.imo.toLowerCase().includes(query.toLowerCase()) ||
      v.line.toLowerCase().includes(query.toLowerCase()) ||
      v.container.toLowerCase().includes(query.toLowerCase())

    if (!matchesQuery) return false
    if (statusFilter === 'all') return true
    if (statusFilter === 'arriving') return v.stage === 0
    if (statusFilter === 'queued') return v.stage === 1
    if (statusFilter === 'docked') return v.stage === 2
    if (statusFilter === 'departing') return v.stage === 3
    return true
  })

  const trendStyles = {
    on_schedule: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-900', label: 'On Schedule' },
    delayed: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-900', label: 'Delayed Schedule' },
    improving: { text: 'text-[#0085db]', bg: 'bg-sky-50 dark:bg-sky-950/40', border: 'border-sky-200 dark:border-sky-900', label: 'Speeding Up' }
  }

  return (
    <AppShell crumb="Vessel Tracking &amp; Ocean Visibility">
      <div className="space-y-5 max-w-[1680px] mx-auto select-none font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Ocean Visibility Telemetry
              </span>
              <span className="text-xs text-inksoft font-medium">
                Satellite AIS Transponder + Berthing Window Intel
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Vessel Telemetry &amp; Predictive ETA Intelligence
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-inksoft bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-line">
            <span>Tracked Fleet:</span>
            <span className="text-ink font-bold">{vessels.length} Vessels</span>
            <span className="text-line">•</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">2 At Risk</span>
          </div>
        </div>

        {/* Bento Grid: Search & Filter Rail (4 cols) + Dominant Vessel Dossier (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Searchable Vessel List (4 cols) */}
          <div className="lg:col-span-4 bg-surface rounded-3xl border border-line shadow-xs flex flex-col overflow-hidden">
            <div className="p-4 border-b border-line space-y-3 bg-slate-50/70 dark:bg-slate-800/40">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vessel, IMO, line, container…"
              />

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5 scrollbar-none">
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
                    className={`px-3 py-1 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === st.id
                        ? 'bg-[#0085db] text-white shadow-xs'
                        : 'text-inksoft hover:text-ink hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[640px] divide-y divide-line">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-xs text-inksoft font-medium">
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
                      className={`w-full text-left p-4 transition-all flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/40 border-l-4 border-[#0085db] text-ink'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-inksoft'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs sm:text-sm font-bold text-ink truncate">
                            {v.name}
                          </span>
                          {v.transshipment && (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                              Transship
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-inksoft truncate font-medium">
                          {v.imo} • {v.line}
                        </div>
                        <div className="text-[11px] text-inksoft/80 mt-1 font-medium">
                          Container: {v.container}
                        </div>
                      </div>

                      <div className="text-right flex-none">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${trend.bg} ${trend.text} ${trend.border}`}
                        >
                          {v.etaDelta}
                        </span>
                        <div className="text-[11px] text-inksoft font-medium mt-1">
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
          <div className="lg:col-span-8 space-y-5">
            {/* Top Vessel Hero Card */}
            <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-line pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                      {selected.line}
                    </span>
                    <span className="text-xs text-inksoft font-medium">
                      Callsign: {selected.callsign || 'N/A'}
                    </span>
                    <span className="text-xs text-inksoft font-medium">
                      Draft: {selected.draft}m
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                    {selected.name}
                  </h3>
                  <div className="text-xs sm:text-sm text-inksoft font-medium mt-1">
                    IMO: {selected.imo} • Target Container ID: {selected.container}
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
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3.5">
                  <span className="text-rose-600 text-lg flex-none">⚠️</span>
                  <div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide block mb-0.5">
                      Operational Exception Alert
                    </span>
                    <p className="text-xs sm:text-sm text-ink leading-relaxed font-semibold">
                      {selected.exceptionAlert}
                    </p>
                  </div>
                </div>
              )}

              {/* Lifecycle Stage Tracker */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-inksoft">
                  <span className="font-bold text-ink">Vessel Voyage Lifecycle</span>
                  <span className="font-semibold text-[#0085db]">
                    Current Stage: {selected.stage + 1} of 4
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {STAGES.map((st, i) => {
                    const isCompleted = i < selected.stage
                    const isCurrent = i === selected.stage
                    return (
                      <div
                        key={st}
                        className={`p-3 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-sky-50 dark:bg-sky-950/50 border-[#0085db] text-ink shadow-xs ring-1 ring-[#0085db]/20'
                            : isCompleted
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-ink/80'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-line text-inksoft/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isCurrent
                                ? 'bg-[#0085db]'
                                : isCompleted
                                ? 'bg-emerald-500'
                                : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          />
                          <span className="text-[11px] font-bold text-inksoft">Stage {i + 1}</span>
                        </div>
                        <div className="text-xs font-bold leading-tight text-ink">{st}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Route & Quayside Origin/Destination Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line">
                  <span className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1">
                    Port of Origin
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-ink">
                    {selected.origin}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line">
                  <span className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1">
                    Terminal Destination &amp; Berth
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-[#0085db]">
                    {selected.destination} ({selected.berth || 'Anchorage Assignment'})
                  </span>
                </div>
              </div>

              {/* Live Operational Loop: ETA / Delay Shift Controller */}
              <div className="p-4.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#0085db] font-bold block">
                      Live Operational Loop: Voyage Schedule Perturbation
                    </span>
                    <span className="text-xs text-inksoft leading-relaxed">
                      Simulate arrival delay or advance to observe ripple through Congestion, Routing, and 72h Master Plan.
                    </span>
                  </div>

                  <Link
                    to="/congestion"
                    className="text-xs font-bold text-[#0085db] hover:underline whitespace-nowrap flex items-center gap-1"
                  >
                    <span>Observe Downstream Ripple</span>
                    <span>→</span>
                  </Link>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                  <span className="text-xs font-bold text-inksoft uppercase">Inject Schedule Delta:</span>
                  {[
                    { label: '-1.0h Early', delta: -1.0, color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 border-emerald-300' },
                    { label: '+1.5h Delay', delta: 1.5, color: 'text-amber-700 dark:text-amber-300 bg-amber-100/80 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 border-amber-300' },
                    { label: '+3.0h Delay', delta: 3.0, color: 'text-rose-700 dark:text-rose-300 bg-rose-100/80 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 border-rose-300' },
                    { label: '+5.0h Severe', delta: 5.0, color: 'text-rose-800 dark:text-rose-200 font-bold bg-rose-200 hover:bg-rose-300 dark:bg-rose-900 dark:hover:bg-rose-800 border-rose-400' }
                  ].map((btn) => (
                    <motion.button
                      key={btn.label}
                      whileTap={buttonPressInteraction}
                      onClick={() => adjustVesselSchedule(selected.id, btn.delta)}
                      className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer shadow-xs ${btn.color}`}
                    >
                      {btn.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento Sub-row: ETA Intelligence + Dwell Time Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* ETA Confidence & Trend Intelligence */}
              <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-line shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-ink">
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
                    <span className="text-2xl font-extrabold text-ink">
                      {selected.eta || 'At Berth'}
                    </span>
                    <span className="text-xs text-inksoft block mt-1 font-semibold">
                      Schedule Delta: <b className={trendStyles[selected.etaTrend]?.text}>{selected.etaDelta}</b>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-extrabold text-[#0085db]">
                      {selected.confidence || 95}%
                    </span>
                    <span className="text-xs text-inksoft block font-medium">Model Confidence</span>
                  </div>
                </div>

                {/* Confidence Meter */}
                <div className="space-y-1.5">
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-[#0085db] rounded-full transition-all"
                      style={{ width: `${selected.confidence || 95}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-inksoft block font-medium">
                    Historical arrival accuracy within ±20 min: 94.2%
                  </span>
                </div>
              </div>

              {/* Dwell Time & Discharge Operations */}
              <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-line shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-ink">
                    Laytime &amp; Dwell Analytics
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      selected.dwellDays > 2.5
                        ? 'text-rose-600 dark:text-rose-400'
                        : selected.dwellDays > 1.2
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
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
                      className={`text-2xl font-extrabold ${
                        selected.dwellDays > 2.5 ? 'text-rose-600 dark:text-rose-400' : 'text-ink'
                      }`}
                    >
                      {selected.dwellDays} Days
                    </span>
                    <span className="text-xs text-inksoft block mt-1 font-semibold">
                      Total Capacity: {selected.teu.toLocaleString()} TEU
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-extrabold text-ink">
                      {selected.dischargeProgress}%
                    </span>
                    <span className="text-xs text-inksoft block font-medium">Discharge Completed</span>
                  </div>
                </div>

                {/* Discharge Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${selected.dischargeProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-inksoft block font-medium">
                    Assigned Crane: <b className="text-ink font-bold">{selected.craneAssigned}</b>
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
