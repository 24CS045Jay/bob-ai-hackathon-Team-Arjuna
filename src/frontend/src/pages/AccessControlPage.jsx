import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { useRole } from '../context/RoleContext.jsx'
import Badge from '../components/common/Badge.jsx'
import Tabs from '../components/common/Tabs.jsx'
import Button from '../components/common/Button.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

const PERMISSION_DEFINITIONS = [
  { key: 'viewMap', label: 'Telemetry Map', desc: 'Real-time quayside radar & vessel layer observation' },
  { key: 'viewKpis', label: 'Executive KPIs', desc: 'Cost-of-congestion financial metrics & dwell rates' },
  { key: 'viewAlerts', label: 'Alert Feeds', desc: 'Harbor exceptions, OCR bottlenecks, and laytime warnings' },
  { key: 'viewPlan', label: '72-Hour Plan', desc: 'Rolling crane moves and shift window allocations' },
  { key: 'applyRecommendation', label: 'Dispatch Override', desc: 'Authorize crane reroutes and gate diversion bypass' },
  { key: 'ackAlert', label: 'Acknowledge Alerts', desc: 'Clear active alarms and acknowledge operational faults' },
  { key: 'manageUsers', label: 'Access Control Admin', desc: 'Modify system roles, entitlements, and security policy' }
]

