import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRole } from '../../context/RoleContext.jsx'
import Tooltip from '../common/Tooltip.jsx'
import { buttonPressInteraction } from '../../utils/motion.js'

export default function Sidebar() {
  const { activeRole, setIsCommandPaletteOpen, setIsAuditLogOpen } = useRole()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const mainNavItems = [
    {
      to: '/dashboard',
      title: 'Dashboard',
      code: 'map',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      to: '/vessels',
      title: 'Vessel Tracking',
      code: 'vessels',
      badge: '15 AIS',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M2 17l2 4h16l2-4M3 13h18M6 13l2-6h8l2 6" />
        </svg>
      ),
    },
    {
      to: '/congestion',
      title: 'Congestion AI',
      code: 'congestion',
      badge: '81.6%',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      to: '/berths',
      title: 'Berths & Cranes',
      code: 'berths',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 21v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M8 15V9a4 4 0 0 1 8 0v6M12 3v2" />
        </svg>
      ),
    },
    {
      to: '/routing',
      title: 'Channel Routing',
      code: 'routing',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      to: '/simulation',
      title: 'Scenario Simulator',
      code: 'simulation',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
    },
    {
      to: '/plan',
      title: '72h Plan Matrix',
      code: 'plan',
      restricted: activeRole?.permissions?.viewPlan === false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ]

  const otherNavItems = [
    {
      to: '/alerts',
      title: 'Alerts & Exceptions',
      code: 'alerts',
      badge: '3',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      to: '/access-control',
      title: 'RBAC Policy',
      code: 'access-control',
      restricted: activeRole?.permissions?.manageUsers === false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
  ]

  return (
    <aside
      className={`glass-strong border-r border-line flex flex-col justify-between select-none z-20 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-line">
          <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-deep flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base tracking-tight text-ink flex items-center gap-1.5">
                  PORTFLOW
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand/10 text-brand border border-brand/20 font-semibold">
                    AI
                  </span>
                </span>
                <span className="text-[10.5px] text-inksoft font-medium truncate">Maritime Operations ERP</span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-7 h-7 rounded-lg glass border border-line hover:border-brand/40 text-inksoft hover:text-ink flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
            >
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          </button>
        </div>

        {/* Navigation List */}
        <div className="py-4 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-145px)] no-scrollbar">
          {/* Section: MAIN */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-wider text-inksoft/70">
                MAIN
              </div>
            )}
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                if (item.restricted) {
                  return (
                    <Tooltip key={item.to} text={`${item.title} (Restricted)`} position="right">
                      <div className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-inksoft/40 cursor-not-allowed">
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!isCollapsed && <span>{item.title}</span>}
                        {!isCollapsed && <span className="ml-auto text-[10px]">🔒</span>}
                      </div>
                    </Tooltip>
                  )
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-brand text-white shadow-sm font-semibold'
                          : 'text-inksoft hover:text-ink hover:bg-obsidian-700/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-inksoft group-hover:text-ink'}`}>
                          {item.icon}
                        </span>

                        {!isCollapsed && (
                          <span className="truncate flex-1">{item.title}</span>
                        )}

                        {!isCollapsed && item.badge && (
                          <span
                            className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-brand/10 text-brand border border-brand/20'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {!isCollapsed && !item.badge && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`opacity-0 group-hover:opacity-60 transition-opacity ${isActive ? 'opacity-90' : ''}`}
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Section: OTHERS */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-wider text-inksoft/70">
                OTHERS
              </div>
            )}
            <nav className="space-y-1">
              {otherNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-brand text-white shadow-sm font-semibold'
                        : 'text-inksoft hover:text-ink hover:bg-obsidian-700/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-inksoft group-hover:text-ink'}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="truncate flex-1">{item.title}</span>}
                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-crit/15 text-crit border border-crit/25'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-inksoft hover:text-ink hover:bg-obsidian-700/60 transition-all text-left"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {!isCollapsed && <span>Quick Search (⌘K)</span>}
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom User Card (Vantus ERP style) */}
      <div className="p-3 border-t border-line bg-obsidian-800/40">
        <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-obsidian-700/50 transition-colors cursor-pointer">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-brand/20 border border-brand/40 text-brand font-bold flex items-center justify-center text-xs">
              {activeRole?.initials || 'AJ'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-ok border-2 border-white" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-ink truncate leading-tight flex items-center gap-1">
                {activeRole?.title || 'Capt. Arjun'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#0284c7" className="flex-shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div className="text-[10px] text-inksoft truncate font-mono mt-0.5">
                lead@portflow.arjuna
              </div>
            </div>
          )}

          {!isCollapsed && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-inksoft flex-shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </div>
      </div>
    </aside>
  )
}
