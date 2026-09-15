import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import OceanAnimation from '../components/layout/OceanAnimation.jsx'
import { useRole } from '../context/RoleContext.jsx'
import { scrollRevealVariants } from '../utils/motion.js'

export default function LandingPage() {
  const navigate = useNavigate()
  const { roles, login } = useRole()

  const enterAs = (roleCode = 'shift_supervisor') => {
    login(roleCode)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#060E18] text-white flex flex-col selection:bg-amber-400/30 transition-colors overflow-x-hidden font-sans">
      {/* Deep Maritime Twilight Container for Hero & Floating Navigation */}
      <div className="bg-[#060E18] relative">
        {/* Top Floating Pill Navigation Bar (matching reference header) */}
        <header className="relative z-30 pt-4 sm:pt-6 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <nav className="backdrop-blur-xl bg-slate-900/50 border border-white/20 rounded-full px-5 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.55)] group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}
            >
              {/* Modern Hexagon Cargo Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#091420" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.29 7 12 12 20.71 7" />
                <line x1="12" y1="22" x2="12" y2="12" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-base sm:text-lg tracking-tight">PortFlow AI</span>
              </div>
            </div>
          </div>

          {/* Nav Links (matching reference items: Home, Services, Tracking, Pricing, About, Contact) */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-200">
            <span 
              onClick={() => navigate('/')} 
              className="text-white font-semibold cursor-pointer border-b-2 border-white pb-0.5"
            >
              Home
            </span>
            <span 
              onClick={() => enterAs('shift_supervisor')} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              Services
            </span>
            <span 
              onClick={() => { login('shift_supervisor'); navigate('/vessels'); }} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              Tracking
            </span>
            <span 
              onClick={() => { login('shift_supervisor'); navigate('/congestion'); }} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              Pricing
            </span>
            <span 
              onClick={() => { login('shift_supervisor'); navigate('/berths'); }} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              About
            </span>
            <span 
              onClick={() => { login('shift_supervisor'); navigate('/plan'); }} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              Contact
            </span>
          </div>

          {/* Right Action Buttons: Login Icon Button, Expert Help & Get a Quote */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/login')}
              title="Station Login"
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer hover:border-white/50 shadow-sm"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Login</span>
            </button>
            <button
              onClick={() => document.getElementById('value-props')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all hidden sm:block"
            >
              Expert Help
            </button>
            <button
              onClick={() => enterAs('shift_supervisor')}
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
                boxShadow: '0 4px 22px rgba(245, 158, 11, 0.55)',
                color: '#091420'
              }}
              className="px-6 py-2.5 rounded-full font-bold text-xs tracking-wide hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Get a Quote
            </button>
          </div>
        </nav>
      </header>

      {/* Main Hero Container with Background Footage & Typography */}
      <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden">
        <OceanAnimation />

        {/* Hero Content Area */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-5xl pt-10 pb-12">
          {/* Main Title Section matching reference styling */}
          <div className="mb-5 select-none">
            <h1 className="tracking-tight leading-none">
              {/* Hollow Outlined Text Line */}
              <span 
                className="block text-5xl sm:text-7xl lg:text-8xl font-extrabold"
                style={{
                  WebkitTextStroke: '1.8px rgba(255, 255, 255, 0.88)',
                  color: 'transparent'
                }}
              >
                Reliable Global
              </span>
              {/* Solid White Freight Headline */}
              <span className="block text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mt-1 drop-shadow-md">
                Cargo &amp; Freight
              </span>
              {/* Subheading */}
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-bold text-white/95 mt-3.5 drop-shadow-sm">
                Shipping Solutions
              </span>
            </h1>
          </div>

          {/* Description Paragraph */}
          <p className="text-sm sm:text-base leading-relaxed text-slate-200/95 max-w-xl mb-8 font-normal drop-shadow">
            Terminal operations management and container visibility across deepwater quays. Monitor vessel berthing lineups, quay crane productivity (GMPH), gate turn times, and rolling 72-hour operational plans.
          </p>

          {/* Action Button Pair matching reference */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <button
              onClick={() => enterAs('shift_supervisor')}
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
                boxShadow: '0 6px 28px rgba(245, 158, 11, 0.60)',
                color: '#091420'
              }}
              className="px-8 py-3.5 rounded-full font-bold text-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get a Quote</span>
            </button>

            <button
              onClick={() => { login('shift_supervisor'); navigate('/vessels'); }}
              className="px-8 py-3.5 rounded-full text-white font-semibold text-sm border border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <span>Track Order</span>
            </button>
          </div>
        </div>
      </section>
      </div>

      {/* 1. Single-Line Trust-Bar KPI Strip with Unified Dark Contrast */}
      <motion.section 
        {...scrollRevealVariants}
        className="relative z-10 py-5 px-6 sm:px-12 border-y border-white/10 bg-[#091522]/95 backdrop-blur-xl select-none"
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6 sm:gap-8 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white tracking-tight">15</span>
            <span className="text-xs text-slate-300 font-medium">Tracked AIS Vessels</span>
          </div>
          <div className="hidden sm:block h-5 w-px bg-white/15" />
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[#F59E0B] tracking-tight">34.8</span>
            <span className="text-xs text-slate-300 font-medium">Moves / Hour (GMPH)</span>
          </div>
          <div className="hidden sm:block h-5 w-px bg-white/15" />
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[#13DEB9] tracking-tight">98.4%</span>
            <span className="text-xs text-slate-300 font-medium">Berth SLA Compliance</span>
          </div>
          <div className="hidden sm:block h-5 w-px bg-white/15" />
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-emerald-400 tracking-tight">$0</span>
            <span className="text-xs text-slate-300 font-medium">Demurrage Incurred</span>
          </div>
        </div>
      </motion.section>

      {/* 2. Full-Screen Video Background Animation Section */}
      <section className="relative min-h-[85vh] lg:min-h-screen w-full flex flex-col justify-between py-12 px-4 sm:px-8 overflow-hidden bg-[#060E18]">
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
          {/* Subtle Obsidian Twilight Scrim Gradients: crystal-clear center for maximum video visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060E18]/80 via-transparent to-[#060E18] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(6,14,24,0.6)_100%)] pointer-events-none" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 max-w-7xl mx-auto w-full pt-4 select-none text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F59E0B] mb-3 bg-[#091522]/85 border border-amber-500/30 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span>Real-World Terminal Operations · Live Ground Truth Telemetry</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            Autonomous Deepwater Terminal in Action
          </h2>
          <p className="text-sm sm:text-base text-slate-200/90 max-w-2xl mx-auto mt-3 leading-relaxed drop-shadow">
            Continuous vessel monitoring, automated ship-to-shore gantry cranes, algorithmic quay allocation, and zero-surprise demurrage laytime controls.
          </p>
        </div>

        {/* Bottom subtle status badge */}
        <div className="relative z-10 max-w-7xl mx-auto w-full pb-4 select-none flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/75 backdrop-blur-md border border-white/15 text-slate-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pier 400 Deepwater Basin · Continuous Autonomous Crane &amp; Vessel Simulation</span>
          </div>
        </div>
      </section>

      {/* 3. Terminal Intelligence Value-Props with Matching Dark Palette */}
      <motion.section 
        id="value-props"
        {...scrollRevealVariants}
        className="py-16 px-6 sm:px-12 max-w-7xl mx-auto w-full bg-[#060E18]"
      >
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B] bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 rounded-full">
            Terminal Intelligence
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-3 mb-2">
            Engineered for High-Throughput Ports
          </h2>
          <p className="text-sm text-slate-300">
            Eliminating bottlenecks from pilot boarding station to gate clearance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#091522]/80 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-amber-400/40 p-6 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-[#F59E0B] flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Live AIS vessel tracking</h3>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Real-time transponder position synchronization with harbor under-keel tidal clearance windows.
            </p>
          </div>

          <div className="bg-[#091522]/80 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-teal-400/40 p-6 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-[#13DEB9] flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Automated berth planning</h3>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Algorithmic quay allocation and crane gang assignments that prevent anchorage queuing.
            </p>
          </div>

          <div className="bg-[#091522]/80 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-400/40 p-6 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Zero-surprise demurrage</h3>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Proactive charter-party laytime alerts and gate OCR turnaround optimization.
            </p>
          </div>
        </div>
      </motion.section>

      {/* 4. Terminal Operating Metrics & Ground Truth Numbers with Background Video Animation */}
      <section className="relative py-20 px-4 sm:px-8 w-full overflow-hidden bg-[#060E18]">
        {/* Background Looping Video from user asset */}
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
          {/* Obsidian Twilight Scrim Gradients ensuring contrast for the cards */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060E18] via-[#060E18]/70 to-[#060E18] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_15%,_rgba(6,14,24,0.75)_100%)] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12 select-none">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F59E0B] mb-3 bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              <span>Terminal Operating Metrics · Live Ground Truth Telemetry</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 drop-shadow-md">
              Real-World Pier 400 Operating Numbers
            </h2>
            <p className="text-sm sm:text-base text-slate-200/90 max-w-xl mx-auto leading-relaxed drop-shadow">
              Validated operational telemetry synchronized across quayside gantries, fairway drafts, and automated gate lanes.
            </p>
          </div>

          {/* 6 Realistic High-Impact Port Data Numbers Cards with AI-Generated Style Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            {/* Card 1: Crane Productivity */}
            <div className="backdrop-blur-xl bg-[#091522]/85 hover:bg-[#0c1d30]/95 border border-white/20 hover:border-amber-400/60 rounded-3xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* AI Generated Realistic Holographic Crane Icon */}
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
                  34.8 <span className="text-sm font-semibold text-slate-300 font-mono">GMPH</span>
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
            <div className="backdrop-blur-xl bg-[#091522]/85 hover:bg-[#0c1d30]/95 border border-white/20 hover:border-sky-400/60 rounded-3xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* AI Generated Realistic Holographic Berth Docking Sonar Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/25 via-sky-500/10 to-transparent border border-sky-400/40 flex items-center justify-center shadow-[0_0_18px_rgba(56,189,248,0.25)] relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
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
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#38BDF8] bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                      Berth Allocation
                    </span>
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 flex items-baseline gap-2 font-sans">
                  98.4% <span className="text-sm font-semibold text-slate-300 font-mono">On-Time</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-sky-200 transition-colors">
                  Vessel Schedule Adherence
                </h4>
              </div>
              <p className="text-xs text-slate-300/85 leading-relaxed mt-2">
                Dynamic 15.5m draft restrictions and 3.4m tidal windows synchronized across Berths B01 through B08.
              </p>
            </div>

            {/* Card 3: Demurrage Guarantee */}
            <div className="backdrop-blur-xl bg-[#091522]/85 hover:bg-[#0c1d30]/95 border border-white/20 hover:border-emerald-400/60 rounded-3xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* AI Generated Realistic Holographic Laytime Shield Icon */}
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
                  $0.00 <span className="text-sm font-semibold text-slate-300 font-mono">Demurrage</span>
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
            <div className="backdrop-blur-xl bg-[#091522]/85 hover:bg-[#0c1d30]/95 border border-white/20 hover:border-purple-400/60 rounded-3xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* AI Generated Realistic Isometric Container Stack Matrix Icon */}
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
                  8,364 <span className="text-sm font-semibold text-slate-300 font-mono">TEU</span>
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
            <div className="backdrop-blur-xl bg-[#091522]/85 hover:bg-[#0c1d30]/95 border border-white/20 hover:border-amber-400/60 rounded-3xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* AI Generated Realistic Orbital Satellite AIS Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/25 via-amber-500/10 to-transparent border border-amber-400/40 flex items-center justify-center shadow-[0_0_18px_rgba(245,158,11,0.25)] relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <ellipse cx="16" cy="18" rx="12" ry="6" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="3 2" transform="rotate(-15 16 18)" opacity="0.6" />
                      <rect x="14" y="6" width="4" height="7" rx="1" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.2" />
                      <rect x="7" y="7.5" width="6" height="4" rx="0.5" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
                      <rect x="19" y="7.5" width="6" height="4" rx="0.5" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
                      <line x1="10" y1="7.5" x2="10" y2="11.5" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.8" />
                      <line x1="22" y1="7.5" x2="22" y2="11.5" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.8" />
                      <path d="M12 17 C14 20 18 20 20 17" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                      <path d="M10 20 C13 24 19 24 22 20" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                      <circle cx="16" cy="25" r="2" fill="#10B981" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-md">
                      Live Feed
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F59E0B] bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      Satellite AIS
                    </span>
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 flex items-baseline gap-2 font-sans">
                  15 <span className="text-sm font-semibold text-slate-300 font-mono">AIS Vessels</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-amber-200 transition-colors">
                  Live AIS Fleet Transponders
                </h4>
              </div>
              <p className="text-xs text-slate-300/85 leading-relaxed mt-2">
                Ultra-large container and neo-panamax ships tracked from 200 nautical miles out to berth bollard touch.
              </p>
            </div>

            {/* Card 6: Gate Turnaround Velocity */}
            <div className="backdrop-blur-xl bg-[#091522]/85 hover:bg-[#0c1d30]/95 border border-white/20 hover:border-teal-400/60 rounded-3xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* AI Generated Realistic Optical OCR Scanner Reticle Icon */}
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
                  18.2 <span className="text-sm font-semibold text-slate-300 font-mono">Mins</span>
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

      {/* Footer in Unified Dark Maritime Theme */}
      <footer className="py-6 px-6 sm:px-12 border-t border-white/10 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#040A12]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">PortFlow AI Platform</span>
          <span className="text-white/20">|</span>
          <span>Pier 400 Deepwater Terminal Operations</span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} PortFlow AI Inc. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

