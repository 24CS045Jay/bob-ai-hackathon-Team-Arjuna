import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRole } from '../../context/RoleContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import NotificationCenter from './NotificationCenter.jsx'
import BackendStatusBadge from './BackendStatusBadge.jsx'
import { buttonPressInteraction } from '../../utils/motion.js'

export default function Topbar({ crumb = 'Port Operations', onOpenCopilot, onToggleSidebar }) {
  const {
    activeRole,
    roles,
    users,
    login,
    logout,
    setIsCommandPaletteOpen,
    setIsAuditLogOpen
  } = useRole()

  const { isDark, toggleTheme } = useTheme()
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false)
  const roleMenuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setIsRoleMenuOpen(false)
      }
    }
    if (isRoleMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isRoleMenuOpen])

  const handleRoleSelect = (code) => {
    login(code)
    setIsRoleMenuOpen(false)
  }

  const roleColors = {
    admin: 'bg-[#0284C7]',
    shift_supervisor: 'bg-[#F59E0B]',
    berth_planner: 'bg-[#7C3AED]',
    gate_controller: 'bg-[#10B981]',
    viewer: 'bg-slate-600'
  }

  const currentUser = users?.find(u => u.roleCode === activeRole?.code) || users?.[0]

  return (
    <header className="h-16 bg-surface border-b border-line flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 select-none transition-colors shadow-2xs">
      {/* Left: Hamburger, Quick Command Search Trigger, Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {/* Hamburger Toggle Button */}
        <button
          onClick={onToggleSidebar}
          title="Toggle Navigation"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-ink transition-colors cursor-pointer"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Breadcrumb Info */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-inksoft">
          <span>Port of Arjuna</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-ink font-semibold truncate topbar-crumb">{crumb}</span>
        </div>

        {/* Quick Search trigger */}
        <div
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-inksoft hover:text-ink cursor-pointer transition-all text-xs border border-transparent hover:border-line ml-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-[12px] font-medium">Search terminal commands…</span>
          <kbd className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-md bg-surface shadow-2xs text-inksoft border border-line">⌘K</kbd>
        </div>
      </div>

      {/* Right Controls: Backend Status, Theme, Notifications, Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Real-time Backend API Status Badge */}
        <BackendStatusBadge />

        {/* Light / Dark Mode Toggle Icon */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800/80 text-inksoft hover:text-ink transition-all cursor-pointer border border-transparent hover:border-line dark:hover:border-white/10"
        >
          {isDark ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 hover:text-indigo-600">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Terminal Audit Log Trigger */}
        <button
          onClick={() => setIsAuditLogOpen(true)}
          title="Terminal Logs & Audit Trail"
          className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-inksoft hover:text-ink cursor-pointer transition-colors"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#0284C7] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
            3
          </span>
        </button>

        {/* Notifications Popover */}
        <NotificationCenter />

        {/* User Profile Avatar with Online Status */}
        <div className="relative pl-1" ref={roleMenuRef}>
          <motion.button
            whileTap={buttonPressInteraction}
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="relative flex items-center cursor-pointer p-0.5 rounded-xl hover:ring-2 hover:ring-[#0284C7]/30 transition-all"
            aria-label="Switch User Role"
          >
            <div
              className={`w-9 h-9 rounded-xl ${
                roleColors[activeRole?.code] || 'bg-[#0284C7]'
              } text-white font-bold flex items-center justify-center text-xs shadow-xs`}
            >
              {currentUser?.avatar || activeRole?.initials || 'AJ'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface" />
          </motion.button>

          {/* Role Menu Dropdown */}
          <AnimatePresence>
            {isRoleMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-3 w-[330px] sm:w-[360px] bg-surface border border-line rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden font-sans"
              >
                {/* 1. Header Profile Banner */}
                <div className="p-4 border-b border-line bg-gradient-to-br from-slate-50 to-sky-50/50 dark:from-slate-800/80 dark:to-slate-900/60">
                  <div className="flex items-center gap-3">
                    <div className={`relative w-11 h-11 rounded-xl ${roleColors[activeRole?.code] || 'bg-[#0284C7]'} text-white font-extrabold flex items-center justify-center text-sm shadow-sm`}>
                      {currentUser?.avatar || activeRole?.initials || 'AJ'}
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-ink truncate">
                          {currentUser?.name || 'Terminal Operator'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Active Duty
                        </span>
                      </div>
                      <div className="text-xs text-inksoft truncate mt-0.5 font-medium">
                        {currentUser?.title || activeRole?.title}
                      </div>
                      <div className="text-[11px] text-inksoft/80 truncate mt-0.5">
                        {currentUser?.department || 'Port of Arjuna Terminal'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Duty Station Role Switcher */}
                <div className="p-3">
                  <div className="px-2 pt-1 pb-2 flex items-center justify-between">
                    <span className="text-[10.5px] uppercase font-bold tracking-wider text-inksoft">
                      Switch Duty Station
                    </span>
                    <span className="text-[11px] font-bold text-[#0284C7]">
                      5 Stations
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                    {roles.map((r) => {
                      const isCurrent = activeRole?.code === r.code
                      const roleAccent = {
                        admin: '#0284C7',
                        shift_supervisor: '#F59E0B',
                        berth_planner: '#7C3AED',
                        gate_controller: '#10B981',
                        viewer: '#64748B'
                      }[r.code] || '#0284C7'

                      return (
                        <button
                          key={r.code}
                          onClick={() => handleRoleSelect(r.code)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between border cursor-pointer ${
                            isCurrent
                              ? 'bg-sky-500/10 border-sky-500/30 shadow-2xs'
                              : 'border-transparent hover:border-line hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              style={{ backgroundColor: roleAccent }}
                              className="w-8 h-8 rounded-lg text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                            >
                              {r.initials}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isCurrent ? 'text-[#0284C7] dark:text-sky-300' : 'text-ink'}`}>
                                  {r.title}
                                </span>
                                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-inksoft">
                                  {r.tag}
                                </span>
                              </div>
                              <div className="text-[11px] text-inksoft line-clamp-1 mt-0.5 font-medium">
                                {r.description}
                              </div>
                            </div>
                          </div>
                          {isCurrent && (
                            <div className="w-5 h-5 rounded-full bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-2xs ml-2">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Footer with Security Link & Signout */}
                <div className="p-3 border-t border-line bg-slate-50/70 dark:bg-slate-800/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1 text-[11px] text-inksoft font-medium">
                    <span 
                      onClick={() => { setIsRoleMenuOpen(false); navigate('/access-control'); }}
                      className="hover:text-[#0284C7] cursor-pointer transition-colors"
                    >
                      Security &amp; Permissions →
                    </span>
                    <span 
                      onClick={() => { setIsRoleMenuOpen(false); setIsAuditLogOpen(true); }}
                      className="hover:text-[#0284C7] cursor-pointer transition-colors"
                    >
                      Audit Trail
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setIsRoleMenuOpen(false)
                      navigate('/login')
                    }}
                    className="w-full py-2 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 dark:text-rose-300 dark:hover:text-white border border-rose-500/20 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Disconnect Session</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
