import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import KpiRow from '../components/dashboard/KpiRow.jsx'
import { useRole } from '../context/RoleContext.jsx'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { fetch72hPlan } from '../api/client.js'

export default function DashboardPage() {
  const { activeRole, can } = useRole()
  const { vessels, berths } = useOperationalContext()
  const [chartMode, setChartMode] = useState('throughput') // 'throughput' | 'congestion'
  const [planData, setPlanData] = useState(null)

  useEffect(() => {
    fetch72hPlan().then((p) => {
      if (p) setPlanData(p)
    })
  }, [])

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
        
        {/* 1. Welcome Banner Card (Strictly matching MaterialM Screenshots 3 & 5) */}
        <div className="bg-gradient-to-r from-[#0085db] via-[#0094f0] to-[#00A1FF] rounded-2xl p-6 sm:p-7 text-white shadow-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5 leading-tight">
              Welcome {activeRole?.label || 'Jonathan Deo'}
            </h2>
            <p className="text-white/85 text-xs sm:text-sm font-medium mb-5">
              Check all the statistics · AI-grounded berth optimization and 72h continuous harbor telemetry.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                <span className="text-lg sm:text-xl font-black block leading-none">15</span>
                <span className="text-[11px] text-white/80 font-medium">AIS Vessels</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                <span className="text-lg sm:text-xl font-black block leading-none">98.4%</span>
                <span className="text-[11px] text-white/80 font-medium">Berth SLA</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                <span className="text-lg sm:text-xl font-black block leading-none">$0.00</span>
                <span className="text-[11px] text-white/80 font-medium">Demurrage</span>
              </div>
            </div>
          </div>

          {/* Right 3D Isometric Art Decoration (matching megaphone character / 3D cargo scene) */}
          <div className="relative z-10 shrink-0 flex items-center justify-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center p-4 relative shadow-lg">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                {/* Isometric Cargo Container Ship Art */}
                <ellipse cx="80" cy="120" rx="60" ry="18" fill="rgba(0,0,0,0.15)" />
                <path d="M25 95 L80 120 L135 95 L110 80 L50 80 Z" fill="#FFFFFF" />
                <path d="M25 95 L80 120 L80 102 L25 80 Z" fill="#E2E8F0" />
                <path d="M80 120 L135 95 L135 80 L80 102 Z" fill="#CBD5E1" />
                {/* Containers */}
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

        {/* 3. Middle Row: Overall Balance / Throughput Dual-Wave Line Chart + Return On Investment Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Overall Throughput Dual-Wave Card (col-span-8 matching Screenshot 2) */}
          <div className="lg:col-span-8 bg-surface rounded-2xl p-6 border border-line shadow-card flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs font-semibold text-inksoft">Overall Operational Telemetry</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-sans">
                      $2,538,942
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                      16.3%
                    </span>
                    <span className="text-xs text-inksoft">last 12 months</span>
                  </div>
                </div>

                {/* Orders / Expenses Pill Toggle Button Group */}
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 self-start sm:self-auto">
                  <button
                    onClick={() => setChartMode('throughput')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      chartMode === 'throughput'
                        ? 'bg-surface text-[#0085db] shadow-xs'
                        : 'text-inksoft hover:text-ink'
                    }`}
                  >
                    Throughput
                  </button>
                  <button
                    onClick={() => setChartMode('congestion')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      chartMode === 'congestion'
                        ? 'bg-surface text-[#0085db] shadow-xs'
                        : 'text-inksoft hover:text-ink'
                    }`}
                  >
                    Congestion
                  </button>
                </div>
              </div>

              {/* Dual-Wave Smooth Curve SVG (MaterialM signature) */}
              <div className="relative h-60 w-full pt-4">
                <svg viewBox="0 0 700 220" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartBlueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0085db" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#0085db" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline */}
                  <line x1="0" y1="180" x2="700" y2="180" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="700" y2="100" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />

                  {/* Wave 2: Gray Muted Curve */}
                  <path
                    d="M 0,140 Q 100,80 200,120 T 400,100 T 600,140 T 700,90"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Wave 1 Area Gradient Fill */}
                  <path
                    d="M 0,160 Q 120,180 220,110 T 420,70 T 580,120 T 700,150 L 700,220 L 0,220 Z"
                    fill="url(#chartBlueGrad)"
                  />

                  {/* Wave 1: Cyan Curve (Vivid #0085db) */}
                  <path
                    d="M 0,160 Q 120,180 220,110 T 420,70 T 580,120 T 700,150"
                    fill="none"
                    stroke="#0085db"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                  />

                  {/* Peak Highlight Circle */}
                  <circle cx="420" cy="70" r="5" fill="#0085db" stroke="#FFFFFF" strokeWidth="3" className="shadow-md" />
                </svg>

                {/* Month Ticks */}
                <div className="flex justify-between text-xs text-inksoft font-medium pt-3 px-1">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>July</span>
                </div>
              </div>
            </div>
          </div>

          {/* Return On Turnaround Bar Chart (col-span-4 matching Screenshot 2) */}
          <div className="lg:col-span-4 bg-surface rounded-2xl p-6 border border-line shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-ink tracking-tight">Return On Turnaround</h3>
                <button className="text-inksoft hover:text-ink p-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </div>

              {/* Stat Row */}
              <div className="flex items-center gap-3 my-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-[#0085db] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">283%</div>
                  <div className="text-xs text-inksoft">SLA Performance</div>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    +24%
                  </span>
                  <div className="text-[11px] text-inksoft mt-0.5">January</div>
                </div>
              </div>

              {/* Vertical Bar Chart with Rounded Caps */}
              <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                {[
                  { month: 'JAN', height: '45%', highlight: false },
                  { month: 'FEB', height: '85%', highlight: true },
                  { month: 'MAR', height: '60%', highlight: false },
                  { month: 'APR', height: '70%', highlight: false },
                  { month: 'MAY', height: '50%', highlight: false },
                  { month: 'JUN', height: '65%', highlight: false }
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className={`w-full max-w-[28px] rounded-t-xl transition-all duration-500 ${
                        bar.highlight
                          ? 'bg-[#0085db] shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-700/60'
                      }`}
                      style={{ height: bar.height }}
                    />
                    <span className="text-[10.5px] font-bold text-inksoft">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Second Middle Row: Quayside Capacity Gauge + 3 Pastel Stat Mini-Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Quayside Semicircular Donut Meter (col-span-4 matching Screenshots 3 & 5 Product Sales) */}
          <div className="lg:col-span-4 bg-surface rounded-2xl p-6 border border-line shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-ink tracking-tight">Quayside Berth Allocation</h3>
                <button className="text-inksoft hover:text-ink p-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </div>

              {/* Semicircular Meter SVG */}
              <div className="relative h-44 flex flex-col items-center justify-center my-2">
                <svg viewBox="0 0 200 120" className="w-52 h-32 overflow-visible">
                  {/* Background Arc */}
                  <path
                    d="M 20,110 A 80,80 0 0,1 180,110"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />
                  {/* Arc Segments */}
                  <path
                    d="M 20,110 A 80,80 0 0,1 60,42"
                    fill="none"
                    stroke="#0085db"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 68,36 A 80,80 0 0,1 115,30"
                    fill="none"
                    stroke="#7352FF"
                    strokeWidth="18"
                  />
                  <path
                    d="M 125,32 A 80,80 0 0,1 168,75"
                    fill="none"
                    stroke="#FFAE1F"
                    strokeWidth="18"
                  />
                  <path
                    d="M 172,83 A 80,80 0 0,1 180,110"
                    fill="none"
                    stroke="#13DEB9"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Stat & Best Allocation Pill */}
                <div className="absolute top-16 text-center">
                  <span className="text-2xl font-black text-ink block leading-none">8,364</span>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full mt-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    Optimal SLA
                  </div>
                </div>
              </div>

              {/* Legend 4 Items */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-line text-xs font-semibold text-ink">
                <span className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0085db] shrink-0" />
                  36% Container
                </span>
                <span className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#13DEB9] shrink-0" />
                  17% Tanker
                </span>
                <span className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7352FF] shrink-0" />
                  22% Dry Bulk
                </span>
                <span className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFAE1F] shrink-0" />
                  31% Ro-Ro
                </span>
              </div>
            </div>
          </div>

          {/* 3 Pastel Stat Cards (col-span-8 matching Screenshot 2: Total followers, Total income, Current balance) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* Card 1: Assigned Stevedores (Total followers style) */}
            <div className="bg-surface rounded-2xl p-5 border border-line shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
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
                  <div key={i} className="flex-1 bg-rose-400 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Card 2: Terminal Income (Total income style) */}
            <div className="bg-surface rounded-2xl p-5 border border-line shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#7352FF] text-white flex items-center justify-center shadow-xs">
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

            {/* Card 3: Yard Readiness (Current balance style) */}
            <div className="bg-surface rounded-2xl p-5 border border-line shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#13DEB9] text-white flex items-center justify-center shadow-xs">
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
          <div className="lg:col-span-8 bg-surface rounded-2xl p-6 border border-line shadow-card">
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
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : v.statusType === 'delayed'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'bg-sky-50 text-[#0085db] dark:bg-sky-950/40 dark:text-sky-300'
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
          <div className="lg:col-span-4 bg-surface rounded-2xl p-6 border border-line shadow-card flex flex-col justify-between">
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
