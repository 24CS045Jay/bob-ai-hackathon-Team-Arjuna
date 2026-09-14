import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { ALERTS } from '../data/alerts.mock.js'
import { useRole } from '../context/RoleContext.jsx'
import Badge from '../components/common/Badge.jsx'
import Input from '../components/common/Input.jsx'
import { listItemVariants, buttonPressInteraction } from '../utils/motion.js'

export default function AlertsPage() {
  const { can, logAction, activeRole } = useRole()
  const [alertsList] = useState(ALERTS)
  const [acked, setAcked] = useState({})
  const [sevFilter, setSevFilter] = useState('all') // 'all' | 'red' | 'amber' | 'blue'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const canAck = can('ackAlert')

  const handleAck = (alert) => {
    if (!canAck) return
    setAcked((prev) => ({ ...prev, [alert.id]: true }))
    logAction({
      action: 'ALERT_ACKNOWLEDGED',
      target: `Alert #${alert.id} (${alert.zone || 'Port Area'})`,
      details: alert.msg
    })
  }

  const handleBulkAck = () => {
    if (!canAck) return
    const newAcked = { ...acked }
    filtered.forEach((a) => {
      newAcked[a.id] = true
    })
    setAcked(newAcked)
    logAction({
      action: 'ALERT_ACKNOWLEDGED',
      target: `Bulk Operational Exceptions (${filtered.length} items)`,
      details: `Bulk acknowledgment confirmed by ${activeRole?.title}`
    })
  }

  const filtered = alertsList.filter((a) => {
    if (sevFilter !== 'all' && a.sev !== sevFilter) return false
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false
    if (searchQuery.trim()) {
      const match = (a.msg + (a.zone || '') + (a.rootCause || '') + (a.meta || ''))
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      if (!match) return false
    }
    return true
  })

  const activeCount = alertsList.length - Object.keys(acked).length
  const critCount = alertsList.filter((a) => a.sev === 'red' && !acked[a.id]).length

  return (
    <AppShell crumb="Alerts &amp; Operational Exceptions">
      <div className="space-y-5 max-w-[1680px] mx-auto select-none font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Live Exception Feed
              </span>
              <span className="text-xs text-inksoft font-medium">
                Quayside, Gate, Intermodal &amp; Vessel Exceptions
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Operational Exceptions &amp; Demurrage Warnings
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-line text-xs font-semibold">
              <span className="text-inksoft">Unacknowledged:</span>
              <span className="text-ink font-bold">{activeCount}</span>
              <span className="text-line">•</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">{critCount} Critical</span>
            </div>

            {canAck && activeCount > 0 && (
              <motion.button
                whileTap={buttonPressInteraction}
                onClick={handleBulkAck}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-[#0085db] text-white hover:bg-[#0074c2] transition-all cursor-pointer shadow-xs"
              >
                Acknowledge Filtered ({filtered.length})
              </motion.button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-surface rounded-3xl p-5 border border-line shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Severity Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All Severities' },
                { id: 'red', label: 'Critical' },
                { id: 'amber', label: 'Elevated' },
                { id: 'blue', label: 'Informational' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSevFilter(s.id)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    sevFilter === s.id
                      ? 'bg-[#0085db] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-inksoft hover:text-ink'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="w-full md:w-80">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by zone, vessel, or cause…"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs pt-2 border-t border-line scrollbar-none">
            <span className="text-inksoft font-bold text-xs mr-1 uppercase">Terminal Unit:</span>
            {[
              { id: 'all', label: 'All Units' },
              { id: 'gate', label: 'Drayage Gates' },
              { id: 'vessel', label: 'Vessel AIS' },
              { id: 'crane', label: 'Quay Cranes' },
              { id: 'rail', label: 'Intermodal Rail' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-sky-100 dark:bg-sky-950/60 text-[#0085db] font-bold border border-sky-200 dark:border-sky-800'
                    : 'text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Grid */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-surface rounded-3xl p-12 text-center text-xs sm:text-sm text-inksoft border border-line font-medium shadow-xs"
              >
                No operational exceptions match current filter parameters.
              </motion.div>
            ) : (
              filtered.map((alert) => {
                const isAcknowledged = !!acked[alert.id]
                const isCrit = alert.sev === 'red'
                const isWarn = alert.sev === 'amber'

                return (
                  <motion.div
                    key={alert.id}
                    variants={listItemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`bg-surface rounded-3xl p-6 border transition-all flex flex-col md:flex-row md:items-start justify-between gap-5 shadow-xs ${
                      isAcknowledged
                        ? 'opacity-40 border-line'
                        : isCrit
                        ? 'border-rose-200 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/10'
                        : isWarn
                        ? 'border-amber-200 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10'
                        : 'border-line hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`rounded-full flex-none ${
                            isCrit
                              ? 'w-2.5 h-2.5 bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950/50'
                              : isWarn
                              ? 'w-2.5 h-2.5 bg-amber-500'
                              : 'w-2.5 h-2.5 bg-[#0085db]'
                          }`}
                        />
                        <Badge
                          variant={isCrit ? 'crit' : isWarn ? 'warn' : 'brand'}
                          size="sm"
                        >
                          {isCrit ? 'Critical Exception' : isWarn ? 'Elevated Risk' : 'Standard Advisory'}
                        </Badge>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-ink border border-line">
                          {alert.category?.toUpperCase() || 'GENERAL'}
                        </span>
                        {alert.zone && (
                          <span className="text-xs font-bold text-[#0085db] bg-sky-50 dark:bg-sky-950/50 px-2.5 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
                            {alert.zone}
                          </span>
                        )}
                        <span className="text-xs text-inksoft font-medium ml-auto md:ml-2">
                          {alert.meta}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-ink leading-snug">
                        {alert.msg}
                      </h4>

                      {alert.rootCause && (
                        <div className="text-xs sm:text-sm text-inksoft leading-relaxed pt-0.5">
                          <b className="text-ink font-semibold">Root Cause:</b> {alert.rootCause}
                        </div>
                      )}

                      {alert.resolution && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-line text-xs flex items-start gap-2">
                          <span className="text-xs font-bold text-[#0085db] flex-none">Resolution:</span>
                          <span className="text-ink font-medium leading-relaxed">{alert.resolution}</span>
                        </div>
                      )}
                    </div>

                    {/* Acknowledge Button Gated by Role */}
                    <div className="flex-none flex items-center md:flex-col justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-line">
                      {canAck ? (
                        <motion.button
                          whileTap={buttonPressInteraction}
                          onClick={() => handleAck(alert)}
                          disabled={isAcknowledged}
                          className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                            isAcknowledged
                              ? 'border-emerald-300 text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-default'
                              : 'bg-[#0085db] hover:bg-[#0074c2] text-white border-transparent shadow-sm'
                          }`}
                        >
                          {isAcknowledged ? 'Acknowledged ✓' : 'Acknowledge'}
                        </motion.button>
                      ) : (
                        <span
                          title="Read-only perspective: Acknowledgment requires Shift Supervisor or Admin privilege"
                          className="text-xs font-semibold text-inksoft/50 border border-line px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 cursor-not-allowed"
                        >
                          Read Only ({activeRole?.tag})
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  )
}
