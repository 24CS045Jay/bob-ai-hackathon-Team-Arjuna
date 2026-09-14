import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRole } from '../context/RoleContext.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const { roles, login } = useRole()
  const [selectedRoleCode, setSelectedRoleCode] = useState('shift_supervisor')
  const [email, setEmail] = useState('supervisor@globalcargo.com')
  const [password, setPassword] = useState('••••••••••••')
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Map roles to credentials and theme colors
  const roleMeta = {
    admin: {
      email: 'admin@globalcargo.com',
      color: 'bg-[#0085db]',
      border: 'border-[#0085db]',
      lightBg: 'bg-[#EBF3FE] text-[#0085db]',
      accent: '#0085db',
      tag: 'Full Authority',
      desc: 'Complete quayside, gate, and hydro-routing overrides.'
    },
    shift_supervisor: {
      email: 'supervisor@globalcargo.com',
      color: 'bg-[#FFAE1F]',
      border: 'border-[#FFAE1F]',
      lightBg: 'bg-[#FEF5E5] text-[#FFAE1F]',
      accent: '#FFAE1F',
      tag: 'Ops Lead',
      desc: '72h rolling horizon solvers, crane gangs, and demurrage.'
    },
    berth_planner: {
      email: 'planner@globalcargo.com',
      color: 'bg-[#7352FF]',
      border: 'border-[#7352FF]',
      lightBg: 'bg-[#F2EEFF] text-[#7352FF]',
      accent: '#7352FF',
      tag: 'Berth Allocation',
      desc: 'Vessel UKC dynamic draft clearance and pier scheduling.'
    },
    gate_controller: {
      email: 'gate@globalcargo.com',
      color: 'bg-[#13DEB9]',
      border: 'border-[#13DEB9]',
      lightBg: 'bg-[#E6FFFA] text-[#13DEB9]',
      accent: '#13DEB9',
      tag: 'Drayage & OCR',
      desc: 'Turnaround queues, optical truck lanes, and demurrage timers.'
    },
    viewer: {
      email: 'viewer@globalcargo.com',
      color: 'bg-slate-600',
      border: 'border-slate-500',
      lightBg: 'bg-slate-100 text-slate-700',
      accent: '#475569',
      tag: 'Auditor / Viewer',
      desc: 'Read-only satellite AIS transponders and analytics feed.'
    }
  }

  const handleSelectRole = (code) => {
    setSelectedRoleCode(code)
    setEmail(roleMeta[code]?.email || `${code}@globalcargo.com`)
    setPassword('••••••••••••')
  }

  const handleSignIn = (e) => {
    e?.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      login(selectedRoleCode)
      navigate('/dashboard')
    }, 450)
  }

  const selectedRole = roles.find((r) => r.code === selectedRoleCode) || roles[1]
  const currentMeta = roleMeta[selectedRoleCode] || roleMeta.shift_supervisor

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-[#0085db]/20 font-sans">
      {/* Top Navbar */}
      <header className="py-4 px-6 sm:px-12 border-b border-line bg-surface flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-[#0085db]/10 flex items-center justify-center text-[#0085db] group-hover:scale-105 transition-transform shadow-xs">
            {/* MaterialM Logo M */}
            <svg width="28" height="28" viewBox="0 0 38 38" fill="none">
              <rect width="38" height="38" rx="10" fill="#0085db" fillOpacity="0.12" />
              <path d="M11 25V14L19 22L27 14V25" stroke="#0085db" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="29" cy="11" r="3" fill="#0085db" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-lg text-ink tracking-tight block leading-tight">
              Global Cargo <span className="text-[#0085db]">Tideline</span>
            </span>
            <span className="text-[11px] text-inksoft font-medium">Pier 400 Deepwater Terminal OS</span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs font-bold text-inksoft hover:text-ink flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Landing Page</span>
        </Link>
      </header>

      {/* Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Role Profiles Selection */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0085db] bg-[#0085db]/10 px-3 py-1 rounded-full inline-block mb-2">
                Operational Authentication
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Select Duty Station
              </h1>
              <p className="text-xs sm:text-sm text-inksoft mt-1">
                Choose a role below to load configured permissions, AIS views, and terminal dispatch controls.
              </p>
            </div>

            {/* 5 Duty Station Cards */}
            <div className="space-y-2.5 pt-2">
              {roles.map((r) => {
                const meta = roleMeta[r.code] || roleMeta.shift_supervisor
                const isSelected = selectedRoleCode === r.code
                return (
                  <motion.div
                    key={r.code}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectRole(r.code)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? `bg-surface border-2 ${meta.border} shadow-md`
                        : 'bg-surface/80 hover:bg-surface border-line hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl ${meta.color} text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs`}
                      >
                        {r.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-ink leading-tight truncate">
                            {r.title}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.lightBg}`}>
                            {meta.tag}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-inksoft truncate mt-0.5 font-normal">
                          {meta.desc}
                        </p>
                      </div>
                    </div>

                    {/* Radio Indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                        isSelected
                          ? `${meta.border} bg-white`
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className={`w-2.5 h-2.5 rounded-full ${meta.color}`} />
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Credentials & Sign In Card */}
          <div className="lg:col-span-6">
            <div className="bg-surface rounded-3xl border border-line p-6 sm:p-8 shadow-card relative overflow-hidden">
              {/* Top Accent Ribbon */}
              <div
                className={`absolute top-0 inset-x-0 h-1.5 ${currentMeta.color}`}
              />

              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-inksoft block mb-1">
                  Verified Identity
                </span>
                <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2">
                  <span>Sign In as {selectedRole?.title}</span>
                </h2>
                <p className="text-xs text-inksoft mt-1">
                  Preset demo credentials preloaded. Click below to enter the terminal environment.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Terminal Operator Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-line focus:border-[#0085db] focus:bg-white text-ink text-xs sm:text-sm font-medium transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-ink">
                      Access Passcode
                    </label>
                    <span className="text-[11px] text-[#0085db] font-semibold hover:underline cursor-pointer">
                      Forgot passkey?
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-line focus:border-[#0085db] focus:bg-white text-ink text-xs sm:text-sm font-medium transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-inksoft select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#0085db] focus:ring-[#0085db]"
                    />
                    <span>Remember terminal station</span>
                  </label>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    SLA Nominal
                  </span>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl ${currentMeta.color} hover:brightness-110 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enter as {selectedRole?.initials} ({selectedRole?.title})</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Security Badge */}
              <div className="mt-6 pt-4 border-t border-line text-center text-[11px] text-inksoft flex items-center justify-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>End-to-end encrypted · Session logged to immutable audit ledger</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 sm:px-12 border-t border-line bg-surface text-center text-xs text-inksoft flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Global Cargo &amp; Tideline TOS · Pier 400 Deepwater Terminal Operations</span>
        <span>&copy; {new Date().getFullYear()} Global Cargo Logistics Inc. All rights reserved.</span>
      </footer>
    </div>
  )
}
