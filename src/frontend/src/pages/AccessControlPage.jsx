import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { roles, users, updateRolePermission, setIsAuditLogOpen } = useRole()
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
    <AppShell crumb="Access Control &amp; Security Policy">
      <div className="space-y-5 max-w-[1680px] mx-auto select-none font-sans">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                RBAC Security Console
              </span>
              <span className="text-xs text-inksoft font-medium">
                5 Standard Operational Roles • 7 Discrete Entitlements
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Role-Based Access Control &amp; Privilege Matrix
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAuditLogOpen(true)}
              className="text-xs font-bold"
            >
              View Security Audit Trail →
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-xs font-bold"
            >
              + Register Station User
            </Button>
          </div>
        </div>

        {/* Realistic Demo Mode Banner */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-inksoft">
          <span className="text-amber-600 text-lg flex-none mt-0.5">ℹ</span>
          <div className="flex-1 min-w-0 leading-relaxed font-medium">
            <span className="text-ink font-bold mr-1.5">
              Live Interactive Environment:
            </span>
            Entitlement modifications take effect immediately across the running digital-twin session and write structured records to the operational audit log.
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-surface rounded-3xl p-6 border border-line shadow-xs space-y-5">
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
              <div className="text-xs text-inksoft flex items-center justify-between font-medium">
                <span>
                  Configure functional capabilities per role. Toggle switch to grant or revoke operational authority.
                </span>
                <AnimatePresence>
                  {savedFlash && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Entitlement saved &amp; logged to audit trail
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Responsive Matrix Table */}
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-slate-50 dark:bg-slate-800/60">
                      <th className="p-4 font-bold text-ink min-w-[240px]">
                        Entitlement / Capability
                      </th>
                      {roles.map((r) => (
                        <th key={r.code} className="p-4 text-center min-w-[140px]">
                          <div className="font-bold text-ink text-xs">{r.title}</div>
                          <div className="text-[10px] font-bold text-inksoft uppercase tracking-wider mt-0.5">
                            {r.tag}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {PERMISSION_DEFINITIONS.map((perm) => (
                      <tr
                        key={perm.key}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-ink text-xs">
                            {perm.label}
                          </div>
                          <div className="text-xs text-inksoft font-medium mt-0.5 leading-relaxed">
                            {perm.desc}
                          </div>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-[#0085db] bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800">
                            {perm.key}
                          </span>
                        </td>

                        {roles.map((role) => {
                          const isEnabled = !!role.permissions?.[perm.key]
                          const isFlashing = savedFlash === `${role.code}-${perm.key}`
                          const isSelfAdminGate = role.code === 'admin' && perm.key === 'manageUsers'

                          return (
                            <td key={role.code} className="p-4 text-center">
                              <div className="flex flex-col items-center justify-center gap-2">
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
                                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isSelfAdminGate
                                      ? 'opacity-60 cursor-not-allowed bg-[#0085db]'
                                      : isEnabled
                                      ? 'bg-[#0085db]'
                                      : 'bg-slate-300 dark:bg-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </motion.button>

                                <span
                                  className={`text-[10.5px] uppercase font-bold ${
                                    isFlashing
                                      ? 'text-[#0085db] font-extrabold'
                                      : isEnabled
                                      ? 'text-emerald-600 dark:text-emerald-400'
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
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-semibold ${
                        selectedDepartment === dept
                          ? 'bg-[#0085db] text-white border-transparent shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 border-line text-inksoft hover:text-ink'
                      }`}
                    >
                      {dept === 'all' ? 'All Units' : dept}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Filter staff by name or email…"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-line rounded-xl px-3.5 py-2 text-xs text-ink placeholder:text-inksoft/60 focus:outline-none focus:border-[#0085db]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-slate-50 dark:bg-slate-800/60 text-inksoft font-bold text-xs uppercase tracking-wider">
                      <th className="p-4">Personnel</th>
                      <th className="p-4">Assigned Operational Role</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Duty Shift</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-inksoft text-xs font-medium">
                          No personnel records matching current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const userRole = roles.find((r) => r.code === u.roleCode)
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#0085db] border border-sky-200 dark:border-sky-800 flex items-center justify-center font-bold text-xs flex-none shadow-xs">
                                  {u.avatar || (u.name ? u.name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() : 'OP')}
                                </div>
                                <div>
                                  <div className="font-bold text-ink text-xs">{u.name}</div>
                                  <div className="text-xs text-inksoft font-medium">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Badge variant={roleBadgeVariants[u.roleCode] || 'neutral'} size="sm">
                                  {userRole?.title || u.roleCode}
                                </Badge>
                                <span className="text-[10px] font-bold text-inksoft">
                                  [{userRole?.tag || 'ROLE'}]
                                </span>
                              </div>
                              <div className="text-xs text-inksoft mt-0.5 font-medium">{u.title}</div>
                            </td>

                            <td className="p-4 text-ink font-medium">{u.department}</td>

                            <td className="p-4 text-xs text-inksoft font-medium">{u.shift}</td>

                            <td className="p-4 text-right">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
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