export default function AccessControlPage() {
  const { roles, users, updateRolePermission, activeRole, setIsAuditLogOpen } = useRole()
  const [activeTab, setActiveTab] = useState('matrix')
  const [savedFlash, setSavedFlash] = useState(null)
  const [userSearch, setUserSearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  const handleToggle = (roleCode, permissionKey, currentValue) => {
    const nextValue = !currentValue
    updateRolePermission(roleCode, permissionKey, nextValue)
    setSavedFlash(`${roleCode}-${permissionKey}`)
    setTimeout(() => {
      setSavedFlash(null)
    }, 1800)
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.title.toLowerCase().includes(userSearch.toLowerCase())

    if (!matchesSearch) return false
    if (selectedDepartment !== 'all' && u.department !== selectedDepartment) return false
    return true
  })

  const departments = ['all', ...Array.from(new Set(users.map((u) => u.department)))]

  const roleBadgeVariants = {
    admin: 'brand',
    shift_supervisor: 'warn',
    berth_planner: 'brand',
    gate_controller: 'ok',
    viewer: 'neutral'
  }

  return (
    <AppShell crumb="Access Control & Security Policy">
      <div className="space-y-4 max-w-[1680px] mx-auto select-none animate-fadeUp">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass p-4 sm:p-5 rounded-2xl border border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-glow bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                RBAC Security Console
              </span>
              <span className="text-xs text-inksoft font-mono">
                5 Standard Operational Roles · 7 Discrete Entitlements
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              Role-Based Access Control &amp; Privilege Matrix
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAuditLogOpen(true)}
              className="font-mono text-xs"
            >
              View Security Audit Trail →
            </Button>
          </div>
        </div>

        {/* Realistic Demo Mode Banner */}
        <div className="glass rounded-xl p-3.5 border border-amber/30 bg-amber/5 flex items-start gap-3 text-xs text-inksoft">
          <span className="text-amber text-base flex-none mt-0.5">ℹ</span>
          <div className="flex-1 min-w-0 leading-relaxed">
            <span className="text-ink font-semibold mr-1.5">
              Read-Only Demo Environment:
            </span>
            Entitlement modifications take effect immediately across the running digital-twin session and write structured records to the operational audit log. Server-side persistence is not configured in this prototype.
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="glass rounded-2xl p-4 border border-line space-y-4">
          <Tabs
            tabs={[
              { id: 'matrix', label: 'Permission Matrix', count: roles.length },
              { id: 'users', label: 'Personnel Directory', count: users.length }
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="text-xs text-inksoft flex items-center justify-between">
                <span>
                  Configure functional capabilities per role. Toggle switch to grant or revoke operational authority.
                </span>
                <AnimatePresence>
                  {savedFlash && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="text-[11px] font-mono text-ok flex items-center gap-1.5 bg-ok/10 px-2.5 py-0.5 rounded border border-ok/30"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulseDot" />
                      Entitlement saved &amp; logged to audit trail
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Responsive Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-obsidian-800/80">
                      <th className="p-3.5 font-semibold text-ink min-w-[220px]">
                        Entitlement / Capability
                      </th>
                      {roles.map((r) => (
                        <th key={r.code} className="p-3.5 text-center min-w-[140px]">
                          <div className="font-semibold text-ink">{r.title}</div>
                          <div className="text-[10px] font-mono text-inksoft uppercase tracking-wider mt-0.5">
                            {r.tag}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40 font-mono">
                    {PERMISSION_DEFINITIONS.map((perm) => (
                      <tr
                        key={perm.key}
                        className="hover:bg-obsidian-800/40 transition-colors"
                      >
                        <td className="p-3.5">
                          <div className="font-sans font-semibold text-ink text-xs">
                            {perm.label}
                          </div>
                          <div className="text-[11px] text-inksoft font-sans font-normal mt-0.5 leading-snug">
                            {perm.desc}
                          </div>
                          <span className="inline-block mt-1 text-[9.5px] text-brand-glow bg-brand/10 px-1.5 py-0.2 rounded border border-brand/20">
                            {perm.key}
                          </span>
                        </td>

                        {roles.map((role) => {
                          const isEnabled = !!role.permissions?.[perm.key]
                          const isFlashing = savedFlash === `${role.code}-${perm.key}`
                          const isSelfAdminGate = role.code === 'admin' && perm.key === 'manageUsers'

                          return (
                            <td key={role.code} className="p-3.5 text-center">
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                <motion.button
                                  whileTap={isSelfAdminGate ? undefined : buttonPressInteraction}
                                  onClick={() => {
                                    if (isSelfAdminGate) return
                                    handleToggle(role.code, perm.key, isEnabled)
                                  }}
                                  disabled={isSelfAdminGate}
                                  title={
                                    isSelfAdminGate
                                      ? 'Cannot revoke master administrator authorization from admin role'
                                      : `${isEnabled ? 'Revoke' : 'Grant'} ${perm.label} for ${role.title}`
                                  }
                                  className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isSelfAdminGate
                                      ? 'opacity-60 cursor-not-allowed bg-brand'
                                      : isEnabled
                                      ? 'bg-brand'
                                      : 'bg-obsidian-700'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </motion.button>

                                <span
                                  className={`text-[10px] uppercase font-mono ${
                                    isFlashing
                                      ? 'text-brand-glow font-bold'
                                      : isEnabled
                                      ? 'text-ok'
                                      : 'text-inksoft/60'
                                  }`}
                                >
                                  {isEnabled ? 'Enabled' : 'Locked'}
                                </span>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDepartment(dept)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        selectedDepartment === dept
                          ? 'bg-brand/15 text-brand-glow border-brand/40 font-semibold'
                          : 'glass border-line text-inksoft hover:text-ink'
                      }`}
                    >
                      {dept === 'all' ? 'All Units' : dept}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Filter staff by name or email…"
                    className="w-full glass border border-line rounded-lg px-3 py-1.5 text-xs text-ink placeholder:text-inksoft/60 focus:outline-none focus:border-brand/50 font-mono"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-obsidian-800/80 text-inksoft font-mono text-[11px] uppercase tracking-wider">
                      <th className="p-3.5">Personnel</th>
                      <th className="p-3.5">Assigned Operational Role</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Duty Shift</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-inksoft text-xs">
                          No personnel records matching current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const userRole = roles.find((r) => r.code === u.roleCode)
                        return (
                          <tr key={u.id} className="hover:bg-obsidian-800/40 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-brand/20 text-brand-glow border border-brand/30 flex items-center justify-center font-bold text-xs font-mono flex-none">
                                  {u.avatar}
                                </div>
                                <div>
                                  <div className="font-semibold text-ink">{u.name}</div>
                                  <div className="text-[11px] text-inksoft font-mono">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <Badge variant={roleBadgeVariants[u.roleCode] || 'neutral'} size="sm">
                                  {userRole?.title || u.roleCode}
                                </Badge>
                                <span className="text-[10px] font-mono text-inksoft">
                                  [{userRole?.tag || 'ROLE'}]
                                </span>
                              </div>
                              <div className="text-[10.5px] text-inksoft mt-0.5">{u.title}</div>
                            </td>

                            <td className="p-3.5 text-inksoft">{u.department}</td>

                            <td className="p-3.5 font-mono text-[11px] text-inksoft">{u.shift}</td>

                            <td className="p-3.5 text-right">
                              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ok">
                                <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                                Active
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
