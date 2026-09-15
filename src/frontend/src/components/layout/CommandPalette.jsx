import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRole } from '../../context/RoleContext.jsx'
import { VESSELS } from '../../data/vessels.mock.js'
import { BERTHS } from '../../data/berths.mock.js'
import { GATES } from '../../data/gates.mock.js'
import {
  modalBackdropVariants,
  modalPanelVariants,
  usePrefersReducedMotion
} from '../../utils/motion.js'

export default function CommandPalette() {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, syncNow, setIsAuditLogOpen, login, roles } = useRole()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [isCommandPaletteOpen])

  // Build searchable items
  const pages = [
    { type: 'Page', title: 'Port Digital Twin Map', subtitle: 'Live map overview & KPI telemetry', path: '/dashboard' },
    { type: 'Page', title: 'Vessel & Container Tracking', subtitle: 'AIS telemetry & ocean arrival ETA', path: '/vessels' },
    { type: 'Page', title: 'Congestion & Laytime Analytics', subtitle: 'Dwell bottlenecks & demurrage exposure', path: '/congestion' },
    { type: 'Page', title: 'Alternate Routing & Diversions', subtitle: 'Real-time quayside and gate diversion engine', path: '/routing' },
    { type: 'Page', title: 'Berth & Crane Allocation', subtitle: 'Quayside allocation board & crane dispatch', path: '/berths' },
    { type: 'Page', title: 'Gate & Landside Traffic', subtitle: 'OCR lane queues & truck diversion', path: '/gates' },
    { type: 'Page', title: 'Event Cascade Causality', subtitle: 'Downstream incident ripple effect modeling', path: '/cascade' },
    { type: 'Page', title: 'Scenario Simulation Builder', subtitle: 'Run hypothetical disruption projections', path: '/simulation' },
    { type: 'Page', title: '72-Hour Operations Plan', subtitle: 'Rolling shift schedule & approval gate', path: '/plan' },
    { type: 'Page', title: 'Alerts & Operational Exceptions', subtitle: 'Live exception feed & acknowledgment', path: '/alerts' },
    { type: 'Page', title: 'RBAC Policy & Entitlements', subtitle: 'Configure user roles & permission matrix', path: '/access-control' }
  ]

  const vesselItems = VESSELS.map((v) => ({
    type: 'Vessel',
    title: v.name,
    subtitle: `${v.imo} · ${v.line} · Container ${v.container}`,
    action: () => navigate('/vessels')
  }))

  const berthItems = BERTHS.map((b) => ({
    type: 'Berth',
    title: b.name,
    subtitle: `${b.vessel} · Crane ${b.crane}`,
    action: () => navigate('/berths')
  }))

  const gateItems = GATES.map((g) => ({
    type: 'Gate',
    title: g.name,
    subtitle: `${g.queue} trucks queued · ~${g.waitMin}m turnaround`,
    action: () => navigate('/gates')
  }))

  const quickActions = [
    {
      type: 'Action',
      title: 'Sync Digital Twin Telemetry',
      subtitle: 'Force immediate telemetry refresh across all layers',
      action: () => {
        syncNow()
        setIsCommandPaletteOpen(false)
      }
    },
    {
      type: 'Action',
      title: 'Open Operational Audit Log',
      subtitle: 'Review session actions and role accountability trail',
      action: () => {
        setIsAuditLogOpen(true)
        setIsCommandPaletteOpen(false)
      }
    },
    ...roles.map((r) => ({
      type: 'Switch Role',
      title: `Switch perspective to ${r.title}`,
      subtitle: r.description,
      action: () => {
        login(r.code)
        setIsCommandPaletteOpen(false)
      }
    }))
  ]

  const allItems = [...pages, ...vesselItems, ...berthItems, ...gateItems, ...quickActions]

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.type.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 10)

  const handleSelect = (item) => {
    setIsCommandPaletteOpen(false)
    if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      handleSelect(filtered[selectedIndex])
    }
  }

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <motion.div
          key="palette-backdrop"
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md"
          onClick={() => setIsCommandPaletteOpen(false)}
        >
          <motion.div
            key="palette-panel"
            variants={prefersReduced ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : modalPanelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-xl glass-strong border border-lineSoft rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line bg-obsidian-800/40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-inksoft flex-none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                placeholder="Search command, vessel, berth, gate, or screen…"
                className="w-full bg-transparent text-sm text-ink placeholder:text-inksoft/60 focus:outline-none font-mono"
              />
              <button
                onClick={() => setIsCommandPaletteOpen(false)}
                className="text-[10.5px] font-mono text-inksoft bg-obsidian-700/60 px-2 py-0.5 rounded border border-line hover:text-ink"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-xs text-inksoft">
                  No matching results for "{query}"
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const isSelected = idx === selectedIndex
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand/15 border border-brand/40 text-ink'
                          : 'text-inksoft hover:bg-obsidian-800/50'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-ink truncate">{item.title}</span>
                          <span className="text-[9.5px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-obsidian-800 text-inksoft border border-line">
                            {item.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-inksoft truncate mt-0.5">{item.subtitle}</div>
                      </div>
                      {isSelected && (
                        <span className="text-[10.5px] text-brand-glow font-mono flex items-center gap-1 flex-none">
                          Jump ↵
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 bg-obsidian-800/80 border-t border-line text-[11px] text-inksoft font-mono">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span className="text-[10px]">PORTFLOW AI ⌘K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
