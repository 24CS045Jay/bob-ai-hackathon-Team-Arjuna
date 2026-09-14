import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MAP_ENTITIES } from '../../data/mapEntities.mock.js'
import { WEATHER_TIDE } from '../../data/weatherTide.mock.js'
import MapDot from './MapDot.jsx'
import MapLegend from './MapLegend.jsx'
import ZoomControl from './ZoomControl.jsx'
import { buttonPressInteraction } from '../../utils/motion.js'

export default function PortMap() {
  const stageRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [activeLayer, setActiveLayer] = useState('all') // 'all' | 'vessel' | 'berth' | 'gate' | 'congestion'
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [popover, setPopover] = useState(null)
  const [selectedEntity, setSelectedEntity] = useState(null)

  const handleHover = (entity) => {
    if (!stageRef.current) return
    const stageRect = stageRef.current.getBoundingClientRect()
    const px = (entity.x / 900) * stageRect.width
    const py = (entity.y / 480) * stageRect.height
    setPopover({ ...entity, px, py })
  }

  const zoomBy = (dir) => setZoom((z) => Math.min(1.8, Math.max(0.75, Number((z + dir * 0.15).toFixed(2)))))
  const resetZoom = () => setZoom(1)

  // Filter entities
  const filteredEntities = MAP_ENTITIES.filter((item) => {
    const matchesQuery =
      !searchQuery.trim() ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sub1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sub2.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesQuery) return false

    if (activeLayer === 'all') return true
    if (activeLayer === 'congestion') return item.status === 'warn' || item.status === 'crit'
    return item.type === activeLayer
  })

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col border border-line relative select-none">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-obsidian-800/40">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-ok animate-pulseDot" />
          <h3 className="text-xs sm:text-sm font-semibold text-ink">
            Port Digital Twin Telemetry Map
          </h3>
          <span className="text-[10px] font-mono text-inksoft bg-obsidian-700/50 px-2 py-0.5 rounded border border-line">
            900 × 480 GRID
          </span>
        </div>

        {/* Weather Overlay Toggle */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={buttonPressInteraction}
            onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 font-medium ${
              showWeatherOverlay
                ? 'bg-brand/15 border-brand/40 text-brand-glow shadow-[0_0_10px_rgba(59,124,246,0.25)]'
                : 'glass border-line text-inksoft hover:text-ink'
            }`}
          >
            <span className="text-xs">🌊</span>
            <span>Ocean &amp; Tide Overlay</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                showWeatherOverlay ? 'bg-brand-glow' : 'bg-inksoft/40'
              }`}
            />
          </motion.button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-4 py-2.5 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-obsidian-900/50">
        {/* Layer Filters */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Layers' },
            { id: 'vessel', label: 'Vessels' },
            { id: 'berth', label: 'Berths & Quayside' },
            { id: 'gate', label: 'Gates & Roads' },
            { id: 'congestion', label: 'Congestion Heat' }
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeLayer === layer.id
                  ? 'bg-brand/20 text-brand-glow font-semibold border border-brand/35 shadow-sm'
                  : 'text-inksoft hover:text-ink hover:bg-obsidian-800/60'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex-1 min-w-[200px] max-w-[280px] relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vessel, gate, or berth…"
            className="w-full glass border border-line rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-inksoft/60 focus:outline-none focus:border-brand/50 font-mono"
          />
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-inksoft pointer-events-none"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Map Surface Viewport */}
      <div
        ref={stageRef}
        className="relative flex-1 min-h-[380px] sm:min-h-[440px] overflow-hidden"
        style={{ backgroundColor: 'var(--map-water, #0A0D12)' }}
      >
        {/* Weather & Tide Telemetry HUD */}
        {showWeatherOverlay && (
          <div className="absolute top-3 left-3 z-10 glass-strong border border-lineSoft rounded-xl p-3 shadow-xl max-w-[280px] text-xs select-none pointer-events-none sm:pointer-events-auto">
            <div className="flex items-center justify-between border-b border-line pb-1.5 mb-2 font-mono text-[10px] text-inksoft uppercase tracking-wider">
              <span>Maritime Weather HUD</span>
              <span className="text-ok flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulseDot" />
                Live Feed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-inksoft block text-[10px]">Tide Height</span>
                <span className="font-mono font-bold text-brand-glow text-xs">
                  +{WEATHER_TIDE.currentTide.heightMeters}m
                </span>
                <span className="text-[9.5px] text-inksoft block truncate">
                  {WEATHER_TIDE.currentTide.status}
                </span>
              </div>

              <div>
                <span className="text-inksoft block text-[10px]">Wind Velocity</span>
                <span className="font-mono font-bold text-amber text-xs">
                  {WEATHER_TIDE.wind.speedKts} kts
                </span>
                <span className="text-[9.5px] text-inksoft block truncate">
                  Gusts {WEATHER_TIDE.wind.gustKts} kts · {WEATHER_TIDE.wind.direction}
                </span>
              </div>

              <div>
                <span className="text-inksoft block text-[10px]">Visibility</span>
                <span className="font-mono font-bold text-ink text-xs">
                  {WEATHER_TIDE.visibility?.nm ?? WEATHER_TIDE.atmosphere?.visibilityNm ?? 8.5} nm
                </span>
                <span className="text-[9.5px] text-inksoft block truncate">
                  {WEATHER_TIDE.visibility?.condition ?? WEATHER_TIDE.atmosphere?.visibilityLabel ?? 'Good'}
                </span>
              </div>

              <div>
                <span className="text-inksoft block text-[10px]">Water Temp</span>
                <span className="font-mono font-bold text-ink text-xs">
                  {WEATHER_TIDE.waterTempC ?? WEATHER_TIDE.seaState?.waterTempC ?? 17.4}°C
                </span>
                <span className="text-[9.5px] text-inksoft block truncate">
                  Swell {WEATHER_TIDE.swell?.heightMeters ?? WEATHER_TIDE.seaState?.swellHeightMeters ?? 1.2}m @ {WEATHER_TIDE.swell?.periodSec ?? WEATHER_TIDE.seaState?.periodSec ?? 7}s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scalable SVG Map Surface */}
        <svg
          viewBox="0 0 900 480"
          className="w-full h-full object-cover transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Water Base Surface */}
          <rect width="900" height="480" fill="var(--map-water, #0C1017)" />

          {/* Grid lines for Swiss alignment */}
          <g stroke="var(--color-line-rgb, rgba(255,255,255,0.025))" strokeOpacity="0.06" strokeWidth="1">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`v_${i}`} x1={(i + 1) * 100} y1="0" x2={(i + 1) * 100} y2="480" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`h_${i}`} x1="0" y1={(i + 1) * 80} x2="900" y2={(i + 1) * 80} />
            ))}
          </g>

          {/* Landmass Outlines */}
          {/* West Breakwater & North Peninsula */}
          <path
            d="M0,0 L260,0 C300,70 250,160 180,190 C110,220 60,300 90,380 C110,440 60,470 0,480 Z"
            fill="var(--map-land, #141923)"
            stroke="var(--color-line-rgb, rgba(255,255,255,0.08))"
            strokeOpacity="0.15"
            strokeWidth="1.2"
          />

          {/* South Container Pier & Yard Land */}
          <path
            d="M900,480 L900,220 C820,240 760,300 780,360 C795,405 760,440 700,470 C650,490 620,480 620,480 Z"
            fill="var(--map-land, #141923)"
            stroke="var(--color-line-rgb, rgba(255,255,255,0.08))"
            strokeOpacity="0.15"
            strokeWidth="1.2"
          />

          {/* Terminal Quayside Docks & Finger Piers */}
          <path
            d="M230,55 L420,85 L400,140 L245,115 Z"
            fill="var(--map-pier, #1E2532)"
            stroke="var(--color-line-rgb, rgba(255,255,255,0.12))"
            strokeOpacity="0.2"
            strokeWidth="1.2"
          />
          <path
            d="M250,120 L390,150 L370,225 L255,200 Z"
            fill="var(--map-pier, #1E2532)"
            stroke="var(--color-line-rgb, rgba(255,255,255,0.12))"
            strokeOpacity="0.2"
            strokeWidth="1.2"
          />
          <path
            d="M440,160 L620,220 L600,285 L445,230 Z"
            fill="var(--map-pier, #1E2532)"
            stroke="var(--color-line-rgb, rgba(255,255,255,0.12))"
            strokeOpacity="0.2"
            strokeWidth="1.2"
          />

          {/* Container Yard Stacks Blocks */}
          <g fill="var(--map-block, #18202D)" stroke="var(--color-line-rgb, rgba(255,255,255,0.06))" strokeOpacity="0.15" strokeWidth="1">
            <rect x="140" y="60" width="70" height="35" rx="3" />
            <text x="175" y="82" fill="var(--color-inksoft, #8A93A3)" fontSize="9" textAnchor="middle" fontFamily="monospace">
              BLOCK A
            </text>

            <rect x="130" y="110" width="75" height="35" rx="3" />
            <text x="167" y="132" fill="var(--color-inksoft, #8A93A3)" fontSize="9" textAnchor="middle" fontFamily="monospace">
              BLOCK B
            </text>

            <rect x="110" y="160" width="65" height="35" rx="3" />
            <text x="142" y="182" fill="var(--color-inksoft, #8A93A3)" fontSize="9" textAnchor="middle" fontFamily="monospace">
              BLOCK C
            </text>

            {/* Block D (Reefer Hotspot) */}
            <rect x="70" y="320" width="65" height="40" rx="3" fill="var(--map-block, #241B18)" stroke="rgba(224,151,42,0.4)" />
            <text x="102" y="344" fill="#E0972A" fontSize="9" textAnchor="middle" fontFamily="monospace">
              BLOCK D (92%)
            </text>
          </g>

          {/* Navigational Fairway Channel Lines */}
          <g stroke="rgba(59,124,246,0.25)" strokeWidth="1.5" strokeDasharray="5 5" fill="none">
            <path d="M280,80 L640,140" />
            <path d="M310,145 L670,210" />
            <path d="M340,215 L660,305" />
            <path d="M380,310 L750,420" />
          </g>

          {/* Radar Sweep Line Animation */}
          <line
            x1="450"
            y1="240"
            x2="850"
            y2="100"
            stroke="rgba(91,155,255,0.2)"
            strokeWidth="2"
            className="origin-[450px_240px] animate-[spin_10s_linear_infinite]"
          />

          {/* Render Entity Dots */}
          <g>
            {filteredEntities.map((entity, i) => (
              <MapDot
                key={entity.id}
                entity={entity}
                index={i}
                onHover={handleHover}
                onLeave={() => setPopover(null)}
                onClick={(item) => setSelectedEntity(item)}
              />
            ))}
          </g>
        </svg>

        {/* Map Controls */}
        <ZoomControl onZoomIn={() => zoomBy(1)} onZoomOut={() => zoomBy(-1)} onReset={resetZoom} />
        <MapLegend />

        {/* Hover Popover */}
        <AnimatePresence>
          {popover && !selectedEntity && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="absolute pointer-events-none glass-strong border border-lineSoft rounded-xl p-3 text-xs min-w-[190px] shadow-2xl z-30 select-none"
              style={{ left: Math.min(popover.px + 16, 680), top: Math.max(popover.py - 20, 10) }}
            >
              <div className="font-semibold text-ink flex items-center justify-between gap-2 mb-1">
                <span>{popover.label}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    popover.status === 'crit'
                      ? 'bg-crit animate-critGlow'
                      : popover.status === 'warn'
                      ? 'bg-amber'
                      : 'bg-ok'
                  }`}
                />
              </div>
              <div className="text-[11px] text-inksoft">{popover.sub1}</div>
              <div className="text-[11px] text-inksoft font-mono mt-0.5">{popover.sub2}</div>
              <div className="text-[9.5px] text-brand-glow mt-1.5 font-medium">Click to inspect entity →</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clicked Entity Inspector Drawer */}
        <AnimatePresence>
          {selectedEntity && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute right-3.5 top-3.5 z-40 glass-strong border border-lineSoft rounded-2xl p-4 shadow-2xl w-72 sm:w-80"
            >
              <div className="flex items-start justify-between border-b border-line pb-2.5 mb-3">
                <div>
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-brand-glow bg-brand/10 px-1.5 py-0.2 rounded border border-brand/20">
                    {selectedEntity.type}
                  </span>
                  <h4 className="text-sm font-bold text-ink mt-1">{selectedEntity.label}</h4>
                </div>
                <motion.button
                  whileTap={buttonPressInteraction}
                  onClick={() => setSelectedEntity(null)}
                  className="text-inksoft hover:text-ink w-6 h-6 rounded flex items-center justify-center hover:bg-obsidian-700/60 transition-colors"
                >
                  ✕
                </motion.button>
              </div>

              <div className="space-y-2.5 text-xs text-inksoft mb-4">
                <div className="flex justify-between border-b border-line/40 pb-1.5">
                  <span>Status</span>
                  <span
                    className={`font-semibold uppercase font-mono text-[10.5px] ${
                      selectedEntity.status === 'crit'
                        ? 'text-crit'
                        : selectedEntity.status === 'warn'
                        ? 'text-amber'
                        : 'text-ok'
                    }`}
                  >
                    {selectedEntity.status === 'crit'
                      ? 'Critical Alert'
                      : selectedEntity.status === 'warn'
                      ? 'Elevated Delay'
                      : 'Normal Flow'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-line/40 pb-1.5">
                  <span>Operational State</span>
                  <span className="text-ink font-medium">{selectedEntity.sub1}</span>
                </div>

                <div className="flex justify-between border-b border-line/40 pb-1.5">
                  <span>Telemetry Metric</span>
                  <span className="text-ink font-mono">{selectedEntity.sub2}</span>
                </div>

                <div className="flex justify-between">
                  <span>Grid Coordinates</span>
                  <span className="font-mono text-inksoft">
                    X:{selectedEntity.x} · Y:{selectedEntity.y}
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={buttonPressInteraction}
                onClick={() => setSelectedEntity(null)}
                className="w-full text-xs font-semibold py-2 rounded-lg bg-obsidian-700/70 text-ink hover:bg-obsidian-700 transition-colors"
              >
                Close Inspector
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
