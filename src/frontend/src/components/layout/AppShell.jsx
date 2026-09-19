import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import CommandPalette from './CommandPalette.jsx'
import AuditLogModal from './AuditLogModal.jsx'
import CopilotSidebar from '../copilot/CopilotSidebar.jsx'

export default function AppShell({ crumb, children }) {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-canvas text-ink transition-colors">
      {/* SaaS Dual-State Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          crumb={crumb}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Floating Modern Copilot Assistant Trigger (Bottom Right) */}
      <motion.button
        onClick={() => setIsCopilotOpen(true)}
        title="PortFlow AI Operations Copilot — Ask Any Query"
        aria-label="Open PortFlow AI Copilot"
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0369A1] via-[#0284C7] to-[#38BDF8] text-white shadow-[0_10px_25px_-5px_rgba(2,132,199,0.5)] flex items-center justify-center z-40 cursor-pointer border border-white/40 group overflow-visible select-none transition-shadow hover:shadow-[0_14px_30px_-4px_rgba(2,132,199,0.65)]"
      >
        {/* Soft Ambient Ripple */}
        <span className="absolute inset-0 rounded-2xl bg-sky-400/30 animate-ping pointer-events-none opacity-30" />
        <span className="absolute -inset-1 rounded-2xl bg-sky-400/20 blur-md pointer-events-none group-hover:bg-sky-400/40 transition-colors" />

        {/* Animated Floating Robot Character */}
        <div className="relative z-10 w-9 h-9 flex items-center justify-center animate-[bounce_3s_ease-in-out_infinite]">
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            {/* Antenna with pulsing beacon tip */}
            <line x1="18" y1="9" x2="18" y2="4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="3.5" r="2.5" fill="#38BDF8" className="animate-pulse" />

            {/* Robot Head Outer Body */}
            <rect x="7" y="9" width="22" height="17" rx="6" fill="#FFFFFF" />
            {/* Ear headphone pods */}
            <rect x="4" y="14" width="3" height="7" rx="1.5" fill="#E2E8F0" />
            <rect x="29" y="14" width="3" height="7" rx="1.5" fill="#E2E8F0" />

            {/* Digital Visor Face Screen */}
            <rect x="10" y="12.5" width="16" height="10" rx="3.5" fill="#091420" />

            {/* Glowing Cyan Animated Eyes */}
            <ellipse cx="14.5" cy="17.5" rx="1.8" ry="2" fill="#38BDF8" className="animate-pulse" />
            <ellipse cx="21.5" cy="17.5" rx="1.8" ry="2" fill="#38BDF8" className="animate-pulse" />

            {/* Voice Wave Smile */}
            <path d="M16 20.5 Q18 22 20 20.5" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" />

            {/* Robot Neck & Collar */}
            <path d="M11 27 C11 27 13 32 18 32 C23 32 25 27 25 27" fill="#E2E8F0" />
            <circle cx="18" cy="29" r="1.2" fill="#0284C7" />
          </svg>
        </div>

        {/* Live Status Indicator */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-surface shadow-[0_0_8px_rgba(52,211,153,0.9)] z-20" />
      </motion.button>

      {/* Grounded Operations Copilot Drawer */}
      <CopilotSidebar isOpen={isCopilotOpen} setIsOpen={setIsCopilotOpen} />

      {/* Global Modals */}
      <CommandPalette />
      <AuditLogModal />
    </div>
  )
}
