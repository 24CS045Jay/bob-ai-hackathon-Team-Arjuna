import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { WORLD_PORTS, ACTIVE_VESSELS } from '../data/worldPorts.mock.js'

// ─── Dwell colour scale (matches reference screenshot) ───────────────────────
function getDwellColor(dwell) {
  if (dwell <= 2.0) return '#1a3a6e'
  if (dwell <= 2.7) return '#1e6bb8'
  if (dwell <= 3.9) return '#4da6e0'
  if (dwell <= 4.9) return '#f59e0b'
  if (dwell <= 6.4) return '#f97316'
  return '#dc2626'
}

const DWELL_LEGEND = [
  { label: '0–2.0',  color: '#1a3a6e' },
  { label: '2.1–2.7',color: '#1e6bb8' },
  { label: '2.7–3.9',color: '#4da6e0' },
  { label: '3.9–4.9',color: '#f59e0b' },
  { label: '5.0–6.4',color: '#f97316' },
  { label: '6.4+',   color: '#dc2626' },
]

// ─── Equirectangular projection: lat/lng → SVG x/y ───────────────────────────
// SVG canvas: 1000 × 500
const W = 1000, H = 500
function project(lat, lng) {
  const x = ((lng + 180) / 360) * W
  const y = ((90 - lat) / 180) * H
  return { x, y }
}

// Port radius by type
const RADIUS = { mega: 10, large: 7, medium: 5, small: 3.5 }

// Vessel status colour
const VESSEL_COLOR = { berthed: '#10b981', anchored: '#f59e0b', transit: '#3b82f6' }

// ─── Simplified world coastline paths (SVG d-paths, equirectangular) ─────────
// These are low-poly approximations sufficient for a schematic port-ops map.
const LANDMASSES = [
  // North America
  "M 86,28 L 130,18 L 170,22 L 190,30 L 205,50 L 210,70 L 225,90 L 235,110 L 228,130 L 218,150 L 200,165 L 188,180 L 175,185 L 160,178 L 145,170 L 138,155 L 142,135 L 148,120 L 152,100 L 145,80 L 130,65 L 115,60 L 100,50 L 86,28 Z",
  // Central America / Caribbean peninsula
  "M 175,185 L 180,195 L 188,205 L 182,215 L 172,210 L 170,200 L 175,185 Z",
  // South America
  "M 190,195 L 210,185 L 228,195 L 240,215 L 250,240 L 252,270 L 248,300 L 238,330 L 225,360 L 212,380 L 205,390 L 200,370 L 195,340 L 192,310 L 188,280 L 185,250 L 188,225 L 190,195 Z",
  // Europe
  "M 455,40 L 480,35 L 505,42 L 520,55 L 512,70 L 498,78 L 485,82 L 470,75 L 462,65 L 458,52 L 455,40 Z",
  // UK
  "M 450,50 L 455,42 L 460,52 L 456,62 L 450,58 L 450,50 Z",
  // Scandinavia
  "M 485,20 L 495,15 L 505,20 L 508,35 L 498,40 L 488,35 L 485,20 Z",
  // Africa
  "M 455,120 L 480,110 L 510,112 L 530,125 L 538,150 L 535,180 L 528,210 L 518,240 L 505,265 L 495,280 L 485,275 L 475,260 L 468,235 L 462,210 L 458,185 L 455,158 L 452,135 L 455,120 Z",
  // Middle East / Arabian Peninsula
  "M 530,115 L 555,108 L 568,115 L 572,130 L 565,148 L 550,155 L 538,148 L 530,135 L 530,115 Z",
  // India
  "M 590,130 L 608,125 L 618,138 L 615,158 L 608,172 L 598,178 L 590,170 L 585,155 L 588,140 L 590,130 Z",
  // South East Asia / Indochina
  "M 640,130 L 665,120 L 680,128 L 685,145 L 675,162 L 660,170 L 648,165 L 640,150 L 640,130 Z",
  // China / East Asia
  "M 660,70 L 700,60 L 730,65 L 748,80 L 750,100 L 738,118 L 720,128 L 700,130 L 680,125 L 665,115 L 658,98 L 658,82 L 660,70 Z",
  // Japan
  "M 752,82 L 760,75 L 768,82 L 765,95 L 756,98 L 752,90 L 752,82 Z",
  // Korea
  "M 738,88 L 748,82 L 752,90 L 746,100 L 738,98 L 738,88 Z",
  // Indonesia / Malaysia archipelago (simplified)
  "M 660,190 L 685,185 L 705,190 L 712,202 L 700,210 L 680,208 L 665,200 L 660,190 Z",
  "M 715,192 L 740,188 L 755,198 L 750,210 L 730,212 L 718,205 L 715,192 Z",
  // Australia
  "M 700,250 L 740,238 L 775,240 L 800,255 L 812,278 L 808,305 L 792,325 L 770,335 L 748,332 L 728,320 L 712,300 L 706,275 L 700,250 Z",
  // Russia / Central Asia (simplified northern block)
  "M 490,15 L 580,8 L 680,12 L 740,22 L 760,40 L 748,58 L 720,65 L 680,60 L 640,55 L 590,52 L 540,48 L 500,42 L 490,30 L 490,15 Z",
  // Greenland
  "M 290,8 L 330,5 L 360,12 L 368,28 L 355,40 L 335,45 L 312,42 L 296,30 L 290,8 Z",
  // New Zealand (approximate)
  "M 828,340 L 835,332 L 840,342 L 835,352 L 828,348 L 828,340 Z",
]

