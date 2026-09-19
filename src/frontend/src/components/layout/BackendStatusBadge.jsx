import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOperationalContext } from '../../context/OperationalContext.jsx'

export default function BackendStatusBadge() {
  const { backendStatus, checkBackendHealth } = useOperationalContext()
  const [showDetails, setShowDetails] = useState(false)

  const isConnected = backendStatus?.connected

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
          isConnected
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
        }`}
        title="Toggle Backend Telemetry Status"
      >
        <span className="relative flex h-2 w-2">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </span>
        <span className="hidden sm:inline">
          {isConnected ? 'Backend Connected' : 'Local Standalone'}
        </span>
        <span className="text-[10px] opacity-75 font-mono">
          {isConnected ? `${backendStatus.latencyMs}ms` : 'Simulator'}
        </span>
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-surface border border-line rounded-2xl shadow-xl z-50 p-4 text-xs font-sans select-none"
          >
            <div className="flex items-center justify-between pb-2 border-b border-line mb-3">
              <span className="font-bold text-ink">Backend Connectivity</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {isConnected ? 'FastAPI 8000 LIVE' : 'CLIENT-SIDE FALLBACK'}
              </span>
            </div>

            <div className="space-y-2 text-inksoft">
              <div className="flex justify-between">
                <span>Target Host:</span>
                <span className="font-mono text-ink font-semibold">http://127.0.0.1:8000</span>
              </div>
              <div className="flex justify-between">
                <span>Round-Trip Latency:</span>
                <span className="font-mono text-ink font-semibold">
                  {isConnected ? `${backendStatus.latencyMs} ms` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active Inference Engine:</span>
                <span className="text-ink font-semibold truncate max-w-[140px]" title={backendStatus.activeLlm}>
                  {backendStatus.activeLlm || 'Local Heuristics'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active Routers:</span>
                <span className="text-ink font-semibold">4 Microservices</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between gap-2">
              <button
                onClick={() => checkBackendHealth()}
                disabled={backendStatus.checking}
                className="w-full py-1.5 px-3 rounded-xl bg-sky-50 dark:bg-slate-800 text-[#0085db] font-bold hover:bg-sky-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-sky-100 dark:border-slate-700"
              >
                {backendStatus.checking ? 'Testing...' : 'Ping Backend Health'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
