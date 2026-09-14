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
  const hoverTimerRef = useRef(null)

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 180)
  }

  const handleNavClick = () => {
    if (!isOpen) {
      setIsHovered(false)
    }
  }

  // Navigation Items matching MaterialM template structure
  const dashboards = [
    {
      to: '/dashboard',
      title: 'Overview & CRM',
      code: 'dashboard',
      badge: 'Live',
      badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
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
      badgeColor: 'bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300',
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
      badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
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
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
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
      badge: 'New',
      badgeColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300',
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
  ]

  const systemItems = [
    {
      to: '/access',
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
      badgeColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
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
    { to: '/berths', label: 'Berth Operations', icon: portOperations[0].icon },
    { to: '/routing', label: 'Channel Routing', icon: portOperations[1].icon },
    { to: '/gates', label: 'Gate Logistics', icon: portOperations[2].icon },
    { to: '/simulation', label: 'Scenarios', icon: portOperations[4].icon },
    { to: '/plan', label: '72h Matrix', icon: portOperations[5].icon },
  ]

  const isExpanded = isOpen || isHovered

  return (
    <aside 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex select-none z-30 shrink-0"
    >
      {/* 1. Leftmost Mini Icon Rail (MaterialM signature ~70px wide) */}
      <div className="w-[68px] sm:w-[72px] bg-surface border-r border-line flex flex-col items-center justify-between py-4 z-20 shrink-0 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        {/* MaterialM Brand Emblem */}
        <div className="flex flex-col items-center gap-6">
          <NavLink
            to="/"
            title="Tideline Maritime OS"
            className="w-10 h-10 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
          >
            {/* Curved M logo matching MaterialM */}
            <svg width="36" height="36" viewBox="0 0 38 38" fill="none">
              <rect width="38" height="38" rx="12" fill="#0085db" fillOpacity="0.12" />
              <path d="M11 25V14L19 22L27 14V25" stroke="#0085db" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="29" cy="11" r="3" fill="#0085db" />
            </svg>
          </NavLink>

          {/* Quick Icons Stack */}
          <div className="flex flex-col gap-1.5 items-center">
            {railIcons.map((item, idx) => {
              const isActive = location.pathname === item.to
              return (
                <Tooltip key={idx} text={item.label} position="right">
                  <NavLink
                    to={item.to}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-sky-100 text-[#0085db] dark:bg-sky-900/40 dark:text-sky-300 font-bold shadow-xs'
                        : 'text-inksoft hover:text-[#0085db] hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                  </NavLink>
                </Tooltip>
              )
            })}
          </div>
        </div>

        {/* Bottom Rail User Profile Avatar */}
        <div className="relative group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-[#0085db] text-white font-bold flex items-center justify-center text-xs shadow-sm cursor-pointer hover:scale-105 transition-transform">
            {activeRole?.initials || 'AJ'}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface" />
        </div>
      </div>

      {/* 2. Secondary Sub-Navigation Rail (Slides out smoothly from left to right on hover or when pinned) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={
              isOpen
                ? "w-[226px] overflow-hidden bg-surface border-r border-line flex flex-col justify-between py-4 px-3 shrink-0"
                : "absolute left-[68px] sm:left-[72px] top-0 bottom-0 h-full w-[236px] z-50 bg-surface border-r border-line flex flex-col justify-between py-4 px-3 shadow-[12px_0_36px_rgba(0,0,0,0.12)] dark:shadow-[12px_0_36px_rgba(0,0,0,0.45)] overflow-hidden"
            }
          >
            <div className="space-y-5 overflow-y-auto pr-1">
              {/* MaterialM Logo Title Row */}
              <div className="px-3 pt-1 pb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-ink tracking-tight">MaterialM</span>
                  <span className="text-[10px] uppercase font-bold text-[#0085db] bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5 rounded-full">TOS</span>
                </div>
              </div>

              {/* Group 1: Dashboards */}
              <div>
                <span className="text-[11px] font-bold text-inksoft uppercase tracking-wider px-3 mb-2 block">
                  Dashboards
                </span>
                <div className="space-y-1">
                  {dashboards.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-2xl flex items-center justify-between text-xs transition-all ${
                          isActive
                            ? 'bg-[#EBF3FE] text-[#0085db] dark:bg-sky-950/50 dark:text-sky-300 font-semibold shadow-xs'
                            : 'text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
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

              {/* Group 2: Port Operations */}
              <div>
                <span className="text-[11px] font-bold text-inksoft uppercase tracking-wider px-3 mb-2 block">
                  Port Operations
                </span>
                <div className="space-y-1">
                  {portOperations.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-2xl flex items-center justify-between text-xs transition-all ${
                          isActive
                            ? 'bg-[#EBF3FE] text-[#0085db] dark:bg-sky-950/50 dark:text-sky-300 font-semibold shadow-xs'
                            : 'text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
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

              {/* Group 3: System & Security */}
              <div>
                <span className="text-[11px] font-bold text-inksoft uppercase tracking-wider px-3 mb-2 block">
                  System
                </span>
                <div className="space-y-1">
                  {systemItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-2xl flex items-center justify-between text-xs transition-all ${
                          isActive
                            ? 'bg-[#EBF3FE] text-[#0085db] dark:bg-sky-950/50 dark:text-sky-300 font-semibold shadow-xs'
                            : 'text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
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
            </div>

            {/* Bottom Terminal Operational Status Card */}
            <div className="mt-3 p-3 bg-gradient-to-tr from-sky-50 to-indigo-50/40 dark:from-slate-800/80 dark:to-slate-800/30 rounded-2xl border border-sky-100 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-ink">Duty Station</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[10.5px] text-inksoft block leading-tight font-medium">
                {activeRole?.label || 'Shift Supervisor'}
              </span>
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="mt-2.5 w-full py-1.5 rounded-xl bg-[#0085db] hover:bg-[#0074c2] text-white text-[11px] font-bold transition-all shadow-xs"
              >
                Quick Action (⌘K)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}
