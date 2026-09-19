import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import KpiRow from '../components/dashboard/KpiRow.jsx'
import { useRole } from '../context/RoleContext.jsx'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { fetch72hPlan, fetchLiveVessels } from '../api/client.js'

function getArcCoords(deg, cx = 100, cy = 95, r = 75) {
  const rad = (deg * Math.PI) / 180
  const x = cx - r * Math.cos(rad)
  const y = cy - r * Math.sin(rad)
  return `${x.toFixed(2)},${y.toFixed(2)}`
}

function makeArcPath(startDeg, endDeg, cx = 100, cy = 95, r = 75) {
  const p1 = getArcCoords(startDeg, cx, cy, r)
  const p2 = getArcCoords(endDeg, cx, cy, r)
  return `M ${p1} A ${r} ${r} 0 0 1 ${p2}`
}

export default function DashboardPage() {
  const { activeRole, can } = useRole()
  const { vessels, berths } = useOperationalContext()
  const [chartMode, setChartMode] = useState('throughput') // 'throughput' | 'congestion'
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(1) // 1 = FEB (highlighted as in screenshot 4)
  const [selectedBerthFilter, setSelectedBerthFilter] = useState('all') // 'all' | 'container' | 'dry_bulk' | 'roro' | 'tanker'
  const [planData, setPlanData] = useState(null)
  const [maritimeVessels, setMaritimeVessels] = useState([])

  useEffect(() => {
    fetch72hPlan().then((p) => {
      if (p) setPlanData(p)
    })
    fetchLiveVessels().then((res) => {
      if (res?.vessels) setMaritimeVessels(res.vessels)
    }).catch(() => {})
  }, [])

  // Return On Turnaround Month Datasets (interactive, FEB active by default)
  const turnaroundMonths = [
    { month: 'JAN', full: 'January', height: '45%', sla: '210%', trend: '+14%', isUp: true, turnTime: '22.4h', vessels: 12 },
    { month: 'FEB', full: 'February', height: '85%', sla: '283%', trend: '+24%', isUp: true, turnTime: '18.2h', vessels: 15 },
    { month: 'MAR', full: 'March', height: '60%', sla: '235%', trend: '+16%', isUp: true, turnTime: '20.5h', vessels: 14 },
    { month: 'APR', full: 'April', height: '70%', sla: '260%', trend: '+19%', isUp: true, turnTime: '19.1h', vessels: 16 },
    { month: 'MAY', full: 'May', height: '50%', sla: '224%', trend: '+15%', isUp: true, turnTime: '21.8h', vessels: 13 },
    { month: 'JUN', full: 'June', height: '65%', sla: '252%', trend: '+18%', isUp: true, turnTime: '19.7h', vessels: 15 },
  ]
  const currentTurnaround = turnaroundMonths[selectedMonthIdx]

  // Telemetry interactive datasets
  const telemetryData = {
    throughput: {
      headline: '$2,538,942',
      badge: '16.3%',
      badgeUp: true,
      timeframe: 'last 12 months',
      months: [
        { label: 'Jan', val: '$1.82M', x: 0, y: 160, moves: '28,400 TEU' },
        { label: 'Feb', val: '$2.15M', x: 116, y: 135, moves: '32,100 TEU' },
        { label: 'Mar', val: '$2.38M', x: 233, y: 95, moves: '36,800 TEU' },
        { label: 'Apr', val: '$2.31M', x: 350, y: 65, moves: '35,400 TEU' },
        { label: 'May', val: '$2,538,942', x: 420, y: 70, moves: '39,200 TEU' },
        { label: 'Jun', val: '$2.28M', x: 583, y: 125, moves: '34,700 TEU' },
        { label: 'July', val: '$2.61M', x: 700, y: 145, moves: '41,300 TEU' }
      ],
      primaryCurve: 'M 0,160 C 80,180 160,120 233,95 C 290,75 350,55 420,70 C 490,85 580,130 700,145',
      areaCurve: 'M 0,160 C 80,180 160,120 233,95 C 290,75 350,55 420,70 C 490,85 580,130 700,145 L 700,220 L 0,220 Z',
      benchmarkCurve: 'M 0,140 C 90,90 180,125 280,110 C 380,95 480,135 600,120 C 650,115 680,100 700,90',
      activePt: { x: 420, y: 70, month: 'May', val: '$2,538,942' }
    },
    congestion: {
      headline: '24.2% Index',
      badge: '8.4%',
      badgeUp: false,
      timeframe: 'last 12 months',
      months: [
        { label: 'Jan', val: '42.5%', x: 0, y: 60, moves: '4.8h avg delay' },
        { label: 'Feb', val: '38.1%', x: 116, y: 80, moves: '4.1h avg delay' },
        { label: 'Mar', val: '34.8%', x: 233, y: 105, moves: '3.6h avg delay' },
        { label: 'Apr', val: '29.2%', x: 350, y: 130, moves: '2.9h avg delay' },
        { label: 'May', val: '31.0%', x: 420, y: 120, moves: '3.2h avg delay' },
        { label: 'Jun', val: '26.4%', x: 583, y: 145, moves: '2.5h avg delay' },
        { label: 'July', val: '24.2%', x: 700, y: 155, moves: '2.1h avg delay' }
      ],
      primaryCurve: 'M 0,60 C 80,75 160,95 233,105 C 300,115 370,140 420,120 C 530,105 610,150 700,155',
      areaCurve: 'M 0,60 C 80,75 160,95 233,105 C 300,115 370,140 420,120 C 530,105 610,150 700,155 L 700,220 L 0,220 Z',
      benchmarkCurve: 'M 0,85 C 100,95 200,120 300,135 C 400,145 500,150 600,140 C 650,135 680,130 700,125',
      activePt: { x: 700, y: 155, month: 'July', val: '24.2% Index' }
    }
  }
  const currentTelemetry = telemetryData[chartMode]

  // MaterialM Table Data (matching Screenshot 4 Popular Products style)
  const popularVessels = [
    {
      name: 'MSC Arjuna',
      cargo: 'Ultra Large Container · 14,000 TEU',
      metric: '$180 / 499k',
      metricSub: 'Partially unloaded',
      progress: 65,
      status: 'Confirmed',
      statusType: 'confirmed',
      iconBg: 'bg-sky-100 text-[#0085db] dark:bg-sky-950/40 dark:text-sky-300',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 17l2 4h16l2-4M3 13h18M6 13l2-6h8l2 6" />
        </svg>
      )
    },
    {
      name: 'Maersk Baroda',
      cargo: 'New Panamax · 9,200 TEU',
      metric: '$120 / 499k',
      metricSub: 'Full discharge',
      progress: 100,
      status: 'Confirmed',
      statusType: 'confirmed',
      iconBg: 'bg-amber-100 text-[#FFAE1F] dark:bg-amber-950/40 dark:text-amber-300',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    {
      name: 'CMA CGM Gujarat',
      cargo: 'Neo-Panamax · Berth B03 Anchorage',
      metric: '$120 / 499k',
      metricSub: 'Draft limit hold',
      progress: 30,
      status: 'Delayed',
      statusType: 'delayed',
      iconBg: 'bg-rose-100 text-[#FA896B] dark:bg-rose-950/40 dark:text-rose-300',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )
    },
    {
      name: 'Bharat Pioneer',
      cargo: 'VLCC Crude Tanker · Pier 400',
      metric: '$120 / 499k',
      metricSub: 'Tidal clearance sync',
      progress: 75,
      status: 'In Transit',
      statusType: 'in_transit',
      iconBg: 'bg-purple-100 text-[#7352FF] dark:bg-purple-950/40 dark:text-purple-300',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    }
  ]

  // Earning Reports Data (matching Screenshot 4 Earning Reports style)
  const earningReports = [
    {
      title: 'Approach Fairway',
      sub: 'UKC Under-Keel Depth',
      trend: '+16.3%',
      isUp: true,
      iconBg: 'bg-sky-100 text-[#0085db] dark:bg-sky-950/40 dark:text-sky-300',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    },
    {
      title: 'Container Terminal',
      sub: 'Quay Crane 34.8 GMPH',
      trend: '+12.55%',
      isUp: true,
      iconBg: 'bg-rose-100 text-[#FA896B] dark:bg-rose-950/40 dark:text-rose-300',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      )
    },
    {
      title: 'Feeder Basin',
      sub: 'Yard Density 72%',
      trend: '+12.55%',
      isUp: true,
      iconBg: 'bg-emerald-100 text-[#13DEB9] dark:bg-emerald-950/40 dark:text-emerald-300',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      )
    },
    {
      title: 'Tanker Pier Jetty',
      sub: 'Queue Turnaround 38m',
      trend: '+8.28%',
      isUp: true,
      iconBg: 'bg-amber-100 text-[#FFAE1F] dark:bg-amber-950/40 dark:text-amber-300',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    },
    {
      title: 'Dry Bulk Terminal',
      sub: 'Pilot Boarding Station',
      trend: '+10.55%',
      isUp: true,
      iconBg: 'bg-purple-100 text-[#7352FF] dark:bg-purple-950/40 dark:text-purple-300',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    }
  ]

  return (
    <AppShell crumb="Overview & CRM">
      <div className="space-y-6 max-w-[1680px] mx-auto select-none">
        
        {/* 1. Welcome Banner Card */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/20">
          {/* Ambient Glow Blob */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold mb-3 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Terminal Telemetry · Port of Arjuna Pier 400</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 leading-tight">
              Welcome, {activeRole?.label || 'Duty Supervisor'}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm font-medium mb-5 max-w-lg leading-relaxed">
              AI-grounded berth optimization, crane moves dispatch, and continuous 72h rolling horizon telemetry.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/25 shadow-sm transition-all">
                <span className="text-lg sm:text-xl font-black block leading-none">15</span>
                <span className="text-[11px] text-white/80 font-semibold">AIS Vessels</span>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/25 shadow-sm transition-all">
                <span className="text-lg sm:text-xl font-black block leading-none text-emerald-300">98.4%</span>
                <span className="text-[11px] text-white/80 font-semibold">Berth SLA</span>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/25 shadow-sm transition-all">
                <span className="text-lg sm:text-xl font-black block leading-none text-cyan-300">$0.00</span>
                <span className="text-[11px] text-white/80 font-semibold">Demurrage Guard</span>
              </div>
            </div>
          </div>

          {/* Right 3D Isometric Art Decoration */}
          <div className="relative z-10 shrink-0 flex items-center justify-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/25 flex items-center justify-center p-4 relative shadow-2xl hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                {/* Isometric Cargo Container Ship Art */}
                <ellipse cx="80" cy="120" rx="60" ry="18" fill="rgba(0,0,0,0.25)" />
                <path d="M25 95 L80 120 L135 95 L110 80 L50 80 Z" fill="#FFFFFF" />
                <path d="M25 95 L80 120 L80 102 L25 80 Z" fill="#E2E8F0" />
                <path d="M80 120 L135 95 L135 80 L80 102 Z" fill="#CBD5E1" />
                {/* Containers with vibrant colors */}
                <rect x="52" y="60" width="18" height="18" rx="2" fill="#FFAE1F" />
                <rect x="74" y="60" width="18" height="18" rx="2" fill="#13DEB9" />
                <rect x="63" y="40" width="18" height="18" rx="2" fill="#FA896B" />
                <circle cx="120" cy="45" r="8" fill="#FFFFFF" fillOpacity="0.4" />
                <path d="M110 55 L130 55" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. 4 Pastel Stat Cards (MaterialM Screenshot 2 style) */}
        {can('viewKpis') && <KpiRow />}

        {/* 2.5 Maritime ML Intelligence & Fleet Telemetry Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 border border-indigo-500/20 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl flex-none shadow-inner">
              🚢
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Maritime ML Decision Suite</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  RandomForest ETA &amp; Risk Active (F1: 93%)
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                AIS Ingestion &amp; Open-Meteo Dynamic Rerouting Engine
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl leading-relaxed">
                Tracking {maritimeVessels.length || 8} commercial carriers approaching Port of Arjuna. Deepwater bypass corridors eliminate weather hazard exposure and avoid high-demurrage anchorage delays.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-none">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-center min-w-[100px]">
              <div className="text-[10px] text-slate-300 font-semibold">Active Reroutes</div>
              <div className="text-base font-black text-rose-400">
                {maritimeVessels.filter((v) => v.recommendation === 'REROUTE').length || 1} Ship
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-center min-w-[105px]">
              <div className="text-[10px] text-slate-300 font-semibold">Demurrage Saved</div>
              <div className="text-base font-black text-emerald-400">+$18,500</div>
            </div>

            <Link
              to="/world-map"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Inspect World Map</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* 3. Middle Row: Overall Balance / Throughput Dual-Wave Line Chart + Return On Investment Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Overall Throughput Dual-Wave Card (col-span-8 matching Screenshot 4) */}
          <div className="lg:col-span-8 bg-surface rounded-2xl p-6 border border-line shadow-card flex flex-col justify-between relative overflow-hidden hover:shadow-lg hover:border-cyan-400/40 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-cyan-400 before:via-blue-500 before:to-indigo-500">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs font-semibold text-inksoft">Overall Operational Telemetry</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-sans transition-all">
                      {currentTelemetry.headline}
                    </span>
                    <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-md ${
                      currentTelemetry.badgeUp 
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400'
                    }`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points={currentTelemetry.badgeUp ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                      </svg>
                      {currentTelemetry.badge}
                    </span>
                    <span className="text-xs text-inksoft">{currentTelemetry.timeframe}</span>
                  </div>
                </div>

                {/* Throughput / Congestion Pill Toggle Button Group */}
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 self-start sm:self-auto shadow-inner">
                  <button
                    onClick={() => { setChartMode('throughput'); setHoveredPoint(null); }}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      chartMode === 'throughput'
                        ? 'bg-surface text-[#0085db] shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-inksoft hover:text-ink'
                    }`}
                  >
                    Throughput
                  </button>
                  <button
                    onClick={() => { setChartMode('congestion'); setHoveredPoint(null); }}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      chartMode === 'congestion'
                        ? 'bg-surface text-[#0085db] shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-inksoft hover:text-ink'
                    }`}
                  >
                    Congestion
                  </button>
                </div>
              </div>

              {/* Dual-Wave Smooth Curve SVG with Interactive Hover Points */}
              <div className="relative h-60 w-full pt-4">
                <svg viewBox="0 0 700 220" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartBlueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0085db" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#0085db" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guidelines */}
                  <line x1="0" y1="180" x2="700" y2="180" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                  <line x1="0" y1="110" x2="700" y2="110" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />

                  {/* Wave 2: Benchmark Curve (Gray) */}
                  <path
                    d={currentTelemetry.benchmarkCurve}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />

                  {/* Wave 1 Area Gradient Fill */}
                  <path
                    d={currentTelemetry.areaCurve}
                    fill="url(#chartBlueGrad)"
                    className="transition-all duration-700 ease-out"
                  />

                  {/* Wave 1: Primary Cyan/Blue Curve */}
                  <path
                    d={currentTelemetry.primaryCurve}
                    fill="none"
                    stroke="#0085db"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />

                  {/* Active Highlight Marker */}
                  <circle
                    cx={currentTelemetry.activePt.x}
                    cy={currentTelemetry.activePt.y}
                    r="5.5"
                    fill="#0085db"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    className="shadow-md animate-pulse"
                  />

                  {/* Interactive Month Points (Hoverable & Clickable) */}
                  {currentTelemetry.months.map((pt, i) => (
                    <g key={i} className="cursor-pointer group" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                      <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                      <circle cx={pt.x} cy={pt.y} r="4" fill="#0085db" opacity="0.3" className="group-hover:opacity-100 group-hover:scale-150 transition-all origin-center" />
                    </g>
                  ))}
                </svg>

                {/* Floating Tooltip for Hovered Data Point */}
                {hoveredPoint && (
                  <div
                    className="absolute z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold shadow-xl backdrop-blur-md pointer-events-none transition-all duration-150 border border-white/10"
                    style={{ left: `clamp(10px, ${(hoveredPoint.x / 700) * 90}%, 85%)`, top: `${Math.max(10, hoveredPoint.y - 45)}px` }}
                  >
                    <span className="text-[#38bdf8] font-bold block text-[11px]">{hoveredPoint.label}</span>
                    <span className="text-white font-extrabold">{hoveredPoint.val}</span>
                    <span className="text-slate-300 text-[10px] block font-normal">{hoveredPoint.moves}</span>
                  </div>
                )}

                {/* Month Ticks along X-Axis */}
                <div className="flex justify-between text-xs text-inksoft font-medium pt-3 px-1">
                  {currentTelemetry.months.map((m, idx) => (
                    <span
                      key={idx}
                      onClick={() => setHoveredPoint(m)}
                      className={`cursor-pointer transition-colors ${hoveredPoint?.label === m.label ? 'text-[#0085db] font-bold' : 'hover:text-ink'}`}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Return On Turnaround Bar Chart (col-span-4 matching Screenshot 4) */}
          <div className="lg:col-span-4 bg-surface rounded-2xl p-6 border border-line shadow-card flex flex-col justify-between relative overflow-hidden hover:shadow-lg hover:border-indigo-400/40 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-indigo-400 before:to-purple-500">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-ink tracking-tight">Return On Turnaround</h3>
                <button
                  onClick={() => setSelectedMonthIdx((prev) => (prev + 1) % turnaroundMonths.length)}
                  title="Cycle month SLA"
                  className="text-inksoft hover:text-ink p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
              </div>

              {/* Stat Row - Dynamically changes based on selected/hovered month */}
              <div className="flex items-center gap-3 my-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-[#0085db] flex items-center justify-center shrink-0 shadow-xs">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight transition-all">
                    {currentTurnaround.sla}
                  </div>
                  <div className="text-xs text-inksoft font-medium">SLA Performance</div>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    {currentTurnaround.trend}
                  </span>
                  <div className="text-[11px] text-inksoft mt-0.5 font-medium">{currentTurnaround.full}</div>
                </div>
              </div>

              {/* Vertical Bar Chart with Interactive Clickable Bars */}
              <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                {turnaroundMonths.map((bar, idx) => {
                  const isHighlighted = selectedMonthIdx === idx
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedMonthIdx(idx)}
                      title={`${bar.full}: ${bar.sla} SLA, ${bar.turnTime} turn time`}
                      className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
                    >
                      <div
                        className={`w-full max-w-[28px] rounded-t-xl transition-all duration-400 ${
                          isHighlighted
                            ? 'bg-[#0085db] shadow-[0_4px_16px_rgba(0,133,219,0.35)] scale-y-100'
                            : 'bg-slate-200 dark:bg-slate-700/60 group-hover:bg-slate-300 dark:group-hover:bg-slate-600'
                        }`}
                        style={{ height: bar.height }}
                      />
                      <span className={`text-[10.5px] font-bold transition-colors ${isHighlighted ? 'text-[#0085db]' : 'text-inksoft group-hover:text-ink'}`}>
                        {bar.month}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Second Middle Row: Quayside Berth Allocation Gauge (Screenshot 3) + 3 Pastel Stat Mini-Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Quayside Berth Allocation Semicircular Gauge (col-span-4 Strictly matching Screenshot 3) */}
          <div className="lg:col-span-4 bg-surface rounded-2xl p-6 border border-line shadow-card flex flex-col justify-between relative overflow-hidden hover:shadow-lg hover:border-purple-400/40 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-purple-400 before:via-pink-500 before:to-amber-400">
            <div>
              {/* Header with Title and Three-Dot Menu */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-ink tracking-tight">Quayside Berth Allocation</h3>
                <button
                  onClick={() => setSelectedBerthFilter(prev => prev === 'all' ? 'container' : 'all')}
                  title="Toggle Allocation View"
                  className="text-inksoft hover:text-ink p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
              </div>

              {/* Semicircular Gauge Matching Screenshot 3 */}
              <div className="relative h-44 flex flex-col items-center justify-center my-2">
                <svg viewBox="0 0 200 120" className="w-56 h-36 overflow-visible">
                  {/* Background Track Arc */}
                  <path
                    d="M 25,108 A 75 75 0 0 1 175,108"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="16"
                    strokeLinecap="round"
                    className="dark:stroke-slate-800/80"
                  />

                  {/* 1. Container Segment (36%): Blue Arc */}
                  <path
                    d={makeArcPath(0, 62, 100, 108, 75)}
                    fill="none"
                    stroke="#0085db"
                    strokeWidth="16"
                    strokeLinecap="round"
                    className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                    title="Container: 36% (Berths B01-B03)"
                  />

                  {/* 2. Dry Bulk Segment (22%): Violet Arc */}
                  <path
                    d={makeArcPath(66, 104, 100, 108, 75)}
                    fill="none"
                    stroke="#7352FF"
                    strokeWidth="16"
                    className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                    title="Dry Bulk: 22% (Berths B04-B05)"
                  />

                  {/* Subtle Separator Spacer Segment */}
                  <path
                    d={makeArcPath(106, 110, 100, 108, 75)}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="16"
                    className="dark:stroke-slate-700/60"
                  />

                  {/* 3. Ro-Ro Segment (31%): Yellow/Orange Arc */}
                  <path
                    d={makeArcPath(113, 148, 100, 108, 75)}
                    fill="none"
                    stroke="#FFAE1F"
                    strokeWidth="16"
                    className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                    title="Ro-Ro: 31% (Ramp Terminal R1)"
                  />

                  {/* 4. Tanker Segment (17%): Cyan/Teal Arc */}
                  <path
                    d={makeArcPath(152, 180, 100, 108, 75)}
                    fill="none"
                    stroke="#13DEB9"
                    strokeWidth="16"
                    strokeLinecap="round"
                    className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                    title="Tanker: 17% (Pier 400 Deepwater Jetty)"
                  />
                </svg>

                {/* Center Value & Optimal SLA Badge Matching Screenshot 3 */}
                <div className="absolute top-14 text-center select-none pointer-events-none">
                  <span className="text-3xl font-black text-ink block leading-tight tracking-tight">
                    8,364
                  </span>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A86B] dark:text-emerald-400 bg-[#E8F8F0] dark:bg-emerald-950/60 px-3 py-1 rounded-full mt-1.5 shadow-xs">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <span>Optimal SLA</span>
                  </div>
                </div>
              </div>

              {/* 2x2 Legend Grid strictly matching Screenshot 3 */}
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-3.5 border-t border-line text-xs font-semibold text-ink">
                {/* Left Column */}
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0085db] shrink-0" />
                  <span>36% Container</span>
                </div>
                {/* Right Column */}
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#13DEB9] shrink-0" />
                  <span>17% Tanker</span>
                </div>
                {/* Left Column */}
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7352FF] shrink-0" />
                  <span>22% Dry Bulk</span>
                </div>
                {/* Right Column */}
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFAE1F] shrink-0" />
                  <span>31% Ro-Ro</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Pastel Stat Cards (col-span-8 matching Screenshot 4: Gang Assignments, Tariff Earnings, Drayage Flow) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* Card 1: Gang Assignments */}
            <div className="bg-surface rounded-2xl p-5 border border-line shadow-card flex flex-col justify-between relative overflow-hidden hover:-translate-y-1 hover:shadow-md hover:border-rose-400/40 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-rose-500 before:to-pink-500">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-inksoft">Gang Assignments</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-black text-ink tracking-tight">4,562</div>
                  <div className="text-xs text-inksoft font-medium mt-0.5">+23% vs last shift</div>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-10 mt-4">
                {[40, 65, 80, 50, 95, 75].map((h, i) => (
                  <div key={i} className="flex-1 bg-rose-400 hover:bg-rose-500 rounded-t-sm transition-colors cursor-pointer" style={{ height: `${h}%` }} title={`Shift ${i+1}: ${h * 50} workers`} />
                ))}
              </div>
            </div>

            {/* Card 2: Tariff Earnings */}
            <div className="bg-surface rounded-2xl p-5 border border-line shadow-card flex flex-col justify-between relative overflow-hidden hover:-translate-y-1 hover:shadow-md hover:border-purple-400/40 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-indigo-500 before:to-purple-500">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-inksoft">Tariff Earnings</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-black text-ink tracking-tight">$6,280k</div>
                  <div className="text-xs text-inksoft font-medium mt-0.5">+18% monthly rev</div>
                </div>
              </div>
              <div className="h-10 mt-4 flex items-center">
                <svg viewBox="0 0 100 30" className="w-full h-8 overflow-visible">
                  <path d="M 0,20 Q 25,5 50,18 T 100,8" fill="none" stroke="#7352FF" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 3: Drayage Flow */}
            <div className="bg-surface rounded-2xl p-5 border border-line shadow-card flex flex-col justify-between relative overflow-hidden hover:-translate-y-1 hover:shadow-md hover:border-teal-400/40 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-teal-400 before:to-emerald-500">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-inksoft">Drayage Flow</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-black text-ink tracking-tight">$2,529k</div>
                  <div className="text-xs text-inksoft font-medium mt-0.5">+42% turn rate</div>
                </div>
              </div>
              <div className="h-10 mt-4 flex items-center justify-end">
                <div className="w-10 h-10 rounded-full border-4 border-[#13DEB9] border-t-transparent animate-[spin_8s_linear_infinite]" />
              </div>
            </div>

          </div>
        </div>

        {/* 5. Bottom Row: Active Fleet Table (Screenshot 4 Popular Products) + Zone Reports (Screenshot 4 Earning Reports) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Active Fleet Table (col-span-8 matching Screenshot 4 Popular Products) */}
          <div className="lg:col-span-8 bg-surface rounded-2xl p-6 border border-line shadow-card relative overflow-hidden hover:shadow-lg hover:border-cyan-400/40 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-cyan-400 before:via-blue-500 before:to-indigo-500">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-ink tracking-tight">Active Fleet &amp; Lineup Calls</h3>
                <p className="text-xs text-inksoft">Total 15 vessels tracked by AIS transponders</p>
              </div>
              <Link
                to="/vessels"
                className="text-xs font-bold text-[#0085db] hover:underline flex items-center gap-1"
              >
                <span>View Full Lineup</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-line/60">
              {popularVessels.map((v, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                  {/* Left: 3D Squircle Icon + Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-2.5 shrink-0 shadow-xs ${v.iconBg}`}>
                      {v.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-ink block truncate leading-tight">{v.name}</span>
                      <span className="text-xs text-inksoft truncate block">{v.cargo}</span>
                    </div>
                  </div>

                  {/* Middle: Metric & Progress Bar */}
                  <div className="hidden sm:block text-left min-w-[130px]">
                    <span className="text-xs font-extrabold text-ink block">{v.metric}</span>
                    <span className="text-[11px] text-inksoft block mb-1">{v.metricSub}</span>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${v.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Soft Status Pill + 3-Dots */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        v.statusType === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : v.statusType === 'delayed'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          : 'bg-sky-50 text-[#0085db] dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                      }`}
                    >
                      {v.status}
                    </span>
                    <button className="text-inksoft hover:text-ink p-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Telemetry Reports (col-span-4 matching Screenshot 4 Earning Reports) */}
          <div className="lg:col-span-4 bg-surface rounded-2xl p-6 border border-line shadow-card flex flex-col justify-between relative overflow-hidden hover:shadow-lg hover:border-emerald-400/40 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-400 before:to-teal-500">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-ink tracking-tight">Zone Telemetry Reports</h3>
                  <p className="text-xs text-inksoft">Multi-horizon hydrodynamic status</p>
                </div>
                <button className="text-inksoft hover:text-ink p-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {earningReports.map((report, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center p-2.5 shrink-0 ${report.iconBg}`}>
                        {report.icon}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink block leading-tight">{report.title}</span>
                        <span className="text-[11px] text-inksoft">{report.sub}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                      {report.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-line">
              <Link
                to="/congestion"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-ink text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Full Hydrodynamic Matrix</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  )
}
