import { useState, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRole } from '../../context/RoleContext.jsx'
import Tooltip from '../common/Tooltip.jsx'
import { buttonPressInteraction } from '../../utils/motion.js'

export default function Sidebar({ isOpen = false, onToggle }) {
  const { activeRole, setIsCommandPaletteOpen, setIsAuditLogOpen } = useRole()
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const hoverTimerRef = useRef(null)

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    if (isPinned) return
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 180)
  }

  const handleNavClick = () => {
    if (!isPinned) {
      setIsHovered(false)
    }
    if (isOpen && onToggle) {
      onToggle()
    }
  }

  // Navigation Items
  const dashboards = [
    {
      to: '/dashboard',
      title: 'Overview & CRM',
      code: 'dashboard',
      badge: 'Live',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      to: '/vessels',
      title: 'AIS Fleet Lineup',
      code: 'vessels',
      badge: '15 AIS',
      badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 17l2 4h16l2-4M3 13h18M6 13l2-6h8l2 6" />
        </svg>
      ),
    },
    {
      to: '/congestion',
      title: 'Congestion AI',
      code: 'congestion',
      badge: '81.6%',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      to: '/world-map',
      title: 'World Port Map',
      code: 'world-map',
      badge: 'GIS',
      badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
  ]

  const portOperations = [
    {
      to: '/berths',
      title: 'Berths & Cranes',
      code: 'berths',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M8 15V9a4 4 0 0 1 8 0v6M12 3v2" />
        </svg>
      ),
    },
    {
      to: '/routing',
      title: 'Channel Routing',
      code: 'routing',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="19" r="3" />
          <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
          <circle cx="18" cy="5" r="3" />
        </svg>
      ),
    },
    {
      to: '/gates',
      title: 'Gate Logistics',
      code: 'gates',
      badge: '91 Trucks',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      to: '/cascade',
      title: 'Event Cascade',
      code: 'cascade',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      to: '/simulation',
      title: 'Scenario Simulator',
      code: 'simulation',
      badge: 'Sandbox',
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
    },
    {
      to: '/plan',
      title: '72h Plan Matrix',
      code: 'plan',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      to: '/datasheet',
      title: 'Ship & Cargo Data',
      code: 'datasheet',
      badge: 'CRUD',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ),
    },
  ]

  const systemItems = [
    {
      to: '/access-control',
      title: 'Access Control',
      code: 'access',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      to: '/alerts',
      title: 'Alerts & Incidents',
      code: 'alerts',
      badge: '2 Crit',
      badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
  ]

  // Primary rail icon items
  const railIcons = [
    { to: '/dashboard', label: 'Dashboard', icon: dashboards[0].icon },
    { to: '/vessels', label: 'Fleet AIS', icon: dashboards[1].icon },
    { to: '/congestion', label: 'Congestion AI', icon: dashboards[2].icon },
    { to: '/world-map', label: 'World Port Map', icon: dashboards[3].icon },
    { to: '/berths', label: 'Berth Operations', icon: portOperations[0].icon },
    { to: '/routing', label: 'Channel Routing', icon: portOperations[1].icon },
    { to: '/gates', label: 'Gate Logistics', icon: portOperations[2].icon },
    { to: '/simulation', label: 'Scenarios', icon: portOperations[4].icon },
    { to: '/plan', label: '72h Matrix', icon: portOperations[5].icon },
    { to: '/datasheet', label: 'Ship & Cargo Data', icon: portOperations[6].icon },
  ]

  const isExpanded = isOpen || isHovered || isPinned

  const allGroups = [
    { label: 'Dashboards', items: dashboards },
    { label: 'Port Operations', items: portOperations },
    { label: 'System', items: systemItems },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative flex select-none z-30 shrink-0 ${isOpen ? 'fixed lg:relative inset-y-0 left-0' : ''}`}
      >
        {/* 1. Leftmost Icon Rail */}
        <div className="w-[68px] sm:w-[72px] bg-surface border-r border-line flex flex-col items-center justify-between py-4 z-20 shrink-0 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
          {/* Brand Emblem */}
          <div className="flex flex-col items-center gap-3">
            <NavLink
              to="/"
              title="PortFlow AI Maritime Operations"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.29 7 12 12 20.71 7" />
                <line x1="12" y1="22" x2="12" y2="12" />
              </svg>
            </NavLink>

            {/* Pin / Stick button */}
            <Tooltip text={isPinned ? 'Unpin sidebar' : 'Pin sidebar open'} position="right">
              <button
                onClick={() => {
                  setIsPinned((v) => !v)
                  if (!isPinned) setIsHovered(true)
                }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
                  isPinned
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-[#0284C7] dark:text-sky-300'
                    : 'border-line text-inksoft hover:text-[#0284C7] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v6l3 3-3 3v6" />
                  <path d="M5 9h14" />
                </svg>
              </button>
            </Tooltip>

            {/* Quick Icons Stack */}
            <div className="flex flex-col gap-1 items-center mt-1">
              {railIcons.map((item, idx) => {
                const isActive = location.pathname === item.to
                return (
                  <Tooltip key={idx} text={item.label} position="right">
                    <NavLink
                      to={item.to}
                      onClick={handleNavClick}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-sky-500/15 text-[#0284C7] dark:text-sky-300 font-bold shadow-2xs border border-sky-500/30'
                          : 'text-inksoft hover:text-[#0284C7] hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.icon}
                    </NavLink>
                  </Tooltip>
                )
              })}
            </div>
          </div>

          {/* Bottom Rail User Avatar */}
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-[#0284C7] text-white font-bold flex items-center justify-center text-xs shadow-xs cursor-pointer hover:scale-105 transition-transform">
              {activeRole?.initials || 'AJ'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface" />
          </div>
        </div>

        {/* 2. Secondary Expanded Navigation Drawer */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={
                isPinned || isOpen
                  ? 'w-[240px] overflow-hidden bg-surface border-r border-line flex flex-col justify-between py-4 px-3 shrink-0'
                  : 'absolute left-[68px] sm:left-[72px] top-0 bottom-0 h-full w-[240px] z-50 bg-surface border-r border-line flex flex-col justify-between py-4 px-3 shadow-[12px_0_36px_rgba(0,0,0,0.08)] dark:shadow-[12px_0_36px_rgba(0,0,0,0.45)] overflow-hidden'
              }
            >
              <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                {/* Title Row */}
                <div className="px-3 pt-1 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-ink tracking-tight">PortFlow AI</span>
                    <span className="text-[10px] uppercase font-bold text-[#0284C7] bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-full">TOS</span>
                  </div>
                  {/* Pin toggle in expanded panel */}
                  <Tooltip text={isPinned ? 'Unpin sidebar' : 'Pin sidebar open'} position="left">
                    <button
                      onClick={() => setIsPinned((v) => !v)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border text-xs cursor-pointer ${
                        isPinned
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-[#0284C7]'
                          : 'border-line text-inksoft hover:text-[#0284C7] hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v6l3 3-3 3v6" />
                        <path d="M5 9h14" />
                      </svg>
                    </button>
                  </Tooltip>
                </div>

                {/* Nav Groups */}
                {allGroups.map((group) => (
                  <div key={group.label}>
                    <span className="text-[10.5px] font-bold text-inksoft uppercase tracking-wider px-3 mb-1.5 block">
                      {group.label}
                    </span>
                    <div className="space-y-0.5">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all ${
                              isActive
                                ? 'bg-sky-500/10 text-[#0284C7] dark:text-sky-300 font-semibold border-l-2 border-[#0284C7]'
                                : 'text-inksoft hover:text-ink hover:bg-slate-100/80 dark:hover:bg-slate-800/80 font-medium'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="shrink-0">{item.icon}</span>
                            <span className="truncate">{item.title}</span>
                          </div>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Terminal Status Card */}
              <div className="mt-3 p-3 bg-gradient-to-tr from-sky-50 to-indigo-50/40 dark:from-slate-800/80 dark:to-slate-800/30 rounded-2xl border border-sky-100 dark:border-slate-700/60 shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-ink">Active Duty</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-[11px] text-inksoft block leading-tight font-medium">
                  {activeRole?.label || 'Shift Supervisor'}
                </span>
                <button
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="mt-2.5 w-full py-1.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white text-[11px] font-semibold transition-all shadow-2xs cursor-pointer"
                >
                  Quick Command (⌘K)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </>
  )
}
