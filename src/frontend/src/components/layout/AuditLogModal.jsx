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
      title="Operational Activity & Audit Trail"
      subtitle="In-session accountability log tracking decisions, security overrides, and approvals"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {actions.map((act) => (
            <motion.button
              whileTap={buttonPressInteraction}
              key={act}
              onClick={() => setFilterAction(act)}
              className={`text-[10.5px] font-mono px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                filterAction === act
                  ? 'bg-brand text-white font-semibold'
                  : 'glass text-inksoft hover:text-ink hover:bg-obsidian-800/60'
              }`}
            >
              {act.replace('_', ' ')}
            </motion.button>
          ))}
        </div>

        <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-inksoft">
              No audit records matching "{filterAction}"
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 glass border border-line rounded-xl hover:border-lineSoft transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-ink">
                      {item.action}
                    </span>
                    <Badge variant={roleColors[item.roleCode] || 'neutral'} size="sm">
                      {item.roleTitle}
                    </Badge>
                  </div>
                  <span className="font-mono text-[10.5px] text-inksoft flex-none">
                    {item.timestamp}
                  </span>
                </div>

                <div className="text-xs text-inksoft flex items-center gap-1.5 mb-1">
                  <span className="text-ink font-medium">Target:</span>
                  <span className="font-mono text-brand-glow">{item.target}</span>
                </div>

                <p className="text-[11.5px] text-ink/85 leading-relaxed bg-obsidian-800/60 p-2.5 rounded-lg border border-line/50 font-sans">
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
