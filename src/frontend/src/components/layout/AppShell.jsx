import { useState } from 'react'
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
      {/* MaterialM Dual-Rail Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          crumb={crumb}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Floating Settings FAB Button (MaterialM Signature) */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        title="Open Copilot Assistant & Terminal Settings"
        className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-[#0085db] hover:bg-[#0074c2] text-white shadow-[0_4px_16px_rgba(0,133,219,0.38)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:rotate-45 transition-transform duration-500">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {/* Grounded Operations Copilot Drawer */}
      <CopilotSidebar isOpen={isCopilotOpen} setIsOpen={setIsCopilotOpen} />

      {/* Global Modals */}
      <CommandPalette />
      <AuditLogModal />
    </div>
  )
}
