import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import KpiRow from '../components/dashboard/KpiRow.jsx'
import PortMap from '../components/port-map/PortMap.jsx'
import { useRole } from '../context/RoleContext.jsx'
import { useOperationalContext } from '../context/OperationalContext.jsx'
import { fetch72hPlan } from '../api/client.js'

export default function DashboardPage() {
  const { activeRole, can } = useRole()
  const { vessels, berths } = useOperationalContext()
  const [viewMode, setViewMode] = useState('matrix') // 'matrix' | 'map'
  const [activeHorizonIndex, setActiveHorizonIndex] = useState(2) // T+12h default
  const [isPlaying, setIsPlaying] = useState(false)
  const [planData, setPlanData] = useState(null)

  useEffect(() => {
    fetch72hPlan().then((p) => {
      if (p) setPlanData(p)
    })
  }, [])

  // Auto-play timeline slider simulation
  useEffect(() => {
    let timer
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveHorizonIndex((prev) => (prev + 1) % 12)
      }, 2000)
    }
    return () => clearInterval(timer)
  }, [isPlaying])

  const timeSlices = [
    { label: 'T+00h', time: '00:00' },
    { label: 'T+06h', time: '06:00' },
    { label: 'T+12h', time: '12:00' },
    { label: 'T+18h', time: '18:00' },
    { label: 'T+24h', time: '24:00' },
    { label: 'T+30h', time: '30:00' },
    { label: 'T+36h', time: '36:00' },
    { label: 'T+42h', time: '42:00' },
    { label: 'T+48h', time: '48:00' },
    { label: 'T+54h', time: '54:00' },
    { label: 'T+60h', time: '60:00' },
    { label: 'T+72h', time: '72:00' },
  ]

  // Zone matrix telemetry matching Image 1 dot indicators
  const zonesData = [
    {
      code: 'A',
      name: 'Approach Fairway',
      country: 'Zone A',
      metrics: [
        { label: 'UKC Clearance', dots: [1, 1, 1, 1, 1, 1, 0, 0] },
        { label: 'Crane Moves', dots: [1, 1, 1, 0, 0, 0, 0, 0] },
        { label: 'Yard Density', dots: [1, 1, 1, 1, 0, 0, 0, 0] },
        { label: 'Queue Load', dots: [1, 1, 1, 1, 1, 0, 0, 0] },
      ],
      terminal: 'Outer Pilot Gate',
    },
    {
      code: 'B',
      name: 'Container Terminal',
      country: 'Zone B',
      metrics: [
        { label: 'UKC Clearance', dots: [1, 1, 1, 1, 1, 1, 1, 1] },
        { label: 'Crane Moves', dots: [1, 1, 1, 1, 1, 1, 1, 0] },
        { label: 'Yard Density', dots: [1, 1, 1, 1, 1, 1, 1, 1] },
        { label: 'Queue Load', dots: [1, 1, 1, 1, 1, 1, 0, 0] },
      ],
      terminal: 'Berths B01-B04',
      isHotspot: true,
    },
    {
      code: 'C',
      name: 'Feeder Basin',
      country: 'Zone C',
      metrics: [
        { label: 'UKC Clearance', dots: [1, 1, 1, 1, 1, 0, 0, 0] },
        { label: 'Crane Moves', dots: [1, 1, 1, 1, 1, 0, 0, 0] },
        { label: 'Yard Density', dots: [1, 1, 1, 1, 1, 1, 0, 0] },
        { label: 'Queue Load', dots: [1, 1, 1, 1, 0, 0, 0, 0] },
      ],
      terminal: 'Berths B05-B06',
    },
    {
      code: 'D',
      name: 'Tanker Pier Jetty',
      country: 'Zone D',
      metrics: [
        { label: 'UKC Clearance', dots: [1, 1, 1, 1, 1, 1, 1, 0] },
        { label: 'Crane Moves', dots: [1, 1, 0, 0, 0, 0, 0, 0] },
        { label: 'Yard Density', dots: [1, 1, 1, 1, 1, 0, 0, 0] },
        { label: 'Queue Load', dots: [1, 1, 1, 0, 0, 0, 0, 0] },
      ],
      terminal: 'Berths B07-B08',
    },
    {
      code: 'E',
      name: 'Dry Bulk Terminal',
      country: 'Zone E',
      metrics: [
        { label: 'UKC Clearance', dots: [1, 1, 1, 1, 1, 1, 0, 0] },
        { label: 'Crane Moves', dots: [1, 1, 1, 1, 0, 0, 0, 0] },
        { label: 'Yard Density', dots: [1, 1, 1, 1, 1, 0, 0, 0] },
        { label: 'Queue Load', dots: [1, 1, 1, 1, 0, 0, 0, 0] },
      ],
      terminal: 'Berths B09-B10',
    },
  ]

  // Canonical fleet for Active Users table (Image 1 style)
  const fleetTable = [
    {
      name: 'MSC Arjuna',
      flag: 'PA',
      type: 'Ultra Large Container',
      berth: 'Berth B01',
      zone: 'Zone B',
      draft: '15.5m',
      speed: '14.2 kn',
      status: 'Underway',
      statusType: 'underway',
      action: 'Priority 3',
    },
    {
      name: 'Maersk Baroda',
      flag: 'DK',
      type: 'New Panamax Container',
      berth: 'Berth B02',
      zone: 'Zone B',
      draft: '14.5m',
      speed: '0.0 kn',
      status: 'Moored',
      statusType: 'moored',
      action: 'Priority 2',
    },
    {
      name: 'CMA CGM Gujarat',
      flag: 'FR',
      type: 'Neo-Panamax Container',
      berth: 'Berth B03',
      zone: 'Zone B',
      draft: '14.0m',
      speed: '0.1 kn',
      status: 'Anchored',
      statusType: 'anchored',
      action: 'Priority 2',
    },
    {
      name: 'Bharat Pioneer',
      flag: 'IN',
      type: 'VLCC Crude Tanker',
      berth: 'Berth B07',
      zone: 'Zone D',
      draft: '16.0m',
      speed: '0.2 kn',
      status: 'Anchored',
      statusType: 'anchored',
      action: 'Priority 3',
    },
    {
      name: 'ONE Kathiawar',
      flag: 'JP',
      type: 'Feedermax Container',
      berth: 'Berth B05',
      zone: 'Zone C',
      draft: '9.2m',
      speed: '0.0 kn',
      status: 'Moored',
      statusType: 'moored',
      action: 'Priority 1',
    },
    {
      name: 'Saurashtra Star',
      flag: 'BS',
      type: 'Pure Car Carrier (Ro-Ro)',
      berth: 'Berth B11',
      zone: 'Zone F',
      draft: '9.8m',
      speed: '0.0 kn',
      status: 'Moored',
      statusType: 'moored',
      action: 'Priority 2',
    },
  ]

  const activeSlice = planData?.slices?.[activeHorizonIndex] || {
    peak_congestion_index: 81.6,
    tide_height_m: 3.4,
    primary_bottleneck_zone: 'B',
  }

  return (
    <AppShell crumb="Dashboard">
      <div className="space-y-5 max-w-[1680px] mx-auto select-none">
        {/* Top: 4 KPI Cards (Vantus style) */}
        {can('viewKpis') && <KpiRow />}

        {/* Middle: Zone Operations & Timeline Matrix (Vantus "Top Users by Country" style) */}
        <div className="glass-strong rounded-2xl border border-line p-5 sm:p-6 space-y-6">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">Operational Telemetry by Port Zone</h2>
                <p className="text-xs text-inksoft">Multi-horizon discrete telemetry with dynamic Under-Keel Clearance</p>
              </div>
            </div>

            {/* View & Zone Controls */}
            <div className="flex items-center gap-2">
              <div className="glass border border-line rounded-xl p-1 flex items-center gap-1 text-xs">
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    viewMode === 'matrix' ? 'bg-brand text-white shadow-sm font-semibold' : 'text-inksoft hover:text-ink'
                  }`}
                >
                  Dot Matrix Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    viewMode === 'map' ? 'bg-brand text-white shadow-sm font-semibold' : 'text-inksoft hover:text-ink'
                  }`}
                >
                  Interactive Map
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-line text-xs text-ink font-semibold">
                <span>Horizon: {timeSlices[activeHorizonIndex]?.label}</span>
                <span className="text-inksoft font-normal">({activeSlice.tide_height_m}m Tide)</span>
              </div>
            </div>
          </div>

          {/* Body: Either Dot Matrix Grid or Interactive Map */}
          {viewMode === 'matrix' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-2">
              {zonesData.map((z, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    z.isHotspot
                      ? 'bg-brand/5 border-brand/40 shadow-sm'
                      : 'bg-surface border-line hover:border-lineSoft hover:shadow-sm'
                  }`}
                >
                  {/* Zone Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-ink">{z.country}</span>
                    <span
                      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                        z.isHotspot
                          ? 'bg-brand/15 text-brand'
                          : 'bg-slate-100 text-inksoft'
                      }`}
                    >
                      {z.code === 'B' ? '81.6% PEAK' : 'NOMINAL'}
                    </span>
                  </div>

                  {/* Dot Matrix Indicators */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {z.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="flex flex-col items-center">
                        <span className="text-[10px] text-inksoft uppercase truncate w-full text-center mb-1.5 font-medium">
                          {m.label.split(' ')[0]}
                        </span>
                        <div className="flex flex-col gap-1">
                          {m.dots.map((dot, dIdx) => (
                            <span
                              key={dIdx}
                              className={`w-2 h-2 rounded-full ${
                                dot === 1
                                  ? z.isHotspot
                                    ? 'bg-brand'
                                    : 'bg-ok'
                                  : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Zone Footer */}
                  <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px]">
                    <span className="text-ink font-semibold truncate">{z.name}</span>
                    <span className="text-inksoft text-[10px] flex-shrink-0">{z.terminal}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-line">
              <PortMap />
            </div>
          )}

          {/* Interactive Time Slider Bar */}
          <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause timeline' : 'Play timeline'}
              className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center shadow-md hover:bg-brand-deep transition-colors flex-shrink-0"
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            {/* Track with steps */}
            <div className="flex-1 w-full relative py-3">
              <div className="h-1.5 w-full bg-slate-200 rounded-full relative">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-300"
                  style={{ width: `${(activeHorizonIndex / (timeSlices.length - 1)) * 100}%` }}
                />
              </div>

              {/* Ticks and Year/Hour Labels */}
              <div className="flex justify-between mt-2 text-[11px] text-inksoft">
                {timeSlices.map((ts, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveHorizonIndex(i)}
                    className={`hover:text-brand transition-colors text-center ${
                      activeHorizonIndex === i ? 'text-brand font-bold scale-105' : ''
                    }`}
                  >
                    <span className="block">{ts.label}</span>
                    <span className="text-[9.5px] opacity-70 hidden md:block">{ts.time}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Activities Circular Card + Active Fleet Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Terminal Operations Activities */}
          <div className="lg:col-span-4 bg-surface rounded-2xl border border-line p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-ink">Terminal Activities</h3>
                  <p className="text-xs text-inksoft">Active resource allocation</p>
                </div>
                <button className="text-inksoft hover:text-ink p-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </div>

              {/* Overlapping Circles / Visualizer */}
              <div className="relative h-44 flex items-center justify-center my-2">
                {/* Outer Big Circle: 70% Active Berthing */}
                <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-sky-400 to-sky-500 text-white flex items-center justify-center shadow-lg font-bold text-xl font-sans relative z-10">
                  <span>70%</span>
                </div>

                {/* Overlapping Second Circle: 20% Transit */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-500 text-white flex items-center justify-center shadow-md font-bold text-sm absolute top-4 right-10 z-20 border-2 border-white">
                  <span>20%</span>
                </div>

                {/* Overlapping Third Circle: 10% Maintenance */}
                <div className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md font-bold text-xs absolute bottom-4 right-16 z-30 border-2 border-white">
                  <span>10%</span>
                </div>
              </div>
            </div>

            {/* Legend Pills */}
            <div className="pt-4 border-t border-line flex items-center justify-around text-xs font-medium">
              <span className="flex items-center gap-1.5 text-ink">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                Active (70%)
              </span>
              <span className="flex items-center gap-1.5 text-ink">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                Transit (20%)
              </span>
              <span className="flex items-center gap-1.5 text-ink">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                Reserve (10%)
              </span>
            </div>
          </div>

          {/* Right: Active Fleet & Dispatch Queue */}
          <div className="lg:col-span-8 bg-surface rounded-2xl border border-line p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink">Active Fleet &amp; Berth Schedule</h3>
                <p className="text-xs text-inksoft">Real-time status of vessels in Port of Arjuna</p>
              </div>
              <Link
                to="/vessels"
                className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
              >
                <span>View All 15</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {/* Modern Clean Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-line text-inksoft font-semibold text-[11px] uppercase tracking-wider">
                    <th className="pb-3 pl-2">Vessel Name</th>
                    <th className="pb-3">Cargo Type</th>
                    <th className="pb-3">Berth / Zone</th>
                    <th className="pb-3">Draft / Speed</th>
                    <th className="pb-3 pr-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {fleetTable.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Vessel Name with avatar */}
                      <td className="py-3 pl-2 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20 text-brand flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          {v.flag}
                        </div>
                        <div>
                          <span className="font-semibold text-ink block leading-tight">{v.name}</span>
                          <span className="text-[10.5px] text-inksoft">{v.action}</span>
                        </div>
                      </td>

                      {/* Cargo Type */}
                      <td className="py-3 text-inksoft font-medium">
                        {v.type}
                      </td>

                      {/* Berth / Zone */}
                      <td className="py-3">
                        <span className="font-semibold text-ink block">{v.berth}</span>
                        <span className="text-[11px] text-brand font-medium">{v.zone}</span>
                      </td>

                      {/* Draft / Speed */}
                      <td className="py-3 text-inksoft">
                        <span className="text-ink font-semibold">{v.draft}</span>
                        <span className="text-lineSoft mx-1">·</span>
                        <span>{v.speed}</span>
                      </td>

                      {/* Status Pill */}
                      <td className="py-3 pr-2 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            v.statusType === 'moored'
                              ? 'bg-ok/10 text-ok'
                              : v.statusType === 'underway'
                              ? 'bg-brand/10 text-brand'
                              : 'bg-slate-100 text-inksoft'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