export default function WorldMapPage() {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [dataMode, setDataMode]     = useState('import')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPort, setSelectedPort] = useState(null)
  const [hoveredPort, setHoveredPort]   = useState(null)
  const [hoveredVessel, setHoveredVessel] = useState(null)
  const [showVessels, setShowVessels]   = useState(true)
  const [regionFilter, setRegionFilter] = useState('all')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Pan & Zoom state
  const [zoom, setZoom]     = useState(1)
  const [pan, setPan]       = useState({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const dragStart  = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const getDwellValue = (port) => ({
    import: port.importDwell, export: port.exportDwell,
    berthing: port.berthingDwell, anchor: port.anchorDwell,
  }[dataMode] ?? port.medianDwell)

  const regions = ['all', ...new Set(WORLD_PORTS.map(p => p.region))]

  const filteredPorts = WORLD_PORTS.filter(p => {
    const q = searchQuery.toLowerCase()
    const mQ = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.country.toLowerCase().includes(q)
    const mR = regionFilter === 'all' || p.region === regionFilter
    return mQ && mR
  })

  // ── Zoom helpers ────────────────────────────────────────────────────────────
  const zoomIn  = () => setZoom(z => Math.min(z * 1.35, 8))
  const zoomOut = () => setZoom(z => Math.max(z / 1.35, 0.6))
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  // Wheel zoom centered on cursor
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
    setZoom(z => {
      const nz = Math.min(Math.max(z * factor, 0.6), 8)
      // Adjust pan so zoom is centered on cursor position relative to SVG
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return nz
      const cx = e.clientX - rect.left - rect.width / 2
      const cy = e.clientY - rect.top  - rect.height / 2
      setPan(p => ({
        x: cx - (cx - p.x) * (nz / z),
        y: cy - (cy - p.y) * (nz / z),
      }))
      return nz
    })
  }, [])

  // Pan drag
  const onMouseDown = (e) => {
    if (e.button !== 0) return
    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }
  const onMouseMove = (e) => {
    if (!isDragging.current) return
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    })
  }
  const onMouseUp = () => { isDragging.current = false }

  // Touch support
  const lastTouch = useRef(null)
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, panX: pan.x, panY: pan.y }
    }
  }
  const onTouchMove = (e) => {
    if (e.touches.length === 1 && lastTouch.current) {
      e.preventDefault()
      setPan({
        x: lastTouch.current.panX + (e.touches[0].clientX - lastTouch.current.x),
        y: lastTouch.current.panY + (e.touches[0].clientY - lastTouch.current.y),
      })
    }
  }

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Fullscreen API
  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Click on SVG background clears selection
  const handleSvgClick = (e) => {
    if (e.target.tagName === 'svg' || e.target.tagName === 'rect' || e.target.tagName === 'path') {
      setSelectedPort(null)
    }
  }

  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`

  // Tooltip position from port SVG coords → screen coords relative to container
  const getTooltipPos = (port) => {
    const { x, y } = project(port.lat, port.lng)
    const rect = svgRef.current?.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!rect || !containerRect) return { left: 0, top: 0 }
    // SVG viewBox 0 0 1000 500, rendered to rect dimensions
    const scaleX = rect.width  / W
    const scaleY = rect.height / H
    const screenX = rect.left - containerRect.left + (x * scaleX + pan.x / zoom * scaleX) * zoom
    const screenY = rect.top  - containerRect.top  + (y * scaleY + pan.y / zoom * scaleY) * zoom
    return {
      left: Math.min(screenX + 14, (containerRect.width || 800) - 220),
      top:  Math.max(screenY - 80, 8),
    }
  }

  const totalVessels = WORLD_PORTS.reduce((a, p) => a + p.vesselCount, 0)
  const activePort   = selectedPort || hoveredPort

  return (
    <AppShell crumb="World Ship & Port Tracker">
      <div className="space-y-4 max-w-[1680px] mx-auto">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Global Maritime Intelligence
              </span>
              <span className="text-xs text-inksoft font-medium">Live AIS · Port Dwell Analytics · Vessel Tracking</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">World Ship &amp; Port Tracker</h2>
            <p className="text-sm text-inksoft mt-1 leading-relaxed">
              Track vessels and monitor port dwell times across the global maritime network. Scroll to zoom · drag to pan · click a port for details.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs font-semibold text-inksoft">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-line">
              <span className="text-ink font-bold">{WORLD_PORTS.length}</span> Ports &nbsp;·&nbsp;
              <span className="text-ink font-bold">{totalVessels}</span> Tracked
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AIS Live
            </div>
          </div>
        </div>

        {/* ── Controls Bar ───────────────────────────────────────────────── */}
        <div className="bg-surface rounded-3xl border border-line shadow-xs p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search port, country…"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl pl-8 pr-3 py-2 text-xs text-ink placeholder:text-inksoft/60 focus:outline-none focus:border-[#0085db]/60 transition-colors" />
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-inksoft pointer-events-none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Data Mode */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {[['import','Import'],['export','Export'],['berthing','Berthing'],['anchor','Anchor']].map(([id,label]) => (
                <button key={id} onClick={() => setDataMode(id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${dataMode === id ? 'bg-white dark:bg-slate-700 text-[#0085db] shadow-sm' : 'text-inksoft hover:text-ink'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Region */}
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#0085db]/60">
              {regions.map(r => <option key={r} value={r}>{r === 'all' ? 'All Regions' : r}</option>)}
            </select>

            {/* Vessel Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-inksoft hover:text-ink select-none">
              <div onClick={() => setShowVessels(v => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${showVessels ? 'bg-[#0085db]' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showVessels ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              Vessels
            </label>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button onClick={zoomOut} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-line text-inksoft hover:text-ink hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-base font-bold transition-colors">−</button>
              <button onClick={resetView} className="px-2 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-line text-[10px] font-bold text-inksoft hover:text-ink transition-colors">{Math.round(zoom * 100)}%</button>
              <button onClick={zoomIn} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-line text-inksoft hover:text-ink hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-base font-bold transition-colors">+</button>
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-line text-inksoft hover:text-ink hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen map'}>
              {isFullscreen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 0 2-2h3M3 16h3a2 2 0 0 0 2 2v3"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Map + Side Panel ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* MAP CANVAS */}
          <div
            ref={containerRef}
            className="lg:col-span-9 bg-surface rounded-3xl border border-line shadow-xs overflow-hidden relative select-none"
            style={{ height: isFullscreen ? '100vh' : '600px' }}
          >
            {/* SVG World Map */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={() => { lastTouch.current = null }}
              onClick={handleSvgClick}
              style={{ background: '#c8d8e8' }}
            >
              <g style={{ transform, transformOrigin: '50% 50%', transition: isDragging.current ? 'none' : 'transform 0.05s' }}>
                {/* Ocean background */}
                <rect x="0" y="0" width={W} height={H} fill="#c8d8e8" />

                {/* Graticule (grid lines) */}
                <g stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" fill="none">
                  {[-60,-30,0,30,60].map(lat => {
                    const { y } = project(lat, 0)
                    return <line key={lat} x1="0" y1={y} x2={W} y2={y} />
                  })}
                  {[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lng => {
                    const { x } = project(0, lng)
                    return <line key={lng} x1={x} y1="0" x2={x} y2={H} />
                  })}
                </g>

                {/* Equator & Prime Meridian highlight */}
                <line x1="0" y1={H/2} x2={W} y2={H/2} stroke="rgba(255,255,255,0.45)" strokeWidth="0.7" strokeDasharray="4 4" />
                <line x1={W/2} y1="0" x2={W/2} y2={H} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" strokeDasharray="4 4" />

                {/* Landmasses */}
                {LANDMASSES.map((d, i) => (
                  <path key={i} d={d} fill="#d4cdb5" stroke="#b8b09c" strokeWidth="0.5" />
                ))}

                {/* Port circles */}
                {filteredPorts.map(port => {
                  const { x, y } = project(port.lat, port.lng)
                  const dwell = getDwellValue(port)
                  const color = getDwellColor(dwell)
                  const r = (RADIUS[port.type] || 5) / zoom * 1.4 + 2
                  const isSelected = selectedPort?.id === port.id
                  const isHov = hoveredPort?.id === port.id
                  return (
                    <g key={port.id}
                      onMouseEnter={() => setHoveredPort(port)}
                      onMouseLeave={() => setHoveredPort(null)}
                      onClick={e => { e.stopPropagation(); setSelectedPort(port) }}
                      style={{ cursor: 'pointer' }}
                    >
                      {(isSelected || isHov) && (
                        <circle cx={x} cy={y} r={r + 4} fill={color} opacity="0.25" />
                      )}
                      <circle cx={x} cy={y} r={r} fill={color} stroke="white" strokeWidth={isSelected ? 1.8 : 1.1} opacity="0.9" />
                      {isSelected && (
                        <circle cx={x} cy={y} r={r + 2} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
                      )}
                    </g>
                  )
                })}

                {/* Vessel markers */}
                {showVessels && ACTIVE_VESSELS.map(v => {
                  const { x, y } = project(v.lat, v.lng)
                  const c = VESSEL_COLOR[v.status] || '#3b82f6'
                  const r = 4 / zoom * 1.2 + 1.5
                  return (
                    <g key={v.id}
                      onMouseEnter={() => setHoveredVessel(v)}
                      onMouseLeave={() => setHoveredVessel(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle cx={x} cy={y} r={r + 2} fill={c} opacity="0.2" />
                      <circle cx={x} cy={y} r={r} fill={c} stroke="white" strokeWidth="1" />
                      {/* Ship arrow */}
                      <polygon
                        points={`${x},${y - r - 2} ${x - r * 0.6},${y + r * 0.4} ${x + r * 0.6},${y + r * 0.4}`}
                        fill="white" opacity="0.85"
                      />
                    </g>
                  )
                })}
              </g>
            </svg>

            {/* Port Hover / Selected Tooltip */}
            <AnimatePresence>
              {(hoveredPort && !selectedPort) && (() => {
                const port = hoveredPort
                const dwell = getDwellValue(port)
                const pos = getTooltipPos(port)
                return (
                  <motion.div key="hover-tip"
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute pointer-events-none z-30 bg-white dark:bg-slate-900 border border-line rounded-2xl shadow-xl p-3 min-w-[190px] text-xs"
                    style={{ left: pos.left, top: pos.top }}>
                    <div className="font-bold text-ink mb-0.5">{port.name}</div>
                    <div className="text-inksoft mb-2">{port.code} · {port.country}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-inksoft">Import Dwell</span>
                      <span className="font-bold" style={{ color: getDwellColor(port.importDwell) }}>{port.importDwell}d</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-inksoft">Vessels</span>
                      <span className="font-bold text-ink">{port.vesselCount}</span>
                    </div>
                    <div className="text-[10px] text-[#0085db] mt-1.5">Click for full details →</div>
                  </motion.div>
                )
              })()}
            </AnimatePresence>

            {/* Vessel Hover Tooltip */}
            <AnimatePresence>
              {hoveredVessel && (() => {
                const v = hoveredVessel
                const { x, y } = project(v.lat, v.lng)
                const rect = svgRef.current?.getBoundingClientRect()
                const cRect = containerRef.current?.getBoundingClientRect()
                const scaleX = (rect?.width || W) / W
                const scaleY = (rect?.height || H) / H
                const sx = (rect?.left || 0) - (cRect?.left || 0) + x * scaleX * zoom + pan.x
                const sy = (rect?.top  || 0) - (cRect?.top  || 0) + y * scaleY * zoom + pan.y
                return (
                  <motion.div key="vessel-tip"
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute pointer-events-none z-30 bg-white dark:bg-slate-900 border border-line rounded-2xl shadow-xl p-3 min-w-[180px] text-xs"
                    style={{ left: Math.min(sx + 12, (cRect?.width || 800) - 200), top: Math.max(sy - 70, 8) }}>
                    <div className="font-bold text-ink mb-0.5">{v.name}</div>
                    <div className="text-inksoft mb-1.5">{v.imo}</div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: VESSEL_COLOR[v.status] }} />
                      <span className="font-semibold capitalize" style={{ color: VESSEL_COLOR[v.status] }}>{v.status}</span>
                    </div>
                    <div className="text-inksoft mt-1">{v.line} · {v.teu.toLocaleString()} TEU</div>
                    {v.port && <div className="text-inksoft mt-0.5">📍 {v.port}</div>}
                    <div className="text-[#0085db] font-bold mt-1">ETA: {v.eta}</div>
                  </motion.div>
                )
              })()}
            </AnimatePresence>

            {/* Dwell Legend (bottom-left) */}
            <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-2xl border border-line shadow-lg px-3 py-2">
              <div className="flex items-center justify-between mb-1.5 gap-4">
                <span className="text-[10px] font-bold text-inksoft uppercase tracking-wider">Median Dwell (days)</span>
              </div>
              <div className="flex items-end gap-1">
                {DWELL_LEGEND.map(d => (
                  <div key={d.label} className="flex flex-col items-center gap-0.5">
                    <div className="w-10 h-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-[8.5px] text-inksoft">{d.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-line/50">
                <div className="flex items-center gap-1 text-[9.5px] text-inksoft"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Berthed</div>
                <div className="flex items-center gap-1 text-[9.5px] text-inksoft"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Anchored</div>
                <div className="flex items-center gap-1 text-[9.5px] text-inksoft"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Transit</div>
              </div>
            </div>

            {/* Zoom hint */}
            <div className="absolute top-3 right-3 z-20 text-[10px] text-inksoft bg-white/80 dark:bg-slate-900/80 rounded-xl px-2 py-1 border border-line/60">
              Scroll to zoom · Drag to pan
            </div>
          </div>

          {/* ── RIGHT INFO PANEL ─────────────────────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto max-h-[600px]">
            {/* Selected Port Detail */}
            {selectedPort ? (
              <div className="bg-surface rounded-3xl border border-line shadow-xs overflow-hidden">
                <div className="p-4 border-b border-line bg-slate-50/70 dark:bg-slate-800/40 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-[#0085db]">{selectedPort.code}</div>
                    <h4 className="text-sm font-extrabold text-ink leading-tight mt-0.5">{selectedPort.name}</h4>
                    <div className="text-xs text-inksoft mt-0.5">{selectedPort.country} · {selectedPort.region}</div>
                  </div>
                  <button onClick={() => setSelectedPort(null)}
                    className="text-inksoft hover:text-ink w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors flex-none">✕</button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                      <span className="text-[9.5px] font-bold text-inksoft uppercase tracking-wider block mb-1">Vessels</span>
                      <span className="text-sm font-extrabold text-ink">{selectedPort.vesselCount}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                      <span className="text-[9.5px] font-bold text-inksoft uppercase tracking-wider block mb-1">Type</span>
                      <span className="text-xs font-bold text-ink capitalize">{selectedPort.type}</span>
                    </div>
                  </div>

                  <div className="text-[10.5px] font-bold text-inksoft uppercase tracking-wider">Container Dwell</div>
                  {[['Import Dwell', selectedPort.importDwell], ['Export Dwell', selectedPort.exportDwell]].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-inksoft flex-none">{label}</span>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(val/15*100, 100)}%`, background: getDwellColor(val) }} />
                        </div>
                        <span className="font-bold text-ink w-12 text-right">{val}d</span>
                      </div>
                    </div>
                  ))}

                  <div className="text-[10.5px] font-bold text-inksoft uppercase tracking-wider">Vessel Dwell</div>
                  {[['Berthing', selectedPort.berthingDwell], ['Anchor', selectedPort.anchorDwell]].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-inksoft flex-none">{label}</span>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(val/2*100, 100)}%`, background: getDwellColor(val * 5) }} />
                        </div>
                        <span className="font-bold text-ink w-12 text-right">{val}d</span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <span className="text-xs font-bold text-inksoft">Median Dwell</span>
                    <span className="text-lg font-extrabold" style={{ color: getDwellColor(selectedPort.medianDwell) }}>
                      {selectedPort.medianDwell}d
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface rounded-3xl border border-line shadow-xs p-6 text-center">
                <div className="text-3xl mb-2">🌍</div>
                <div className="text-sm font-bold text-ink mb-1">Click a port circle</div>
                <div className="text-xs text-inksoft leading-relaxed">Click any coloured circle on the map to view detailed dwell analytics.</div>
              </div>
            )}

            {/* Global Stats */}
            <div className="bg-surface rounded-3xl border border-line shadow-xs p-4">
              <h4 className="text-xs font-bold text-ink mb-3 uppercase tracking-wider">Global Summary</h4>
              <div className="space-y-2">
                {[
                  { label: 'Avg Import Dwell', value: `${(WORLD_PORTS.reduce((a,p)=>a+p.importDwell,0)/WORLD_PORTS.length).toFixed(1)}d`, color: 'text-[#0085db]' },
                  { label: 'Avg Export Dwell', value: `${(WORLD_PORTS.reduce((a,p)=>a+p.exportDwell,0)/WORLD_PORTS.length).toFixed(1)}d`, color: 'text-[#0085db]' },
                  { label: 'Most Congested', value: WORLD_PORTS.reduce((a,b)=>a.importDwell>b.importDwell?a:b).name.split(' ').slice(0,2).join(' '), color: 'text-rose-600 dark:text-rose-400' },
                  { label: 'Best Throughput', value: WORLD_PORTS.reduce((a,b)=>a.importDwell<b.importDwell?a:b).name.split(' ').slice(0,2).join(' '), color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'In Transit', value: `${ACTIVE_VESSELS.filter(v=>v.status==='transit').length} vessels`, color: 'text-sky-600' },
                  { label: 'Berthed Now', value: `${ACTIVE_VESSELS.filter(v=>v.status==='berthed').length} vessels`, color: 'text-emerald-600 dark:text-emerald-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-inksoft">{label}</span>
                    <span className={`font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Port Directory */}
            <div className="bg-surface rounded-3xl border border-line shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-line bg-slate-50/70 dark:bg-slate-800/40">
                <h4 className="text-xs font-bold text-ink">Port Directory</h4>
                <p className="text-[11px] text-inksoft mt-0.5">{filteredPorts.length} ports · click to highlight</p>
              </div>
              <div className="divide-y divide-line max-h-56 overflow-y-auto">
                {filteredPorts.map(port => (
                  <button key={port.id} onClick={() => setSelectedPort(port)}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedPort?.id === port.id ? 'bg-sky-50 dark:bg-sky-950/40 border-l-2 border-[#0085db]' : ''}`}>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-ink truncate">{port.name}</div>
                      <div className="text-[10px] text-inksoft">{port.code} · {port.country}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-none">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: getDwellColor(port.medianDwell) }} />
                      <span className="text-[11px] font-bold text-ink">{port.medianDwell}d</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
