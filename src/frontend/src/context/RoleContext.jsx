import { createContext, useContext, useState, useEffect } from 'react'
import { ROLES } from '../data/roles.mock.js'
import { USERS } from '../data/users.mock.js'

const RoleContext = createContext(null)

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Hotspot Alert: Gate 3 queue breached 40 trucks',
    time: '2m ago',
    type: 'alert',
    unread: true,
    path: '/gates'
  },
  {
    id: 'n2',
    title: 'Demurrage Warning: MV Coral Voyager anchored 9h',
    time: '6m ago',
    type: 'alert',
    unread: true,
    path: '/vessels'
  },
  {
    id: 'n3',
    title: 'Digital Twin: Rolling 72-hour plan recalculated',
    time: '18m ago',
    type: 'plan',
    unread: true,
    path: '/plan'
  },
  {
    id: 'n4',
    title: 'System: Telemetry link to North Pier Radar verified',
    time: '35m ago',
    type: 'system',
    unread: false,
    path: '/dashboard'
  }
]

const INITIAL_AUDIT_LOG = [
  {
    id: 'a1',
    timestamp: '10:14:22 UTC',
    roleCode: 'admin',
    roleTitle: 'Operations Admin',
    action: 'SESSION_INITIALIZED',
    target: 'Tideline Core',
    details: 'Digital twin real-time synchronization link established.'
  },
  {
    id: 'a2',
    timestamp: '10:08:45 UTC',
    roleCode: 'shift_supervisor',
    roleTitle: 'Shift Supervisor',
    action: 'SIMULATION_EXECUTED',
    target: 'Gate 3 Closure Scenario',
    details: 'Modeled downstream diversion impact on Quay Crane STS-03.'
  },
  {
    id: 'a3',
    timestamp: '09:55:10 UTC',
    roleCode: 'berth_planner',
    roleTitle: 'Berth Planner',
    action: 'CRANE_REASSIGNED',
    target: 'Crane C-06 to Berth 6',
    details: 'Standby crane activated to relieve bottleneck at Berth 5.'
  }
]

export function RoleProvider({ children }) {
  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem('tideline_roles_matrix')
      if (saved) return JSON.parse(saved)
    } catch {
      // storage unavailable
    }
    return ROLES
  })

  const [users] = useState(USERS)

  // Default to shift_supervisor for immediate rich viewing or preserve selection
  const [activeRoleCode, setActiveRoleCode] = useState(() => {
    try {
      return localStorage.getItem('tideline_active_role') || 'shift_supervisor'
    } catch {
      return 'shift_supervisor'
    }
  })

  const [lastSyncedSecondsAgo, setLastSyncedSecondsAgo] = useState(3)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT_LOG)
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  const activeRole = roles.find((r) => r.code === activeRoleCode) || null

  const login = (roleCode) => {
    setActiveRoleCode(roleCode)
    try {
      localStorage.setItem('tideline_active_role', roleCode)
    } catch {
      // ignore storage issues
    }
    logAction({
      action: 'ROLE_SWITCHED',
      target: roleCode,
      details: `Switched active perspective to ${roleCode.replace('_', ' ').toUpperCase()}`
    })
  }

  const logout = () => {
    setActiveRoleCode(null)
    try {
      localStorage.removeItem('tideline_active_role')
    } catch {
      // ignore
    }
  }

  const can = (permissionKey) => {
    if (!activeRole) return false
    return !!activeRole.permissions?.[permissionKey]
  }

  const syncNow = () => {
    setLastSyncedSecondsAgo(0)
    logAction({
      action: 'DIGITAL_TWIN_SYNC',
      target: 'Quayside & Landside Telemetry',
      details: 'Manual refresh pulse broadcast across digital twin layers.'
    })
  }

  const logAction = ({ action, target, details }) => {
    const now = new Date()
    const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now
      .getUTCMinutes()
      .toString()
      .padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`

    const newEntry = {
      id: 'a_' + Date.now() + Math.random().toString(36).substring(2, 6),
      timestamp: timeStr,
      roleCode: activeRole?.code || 'guest',
      roleTitle: activeRole?.title || 'Guest / Unauthenticated',
      action,
      target,
      details
    }

    setAuditLog((prev) => [newEntry, ...prev.slice(0, 49)])
  }

  const updateRolePermission = (roleCode, permissionKey, nextValue) => {
    const targetRole = roles.find((r) => r.code === roleCode)
    const roleTitle = targetRole ? targetRole.title : roleCode

    setRoles((prev) => {
      const updated = prev.map((role) => {
        if (role.code === roleCode) {
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [permissionKey]: nextValue
            }
          }
        }
        return role
      })

      try {
        localStorage.setItem('tideline_roles_matrix', JSON.stringify(updated))
      } catch {
        // ignore
      }

      return updated
    })

    logAction({
      action: 'PERMISSION_MUTATED',
      target: `${roleTitle} [${permissionKey}]`,
      details: `${permissionKey} entitlement ${nextValue ? 'GRANTED' : 'REVOKED'} by ${activeRole?.title || 'Administrator'}`
    })
  }

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const addNotification = (notif) => {
    const newNotif = {
      id: 'n_' + Date.now(),
      time: 'Just now',
      unread: true,
      ...notif
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  // Ticker for digital-twin live state
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSyncedSecondsAgo((prev) => (prev >= 24 ? 0 : prev + 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <RoleContext.Provider
      value={{
        roles,
        users,
        activeRole,
        login,
        logout,
        can,
        updateRolePermission,
        lastSyncedSecondsAgo,
        syncNow,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        auditLog,
        logAction,
        isAuditLogOpen,
        setIsAuditLogOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within a RoleProvider')
  return ctx
}
