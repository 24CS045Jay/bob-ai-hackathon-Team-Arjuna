import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import OceanAnimation from '../components/layout/OceanAnimation.jsx'
import { useRole } from '../context/RoleContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { scrollRevealVariants } from '../utils/motion.js'

export default function LandingPage() {
  const navigate = useNavigate()
  const { roles, login } = useRole()
  const { isDark, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const enterAs = (roleCode = 'shift_supervisor') => {
    login(roleCode)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#060E18] text-white flex flex-col selection:bg-cyan-500/30 transition-colors overflow-x-hidden font-sans relative">
      {/* Dynamic Ambient Gradient Blobs for Visual Depth & Energy */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-cyan-500/18 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute top-10 -right-32 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-[460px] left-1/4 w-[480px] h-[480px] bg-blue-600/15 rounded-full blur-[130px]" />
        <div className="absolute top-[900px] -right-20 w-[550px] h-[550px] bg-fuchsia-600/12 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-mesh-dots opacity-40" />
      </div>

      {/* Deep Maritime Twilight Container for Hero & Floating Navigation */}
      <div className="bg-[#060E18] relative z-10">
        {/* Top Floating SaaS Navigation Bar */}
        <header className="relative z-30 pt-4 sm:pt-6 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <nav className="backdrop-blur-2xl bg-slate-900/80 border border-white/15 hover:border-cyan-400/40 rounded-2xl px-4 sm:px-7 py-3 flex items-center justify-between shadow-[0_16px_50px_rgba(0,0,0,0.5)] transition-all duration-300">
            {/* Brand Logo & Name */}
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 shadow-[0_0_24px_rgba(6,182,212,0.55)] group-hover:scale-105 transition-transform"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.29 7 12 12 20.71 7" />
                  <line x1="12" y1="22" x2="12" y2="12" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-lg tracking-tight leading-tight flex items-center gap-1.5">
                  PortFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-extrabold">AI</span>
                </span>
                <span className="text-[10px] text-cyan-300/80 font-medium tracking-wide">Maritime Digital Twin</span>
              </div>
            </div>

            {/* Nav Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
              <span 
                onClick={() => enterAs('shift_supervisor')} 
                className="text-white cursor-pointer hover:text-cyan-400 transition-colors flex items-center gap-1 font-bold"
                title="Launch Overview & CRM Dashboard"
              >
                Overview
              </span>
              <span 
                onClick={() => {
                  const el = document.getElementById('features') || document.getElementById('value-props')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }} 
                className="hover:text-white cursor-pointer transition-colors"
                title="Explore Terminal Features & Intelligence"
              >
                Features
              </span>
              <span 
                onClick={() => { login('shift_supervisor'); navigate('/vessels'); }} 
                className="hover:text-white cursor-pointer transition-colors"
              >
                AIS Fleet
              </span>
              <span 
                onClick={() => { login('shift_supervisor'); navigate('/congestion'); }} 
                className="hover:text-white cursor-pointer transition-colors"
              >
                Congestion AI
              </span>
              <span 
                onClick={() => { login('shift_supervisor'); navigate('/berths'); }} 
                className="hover:text-white cursor-pointer transition-colors"
              >
                Berth Solver
              </span>
              <span 
                onClick={() => { login('shift_supervisor'); navigate('/plan'); }} 
                className="hover:text-white cursor-pointer transition-colors"
              >
                72h Matrix
              </span>
            </div>

            {/* Right Action Buttons: Theme Toggle + Login + Launch Console + Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer hover:border-cyan-400/40"
              >
                {isDark ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => navigate('/login')}
                title="Duty Station Login"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer hover:border-cyan-400/40 shadow-xs"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Station Login</span>
              </button>

              <button
                onClick={() => enterAs('shift_supervisor')}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white shadow-[0_0_24px_rgba(6,182,212,0.45)] hover:shadow-[0_0_32px_rgba(147,51,234,0.6)] transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <span>Launch Console</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all cursor-pointer"
                title="Toggle Menu"
              >
                {mobileMenuOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </nav>

          {/* Mobile Collapsible Navigation Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="lg:hidden mt-2 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-3"
              >
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    onClick={() => { setMobileMenuOpen(false); enterAs('shift_supervisor'); }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left text-cyan-300 font-bold"
                  >
                    Overview &amp; CRM
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      const el = document.getElementById('features') || document.getElementById('value-props');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left text-slate-200"
                  >
                    Terminal Features
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); login('shift_supervisor'); navigate('/vessels'); }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left text-slate-200"
                  >
                    AIS Fleet Lineup
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); login('shift_supervisor'); navigate('/congestion'); }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left text-slate-200"
                  >
                    Congestion AI
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); login('shift_supervisor'); navigate('/berths'); }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left text-slate-200"
                  >
                    Berth Solver
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); login('shift_supervisor'); navigate('/plan'); }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left text-slate-200"
                  >
                    72h Matrix
                  </button>
                </div>
                <div className="pt-2 border-t border-white/10 flex gap-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                    className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-white/10 border border-white/20"
                  >
                    Duty Station Login
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); enterAs('shift_supervisor'); }}
                    className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                  >
                    Launch Console
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Main Hero Container with Ocean Canvas & High-Energy SaaS Typography */}
        <section className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden">
          <OceanAnimation />

          {/* Hero Content Area */}
          <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-10 md:px-16 max-w-7xl mx-auto w-full pt-8 pb-12">
            <div className="mb-8 select-none max-w-4xl">
              {/* SaaS Eyebrow Pill with Pulsing Glow */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/15 border border-cyan-400/35 backdrop-blur-md text-cyan-300 text-xs font-bold mb-5 shadow-[0_0_24px_rgba(6,182,212,0.3)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>IBM &amp; BOB Hackathon · Next-Gen Autonomous Maritime Operations AI</span>
              </div>

              {/* Main High-Impact SaaS Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white drop-shadow-lg">
                Autonomous Maritime <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 via-indigo-300 to-fuchsia-400 drop-shadow-sm">
                  Operations &amp; Congestion AI
                </span>
              </h1>

              {/* Description Paragraph */}
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-slate-200/90 max-w-2xl mt-5 font-normal drop-shadow">
                Continuous 72-hour Random Forest congestion forecasting, physics-constrained berth allocation, Earliest Deadline First crane dispatching, and zero-hallucination watsonx.ai Copilot for high-throughput container terminals.
              </p>
            </div>

            {/* Action Button Pair */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={() => enterAs('shift_supervisor')}
                className="px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white shadow-[0_0_35px_rgba(6,182,212,0.5)] hover:shadow-[0_0_45px_rgba(147,51,234,0.7)] active:scale-95 transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Launch Operations Console</span>
              </button>

              <button
                onClick={() => { login('shift_supervisor'); navigate('/vessels'); }}
                className="px-8 py-4 rounded-xl text-white font-semibold text-sm border border-purple-500/30 hover:border-cyan-400/60 bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md hover:scale-102 active:scale-98 transition-all flex items-center gap-2.5 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span>AIS Fleet Lineup (15 Vessels)</span>
              </button>
            </div>

            {/* Interactive Live Digital Twin Hero Telemetry HUD */}
            <div className="w-full backdrop-blur-2xl bg-slate-900/70 border border-white/15 rounded-2xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
              {/* Header inside HUD */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Live Pier 400 Digital Twin Telemetry
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-bold text-cyan-300">
                    15 Vessels Synchronized
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">● Real-time AIS Sync: 12ms</span>
                  <span>|</span>
                  <span className="text-purple-300 font-semibold">watsonx.ai Active</span>
                </div>
              </div>

              {/* 4 Interactive Vessel Status Pods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Vessel 1 */}
                <div 
                  onClick={() => { login('shift_supervisor'); navigate('/vessels'); }}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">MSC Arjuna</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Confirmed
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mb-2">Berth B02 · 14,000 TEU</div>
                  <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-[65%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Discharge</span>
                    <span className="text-cyan-300 font-semibold">65% · 34.8 GMPH</span>
                  </div>
                </div>

                {/* Vessel 2 */}
                <div 
                  onClick={() => { login('shift_supervisor'); navigate('/vessels'); }}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 hover:border-indigo-400/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">Maersk Baroda</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      In Transit
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mb-2">Fairway Approach · Speed 14.2 kn</div>
                  <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full w-[100%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>ETA 02:40</span>
                    <span className="text-sky-300 font-semibold">UKC +3.4m Window</span>
                  </div>
                </div>

                {/* Vessel 3 */}
                <div 
                  onClick={() => { login('shift_supervisor'); navigate('/vessels'); }}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">CMA CGM Gujarat</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Anchorage Hold
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mb-2">Draft Limit 14.8m · Berth B03</div>
                  <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full w-[30%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>High Tide</span>
                    <span className="text-amber-300 font-semibold">Tidal Sync 18:00</span>
                  </div>
                </div>

                {/* Vessel 4 */}
                <div 
                  onClick={() => { login('shift_supervisor'); navigate('/vessels'); }}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 hover:border-purple-400/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Bharat Pioneer</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Tug Ready
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mb-2">VLCC Crude Tanker · Pier 400</div>
                  <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-full w-[75%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Demurrage</span>
                    <span className="text-purple-300 font-semibold">$0.00 Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 1. Colorful High-Contrast KPI Strip */}
      <motion.section 
        {...scrollRevealVariants}
        className="relative z-10 py-6 px-4 sm:px-8 border-y border-white/10 bg-slate-900/90 backdrop-blur-2xl select-none"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Stat 1: AIS Vessels */}
          <div className="p-4 rounded-xl bg-slate-800/60 border-t-2 border-cyan-400 border-x border-b border-white/10 hover:border-cyan-400/50 transition-all shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300">Tracked AIS Fleet</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight">15</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ultra-Large &amp; Neo-Panamax</div>
          </div>

          {/* Stat 2: Moves / Hr */}
          <div className="p-4 rounded-xl bg-slate-800/60 border-t-2 border-amber-400 border-x border-b border-white/10 hover:border-amber-400/50 transition-all shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300">Quayside Moves (GMPH)</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded">+14.6%</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">34.8</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Dual-Trolley STS Crane Moves</div>
          </div>

          {/* Stat 3: Berth SLA Compliance */}
          <div className="p-4 rounded-xl bg-slate-800/60 border-t-2 border-emerald-400 border-x border-b border-white/10 hover:border-emerald-400/50 transition-all shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300">Berth SLA Adherence</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded">Optimal</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">98.4%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Dynamic Tidal Windows</div>
          </div>

          {/* Stat 4: Demurrage */}
          <div className="p-4 rounded-xl bg-slate-800/60 border-t-2 border-purple-400 border-x border-b border-white/10 hover:border-purple-400/50 transition-all shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300">Demurrage Incurred</span>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/15 px-1.5 py-0.2 rounded">100% Guard</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 tracking-tight">$0.00</div>
            <div className="text-[11px] text-slate-400 mt-0.5">72h Zero Penalty Guarantee</div>
          </div>
        </div>
      </motion.section>

      {/* 2. Full-Screen Video Background Animation Section */}
      <section className="relative min-h-[85vh] lg:min-h-screen w-full flex flex-col justify-between py-16 px-4 sm:px-8 overflow-hidden bg-[#060E18]">
        {/* Full-Screen Looping Background Video from user assets */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center scale-105"
          >
            <source src="/assets/video/remove_the_task_bar_from_bott.mp4" type="video/mp4" />
          </video>
          {/* Subtle Scrim Gradients: crystal-clear center for maximum video visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060E18]/85 via-transparent to-[#060E18] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(6,14,24,0.65)_100%)] pointer-events-none" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 max-w-7xl mx-auto w-full pt-4 select-none text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-3 bg-slate-900/85 border border-amber-500/40 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Real-World Terminal Operations · Live Ground Truth Telemetry</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            Autonomous Deepwater Terminal in Action
          </h2>
          <p className="text-sm sm:text-base text-slate-200/90 max-w-2xl mx-auto mt-3 leading-relaxed drop-shadow">
            Continuous vessel monitoring, automated ship-to-shore gantry cranes, algorithmic quay allocation, and zero-surprise demurrage laytime controls.
          </p>
        </div>

        {/* Bottom status badge */}
        <div className="relative z-10 max-w-7xl mx-auto w-full pb-4 select-none flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-slate-200 text-xs font-medium shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pier 400 Deepwater Basin · Continuous Autonomous Crane &amp; Vessel Simulation</span>
          </div>
        </div>
      </section>

      {/* 3. Terminal Intelligence Value-Props with Vibrant Startup Gradients */}
      <motion.section 
        id="features"
        {...scrollRevealVariants}
        className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full relative z-10 scroll-mt-20"
      >
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-4 py-1.5 rounded-full shadow-xs">
            Terminal Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4 mb-3">
            Engineered for High-Throughput Ports
          </h2>
          <p className="text-sm text-slate-300">
            Eliminating bottlenecks from pilot boarding station to gate clearance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Electric Blue / Cyan */}
          <div className="backdrop-blur-xl bg-slate-900/75 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(6,182,212,0.2)] group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                Live AIS Vessel Tracking
              </h3>
              <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed">
                Real-time transponder position synchronization with harbor under-keel tidal clearance windows and GPS waypoints.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <span>View Transponders</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Card 2: Indigo / Violet */}
          <div className="backdrop-blur-xl bg-slate-900/75 rounded-2xl border border-indigo-500/30 hover:border-indigo-400 p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(99,102,241,0.2)] group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                Automated Berth Solver
              </h3>
              <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed">
                Algorithmic quay allocation and crane gang assignments that eliminate anchorage congestion and optimize turnaround time.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <span>Run Solver Algorithm</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Card 3: Purple / Pink */}
          <div className="backdrop-blur-xl bg-slate-900/75 rounded-2xl border border-purple-500/30 hover:border-purple-400 p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(168,85,247,0.2)] group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">
                Zero-Surprise Demurrage
              </h3>
              <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed">
                Proactive charter-party laytime alerts and gate OCR turnaround optimization, saving thousands of dollars per shift.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-pink-400">
              <span>View Laytime Guard</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. Terminal Operating Metrics & Ground Truth Numbers with Background Video Animation */}
      <section className="relative py-20 px-4 sm:px-8 w-full overflow-hidden bg-[#060E18]">
        {/* Background Looping Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center scale-105 opacity-60"
          >
            <source src="/assets/video/generate_in_video_in_that_one.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#060E18] via-[#060E18]/70 to-[#060E18] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_15%,_rgba(6,14,24,0.75)_100%)] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-14 select-none">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 bg-amber-500/15 border border-amber-500/35 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Terminal Operating Metrics · Live Ground Truth Telemetry</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 drop-shadow-md">
              Real-World Pier 400 Operating Numbers
            </h2>
            <p className="text-sm sm:text-base text-slate-200/90 max-w-xl mx-auto leading-relaxed drop-shadow">
              Validated operational telemetry synchronized across quayside gantries, fairway drafts, and automated gate lanes.
            </p>
          </div>

          {/* 6 Realistic High-Impact Port Data Numbers Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            {/* Card 1: Crane Productivity */}
            <div className="backdrop-blur-xl bg-slate-900/85 hover:bg-slate-800/95 border border-white/20 hover:border-amber-400/60 rounded-2xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/25 via-amber-500/10 to-transparent border border-amber-400/40 flex items-center justify-center shadow-[0_0_18px_rgba(245,158,11,0.25)] relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <line x1="2" y1="16" x2="30" y2="16" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
                      <path d="M7 26 L12 8 L20 8 L25 26" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="4" y1="8" x2="28" y2="8" stroke="#FDE68A" strokeWidth="2.2" strokeLinecap="round" />
                      <rect x="13" y="6" width="6" height="4" rx="1" fill="#F59E0B" />
                      <circle cx="16" cy="8" r="1" fill="#FFFFFF" />
                      <line x1="14" y1="10" x2="14" y2="18" stroke="#FDE68A" strokeWidth="1" />
                      <line x1="18" y1="10" x2="18" y2="18" stroke="#FDE68A" strokeWidth="1" />
                      <rect x="11" y="18" width="10" height="3" rx="0.8" fill="#F59E0B" />
                      <rect x="10" y="21" width="12" height="6" rx="1" fill="#F59E0B" fillOpacity="0.4" stroke="#F59E0B" strokeWidth="1.2" />
                      <line x1="16" y1="21" x2="16" y2="27" stroke="#FDE68A" strokeWidth="1" />
                      <circle cx="16" cy="4" r="1.5" fill="#10B981" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-md">
                      +18.4% vs Avg
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F59E0B] bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      Quayside Gantry
                    </span>
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 flex items-baseline gap-2 font-sans">
                  34.8 <span className="text-sm font-semibold text-amber-300 font-mono">GMPH</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-amber-200 transition-colors">
                  Quay Crane Moves Per Hour
                </h4>
              </div>
              <p className="text-xs text-slate-300/85 leading-relaxed mt-2">
                Automated hook sequence scheduling for dual-trolley STS cranes, eliminating gantry tractor idle buffers.
              </p>
            </div>

            {/* Card 2: Berth SLA Compliance */}
            <div className="backdrop-blur-xl bg-slate-900/85 hover:bg-slate-800/95 border border-white/20 hover:border-cyan-400/60 rounded-2xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/25 via-cyan-500/10 to-transparent border border-cyan-400/40 flex items-center justify-center shadow-[0_0_18px_rgba(6,182,212,0.25)] relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="22" r="7" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
                      <circle cx="16" cy="22" r="11" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
                      <line x1="4" y1="7" x2="28" y2="7" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="8" cy="7" r="2" fill="#38BDF8" />
                      <circle cx="24" cy="7" r="2" fill="#38BDF8" />
                      <line x1="8" y1="7" x2="12" y2="14" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2 1" />
                      <line x1="24" y1="7" x2="20" y2="14" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2 1" />
                      <path d="M9 14 L12 21 L20 21 L23 14 Z" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.6" strokeLinejoin="round" />
                      <rect x="14" y="11" width="4" height="3" rx="0.5" fill="#E0F2FE" />
                      <path d="M16 23 L16 29 M14 27 L16 29 L18 27" stroke="#38BDF8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-md">
                      Optimal SLA
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                      Berth Allocation
                    </span>
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 flex items-baseline gap-2 font-sans">
                  98.4% <span className="text-sm font-semibold text-cyan-300 font-mono">On-Time</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-cyan-200 transition-colors">
                  Vessel Schedule Adherence
                </h4>
              </div>
              <p className="text-xs text-slate-300/85 leading-relaxed mt-2">
                Dynamic 15.5m draft restrictions and 3.4m tidal windows synchronized across Berths B01 through B08.
              </p>
            </div>

            {/* Card 3: Demurrage Guarantee */}
            <div className="backdrop-blur-xl bg-slate-900/85 hover:bg-slate-800/95 border border-white/20 hover:border-emerald-400/60 rounded-2xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/25 via-emerald-500/10 to-transparent border border-emerald-400/40 flex items-center justify-center shadow-[0_0_18px_rgba(52,211,153,0.25)] relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="13" stroke="#34D399" strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />
                      <path d="M16 5 L24 8.5 V16 C24 21.5 16 26.5 16 26.5 C16 26.5 8 21.5 8 16 V8.5 L16 5 Z" fill="#064E3B" fillOpacity="0.6" stroke="#34D399" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M13 16 L15.5 18.5 L20 13" stroke="#6EE7B7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="16" cy="5" r="1.5" fill="#34D399" />
                      <circle cx="24" cy="8.5" r="1.5" fill="#34D399" />
                      <circle cx="8" cy="8.5" r="1.5" fill="#34D399" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-md">
                      100% Protected
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Laytime Guard
                    </span>
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 flex items-baseline gap-2 font-sans">
                  $0.00 <span className="text-sm font-semibold text-emerald-300 font-mono">Demurrage</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-emerald-200 transition-colors">
                  Demurrage &amp; Penalty Prevention
                </h4>
              </div>
              <p className="text-xs text-slate-300/85 leading-relaxed mt-2">
                Proactive charter-party laytime alerts and early vessel diversion prevent penalties before arrival.
              </p>
            </div>

            {/* Card 4: Quayside Volume Capacity */}
            <div className="backdrop-blur-xl bg-slate-900/85 hover:bg-slate-800/95 border border-white/20 hover:border-purple-400/60 rounded-2xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500/25 via-purple-500/10 to-transparent border border-purple-400/40 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.25)] relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <path d="M16 4 L26 9.5 L16 15 L6 9.5 Z" fill="#7E22CE" fillOpacity="0.4" stroke="#C084FC" strokeWidth="1.4" />
                      <path d="M6 9.5 V19.5 L16 25 V15 Z" fill="#6B21A8" fillOpacity="0.6" stroke="#A855F7" strokeWidth="1.4" />
                      <path d="M26 9.5 V19.5 L16 25 V15 Z" fill="#581C87" fillOpacity="0.6" stroke="#C084FC" strokeWidth="1.4" />
                      <line x1="9.5" y1="12.5" x2="9.5" y2="21" stroke="#E9D5FF" strokeWidth="0.8" opacity="0.7" />
                      <line x1="13" y1="14" x2="13" y2="22.5" stroke="#E9D5FF" strokeWidth="0.8" opacity="0.7" />
                      <line x1="19" y1="14" x2="19" y2="22.5" stroke="#E9D5FF" strokeWidth="0.8" opacity="0.7" />
                      <line x1="22.5" y1="12.5" x2="22.5" y2="21" stroke="#E9D5FF" strokeWidth="0.8" opacity="0.7" />
                      <circle cx="16" cy="4" r="1.5" fill="#E879F9" />
                      <circle cx="26" cy="9.5" r="1.5" fill="#E879F9" />
                      <circle cx="6" cy="9.5" r="1.5" fill="#E879F9" />
                      <circle cx="16" cy="25" r="1.5" fill="#E879F9" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-purple-300 bg-purple-500/15 border border-purple-500/25 px-2.5 py-0.5 rounded-md">
                      Active Shift
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                      Pier 400 Volume
                    </span>
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 flex items-baseline gap-2 font-sans">
                  8,364 <span className="text-sm font-semibold text-purple-300 font-mono">TEU</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-purple-200 transition-colors">
                  Quayside Berth Capacity
                </h4>
              </div>
              <p className="text-xs text-slate-300/85 leading-relaxed mt-2">
                Harmonized breakdown: 36% Container, 22% Dry Bulk, 31% Ro-Ro, and 17% Tanker across deepwater quays.
              </p>
            </div>

            {/* Card 5: Fleet Lineup Tracking */}
            <div className="backdrop-blur-xl bg-slate-900/85 hover:bg-slate-800/95 border border-white/20 hover:border-indigo-400/60 rounded-2xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/25 via-indigo-500/10 to-transparent border border-indigo-400/40 flex items-center justify-center shadow-[0_0_18px_rgba(99,102,241,0.25)] relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <ellipse cx="16" cy="18" rx="12" ry="6" stroke="#818CF8" strokeWidth="0.8" strokeDasharray="3 2" transform="rotate(-15 16 18)" opacity="0.6" />
                      <rect x="14" y="6" width="4" height="7" rx="1" fill="#C7D2FE" stroke="#818CF8" strokeWidth="1.2" />
                      <rect x="7" y="7.5" width="6" height="4" rx="0.5" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
                      <rect x="19" y="7.5" width="6" height="4" rx="0.5" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
                      <line x1="10" y1="7.5" x2="10" y2="11.5" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.8" />
                      <line x1="22" y1="7.5" x2="22" y2="11.5" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.8" />
                      <path d="M12 17 C14 20 18 20 20 17" stroke="#818CF8" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                      <path d="M10 20 C13 24 19 24 22 20" stroke="#818CF8" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                      <circle cx="16" cy="25" r="2" fill="#10B981" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-md">
                      Live Feed
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                      Satellite AIS
                    </span>
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 flex items-baseline gap-2 font-sans">
                  15 <span className="text-sm font-semibold text-indigo-300 font-mono">AIS Vessels</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-indigo-200 transition-colors">
                  Live AIS Fleet Transponders
                </h4>
              </div>
              <p className="text-xs text-slate-300/85 leading-relaxed mt-2">
                Ultra-large container and neo-panamax ships tracked from 200 nautical miles out to berth bollard touch.
              </p>
            </div>

            {/* Card 6: Gate Turnaround Velocity */}
            <div className="backdrop-blur-xl bg-slate-900/85 hover:bg-slate-800/95 border border-white/20 hover:border-teal-400/60 rounded-2xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500/25 via-teal-500/10 to-transparent border border-teal-400/40 flex items-center justify-center shadow-[0_0_18px_rgba(20,184,166,0.25)] relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <path d="M6 10 V6 H10" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 6 H26 V10" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 22 V26 H10" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 26 H26 V22" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="16" cy="16" r="6" stroke="#2DD4BF" strokeWidth="1.5" />
                      <circle cx="16" cy="16" r="2.5" fill="#2DD4BF" />
                      <line x1="8" y1="16" x2="24" y2="16" stroke="#5EEAD4" strokeWidth="1.2" strokeDasharray="1 1" opacity="0.8" />
                      <path d="M19 13 L22 16 L19 19" stroke="#5EEAD4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-teal-300 bg-teal-500/15 border border-teal-500/25 px-2.5 py-0.5 rounded-md">
                      -42% Turn Time
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#13DEB9] bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                      Optical OCR Lanes
                    </span>
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 flex items-baseline gap-2 font-sans">
                  18.2 <span className="text-sm font-semibold text-teal-300 font-mono">Mins</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-teal-200 transition-colors">
                  Terminal Gate Turn Velocity
                </h4>
              </div>
              <p className="text-xs text-slate-300/85 leading-relaxed mt-2">
                Automated chassis optical character recognition scan and yard dispatch eliminating truck congestion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Startup Footer */}
      <footer className="py-10 px-4 sm:px-8 border-t border-white/10 text-xs text-slate-400 bg-[#040A12] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-tr from-cyan-500 to-purple-600 text-white font-bold text-xs shadow-sm">
              PF
            </div>
            <div>
              <span className="font-bold text-white text-sm block">PortFlow AI Operations Platform</span>
              <span className="text-slate-400 text-xs">Pier 400 Deepwater Container Terminal Digital Twin</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium">
            <span onClick={() => enterAs('shift_supervisor')} className="hover:text-cyan-400 cursor-pointer transition-colors">Operations Console</span>
            <span onClick={() => { login('shift_supervisor'); navigate('/vessels'); }} className="hover:text-cyan-400 cursor-pointer transition-colors">AIS Fleet</span>
            <span onClick={() => { login('shift_supervisor'); navigate('/congestion'); }} className="hover:text-cyan-400 cursor-pointer transition-colors">Congestion AI</span>
            <span onClick={() => { login('shift_supervisor'); navigate('/berths'); }} className="hover:text-cyan-400 cursor-pointer transition-colors">Berth Solver</span>
            <span onClick={() => { login('shift_supervisor'); navigate('/plan'); }} className="hover:text-cyan-400 cursor-pointer transition-colors">72h Matrix</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Nominal · 12ms</span>
            </span>
            <span className="text-slate-500">&copy; {new Date().getFullYear()} PortFlow AI Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
