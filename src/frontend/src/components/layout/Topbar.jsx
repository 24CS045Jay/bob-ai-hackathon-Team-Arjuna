import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRole } from '../../context/RoleContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import NotificationCenter from './NotificationCenter.jsx'
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

  const { theme, isDark, toggleTheme } = useTheme()
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
    admin: 'bg-[#0085db]',
    shift_supervisor: 'bg-[#FFAE1F]',
    berth_planner: 'bg-[#7352FF]',
    gate_controller: 'bg-[#13DEB9]',
    viewer: 'bg-slate-600'
  }

  const currentUser = users?.find(u => u.roleCode === activeRole?.code) || users?.[0]

  return (
    <header className="h-16 bg-surface border-b border-line flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 select-none transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Hamburger, Apps Grid, Search Trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* MaterialM Hamburger Toggle Button */}
        <button
          onClick={onToggleSidebar}
          title="Toggle Navigation"
          className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-ink transition-colors cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* 4-Squares Apps Grid Icon (MaterialM signature) */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          title="Terminal Applications"
          className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-inksoft hover:text-ink transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="14" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
          </svg>
        </button>

        {/* Quick Search trigger (MaterialM style) */}
        <div
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-inksoft hover:text-ink cursor-pointer transition-all text-xs border border-transparent hover:border-line"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-[12.5px] font-medium">Search terminal…</span>
          <kbd className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-lg bg-surface shadow-xs text-inksoft border border-line">⌘K</kbd>
        </div>
      </div>

      {/* Right Controls: Theme, Language Flag, Messages, Notifications, Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Light / Dark Mode Toggle Icon (Moon/Sun) */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-inksoft hover:text-ink transition-colors cursor-pointer"
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Flag Icon (Language / Terminal Locale) */}
        <div
          title="Terminal Locale: Global English"
          className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-inksoft cursor-pointer transition-colors"
        >
          <span className="text-base">🇬🇧</span>
        </div>

        {/* Mail / Messages Icon with Badge (3) */}
        <div
          onClick={() => setIsAuditLogOpen(true)}
          title="Terminal Logs & Messages (3 New)"
          className="relative w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-inksoft hover:text-ink cursor-pointer transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0085db] text-white text-[9.5px] font-bold flex items-center justify-center shadow-xs">
            3
          </span>
        </div>

        {/* Notifications Icon with Badge (5) */}
        <NotificationCenter />

        {/* MaterialM Circular User Profile Avatar with Online Status Dot */}
        <div className="relative pl-1" ref={roleMenuRef}>
          <motion.button
            whileTap={buttonPressInteraction}
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="relative flex items-center cursor-pointer p-0.5 rounded-full hover:ring-2 hover:ring-[#0085db]/30 transition-all"
            aria-label="Switch User Role"
          >
            <div
              className={`w-9 h-9 rounded-full ${
                roleColors[activeRole?.code] || 'bg-[#0085db]'
              } text-white font-bold flex items-center justify-center text-xs shadow-xs`}
            >
              {currentUser?.avatar || activeRole?.initials || 'AJ'}
            </div>
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface ring-1 ring-white" />
          </motion.button>

          {/* Role Menu Dropdown - Redesigned High-Contrast MaterialM Profile Card */}
          <AnimatePresence>
            {isRoleMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-3 w-[330px] sm:w-[360px] bg-surface border border-line rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.16)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden font-sans"
              >
                {/* 1. Header Profile Banner */}
                <div className="p-4 border-b border-line bg-gradient-to-br from-slate-50 to-sky-50/50 dark:from-slate-800/80 dark:to-slate-900/60">
                  <div className="flex items-center gap-3">
                    <div className={`relative w-12 h-12 rounded-2xl ${roleColors[activeRole?.code] || 'bg-[#0085db]'} text-white font-extrabold flex items-center justify-center text-sm shadow-md`}>
                      {currentUser?.avatar || activeRole?.initials || 'AJ'}
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-ink truncate">
                          {currentUser?.name || 'Terminal Operator'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Active Duty
                        </span>
                      </div>
                      <div className="text-xs text-inksoft truncate mt-0.5 font-medium">
                        {currentUser?.title || activeRole?.title}
                      </div>
                      <div className="text-[11px] text-inksoft/80 truncate mt-0.5">
                        {currentUser?.department || 'Pier 400 Deepwater Terminal'}
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
                    <span className="text-[11px] font-bold text-[#0085db]">
                      5 Stations
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                    {roles.map((r) => {
                      const isCurrent = activeRole?.code === r.code
                      const roleAccent = {
                        admin: '#0085db',
                        shift_supervisor: '#FFAE1F',
                        berth_planner: '#7352FF',
                        gate_controller: '#13DEB9',
                        viewer: '#64748B'
                      }[r.code] || '#0085db'

                      return (
                        <button
                          key={r.code}
                          onClick={() => handleRoleSelect(r.code)}
                          className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-center justify-between border ${
                            isCurrent
                              ? 'bg-sky-50/90 dark:bg-sky-950/50 border-[#0085db]/40 shadow-xs'
                              : 'border-transparent hover:border-line hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              style={{ backgroundColor: roleAccent }}
                              className="w-8 h-8 rounded-xl text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs"
                            >
                              {r.initials}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isCurrent ? 'text-[#0085db] dark:text-sky-300' : 'text-ink'}`}>
                                  {r.title}
                                </span>
                                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700 text-inksoft">
                                  {r.tag}
                                </span>
                              </div>
                              <div className="text-[11px] text-inksoft line-clamp-1 mt-0.5 font-medium">
                                {r.description}
                              </div>
                            </div>
                          </div>
                          {isCurrent && (
                            <div className="w-5 h-5 rounded-full bg-[#0085db] text-white flex items-center justify-center shrink-0 shadow-xs ml-2">
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

                {/* 3. Footer with Security Link and Prominent Disconnect Button */}
                <div className="p-3 border-t border-line bg-slate-50/70 dark:bg-slate-800/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1 text-[11px] text-inksoft font-medium">
                    <span 
                      onClick={() => { setIsRoleMenuOpen(false); navigate('/access-control'); }}
                      className="hover:text-[#0085db] cursor-pointer transition-colors"
                    >
                      Security &amp; Permissions →
                    </span>
                    <span 
                      onClick={() => { setIsRoleMenuOpen(false); setIsAuditLogOpen(true); }}
                      className="hover:text-[#0085db] cursor-pointer transition-colors"
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
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 dark:text-rose-300 dark:hover:text-white border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Disconnect Terminal Session</span>
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
