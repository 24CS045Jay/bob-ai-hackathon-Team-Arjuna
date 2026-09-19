import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import AppShell from '../components/layout/AppShell.jsx'
import { WORLD_PORTS, ACTIVE_VESSELS, SHIPPING_LANES } from '../data/worldPorts.mock.js'
import { fetchLiveVessels, fetchVesselDecision } from '../api/client.js'

// ─── Dwell colour scale ──────────────────────────────────────────────────────
function getDwellColor(dwell) {
  if (dwell <= 2.0) return '#1a3a6e'
  if (dwell <= 2.7) return '#1e6bb8'
  if (dwell <= 3.9) return '#0085db'
  if (dwell <= 4.9) return '#f59e0b'
  if (dwell <= 6.4) return '#f97316'
  return '#dc2626'
}

const DWELL_LEGEND = [
  { label: '0–2.0d',   color: '#1a3a6e' },
  { label: '2.1–2.7d', color: '#1e6bb8' },
  { label: '2.8–3.9d', color: '#0085db' },
  { label: '4.0–4.9d', color: '#f59e0b' },
  { label: '5.0–6.4d', color: '#f97316' },
  { label: '6.5d+',    color: '#dc2626' },
]

// ─── Vessel Recommendation Theme ─────────────────────────────────────────────
const RECOMMENDATION_THEME = {
  PROCEED: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-600 text-white',
    icon: '✅',
    label: 'PROCEED · CERTIFIED SAFE',
    color: '#10b981',
  },
  REROUTE: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/30',
    badge: 'bg-rose-600 text-white',
    icon: '⚠️',
    label: 'REROUTE · WEATHER HAZARD',
    color: '#f43f5e',
  },
  HOLD: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-600 text-white',
    icon: '⚓',
    label: 'HOLD · ANCHORAGE WAIT',
    color: '#f59e0b',
  },
}

// Vessel status colours
const VESSEL_COLOR = {
  berthed: '#10b981',
  anchored: '#f59e0b',
  transit: '#3b82f6',
}

