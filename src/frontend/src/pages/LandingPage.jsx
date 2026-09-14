import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import OceanAnimation from '../components/layout/OceanAnimation.jsx'
import RoleCard from '../components/auth/RoleCard.jsx'
import SmartPortShowcase from '../components/landing/SmartPortShowcase.jsx'
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
    <div className="min-h-screen bg-obsidian-900 text-ink flex flex-col selection:bg-amber-500/30 transition-colors overflow-x-hidden font-sans">
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
                <span className="text-white font-extrabold text-base sm:text-lg tracking-tight">Global Cargo</span>
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

          {/* Right Action Buttons: Expert Help (Pill) & Get a Quote (Amber Pill) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
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

        {/* Floating Interactive Widget Cards (Matching Reference Image) */}
        <div className="relative z-20 px-6 sm:px-12 pb-10 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4 max-w-7xl mx-auto w-full">
          {/* Bottom Left Floating Card: "UPLOADING - Book Container Uploading Today" */}
          <div 
            onClick={() => { login('shift_supervisor'); navigate('/berths'); }}
            className="backdrop-blur-2xl bg-[#091522]/85 hover:bg-[#0c1c2e]/90 border border-white/20 hover:border-amber-400/50 rounded-2xl p-4 sm:p-4.5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex items-center justify-between gap-5 cursor-pointer transition-all duration-300 max-w-sm group"
          >
            <div className="flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B] font-bold mb-1">
                UPLOADING
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white leading-snug group-hover:text-amber-200 transition-colors">
                Book Container Uploading Today
              </h3>
              <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-[#F59E0B] group-hover:underline">
                <span>Book Now</span>
                <span className="text-xs">→</span>
              </div>
            </div>

            {/* 3D Isometric Golden Container Graphic matching reference */}
            <div className="shrink-0 w-24 h-16 flex items-center justify-center">
              <svg width="86" height="64" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform">
                {/* Top Face */}
                <path d="M50 8 L88 28 L50 48 L12 28 Z" fill="#FBBF24" />
                <path d="M22 23 L60 43 M32 18 L70 38 M42 13 L80 33" stroke="#F59E0B" strokeWidth="1.6" />
                
                {/* Left Face (Corrugated) */}
                <path d="M12 28 L50 48 L50 74 L12 54 Z" fill="#D97706" />
                <path d="M19 32 L19 58 M26 36 L26 62 M33 40 L33 66 M40 44 L40 70 M47 47 L47 73" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round" />
                
                {/* Right Face (Container Doors) */}
                <path d="M50 48 L88 28 L88 54 L50 74 Z" fill="#B45309" />
                <path d="M69 38 L69 64" stroke="#78350F" strokeWidth="2.5" />
                <path d="M60 43 L60 69 M78 33 L78 59" stroke="#92400E" strokeWidth="1.5" />
                
                {/* Corner Castings */}
                <circle cx="12" cy="28" r="2.5" fill="#FEF3C7" />
                <circle cx="50" cy="48" r="2.5" fill="#FEF3C7" />
                <circle cx="88" cy="28" r="2.5" fill="#FEF3C7" />
                <circle cx="50" cy="74" r="2.5" fill="#FEF3C7" />
                <circle cx="12" cy="54" r="2.5" fill="#FEF3C7" />
                <circle cx="88" cy="54" r="2.5" fill="#FEF3C7" />
              </svg>
            </div>
          </div>

          {/* Bottom Right Floating Card: "CN SHG ──[🚢]── US OAK" Route Tracker */}
          <div 
            onClick={() => { login('shift_supervisor'); navigate('/vessels'); }}
            className="backdrop-blur-2xl bg-[#091522]/85 hover:bg-[#0c1c2e]/90 border border-white/20 hover:border-amber-400/50 rounded-2xl p-4 sm:p-4.5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] min-w-[300px] sm:min-w-[360px] cursor-pointer transition-all duration-300"
          >
            {/* Top Ports Row with Route Progress */}
            <div className="flex items-center justify-between text-xs font-mono font-bold text-white mb-2.5">
              <span>CN SHG</span>

              {/* Center progress line with amber ship icon badge */}
              <div className="relative flex-1 mx-4 h-[2px] bg-slate-600/80 rounded-full flex items-center">
                <div className="absolute left-0 h-full w-[65%]" style={{ background: '#F59E0B' }} />
                <div 
                  className="absolute left-[65%] -translate-x-1/2 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-[0_0_14px_rgba(245,158,11,0.9)]"
                  style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#091420" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                    <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
                    <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
                    <path d="M12 10V2" />
                    <path d="M12 2l5 3" />
                  </svg>
                </div>
              </div>

              <span>US OAK</span>
            </div>

            {/* Bottom Timestamps & Status */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">ATD</span>
                <span className="font-semibold text-white">May 3 22:57</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">ETA</span>
                <span className="font-semibold text-white">09:00 May 5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Single-Line Trust-Bar KPI Strip */}
      <motion.section 
        {...scrollRevealVariants}
        className="relative z-10 py-5 px-6 sm:px-12 border-b border-line bg-surface/90 backdrop-blur-md select-none"
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6 sm:gap-8 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-ink tracking-tight">15</span>
            <span className="text-xs text-inksoft font-medium">Tracked AIS Vessels</span>
          </div>
          <div className="hidden sm:block h-5 w-px bg-line" />
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-brand tracking-tight">34.8</span>
            <span className="text-xs text-inksoft font-medium">Moves / Hour (GMPH)</span>
          </div>
          <div className="hidden sm:block h-5 w-px bg-line" />
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-teal-600 tracking-tight">98.4%</span>
            <span className="text-xs text-inksoft font-medium">Berth SLA Compliance</span>
          </div>
          <div className="hidden sm:block h-5 w-px bg-line" />
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-ok tracking-tight">$0</span>
            <span className="text-xs text-inksoft font-medium">Demurrage Incurred</span>
          </div>
        </div>
      </motion.section>

      {/* 2. Scroll-Triggered Animated Port Section */}
      <SmartPortShowcase />

      {/* 3. Minimal Value-Prop Section */}
      <motion.section 
        id="value-props"
        {...scrollRevealVariants}
        className="py-14 px-6 sm:px-12 max-w-6xl mx-auto w-full"
      >
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full">
            Terminal Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-3 mb-2">
            Engineered for High-Throughput Ports
          </h2>
          <p className="text-sm text-inksoft">
            Eliminating bottlenecks from pilot boarding to gate clearance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface rounded-2xl border border-line p-6 card-interactive">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-ink mb-1">Live vessel tracking</h3>
            <p className="text-xs text-inksoft leading-relaxed">
              Real-time AIS position synchronization with harbor under-keel tidal clearance windows.
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-line p-6 card-interactive">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-ink mb-1">Automated berth planning</h3>
            <p className="text-xs text-inksoft leading-relaxed">
              Algorithmic quay allocation and crane gang assignments that prevent anchorage queuing.
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-line p-6 card-interactive">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-ink mb-1">Zero-surprise demurrage</h3>
            <p className="text-xs text-inksoft leading-relaxed">
              Proactive charter-party laytime alerts and gate OCR turnaround optimization.
            </p>
          </div>
        </div>
      </motion.section>

      {/* 4. Role Picker Section */}
      <motion.section 
        id="roles"
        {...scrollRevealVariants}
        className="py-14 px-6 sm:px-12 max-w-6xl mx-auto w-full"
      >
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full">
            Role-Based Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-3 mb-2">
            Select Operational Duty Station
          </h2>
          <p className="text-sm text-inksoft">
            Direct access to specialized workstations configured for terminal duties.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {roles.map((role) => (
            <RoleCard key={role.code} role={role} onSelect={enterAs} />
          ))}
        </div>
      </motion.section>

      {/* 5. Minimal One-Line Footer */}
      <footer className="py-5 px-6 sm:px-12 border-t border-line text-xs text-inksoft flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">Global Cargo &amp; Tideline TOS</span>
          <span className="text-line">|</span>
          <span>Pier 400 Deepwater Terminal Operations</span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} Global Cargo Logistics Inc. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

