import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRole } from '../../context/RoleContext.jsx'
import Modal from '../common/Modal.jsx'
import Badge from '../common/Badge.jsx'
import { buttonPressInteraction } from '../../utils/motion.js'

export default function AuditLogModal() {
  const { isAuditLogOpen, setIsAuditLogOpen, auditLog } = useRole()
  const [filterAction, setFilterAction] = useState('ALL')

  const actions = [
    'ALL',
    'PERMISSION_MUTATED',
    'GATE_REROUTE',
    'CRANE_REASSIGNED',
    'PLAN_APPROVED',
    'ALERT_ACKNOWLEDGED',
    'ROLE_SWITCHED'
  ]

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
      title="Operational Activity &amp; Terminal Messages"
      subtitle="Comprehensive accountability log tracking operator decisions, overrides, and live system broadcasts"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 font-sans">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {actions.map((act) => (
            <motion.button
              whileTap={buttonPressInteraction}
              key={act}
              onClick={() => setFilterAction(act)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                filterAction === act
                  ? 'bg-[#0085db] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-inksoft hover:text-ink hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {act.replace('_', ' ')}
            </motion.button>
          ))}
        </div>

        {/* Records List */}
        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-inksoft font-medium">
              No audit records matching "{filterAction}"
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-surface border border-line rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-ink">
                      {item.action.replace('_', ' ')}
                    </span>
                    <Badge variant={roleColors[item.roleCode] || 'neutral'} size="sm">
                      {item.roleTitle}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold text-inksoft flex-none">
                    {item.timestamp}
                  </span>
                </div>

                <div className="text-xs text-inksoft flex items-center gap-1.5 mb-2 font-medium">
                  <span className="text-ink font-semibold">Target:</span>
                  <span className="text-[#0085db] font-bold">{item.target}</span>
                </div>

                <p className="text-xs text-ink leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-line/60 font-medium">
                  {item.details}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