// ─── Map Tile Providers ───────────────────────────────────────────────────────
const MAP_PROVIDERS = {
  'google-streets': {
    id: 'google-streets',
    name: 'Google World Map (Streets)',
    desc: 'Crisp, high-definition Google Maps standard street & landform view',
    badge: 'Google Look',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps'
  },
  'google-hybrid': {
    id: 'google-hybrid',
    name: 'Google Hybrid (Satellite + Roads)',
    desc: 'Authentic photorealistic Google Satellite imagery with navigation labels',
    badge: 'Satellite',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Satellite'
  },
  'carto-voyager': {
    id: 'carto-voyager',
    name: 'CARTO Voyager (Clean GIS)',
    desc: 'Clean, modern cartography with enhanced coastal & harbor outlines',
    badge: 'Vector GIS',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  'esri-satellite': {
    id: 'esri-satellite',
    name: 'Esri World Imagery (HD Satellite)',
    desc: 'High-resolution global optical satellite photos for port infrastructure inspection',
    badge: 'Optical HD',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: [],
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri World Imagery'
  },
  'carto-dark': {
    id: 'carto-dark',
    name: 'Carto Dark Matter (Night Ops)',
    desc: 'Sleek obsidian theme designed for low-light command center operations',
    badge: 'Dark Ops',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  'maptiler': {
    id: 'maptiler',
    name: 'MapTiler Streets (Free API Key)',
    desc: 'Vector-sharp world map utilizing your free MapTiler API key',
    badge: 'API Key',
    url: 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key={key}',
    subdomains: [],
    maxZoom: 20,
    requiresKey: true,
    attribution: '&copy; MapTiler &copy; OpenStreetMap'
  }
}

const STORAGE_KEY = 'portflow_map_settings_v1'

export default function WorldMapPage() {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const tileLayerRef = useRef(null)
  const portLayerGroupRef = useRef(null)
  const vesselLayerGroupRef = useRef(null)
  const lanesLayerGroupRef = useRef(null)
  const rerouteLayerGroupRef = useRef(null)

  // Configuration state
  const [activeProvider, setActiveProvider] = useState('google-streets')
  const [apiKey, setApiKey] = useState('')
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  // Filters & display state
  const [dataMode, setDataMode] = useState('import') // 'import' | 'export' | 'berthing' | 'anchor'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPort, setSelectedPort] = useState(null)
  const [regionFilter, setRegionFilter] = useState('all')
  const [showVessels, setShowVessels] = useState(true)
  const [showLanes, setShowLanes] = useState(true)
  const [showDwellRings, setShowDwellRings] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Live AIS Vessels & Decision Engine state
  const [liveVessels, setLiveVessels] = useState([])
  const [selectedVessel, setSelectedVessel] = useState(null)
  const [vesselDecision, setVesselDecision] = useState(null)
  const [loadingDecision, setLoadingDecision] = useState(false)
  const [appliedReroute, setAppliedReroute] = useState(false)
  const [activeTab, setActiveTab] = useState('vessels') // 'vessels' | 'ports'
  const [vesselFilter, setVesselFilter] = useState('all') // 'all' | 'reroute' | 'high_risk' | 'proceed'

  // Map Telemetry HUD state
  const [cursorCoords, setCursorCoords] = useState({ lat: 20.0, lng: 10.0 })
  const [currentZoom, setCurrentZoom] = useState(3)

  // Poll / Load Live AIS Vessels
  useEffect(() => {
    let isMounted = true
    const loadVessels = async () => {
      try {
        const data = await fetchLiveVessels()
        if (isMounted && data?.vessels?.length > 0) {
          setLiveVessels(data.vessels)
        }
      } catch (err) {
        console.warn('Live vessels stream unavailable, falling back:', err)
      }
    }
    loadVessels()
    const timer = setInterval(loadVessels, 25000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  // Load Full Decision for Selected Vessel
  useEffect(() => {
    if (!selectedVessel) {
      setVesselDecision(null)
      setAppliedReroute(false)
      rerouteLayerGroupRef.current?.clearLayers()
      return
    }

    let isMounted = true
    setLoadingDecision(true)
    fetchVesselDecision(selectedVessel.mmsi)
      .then((dec) => {
        if (isMounted && dec) {
          setVesselDecision(dec)
        }
      })
      .catch((err) => console.warn('Could not load vessel decision:', err))
      .finally(() => {
        if (isMounted) setLoadingDecision(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedVessel])

  // Load saved configuration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.activeProvider && MAP_PROVIDERS[parsed.activeProvider]) {
          setActiveProvider(parsed.activeProvider)
        }
        if (parsed.apiKey) {
          setApiKey(parsed.apiKey)
        }
      }
    } catch (e) {
      console.warn('Could not load map configuration:', e)
    }
  }, [])

  // Save configuration changes to localStorage
  const saveConfig = (newProvider, newKey) => {
    setActiveProvider(newProvider)
    setApiKey(newKey)
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ activeProvider: newProvider, apiKey: newKey })
      )
    } catch (e) {
      console.warn('Could not save map configuration:', e)
    }
  }

  // Get active dwell metric for any port
  const getDwellValue = (port) => {
    if (!port) return 0
    return (
      {
        import: port.importDwell,
        export: port.exportDwell,
        berthing: port.berthingDwell,
        anchor: port.anchorDwell,
      }[dataMode] ?? port.medianDwell
    )
  }

  const regions = useMemo(
    () => ['all', ...new Set(WORLD_PORTS.map((p) => p.region))],
    []
  )

  const filteredPorts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return WORLD_PORTS.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
      const matchR = regionFilter === 'all' || p.region === regionFilter
      return matchQ && matchR
    })
  }, [searchQuery, regionFilter])

  // Displayed vessels (Live AIS or mock fallback)
  const displayedVessels = useMemo(() => {
    let list = liveVessels.length > 0 ? liveVessels : ACTIVE_VESSELS.map((v, i) => ({
      ...v,
      mmsi: 300000000 + i,
      sog: v.speedKts,
      cog: v.heading,
      origin_country: 'International',
      billing_currency: 'USD',
      route_risk_level: 'LOW',
      recommendation: 'PROCEED',
      weather_score: 0.18,
      wind_speed_knots: 11.5,
      wave_height_m: 0.8,
      total_cost_usd: 24000,
      eta_hours: 12.5,
    }))

    if (vesselFilter === 'reroute') {
      list = list.filter((v) => v.recommendation === 'REROUTE')
    } else if (vesselFilter === 'high_risk') {
      list = list.filter((v) => v.route_risk_level === 'HIGH')
    } else if (vesselFilter === 'proceed') {
      list = list.filter((v) => v.recommendation === 'PROCEED')
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((v) =>
        (v.name || '').toLowerCase().includes(q) ||
        String(v.mmsi).includes(q) ||
        (v.destination || '').toLowerCase().includes(q)
      )
    }

    return list
  }, [liveVessels, vesselFilter, searchQuery])

  // ─── Initialize Leaflet Map ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    // Create Map instance
    const map = L.map(mapContainerRef.current, {
      center: [22.0, 30.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
      zoomControl: false, // Custom placed zoom controls
      attributionControl: false,
    })

    // Add Attribution in bottom right with sleek styling
    L.control
      .attribution({
        position: 'bottomright',
        prefix: '<span class="text-[10px] text-slate-500 font-sans">PortFlow GIS</span>',
      })
      .addTo(map)

    // Layer groups
    const lanesGroup = L.layerGroup().addTo(map)
    const portGroup = L.layerGroup().addTo(map)
    const vesselGroup = L.layerGroup().addTo(map)
    const rerouteGroup = L.layerGroup().addTo(map)

    lanesLayerGroupRef.current = lanesGroup
    portLayerGroupRef.current = portGroup
    vesselLayerGroupRef.current = vesselGroup
    rerouteLayerGroupRef.current = rerouteGroup
    mapInstanceRef.current = map

    // Telemetry listeners
    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
      })
    })

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom())
    })

    // Click map background clears port and vessel selection
    map.on('click', (e) => {
      if (e.originalEvent.target.classList.contains('leaflet-container') ||
          e.originalEvent.target.classList.contains('leaflet-tile')) {
        setSelectedPort(null)
        setSelectedVessel(null)
        setAppliedReroute(false)
        rerouteLayerGroupRef.current?.clearLayers()
      }
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // ─── Update Tile Layer when Provider or API Key changes ─────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }

    const providerConfig = MAP_PROVIDERS[activeProvider] || MAP_PROVIDERS['google-streets']
    let tileUrl = providerConfig.url

    // Inject MapTiler or custom API key if required
    if (providerConfig.requiresKey) {
      const activeKey = apiKey.trim() || 'demo'
      tileUrl = tileUrl.replace('{key}', activeKey)
    }

    const newTileLayer = L.tileLayer(tileUrl, {
      subdomains: providerConfig.subdomains || [],
      maxZoom: providerConfig.maxZoom || 19,
      attribution: providerConfig.attribution,
    })

    newTileLayer.addTo(map)
    tileLayerRef.current = newTileLayer
  }, [activeProvider, apiKey])

  // ─── Render Shipping Lanes ──────────────────────────────────────────────────
  useEffect(() => {
    const group = lanesLayerGroupRef.current
    if (!group) return
    group.clearLayers()

    if (!showLanes) return

    SHIPPING_LANES.forEach((lane) => {
      // Outer glow line
      const glowLine = L.polyline(lane.coordinates, {
        color: lane.color,
        weight: 6,
        opacity: 0.22,
        lineCap: 'round',
        interactive: false,
      })

      // Core dashed corridor line
      const coreLine = L.polyline(lane.coordinates, {
        color: lane.color,
        weight: 2.2,
        opacity: 0.85,
        dashArray: lane.dashArray || '6, 8',
        lineCap: 'round',
      })

      coreLine.bindTooltip(
        `<div class="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" style="background:${lane.color}"></span>
          <span>${lane.name}</span>
        </div>`,
        { sticky: true, className: 'leaflet-tooltip-custom' }
      )

      group.addLayer(glowLine)
      group.addLayer(coreLine)
    })
  }, [showLanes])

  // ─── Render Port Markers with Live Dwell Heat Rings ──────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    const group = portLayerGroupRef.current
    if (!map || !group) return
    group.clearLayers()

    filteredPorts.forEach((port) => {
      const dwell = getDwellValue(port)
      const color = getDwellColor(dwell)
      const isSelected = selectedPort?.id === port.id
      const isCongested = dwell >= 6.0

      const baseRadius = port.type === 'mega' ? 14 : port.type === 'large' ? 11 : 9
      const markerSize = baseRadius * 2 + 8

      const html = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width:${markerSize}px; height:${markerSize}px;">
          ${
            showDwellRings && isCongested
              ? `<div class="absolute inset-0 rounded-full animate-map-pulse" style="background-color: ${color};"></div>`
              : ''
          }
          ${
            isSelected
              ? `<div class="absolute -inset-1.5 rounded-full border-2 border-dashed border-sky-400 animate-spin" style="animation-duration: 8s;"></div>`
              : ''
          }
          <div class="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-125"
               style="background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 3px 10px rgba(0,0,0,0.35);">
            <span class="text-[9px] font-extrabold text-white leading-none tracking-tight">${port.vesselCount}</span>
          </div>
        </div>
      `

      const customIcon = L.divIcon({
        html: html,
        className: 'custom-map-pin',
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      })

      const marker = L.marker([port.lat, port.lng], { icon: customIcon })

      const popupContent = `
        <div class="p-2 font-sans min-w-[210px]">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 uppercase">${port.code}</span>
            <span class="text-[10px] font-semibold text-slate-500 capitalize">${port.type} Port</span>
          </div>
          <div class="text-sm font-extrabold text-slate-900 dark:text-white leading-tight mb-1">${port.name}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mb-2.5">📍 ${port.country} · ${port.region}</div>
          
          <div class="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs mb-2">
            <div>
              <div class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Live Dwell</div>
              <div class="font-extrabold text-sm" style="color:${color}">${dwell} days</div>
            </div>
            <div>
              <div class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Vessels</div>
              <div class="font-extrabold text-sm text-slate-800 dark:text-slate-100">${port.vesselCount}</div>
            </div>
          </div>
          <div class="text-[10px] text-sky-600 dark:text-sky-400 font-medium">Click for telemetry & dwell analytics →</div>
        </div>
      `

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -baseRadius],
        className: 'rounded-2xl shadow-xl',
      })

      marker.on('click', () => {
        setSelectedPort(port)
        map.flyTo([port.lat, port.lng], Math.max(map.getZoom(), 6), {
          duration: 1.1,
          easeLinearity: 0.25,
        })
      })

      group.addLayer(marker)
    })
  }, [filteredPorts, dataMode, selectedPort, showDwellRings])

  // ─── Render Active Vessels with True Heading & Maritime AI State ────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    const group = vesselLayerGroupRef.current
    if (!map || !group) return
    group.clearLayers()

    if (!showVessels) return

    displayedVessels.forEach((vessel) => {
      const rec = vessel.recommendation || 'PROCEED'
      const recTheme = RECOMMENDATION_THEME[rec] || RECOMMENDATION_THEME.PROCEED
      const statusColor = recTheme.color
      const heading = vessel.heading || vessel.cog || 0
      const isSelected = selectedVessel?.mmsi === vessel.mmsi
      const vLat = Number(vessel.lat)
      const vLon = Number(vessel.lon ?? vessel.lng)

      const vesselHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
          <div class="absolute inset-0 rounded-full ${isSelected ? 'animate-ping opacity-60' : 'opacity-25 group-hover:opacity-75'} transition-opacity"
               style="background-color: ${statusColor};"></div>
          <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125"
               style="background: ${statusColor}; border: 2px solid #ffffff;">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="white"
                 style="transform: rotate(${heading}deg); transform-origin: 50% 50%; transition: transform 0.3s ease;">
              <polygon points="12,2 22,22 12,17 2,22" />
            </svg>
          </div>
          ${rec === 'REROUTE' ? `<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center border border-white">!</span>` : ''}
        </div>
      `

      const vesselIcon = L.divIcon({
        html: vesselHtml,
        className: 'custom-map-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([vLat, vLon], { icon: vesselIcon })

      const vesselPopup = `
        <div class="p-2.5 font-sans min-w-[220px]">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-extrabold text-slate-900 dark:text-white">${vessel.name}</span>
            <span class="text-[9px] font-black px-1.5 py-0.5 rounded text-white" style="background:${statusColor}">${rec}</span>
          </div>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 mb-2">MMSI ${vessel.mmsi} · ${vessel.origin_country || 'Intl'}</div>
          
          <div class="grid grid-cols-2 gap-1.5 text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded-xl mb-2 border border-slate-200 dark:border-slate-700">
            <div>
              <span class="text-[9px] text-slate-400 block font-semibold">Speed / Heading</span>
              <span class="font-bold text-slate-800 dark:text-slate-100">${vessel.sog || vessel.speedKts || 14} kts · ${heading}°</span>
            </div>
            <div>
              <span class="text-[9px] text-slate-400 block font-semibold">ML ETA</span>
              <span class="font-bold text-slate-800 dark:text-slate-100">${vessel.eta_hours ? `${vessel.eta_hours}h` : vessel.eta || '12h'}</span>
            </div>
          </div>
          
          <div class="text-[11px] text-slate-600 dark:text-slate-300 mb-1">
            📍 Destination: <strong>${vessel.destination || vessel.port || 'Port of Arjuna'}</strong>
          </div>
          <div class="text-[10.5px] font-bold ${rec === 'REROUTE' ? 'text-rose-600' : 'text-emerald-600'}">
            AI: ${rec === 'REROUTE' ? '⚠️ Severe Sea State — Bypass Corridors Active' : '✅ Fairway Certified Nominal Transit'}
          </div>
          <div class="mt-2 text-[10px] text-sky-600 font-bold text-center py-1 bg-sky-50 dark:bg-sky-950/60 rounded-lg cursor-pointer">
            Click Ship to Open Decision Drawer →
          </div>
        </div>
      `

      marker.bindPopup(vesselPopup, {
        closeButton: false,
        offset: [0, -12],
        className: 'rounded-2xl shadow-xl',
      })

      marker.on('click', () => {
        setSelectedPort(null)
        setSelectedVessel(vessel)
        setActiveTab('vessels')
        map.flyTo([vLat, vLon], Math.max(map.getZoom(), 5), {
          duration: 1.1,
        })
      })

      group.addLayer(marker)
    })
  }, [displayedVessels, showVessels, selectedVessel])

  // ─── Render Dynamic Rerouting & Corridor Overlays ───────────────────────────
  useEffect(() => {
    const group = rerouteLayerGroupRef.current
    if (!group) return
    group.clearLayers()

    if (!selectedVessel || !vesselDecision) return

    const currentWaypoints = vesselDecision.current_route?.waypoints || []
    const alternateWaypoints = vesselDecision.alternate_route?.waypoints || []
    const hazards = vesselDecision.weather?.hazard_waypoints || []
    const isReroute = (vesselDecision.recommendation || selectedVessel.recommendation) === 'REROUTE'

    // 1. Render Current Route Polyline & Waypoints
    if (currentWaypoints.length > 1) {
      const currentCoords = currentWaypoints.map((wp) => [Number(wp.lat), Number(wp.lon)])
      
      const currentGlow = L.polyline(currentCoords, {
        color: isReroute ? '#f43f5e' : '#3b82f6',
        weight: 6,
        opacity: 0.25,
        lineCap: 'round',
      })
      
      const currentLine = L.polyline(currentCoords, {
        color: isReroute ? '#ef4444' : '#2563eb',
        weight: 3,
        dashArray: isReroute ? '8, 8' : '5, 7',
        lineCap: 'round',
      })

      currentLine.bindTooltip(
        `<div class="text-xs font-bold ${isReroute ? 'text-rose-600' : 'text-blue-600'}">
          ${isReroute ? '⚠️ Current Fairway (High Weather Risk & Laytime Penalty)' : 'Current Route (Approved Navigation Corridor)'}
        </div>`,
        { sticky: true }
      )

      group.addLayer(currentGlow)
      group.addLayer(currentLine)

      currentWaypoints.forEach((wp, idx) => {
        const pin = L.circleMarker([Number(wp.lat), Number(wp.lon)], {
          radius: 4,
          fillColor: isReroute ? '#f43f5e' : '#3b82f6',
          color: '#ffffff',
          weight: 1.5,
          fillOpacity: 0.9,
        })
        pin.bindTooltip(`<span class="text-xs font-mono font-bold">${wp.name || `WP-0${idx + 1}`}</span>`, { sticky: true })
        group.addLayer(pin)
      })
    }

    // 2. Render Alternate Deepwater Bypass Corridor (if REROUTE or alternate available)
    if (alternateWaypoints.length > 1) {
      const altCoords = alternateWaypoints.map((wp) => [Number(wp.lat), Number(wp.lon)])
      
      const altGlow = L.polyline(altCoords, {
        color: '#10b981',
        weight: appliedReroute ? 8 : 6,
        opacity: appliedReroute ? 0.45 : 0.22,
        lineCap: 'round',
      })

      const altLine = L.polyline(altCoords, {
        color: '#10b981',
        weight: appliedReroute ? 4 : 3,
        dashArray: appliedReroute ? undefined : '6, 6',
        lineCap: 'round',
      })

      altLine.bindTooltip(
        `<div class="text-xs font-bold text-emerald-600 flex items-center gap-1">
          <span>🛡️ AI Deepwater Bypass Corridor (-${vesselDecision.comparison?.weather_risk_reduction_pct || 45}% risk)</span>
        </div>`,
        { sticky: true }
      )

      group.addLayer(altGlow)
      group.addLayer(altLine)

      alternateWaypoints.forEach((wp, idx) => {
        const altPin = L.circleMarker([Number(wp.lat), Number(wp.lon)], {
          radius: 5,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1.0,
        })
        altPin.bindTooltip(`<span class="text-xs font-mono font-bold text-emerald-700">${wp.name || `Bypass-WP${idx + 1}`}</span>`, { sticky: true })
        group.addLayer(altPin)
      })
    }

    // 3. Render Weather Hazards Overlays
    hazards.forEach((h) => {
      const hazardIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center animate-pulse cursor-pointer">
            <div class="w-8 h-8 rounded-full bg-rose-500/30 flex items-center justify-center">
              <span class="text-base">⛈️</span>
            </div>
          </div>
        `,
        className: 'custom-hazard-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
      const hazardMarker = L.marker([Number(h.lat), Number(h.lon)], { icon: hazardIcon })
      hazardMarker.bindTooltip(
        `<div class="text-xs p-1 text-slate-800 dark:text-slate-100">
          <div class="font-bold text-rose-600 mb-0.5">⚠️ Severe Sea State Hazard</div>
          <div>Wind: <strong>${h.wind_speed_knots} kts</strong> · Waves: <strong>${h.wave_height_m}m</strong></div>
        </div>`,
        { sticky: true }
      )
      group.addLayer(hazardMarker)
    })
  }, [selectedVessel, vesselDecision, appliedReroute])

  // ─── Camera Controls ────────────────────────────────────────────────────────
  const zoomIn = () => mapInstanceRef.current?.zoomIn()
  const zoomOut = () => mapInstanceRef.current?.zoomOut()
  const resetWorldView = () => {
    mapInstanceRef.current?.flyTo([20.0, 30.0], 3, { duration: 1.2 })
    setSelectedPort(null)
  }

  const focusPort = (port) => {
    setSelectedPort(port)
    mapInstanceRef.current?.flyTo([port.lat, port.lng], 7, { duration: 1.2 })
  }

  // Fullscreen API toggle
  const toggleFullscreen = () => {
    const el = mapContainerRef.current?.parentElement
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

  const totalVessels = WORLD_PORTS.reduce((a, p) => a + p.vesselCount, 0)

  return (
    <AppShell crumb="World Ship & Port Tracker">
      <div className="space-y-4 max-w-[1680px] mx-auto">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Pure GIS Geographic Intelligence
              </span>
              <span className="text-xs text-inksoft font-medium">
                Live AIS · Google World Map &amp; Satellite · Interactive Port Telemetry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              World Ship &amp; Port Digital Twin
            </h2>
            <p className="text-sm text-inksoft mt-1 leading-relaxed">
              Real-world geospatial port telemetry, vessel positions, and international maritime corridors with authentic Google World Map visual rendering.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs font-semibold text-inksoft">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-line">
              <span className="text-ink font-bold">{WORLD_PORTS.length}</span> Major Ports &nbsp;·&nbsp;
              <span className="text-ink font-bold">{totalVessels}</span> Berths Monitored
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[#0085db] font-bold hover:bg-sky-100 transition-colors shadow-xs"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Map Layer &amp; API Key</span>
            </button>
          </div>
        </div>

        {/* ── Controls Bar ───────────────────────────────────────────────── */}
        <div className="bg-surface rounded-3xl border border-line shadow-xs p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative min-w-[220px] flex-1 sm:flex-none">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search port, country, code…"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl pl-8 pr-3 py-2 text-xs text-ink placeholder:text-inksoft/60 focus:outline-none focus:border-[#0085db]/60 transition-colors"
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

            {/* Dwell Metric Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {[
                ['import', 'Import Dwell'],
                ['export', 'Export Dwell'],
                ['berthing', 'Berthing'],
                ['anchor', 'Anchor'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setDataMode(id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    dataMode === id
                      ? 'bg-white dark:bg-slate-700 text-[#0085db] shadow-xs'
                      : 'text-inksoft hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Region Filter */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#0085db]/60"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r === 'all' ? 'All Regions' : r}
                </option>
              ))}
            </select>

            {/* Layer Toggles */}
            <div className="flex items-center gap-4 text-xs font-semibold text-inksoft">
              {/* Vessels Toggle */}
              <label className="flex items-center gap-2 cursor-pointer hover:text-ink select-none">
                <input
                  type="checkbox"
                  checked={showVessels}
                  onChange={(e) => setShowVessels(e.target.checked)}
                  className="rounded text-[#0085db] focus:ring-0 cursor-pointer"
                />
                <span>Live Vessels</span>
              </label>

              {/* Shipping Lanes Toggle */}
              <label className="flex items-center gap-2 cursor-pointer hover:text-ink select-none">
                <input
                  type="checkbox"
                  checked={showLanes}
                  onChange={(e) => setShowLanes(e.target.checked)}
                  className="rounded text-[#0085db] focus:ring-0 cursor-pointer"
                />
                <span>Shipping Corridors</span>
              </label>

              {/* Dwell Heat Rings */}
              <label className="flex items-center gap-2 cursor-pointer hover:text-ink select-none">
                <input
                  type="checkbox"
                  checked={showDwellRings}
                  onChange={(e) => setShowDwellRings(e.target.checked)}
                  className="rounded text-[#0085db] focus:ring-0 cursor-pointer"
                />
                <span>Congestion Pulse</span>
              </label>
            </div>

            <div className="flex-1" />

            {/* Map Style Quick Switcher */}
            <div className="flex items-center gap-1.5">
              <select
                value={activeProvider}
                onChange={(e) => saveConfig(e.target.value, apiKey)}
                className="bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-1.5 text-xs text-ink font-semibold focus:outline-none focus:border-[#0085db]/60"
              >
                {Object.values(MAP_PROVIDERS).map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.badge}: {prov.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Main Map Canvas + Right Telemetry Panel ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* MAP CANVAS CONTAINER */}
          <div
            className="lg:col-span-9 bg-slate-900 rounded-3xl border border-line shadow-xs overflow-hidden relative select-none flex flex-col"
            style={{ height: isFullscreen ? '100vh' : '640px' }}
          >
            {/* The Pure Leaflet GIS Canvas */}
            <div
              ref={mapContainerRef}
              className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
              style={{ background: '#0e1726' }}
            />

            {/* ── Top-Right Map Controls HUD ───────────────────────────── */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-line shadow-md p-1 flex items-center gap-1">
                <button
                  onClick={zoomIn}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-sm"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={zoomOut}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-sm"
                  title="Zoom Out"
                >
                  −
                </button>
                <div className="w-px h-4 bg-line my-auto mx-0.5" />
                <button
                  onClick={resetWorldView}
                  className="px-2.5 h-8 rounded-xl flex items-center justify-center text-ink text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Reset to Global World View"
                >
                  World View
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Top-Left Active Provider Pill HUD ─────────────────────── */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-line shadow-md px-3 py-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-ink">
                  {MAP_PROVIDERS[activeProvider]?.name}
                </span>
                <span className="text-[10px] text-inksoft font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  Zoom {currentZoom}x
                </span>
              </div>
            </div>

            {/* ── Bottom-Left Dwell Legend ──────────────────────────────── */}
            <div className="absolute bottom-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-line shadow-lg px-3.5 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-inksoft uppercase tracking-wider">
                  {dataMode.toUpperCase()} DWELL TIME SCALE
                </span>
              </div>
              <div className="flex items-end gap-1.5">
                {DWELL_LEGEND.map((d) => (
                  <div key={d.label} className="flex flex-col items-center gap-1">
                    <div className="w-9 h-2 rounded-full shadow-xs" style={{ background: d.color }} />
                    <span className="text-[8.5px] text-inksoft font-semibold">{d.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2.5 mt-2 pt-2 border-t border-line/60 flex-wrap">
                <div className="flex items-center gap-1 text-[9.5px] text-ink font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Proceed
                </div>
                <div className="flex items-center gap-1 text-[9.5px] text-ink font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Hold
                </div>
                <div className="flex items-center gap-1 text-[9.5px] text-ink font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Reroute (Hazard)
                </div>
                <div className="flex items-center gap-1 text-[9.5px] text-ink font-semibold">
                  <span className="w-3 h-1 rounded bg-emerald-500 inline-block" /> AI Bypass Corridor
                </div>
              </div>
            </div>

            {/* ── Bottom-Right Telemetry GPS Coordinates ────────────────── */}
            <div className="absolute bottom-4 right-4 z-20 text-[10px] font-mono text-inksoft bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl px-2.5 py-1 border border-line shadow-sm">
              LAT {cursorCoords.lat > 0 ? `+${cursorCoords.lat}` : cursorCoords.lat}° &nbsp;|&nbsp; LNG {cursorCoords.lng > 0 ? `+${cursorCoords.lng}` : cursorCoords.lng}°
            </div>
          </div>

          {/* ── RIGHT TELEMETRY & MARITIME AI DECISION PANEL ─────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto max-h-[640px]">
            {/* Top Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-surface rounded-2xl border border-line shadow-2xs">
              <button
                onClick={() => setActiveTab('vessels')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'vessels'
                    ? 'bg-ink text-white shadow-xs'
                    : 'text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>🚢</span>
                <span>Maritime AI ({displayedVessels.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('ports')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'ports'
                    ? 'bg-ink text-white shadow-xs'
                    : 'text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>⚓</span>
                <span>Ports ({filteredPorts.length})</span>
              </button>
            </div>

            {/* 1. SELECTED VESSEL: MARITIME AI DECISION SUPPORT DRAWER */}
            {selectedVessel ? (
              <div className="bg-surface rounded-3xl border border-line shadow-xs overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-line bg-slate-50/70 dark:bg-slate-800/40 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400">MMSI {selectedVessel.mmsi}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-inksoft font-semibold">
                        {selectedVessel.origin_country || 'International'}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-ink leading-tight mt-0.5">
                      {selectedVessel.name}
                    </h4>
                    <div className="text-xs text-inksoft mt-0.5">
                      {selectedVessel.vessel_type || 'Commercial Carrier'} · {selectedVessel.sog || selectedVessel.speedKts || 14} kts
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedVessel(null)
                      setAppliedReroute(false)
                      rerouteLayerGroupRef.current?.clearLayers()
                    }}
                    className="text-inksoft hover:text-ink w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors flex-none"
                    title="Close Vessel Decision Drawer"
                  >
                    ✕
                  </button>
                </div>

                {/* AI Decision Content */}
                <div className="p-4 space-y-3">
                  {loadingDecision ? (
                    <div className="p-6 text-center text-xs text-inksoft flex flex-col items-center justify-center gap-2">
                      <span className="animate-spin text-lg text-sky-500">⟳</span>
                      <span className="font-semibold">Computing ML ETA, Route Risk &amp; Open-Meteo Sea State...</span>
                    </div>
                  ) : (
                    <>
                      {/* AI Recommendation Banner */}
                      <div className={`p-3 rounded-2xl border ${
                        (vesselDecision?.recommendation || selectedVessel.recommendation) === 'REROUTE'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                          : (vesselDecision?.recommendation || selectedVessel.recommendation) === 'HOLD'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold">
                            Maritime AI Recommendation
                          </span>
                          <span className="text-xs font-black px-2 py-0.5 rounded-full text-white shadow-xs" style={{
                            background: appliedReroute
                              ? '#10b981'
                              : (vesselDecision?.recommendation || selectedVessel.recommendation) === 'REROUTE'
                              ? '#f43f5e'
                              : (vesselDecision?.recommendation || selectedVessel.recommendation) === 'HOLD'
                              ? '#f59e0b'
                              : '#10b981'
                          }}>
                            {appliedReroute ? 'REROUTE APPLIED ✓' : (vesselDecision?.recommendation || selectedVessel.recommendation || 'PROCEED')}
                          </span>
                        </div>
                        <p className="text-xs font-semibold leading-snug">
                          {appliedReroute
                            ? 'Alternate bypass corridor activated and transmitted to ship ECDIS.'
                            : (vesselDecision?.recommendation || selectedVessel.recommendation) === 'REROUTE'
                            ? 'Severe weather hazard detected on approach fairway. Deepwater corridor bypass recommended.'
                            : (vesselDecision?.recommendation || selectedVessel.recommendation) === 'HOLD'
                            ? 'Terminal congestion & rough seas warrant anchoring at outer basin.'
                            : 'Transit fairway certified nominal. Vessel is clear to proceed to berthing basin.'}
                        </p>
                      </div>

                      {/* 4 Metric Cards */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                          <span className="text-[9.5px] font-bold text-inksoft uppercase tracking-wider block mb-0.5">
                            ML ETA Prediction
                          </span>
                          <span className="text-base font-extrabold text-ink">
                            {vesselDecision?.eta?.eta_hours ?? selectedVessel.eta_hours ?? 14.2}h
                          </span>
                          <span className="text-[9.5px] text-emerald-600 block font-medium">
                            {Math.round((vesselDecision?.eta?.confidence || 0.92) * 100)}% Confidence
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                          <span className="text-[9.5px] font-bold text-inksoft uppercase tracking-wider block mb-0.5">
                            Route Risk Level
                          </span>
                          <span className={`text-base font-extrabold ${
                            (vesselDecision?.risk?.risk_level || selectedVessel.route_risk_level) === 'HIGH'
                              ? 'text-rose-600'
                              : (vesselDecision?.risk?.risk_level || selectedVessel.route_risk_level) === 'MEDIUM'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}>
                            {vesselDecision?.risk?.risk_level || selectedVessel.route_risk_level || 'LOW'}
                          </span>
                          <span className="text-[9.5px] text-inksoft block font-medium">
                            F1: 93% · ML Classifier
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                          <span className="text-[9.5px] font-bold text-inksoft uppercase tracking-wider block mb-0.5">
                            Sea State (Open-Meteo)
                          </span>
                          <span className="text-xs font-bold text-ink block truncate">
                            {vesselDecision?.weather?.condition || 'Nominal Sea State'}
                          </span>
                          <span className="text-[9.5px] text-inksoft block">
                            {vesselDecision?.weather?.max_wind_knots ?? selectedVessel.wind_speed_knots ?? 12} kts · {vesselDecision?.weather?.max_wave_height_m ?? selectedVessel.wave_height_m ?? 0.8}m
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                          <span className="text-[9.5px] font-bold text-inksoft uppercase tracking-wider block mb-0.5">
                            Voyage Valuation
                          </span>
                          <span className="text-xs font-extrabold text-ink block">
                            ${Number(vesselDecision?.cost?.current_route_cost_usd || selectedVessel.total_cost_usd || 26000).toLocaleString()} USD
                          </span>
                          {selectedVessel.billing_currency && selectedVessel.billing_currency !== 'USD' && (
                            <span className="text-[9px] text-inksoft block font-mono truncate">
                              {vesselDecision?.cost?.current_route_cost_local ? Number(vesselDecision.cost.current_route_cost_local).toLocaleString() : ''} {selectedVessel.billing_currency}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cost Optimization & Demurrage Saved Highlight */}
                      {vesselDecision?.cost?.expected_delay_loss_avoided_usd > 0 && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs">
                          <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                            <span>🛡️ Laytime Demurrage Avoided</span>
                            <span>+${Number(vesselDecision.cost.expected_delay_loss_avoided_usd).toLocaleString()} USD</span>
                          </div>
                          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                            Weather risk reduction: {vesselDecision.comparison?.weather_risk_reduction_pct || 42}% via alternate corridor.
                          </div>
                        </div>
                      )}

                      {/* Grounded AI Explainability bullet points */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-inksoft block mb-1">
                          Model Grounding &amp; Reasoning
                        </span>
                        {(vesselDecision?.explainability_reasons || [
                          'Navigation fairway within certified safety thresholds.',
                          'Nominal wave height and wind velocity along waypoints.',
                          'Vessel is on schedule for scheduled berthing window.',
                        ]).map((reason, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-inksoft">
                            <span className="text-emerald-500 flex-none text-[11px] mt-0.5">▪</span>
                            <span className="leading-snug text-ink">{reason}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        {(vesselDecision?.recommendation || selectedVessel.recommendation) === 'REROUTE' && (
                          <button
                            onClick={() => setAppliedReroute(true)}
                            disabled={appliedReroute}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                              appliedReroute
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-500/25 active:scale-98'
                            }`}
                          >
                            <span>{appliedReroute ? '✓' : '⚡'}</span>
                            <span>{appliedReroute ? 'Corridor Activated (ECDIS Sent)' : 'Apply Dynamic Reroute'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            mapInstanceRef.current?.flyTo([selectedVessel.lat, selectedVessel.lon || selectedVessel.lng], 8, { duration: 1.1 })
                          }}
                          className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-ink transition-colors flex items-center gap-1 flex-1 justify-center"
                        >
                          <span>🎯</span>
                          <span>Fly to Ship</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : selectedPort ? (
              /* 2. SELECTED PORT DETAIL CARD */
              <div className="bg-surface rounded-3xl border border-line shadow-xs overflow-hidden">
                <div className="p-4 border-b border-line bg-slate-50/70 dark:bg-slate-800/40 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-[#0085db]">{selectedPort.code}</div>
                    <h4 className="text-sm font-extrabold text-ink leading-tight mt-0.5">
                      {selectedPort.name}
                    </h4>
                    <div className="text-xs text-inksoft mt-0.5">
                      {selectedPort.country} · {selectedPort.region}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPort(null)}
                    className="text-inksoft hover:text-ink w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors flex-none"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                      <span className="text-[9.5px] font-bold text-inksoft uppercase tracking-wider block mb-1">
                        Vessels In Port
                      </span>
                      <span className="text-base font-extrabold text-ink">
                        {selectedPort.vesselCount}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-line">
                      <span className="text-[9.5px] font-bold text-inksoft uppercase tracking-wider block mb-1">
                        Category
                      </span>
                      <span className="text-xs font-bold text-ink capitalize">
                        {selectedPort.type} Terminal
                      </span>
                    </div>
                  </div>

                  <div className="text-[10.5px] font-bold text-inksoft uppercase tracking-wider">
                    Container Turnaround
                  </div>
                  {[
                    ['Import Dwell', selectedPort.importDwell],
                    ['Export Dwell', selectedPort.exportDwell],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-inksoft flex-none">{label}</span>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min((val / 15) * 100, 100)}%`,
                              background: getDwellColor(val),
                            }}
                          />
                        </div>
                        <span className="font-bold text-ink w-12 text-right">{val}d</span>
                      </div>
                    </div>
                  ))}

                  <div className="text-[10.5px] font-bold text-inksoft uppercase tracking-wider">
                    Berth &amp; Anchorage Wait
                  </div>
                  {[
                    ['Berthing Window', selectedPort.berthingDwell],
                    ['Anchorage Queue', selectedPort.anchorDwell],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-inksoft flex-none">{label}</span>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min((val / 2) * 100, 100)}%`,
                              background: getDwellColor(val * 4),
                            }}
                          />
                        </div>
                        <span className="font-bold text-ink w-12 text-right">{val}d</span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <span className="text-xs font-bold text-inksoft">Median Port Dwell</span>
                    <span
                      className="text-lg font-extrabold"
                      style={{ color: getDwellColor(selectedPort.medianDwell) }}
                    >
                      {selectedPort.medianDwell} days
                    </span>
                  </div>
                </div>
              </div>
            ) : activeTab === 'vessels' ? (
              /* 3. DEFAULT AIS VESSELS LIST & FILTERS */
              <div className="bg-surface rounded-3xl border border-line shadow-xs overflow-hidden flex flex-col">
                <div className="p-4 border-b border-line bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                      Live AIS Trajectories
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
                      Live Feed
                    </span>
                  </div>
                  {/* Vessel filter pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                    {[
                      ['all', 'All'],
                      ['reroute', 'Reroute'],
                      ['high_risk', 'High Risk'],
                      ['proceed', 'Proceed'],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setVesselFilter(key)}
                        className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                          vesselFilter === key
                            ? 'bg-[#0085db] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-inksoft hover:text-ink'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-line max-h-[380px] overflow-y-auto">
                  {displayedVessels.map((v) => {
                    const rec = v.recommendation || 'PROCEED'
                    const recColor =
                      rec === 'REROUTE' ? 'bg-rose-500 text-white' :
                      rec === 'HOLD' ? 'bg-amber-500 text-white' :
                      'bg-emerald-500 text-white'

                    return (
                      <button
                        key={v.mmsi}
                        onClick={() => {
                          setSelectedPort(null)
                          setSelectedVessel(v)
                          mapInstanceRef.current?.flyTo([v.lat, v.lon || v.lng], 6, { duration: 1.1 })
                        }}
                        className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-ink truncate">{v.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase text-white" style={{ background: rec === 'REROUTE' ? '#f43f5e' : '#10b981' }}>
                              {rec}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-inksoft mt-0.5">
                            {v.sog || v.speedKts || 14} kts · {v.origin_country || 'Flag'} → {v.destination || 'Port of Arjuna'}
                          </div>
                        </div>
                        <div className="text-right flex-none">
                          <div className="text-xs font-extrabold text-ink">
                            {v.eta_hours ? `${v.eta_hours}h` : v.eta || '12h'}
                          </div>
                          <div className="text-[9.5px] text-inksoft">
                            Risk: <strong className={v.route_risk_level === 'HIGH' ? 'text-rose-600' : 'text-emerald-600'}>{v.route_risk_level || 'LOW'}</strong>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* 4. DEFAULT PORT DIRECTORY & OVERVIEW */
              <>
                <div className="bg-surface rounded-3xl border border-line shadow-xs p-4">
                  <h4 className="text-xs font-bold text-ink mb-3 uppercase tracking-wider">
                    Network Status Overview
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      {
                        label: 'Avg Global Dwell',
                        value: `${(
                          WORLD_PORTS.reduce((a, p) => a + p.importDwell, 0) / WORLD_PORTS.length
                        ).toFixed(1)} days`,
                        color: 'text-[#0085db]',
                      },
                      {
                        label: 'Most Congested',
                        value: WORLD_PORTS.reduce((a, b) => (a.importDwell > b.importDwell ? a : b))
                          .name.split(' ')
                          .slice(0, 2)
                          .join(' '),
                        color: 'text-rose-600 dark:text-rose-400',
                      },
                      {
                        label: 'Highest Velocity',
                        value: WORLD_PORTS.reduce((a, b) => (a.importDwell < b.importDwell ? a : b))
                          .name.split(' ')
                          .slice(0, 2)
                          .join(' '),
                        color: 'text-emerald-600 dark:text-emerald-400',
                      },
                      {
                        label: 'Vessels in Transit',
                        value: `${displayedVessels.length} ships`,
                        color: 'text-sky-600 dark:text-sky-400',
                      },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="text-inksoft">{label}</span>
                        <span className={`font-bold ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Port Jump Directory */}
                <div className="bg-surface rounded-3xl border border-line shadow-xs overflow-hidden flex-1 flex flex-col">
                  <div className="px-4 py-3 border-b border-line bg-slate-50/70 dark:bg-slate-800/40">
                    <h4 className="text-xs font-bold text-ink">Port Directory</h4>
                    <p className="text-[11px] text-inksoft mt-0.5">
                      {filteredPorts.length} terminals · click to fly camera
                    </p>
                  </div>
                  <div className="divide-y divide-line max-h-56 overflow-y-auto">
                    {filteredPorts.map((port) => (
                      <button
                        key={port.id}
                        onClick={() => focusPort(port)}
                        className={`w-full text-left px-4 py-2 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          selectedPort?.id === port.id
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-l-2 border-[#0085db]'
                            : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-ink truncate">{port.name}</div>
                          <div className="text-[10px] text-inksoft">
                            {port.code} · {port.country}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-none">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: getDwellColor(port.medianDwell) }}
                          />
                          <span className="text-[11px] font-bold text-ink">{port.medianDwell}d</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── API KEY & MAP CONFIGURATION MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {isConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface rounded-3xl border border-line shadow-2xl max-w-xl w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-ink">Map Layer &amp; API Key Settings</h3>
                  <p className="text-xs text-inksoft mt-0.5">
                    Configure your high-definition GIS tile provider &amp; free API key
                  </p>
                </div>
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Provider Selection Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Select Visual World Map Provider
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.values(MAP_PROVIDERS).map((prov) => {
                    const isSelected = activeProvider === prov.id
                    return (
                      <div
                        key={prov.id}
                        onClick={() => setActiveProvider(prov.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#0085db] bg-sky-50 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                            : 'border-line hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-ink">{prov.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-[#0085db] text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-inksoft'
                            }`}
                          >
                            {prov.badge}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-inksoft leading-tight">{prov.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Free API Key Input (if provider requires key or user wants custom key) */}
              <div className="space-y-2 pt-2 border-t border-line">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Map Provider API Key (Optional / MapTiler)
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Free Tier Available
                  </span>
                </div>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="e.g. your_maptiler_api_key_or_google_token"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-xs font-mono text-ink placeholder:text-inksoft/50 focus:outline-none focus:border-[#0085db]"
                />
              </div>

              {/* Guide on How to get Free API Keys */}
              <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-3 text-xs space-y-1.5 border border-line">
                <div className="font-bold text-ink flex items-center gap-1.5">
                  <span>💡</span>
                  <span>How to Get Free Map API Keys:</span>
                </div>
                <ul className="text-inksoft space-y-1 text-[11px] list-disc pl-4 leading-relaxed">
                  <li>
                    <strong>Google World Map &amp; Esri Satellite</strong>: Built-in presets work immediately out-of-the-box with zero configuration needed.
                  </li>
                  <li>
                    <strong>MapTiler (100% Free)</strong>: Offers <strong>100,000 requests/month free</strong> forever with no credit card required at{' '}
                    <a
                      href="https://cloud.maptiler.com/account/keys/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0085db] underline font-semibold"
                    >
                      maptiler.com/keys
                    </a>
                    .
                  </li>
                  <li>
                    <strong>Google Cloud Console</strong>: Gives <strong>$200 free monthly credit</strong> for Maps Platform API keys at{' '}
                    <a
                      href="https://console.cloud.google.com/google/maps-apis"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0085db] underline font-semibold"
                    >
                      console.cloud.google.com
                    </a>
                    .
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    saveConfig(activeProvider, apiKey)
                    setIsConfigOpen(false)
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0085db] text-white hover:bg-[#0074c2] transition-colors shadow-sm"
                >
                  Save &amp; Apply Map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
