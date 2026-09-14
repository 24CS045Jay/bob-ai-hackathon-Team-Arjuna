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
  const [alertsList, setAlertsList] = useState(ALERTS)
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
      <div className="space-y-4 max-w-[1680px] mx-auto select-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass p-4 sm:p-5 rounded-2xl border border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                Live Exception Feed
              </span>
              <span className="text-xs text-inksoft font-mono">
                Quayside, Gate, Intermodal &amp; Vessel Exceptions
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              Operational Exceptions &amp; Demurrage Warnings
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-inksoft">Unacknowledged:</span>
              <span className="text-ink font-bold">{activeCount}</span>
              <span className="text-lineSoft">·</span>
              <span className="text-crit font-bold">{critCount} Critical</span>
            </div>

            {canAck && activeCount > 0 && (
              <motion.button
                whileTap={buttonPressInteraction}
                onClick={handleBulkAck}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg glass border border-line hover:border-lineSoft text-ink hover:text-brand-glow transition-all font-mono"
              >
                Acknowledge Filtered ({filtered.length})
              </motion.button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass rounded-2xl p-4 border border-line space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Severity Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All Severities' },
                { id: 'red', label: 'Critical' },
                { id: 'amber', label: 'Elevated' },
                { id: 'blue', label: 'Informational' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSevFilter(s.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                    sevFilter === s.id
                      ? 'bg-brand/20 text-brand-glow border border-brand/40 font-semibold shadow-sm'
                      : 'glass border-line text-inksoft hover:text-ink'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="w-full md:w-72">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by zone, vessel, or cause…"
                mono
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1 border-t border-line/40">
            <span className="text-inksoft font-mono text-[10px] mr-1 uppercase">Terminal Unit:</span>
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
                className={`px-2.5 py-0.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? 'bg-brand/15 text-brand-glow font-semibold border border-brand/30'
                    : 'text-inksoft hover:text-ink hover:bg-obsidian-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Grid */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-2xl p-12 text-center text-xs text-inksoft border border-line"
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
                    className={`glass rounded-2xl p-5 border transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                      isAcknowledged
                        ? 'opacity-40 border-line/40'
                        : isCrit
                        ? 'border-crit/40 bg-crit/[0.03] shadow-[0_0_16px_rgba(229,73,61,0.08)]'
                        : isWarn
                        ? 'border-amber/40 bg-amber/[0.02]'
                        : 'border-line hover:border-lineSoft'
                    }`}
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`rounded-full flex-none ${
                            isCrit
                              ? 'w-2.5 h-2.5 bg-crit animate-critGlow shadow-[0_0_8px_rgba(229,73,61,0.6)]'
                              : isWarn
                              ? 'w-2 h-2 bg-amber'
                              : 'w-2 h-2 bg-brand'
                          }`}
                        />
                        <Badge
                          variant={isCrit ? 'crit' : isWarn ? 'warn' : 'brand'}
                          size="sm"
                        >
                          {isCrit ? 'Critical Exception' : isWarn ? 'Elevated Risk' : 'Standard Advisory'}
                        </Badge>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-800/80 text-ink border border-line">
                          {alert.category?.toUpperCase() || 'GENERAL'}
                        </span>
                        {alert.zone && (
                          <span className="text-[10px] font-mono text-brand-glow bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                            {alert.zone}
                          </span>
                        )}
                        <span className="text-[10.5px] font-mono text-inksoft ml-auto md:ml-2">
                          {alert.meta}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-ink leading-snug">
                        {alert.msg}
                      </h4>

                      {alert.rootCause && (
                        <div className="text-xs text-inksoft leading-relaxed pt-1">
                          <b className="text-ink font-medium">Root Cause:</b> {alert.rootCause}
                        </div>
                      )}

                      {alert.resolution && (
                        <div className="p-2.5 rounded-xl bg-obsidian-800/70 border border-line/50 text-xs text-brand-glow flex items-start gap-2">
                          <span className="font-mono text-[11px] font-bold flex-none">Resolution:</span>
                          <span className="text-ink font-medium">{alert.resolution}</span>
                        </div>
                      )}
                    </div>

                    {/* Acknowledge Button Gated by Role */}
                    <div className="flex-none flex items-center md:flex-col justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-line/40">
                      {canAck ? (
                        <motion.button
                          whileTap={buttonPressInteraction}
                          onClick={() => handleAck(alert)}
                          disabled={isAcknowledged}
                          className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
                            isAcknowledged
                              ? 'border-ok/30 text-ok bg-ok/10 cursor-default'
                              : 'bg-brand/15 hover:bg-brand/25 text-brand-glow border-brand/35 shadow-[0_0_10px_rgba(59,124,246,0.25)]'
                          }`}
                        >
                          {isAcknowledged ? 'Acknowledged ✓' : 'Acknowledge'}
                        </motion.button>
                      ) : (
                        <span
                          title="Read-only perspective: Acknowledgment requires Shift Supervisor or Admin privilege"
                          className="text-[11px] font-mono text-inksoft/40 border border-line/40 px-3 py-1.5 rounded-xl cursor-not-allowed"
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
