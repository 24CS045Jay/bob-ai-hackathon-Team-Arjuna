import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ALERTS } from '../../data/alerts.mock.js'
import { useRole } from '../../context/RoleContext.jsx'
import { listItemVariants, buttonPressInteraction } from '../../utils/motion.js'

export default function AlertsPanel() {
  const { can, logAction } = useRole()
  const [alertsList, setAlertsList] = useState(ALERTS)
  const [acked, setAcked] = useState({})
  const [sevFilter, setSevFilter] = useState('all')

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

  const handleDismiss = (alertId) => {
    setAlertsList((prev) => prev.filter((a) => a.id !== alertId))
  }

  const filteredAlerts = alertsList.filter((a) => {
    if (sevFilter === 'crit') return a.sev === 'red'
    if (sevFilter === 'warn') return a.sev === 'amber'
    return true
  })

  const activeCount = alertsList.length - Object.keys(acked).length

  return (
    <div className="glass rounded-2xl border border-line h-full flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-line flex items-center justify-between bg-obsidian-800/50">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-semibold text-ink">
            Exceptions &amp; Active Alarms
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-crit/15 text-crit border border-crit/30">
            {activeCount} active
          </span>
        </div>
        <Link
          to="/alerts"
          className="text-[11px] text-brand-glow hover:underline font-medium"
        >
          View feed →
        </Link>
      </div>

      {/* Severity Filter Pills */}
      <div className="px-4 py-2 border-b border-line/60 flex items-center gap-1.5 bg-obsidian-900/40 text-[11px]">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'crit', label: 'Critical' },
          { id: 'warn', label: 'Elevated' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSevFilter(f.id)}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
              sevFilter === f.id
                ? 'bg-brand/15 text-brand-glow font-semibold border border-brand/30'
                : 'text-inksoft hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert Feed Items */}
      <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-line/40">
        <AnimatePresence initial={false}>
          {filteredAlerts.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center text-xs text-inksoft"
            >
              No active exceptions for this filter.
            </motion.div>
          ) : (
            filteredAlerts.map((a) => {
              const isAcknowledged = !!acked[a.id]
              const isCritical = a.sev === 'red'

              return (
                <motion.div
                  key={a.id}
                  variants={listItemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    isAcknowledged ? 'opacity-55 bg-obsidian-800/20' : 'hover:bg-obsidian-800/40'
                  }`}
                >
                  {/* Distinct restrained critical glow vs standard dot */}
                  <span
                    className={`flex-none mt-1.5 rounded-full ${
                      isCritical
                        ? 'w-2.5 h-2.5 bg-crit animate-critGlow shadow-[0_0_8px_rgba(229,73,61,0.6)]'
                        : a.sev === 'amber'
                        ? 'w-2 h-2 bg-amber'
                        : 'w-2 h-2 bg-brand'
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono text-inksoft uppercase tracking-wide">
                        {a.category || 'Ops'}
                      </span>
                      {a.zone && (
                        <span className="text-[10px] font-mono text-brand-glow bg-brand/10 px-1 rounded">
                          {a.zone}
                        </span>
                      )}
                    </div>
                    <div className="text-xs leading-snug text-ink font-medium">
                      {a.msg}
                    </div>
                    <div className="text-[10.5px] font-mono text-inksoft mt-1">
                      {a.meta}
                    </div>
                  </div>

                  <div className="flex-none flex items-center gap-1.5">
                    {canAck ? (
                      <motion.button
                        whileTap={buttonPressInteraction}
                        onClick={() => handleAck(a)}
                        disabled={isAcknowledged}
                        className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md border transition-all ${
                          isAcknowledged
                            ? 'border-ok/30 text-ok bg-ok/10'
                            : 'border-line text-inksoft hover:text-ink hover:border-lineSoft hover:bg-obsidian-800'
                        }`}
                      >
                        {isAcknowledged ? 'Acked ✓' : 'Ack'}
                      </motion.button>
                    ) : (
                      <span
                        title="Read-only perspective: Acknowledgment requires Shift Supervisor or Admin privilege"
                        className="text-[10px] font-mono text-inksoft/40 border border-line/40 px-2 py-0.5 rounded cursor-not-allowed"
                      >
                        Read Only
                      </span>
                    )}

                    {isAcknowledged && (
                      <motion.button
                        whileTap={buttonPressInteraction}
                        onClick={() => handleDismiss(a.id)}
                        title="Dismiss acknowledged alarm"
                        aria-label="Dismiss alarm"
                        className="text-inksoft hover:text-crit p-1 rounded hover:bg-obsidian-800 transition-colors text-xs"
                      >
                        ✕
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
