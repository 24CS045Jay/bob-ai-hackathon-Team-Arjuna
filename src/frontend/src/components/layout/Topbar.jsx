import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRole } from '../../context/RoleContext.jsx'
import NotificationCenter from './NotificationCenter.jsx'
import { buttonPressInteraction } from '../../utils/motion.js'

export default function Topbar({ crumb = 'Port Map', onOpenCopilot }) {
  const {
    activeRole,
    roles,
    login,
    logout,
    lastSyncedSecondsAgo,
    syncNow,
    setIsCommandPaletteOpen,
    setIsAuditLogOpen
  } = useRole()

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
    admin: 'bg-brand',
    shift_supervisor: 'bg-amber',
    berth_planner: 'bg-brand-deep',
    gate_controller: 'bg-ok',
    viewer: 'bg-obsidian-700'
  }

  return (
    <header className="h-16 glass-strong border-b border-line flex items-center justify-between px-6 sticky top-0 z-30 select-none transition-colors">
      {/* Left: Breadcrumbs & Page Title */}
      <div className="flex flex-col min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-ink leading-tight tracking-tight">
          {crumb}
        </h1>
        <div className="text-[11.5px] text-inksoft flex items-center gap-1.5 font-medium mt-0.5">
          <span>PortFlow Operations</span>
          <span className="text-lineSoft">/</span>
          <span className="text-brand font-semibold">{crumb}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Search trigger */}
        <motion.button
          whileTap={buttonPressInteraction}
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-line hover:border-brand/40 text-inksoft hover:text-ink transition-colors text-xs"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-[12px]">Search terminal…</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-obsidian-700 text-inksoft border border-line">⌘K</kbd>
        </motion.button>

        {/* Audit Log button */}
        <motion.button
          whileTap={buttonPressInteraction}
          onClick={() => setIsAuditLogOpen(true)}
          title="Operational Activity & Audit Trail"
          aria-label="Activity Log"
          className="w-8 h-8 rounded-xl glass border border-line hover:border-brand/40 text-inksoft hover:text-ink flex items-center justify-center transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </motion.button>

        {/* Notification Center */}
        <NotificationCenter />

        {/* Primary Action Button (+ Ask Copilot, like + Add Customer in Image 1) */}
        {onOpenCopilot && (
          <motion.button
            whileTap={buttonPressInteraction}
            onClick={onOpenCopilot}
            title="Open PortFlow AI Operations Copilot"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand hover:bg-brand-deep text-white font-semibold text-xs shadow-sm transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Ask Copilot</span>
          </motion.button>
        )}

        {/* Role Switcher Dropdown */}
        <div className="relative" ref={roleMenuRef}>
          <motion.button
            whileTap={buttonPressInteraction}
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 border border-line rounded-full py-1 pl-1.5 pr-2.5 text-xs font-semibold glass hover:border-lineSoft transition-all"
            aria-label="Switch User Role"
          >
            <span
              className={`w-5 h-5 rounded-full ${
                roleColors[activeRole?.code] || 'bg-brand'
              } text-white flex items-center justify-center text-[10px] font-bold font-mono`}
            >
              {activeRole?.initials || '—'}
            </span>
            <span className="text-ink max-w-[120px] sm:max-w-[150px] truncate">
              {activeRole?.title || 'Select Role'}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className={`text-inksoft transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </motion.button>

          <AnimatePresence>
            {isRoleMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 glass-strong border border-lineSoft rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-line bg-obsidian-800/80">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-inksoft block mb-0.5">
                    Terminal Perspective
                  </span>
                  <span className="text-xs text-ink font-semibold">
                    Shift Role Switcher
                  </span>
                </div>

                <div className="p-1.5 space-y-1">
                  {roles.map((r) => {
                    const isCurrent = activeRole?.code === r.code
                    return (
                      <button
                        key={r.code}
                        onClick={() => handleRoleSelect(r.code)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between ${
                          isCurrent
                            ? 'bg-brand/15 border border-brand/40 text-ink'
                            : 'hover:bg-obsidian-700/50 text-inksoft hover:text-ink'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full ${
                              roleColors[r.code] || 'bg-brand'
                            } text-white text-[9.5px] font-bold font-mono flex items-center justify-center`}
                          >
                            {r.initials}
                          </span>
                          <div>
                            <div className="text-xs font-semibold leading-none text-ink">
                              {r.title}
                            </div>
                            <div className="text-[10px] text-inksoft mt-0.5 font-mono">
                              {r.tag}
                            </div>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-glow" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="p-2 border-t border-line bg-obsidian-800/60 flex items-center justify-between">
                  <button
                    onClick={() => {
                      logout()
                      navigate('/')
                    }}
                    className="w-full text-center text-xs text-crit hover:underline font-semibold py-1"
                  >
                    Disconnect Session →
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
