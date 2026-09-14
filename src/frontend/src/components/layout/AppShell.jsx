import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import CommandPalette from './CommandPalette.jsx'
import AuditLogModal from './AuditLogModal.jsx'
import CopilotSidebar from '../copilot/CopilotSidebar.jsx'

export default function AppShell({ crumb, children }) {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-obsidian-900 text-ink transition-colors">
      {/* Fixed Left Navigation Rail */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar crumb={crumb} onOpenCopilot={() => setIsCopilotOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-5 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Grounded Operations Copilot Drawer */}
      <CopilotSidebar isOpen={isCopilotOpen} setIsOpen={setIsCopilotOpen} />

      {/* Global Modals */}
      <CommandPalette />
      <AuditLogModal />
    </div>
  )
}
