import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRole } from '../../context/RoleContext.jsx'
import Modal from '../common/Modal.jsx'
import Badge from '../common/Badge.jsx'
import { buttonPressInteraction } from '../../utils/motion.js'

const FILTER_TABS = [
  { id: 'ALL', label: 'All Activities' },
  { id: 'PERMISSION_MUTATED', label: 'Permissions' },
  { id: 'GATE_REROUTE', label: 'Gate Reroutes' },
  { id: 'CRANE_REASSIGNED', label: 'Crane Allocation' },
  { id: 'PLAN_APPROVED', label: 'Plan Approvals' },
  { id: 'ALERT_ACKNOWLEDGED', label: 'Alerts' },
  { id: 'ROLE_SWITCHED', label: 'Role Changes' },
]

function formatActionTitle(act = '') {
  const map = {
    PERMISSION_MUTATED: 'Permission Mutated',
    GATE_REROUTE: 'Gate Reroute Dispatched',
    CRANE_REASSIGNED: 'Crane Gang Reassigned',
    PLAN_APPROVED: '72h Operational Plan Approved',
    ALERT_ACKNOWLEDGED: 'Alert Acknowledged',
    ROLE_SWITCHED: 'Station Role Switched',
    SESSION_INITIALIZED: 'Digital Twin Session Initialized',
    SIMULATION_EXECUTED: 'Disruption Simulation Run'
  }
  if (map[act]) return map[act]
  return act
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export default function AuditLogModal() {
  const { isAuditLogOpen, setIsAuditLogOpen, auditLog } = useRole()
  const [filterAction, setFilterAction] = useState('ALL')

  const filtered = filterAction === 'ALL'
    ? auditLog
    : auditLog.filter((item) => item.action === filterAction)

  const roleColors = {
    admin: 'brand',
    shift_supervisor: 'warn',
    berth_planner: 'brand',
    gate_controller: 'ok',
    viewer: 'neutral'
  }

  return (
    <Modal
      isOpen={isAuditLogOpen}
      onClose={() => setIsAuditLogOpen(false)}
      title="Operational Activity & Messages"
      subtitle="Audit ledger tracking operator decisions, overrides, and automated dispatch telemetry"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 font-sans">
        {/* Filter Pills with proper spacing & zero truncation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 px-0.5 scrollbar-thin">
          {FILTER_TABS.map((tab) => (
            <motion.button
              whileTap={buttonPressInteraction}
              key={tab.id}
              onClick={() => setFilterAction(tab.id)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                filterAction === tab.id
                  ? 'bg-[#0085db] text-white shadow-sm ring-2 ring-[#0085db]/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-inksoft hover:text-ink hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Records List */}
        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-inksoft font-medium bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-line">
              No message activity records matching this filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-surface border border-line rounded-2xl shadow-xs hover:border-[#0085db]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-ink tracking-tight">
                      {formatActionTitle(item.action)}
                    </span>
                    <Badge variant={roleColors[item.roleCode] || 'neutral'} size="sm">
                      {item.roleTitle}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-inksoft flex-none bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {item.timestamp}
                  </span>
                </div>

                <div className="text-xs text-inksoft flex items-center gap-1.5 mb-2 font-medium">
                  <span className="text-ink font-semibold">Target Entity:</span>
                  <span className="text-[#0085db] font-bold bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800/50">
                    {item.target.replace(/Tideline/g, 'PortFlow AI')}
                  </span>
                </div>

                <p className="text-xs text-ink leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-line/60 font-normal">
                  {item.details.replace(/Tideline/g, 'PortFlow AI')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
