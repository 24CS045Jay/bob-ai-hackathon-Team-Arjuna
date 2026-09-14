import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRole } from '../context/RoleContext.jsx'
import GridMotion from '../components/common/GridMotion.jsx'

// 28 items (4 rows × 7) — all 9 port photos cycled across the grid
const PORT_PHOTOS = [
  '/assets/photos/port1.jpg',
  '/assets/photos/port2.jpg',
  '/assets/photos/port3.jpg',
  '/assets/photos/port4.jpg',
  '/assets/photos/port5.jpg',
  '/assets/photos/port6.jpg',
  '/assets/photos/port7.jpg',
  '/assets/photos/port8.jpg',
  '/assets/photos/port9.jpg'
]

const GRID_ITEMS = Array.from({ length: 28 }, (_, i) => PORT_PHOTOS[i % PORT_PHOTOS.length])

export default function LoginPage() {
  const navigate = useNavigate()
  const { roles, login } = useRole()
  const [selectedRoleCode, setSelectedRoleCode] = useState('shift_supervisor')
  const [email, setEmail] = useState('supervisor@globalcargo.com')
  const [password, setPassword] = useState('••••••••••••')
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const roleMeta = {
    admin: {
      email: 'admin@globalcargo.com',
      color: 'bg-[#0085db]',
      border: 'border-[#0085db]',
      lightBg: 'bg-[#EBF3FE] text-[#0085db]',
      accent: '#0085db',
      ring: 'ring-[#0085db]/40',
      tag: 'Full Authority',
      desc: 'Complete quayside, gate, and hydro-routing overrides.'
    },
    shift_supervisor: {
      email: 'supervisor@globalcargo.com',
      color: 'bg-[#FFAE1F]',
      border: 'border-[#FFAE1F]',
      lightBg: 'bg-amber-100/80 text-amber-700',
      accent: '#FFAE1F',
      ring: 'ring-amber-400/40',
      tag: 'Ops Lead',
      desc: '72h rolling horizon solvers, crane gangs, and demurrage.'
    },
    berth_planner: {
      email: 'planner@globalcargo.com',
      color: 'bg-[#7352FF]',
      border: 'border-[#7352FF]',
      lightBg: 'bg-violet-100/80 text-violet-700',
      accent: '#7352FF',
      ring: 'ring-violet-400/40',
      tag: 'Berth Allocation',
      desc: 'Vessel UKC dynamic draft clearance and pier scheduling.'
    },
    gate_controller: {
      email: 'gate@globalcargo.com',
      color: 'bg-[#13DEB9]',
      border: 'border-[#13DEB9]',
      lightBg: 'bg-teal-100/80 text-teal-700',
      accent: '#13DEB9',
      ring: 'ring-teal-400/40',
      tag: 'Drayage & OCR',
      desc: 'Turnaround queues, optical truck lanes, and demurrage timers.'
    },
    viewer: {
      email: 'viewer@globalcargo.com',
      color: 'bg-slate-600',
      border: 'border-slate-500',
      lightBg: 'bg-slate-100/80 text-slate-700',
      accent: '#475569',
      ring: 'ring-slate-400/40',
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
    <div className="relative min-h-screen w-full overflow-hidden font-sans">

      {/* ── GridMotion fullscreen background ── */}
      <div className="absolute inset-0 z-0">
        <GridMotion
          items={GRID_ITEMS}
          gradientColor="rgba(4, 8, 20, 0.55)"
        />
      </div>

      {/* ── Dark overlay so the panel stays readable ── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#020712]/70 via-[#020712]/50 to-[#020712]/80 pointer-events-none" />

      {/* ── Top navbar ── */}
      <header className="relative z-20 py-4 px-6 sm:px-12 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-[#0085db]/20 border border-[#0085db]/30 flex items-center justify-center text-[#0085db] group-hover:scale-105 transition-transform">
            <svg width="28" height="28" viewBox="0 0 38 38" fill="none">
              <rect width="38" height="38" rx="10" fill="#0085db" fillOpacity="0.18" />
              <path d="M11 25V14L19 22L27 14V25" stroke="#0085db" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="29" cy="11" r="3" fill="#0085db" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight block leading-tight">
              Global Cargo <span className="text-[#0085db]">Tideline</span>
            </span>
            <span className="text-[11px] text-white/50 font-medium">Pier 400 Deepwater Terminal OS</span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs font-bold text-white/60 hover:text-white flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Landing</span>
        </Link>
      </header>

      {/* ── Main login canvas ── */}
      <main className="relative z-20 flex-1 flex items-center justify-center min-h-[calc(100vh-128px)] p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

          {/* Left — Role selector */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-6"
          >
            {/* Highlighted panel behind the entire selector section */}
            <div
              className="relative backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8 space-y-4 overflow-hidden"
              style={{
                background: `linear-gradient(145deg, rgba(0,0,0,0.62) 0%, rgba(${currentMeta.accent.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.18) 100%)`,
                boxShadow: `0 0 0 1px ${currentMeta.accent}33, 0 25px 50px rgba(0,0,0,0.55)`,
              }}
            >
              {/* Top accent gradient line — role colour */}
              <div
                className="absolute top-0 left-0 right-0 h-[2.5px] pointer-events-none rounded-t-3xl"
                style={{ background: `linear-gradient(90deg, ${currentMeta.accent}44, ${currentMeta.accent}, ${currentMeta.accent}44)` }}
              />
              {/* Inner corner glow */}
              <div
                className="absolute -top-24 -left-24 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${currentMeta.accent} 0%, transparent 70%)` }}
              />

              <div>
                <span
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3 border"
                  style={{ color: currentMeta.accent, background: `${currentMeta.accent}22`, borderColor: `${currentMeta.accent}55` }}
                >
                  Operational Authentication
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Select Duty Station
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1.5">
                  Choose a role to load permissions, AIS views, and terminal dispatch controls.
                </p>
              </div>

            <div className="space-y-2.5 pt-1">
              {roles.map((r) => {
                const meta = roleMeta[r.code] || roleMeta.shift_supervisor
                const isSelected = selectedRoleCode === r.code
                return (
                  <motion.div
                    key={r.code}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectRole(r.code)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between backdrop-blur-sm ${
                      isSelected
                        ? `shadow-lg ring-2 ${meta.ring}`
                        : 'bg-white/5 border-white/10 hover:border-white/25 shadow-sm'
                    }`}
                    style={isSelected ? {
                      background: `linear-gradient(135deg, rgba(${meta.accent.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.22) 0%, rgba(0,0,0,0.45) 100%)`,
                      borderColor: meta.accent,
                    } : {}}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl ${meta.color} text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-md`}
                      >
                        {r.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white leading-tight truncate">
                            {r.title}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.lightBg}`}>
                            {meta.tag}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-white/50 truncate mt-0.5">
                          {meta.desc}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                        isSelected ? `${meta.border} bg-white/10` : 'border-white/25'
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
            </div>{/* end highlight panel */}
          </motion.div>

          {/* Right — credentials card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-6"
          >
            <div
              className="backdrop-blur-xl rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, rgba(0,0,0,0.62) 0%, rgba(${currentMeta.accent.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.18) 100%)`,
                boxShadow: `0 0 0 1px ${currentMeta.accent}33, 0 25px 50px rgba(0,0,0,0.55)`,
              }}
            >
              {/* Top accent gradient line — same style as left panel */}
              <div
                className="absolute top-0 inset-x-0 h-[2.5px] pointer-events-none rounded-t-3xl"
                style={{ background: `linear-gradient(90deg, ${currentMeta.accent}44, ${currentMeta.accent}, ${currentMeta.accent}44)` }}
              />

              {/* Inner corner glow */}
              <div
                className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-12 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${currentMeta.accent} 0%, transparent 70%)` }}
              />

              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                  Verified Identity
                </span>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Sign In as {selectedRole?.title}
                </h2>
                <p className="text-xs text-white/45 mt-1">
                  Preset demo credentials preloaded. Click below to enter the terminal environment.
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">
                    Terminal Operator Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/8 border border-white/15 text-white text-xs sm:text-sm font-medium transition-all outline-none placeholder-white/25 focus:bg-white/12"
                    style={{ '--tw-ring-color': currentMeta.accent }}
                    onFocus={e => e.target.style.borderColor = currentMeta.accent}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-white/70">
                      Access Passcode
                    </label>
                    <span className="text-[11px] font-semibold hover:underline cursor-pointer" style={{ color: currentMeta.accent }}>
                      Forgot passkey?
                    </span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/8 border border-white/15 text-white text-xs sm:text-sm font-medium transition-all outline-none focus:bg-white/12"
                    onFocus={e => e.target.style.borderColor = currentMeta.accent}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white/55 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/25"
                      style={{ accentColor: currentMeta.accent }}
                    />
                    <span>Remember terminal station</span>
                  </label>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded">
                    SLA Nominal
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl ${currentMeta.color} hover:brightness-110 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enter as {selectedRole?.initials} — {selectedRole?.title}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-white/10 text-center text-[11px] text-white/35 flex items-center justify-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>End-to-end encrypted · Session logged to immutable audit ledger</span>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-20 py-4 px-6 sm:px-12 border-t border-white/10 bg-black/30 backdrop-blur-md text-center text-xs text-white/35 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Global Cargo &amp; Tideline TOS · Pier 400 Deepwater Terminal Operations</span>
        <span>&copy; {new Date().getFullYear()} Global Cargo Logistics Inc. All rights reserved.</span>
      </footer>
    </div>
  )
}
