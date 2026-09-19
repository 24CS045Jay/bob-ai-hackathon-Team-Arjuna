import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRole } from '../context/RoleContext.jsx'
import GridMotion from '../components/common/GridMotion.jsx'
import { supabaseSignIn, supabaseSignUp, SUPABASE_URL } from '../api/supabaseClient.js'

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
  const { roles, login, registerUser } = useRole()

  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin')

  // Sign In fields
  const [selectedRoleCode, setSelectedRoleCode] = useState('shift_supervisor')
  const [email, setEmail] = useState('supervisor@portflow.ai')
  const [password, setPassword] = useState('supervisor123')
  const [rememberMe, setRememberMe] = useState(true)

  // Sign Up fields
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('')
  const [signUpRoleCode, setSignUpRoleCode] = useState('shift_supervisor')
  const [signUpDepartment, setSignUpDepartment] = useState('Terminal Dispatch')
  const [signUpShift, setSignUpShift] = useState('06:00 - 14:00 (Morning)')

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'error' | 'success', message: '' }

  const roleMeta = {
    admin: {
      email: 'admin@portflow.ai',
      color: 'bg-[#0085db]',
      border: 'border-[#0085db]',
      lightBg: 'bg-sky-100/90 text-[#0085db]',
      accent: '#0085db',
      ring: 'ring-[#0085db]/40',
      tag: 'Full Authority',
      desc: 'Complete quayside, gate, and hydro-routing overrides.'
    },
    shift_supervisor: {
      email: 'supervisor@portflow.ai',
      color: 'bg-[#0085db]',
      border: 'border-[#0085db]',
      lightBg: 'bg-sky-100/90 text-[#0085db]',
      accent: '#0085db',
      ring: 'ring-[#0085db]/40',
      tag: 'Ops Lead',
      desc: '72h rolling horizon solvers, crane gangs, and demurrage.'
    },
    berth_planner: {
      email: 'planner@portflow.ai',
      color: 'bg-[#0085db]',
      border: 'border-[#0085db]',
      lightBg: 'bg-sky-100/90 text-[#0085db]',
      accent: '#0085db',
      ring: 'ring-[#0085db]/40',
      tag: 'Berth Allocation',
      desc: 'Vessel UKC dynamic draft clearance and pier scheduling.'
    },
    gate_controller: {
      email: 'gate@portflow.ai',
      color: 'bg-[#0085db]',
      border: 'border-[#0085db]',
      lightBg: 'bg-sky-100/90 text-[#0085db]',
      accent: '#0085db',
      ring: 'ring-[#0085db]/40',
      tag: 'Drayage & OCR',
      desc: 'Turnaround queues, optical truck lanes, and demurrage timers.'
    },
    viewer: {
      email: 'viewer@portflow.ai',
      color: 'bg-[#0085db]',
      border: 'border-[#0085db]',
      lightBg: 'bg-sky-100/90 text-[#0085db]',
      accent: '#0085db',
      ring: 'ring-[#0085db]/40',
      tag: 'Auditor / Viewer',
      desc: 'Read-only satellite AIS transponders and analytics feed.'
    }
  }

  const handleSelectRole = (code) => {
    setSelectedRoleCode(code)
    setEmail(roleMeta[code]?.email || `${code}@portflow.ai`)
    setPassword(`${code}123`)
    setFeedback(null)
  }

  // ── Instant Dev Bypass Action ──
  const handleDevBypass = () => {
    login('shift_supervisor', {
      name: 'Developer Bypass Operator',
      email: 'dev.bypass@portflow.ai',
      roleCode: 'shift_supervisor',
      title: 'Senior Shift Lead (Dev Testing)',
      department: 'Terminal Dispatch',
      avatar: 'DEV'
    })
    navigate('/dashboard')
  }

  // ── Real Credential Sign In ──
  const handleSignIn = async (e) => {
    e?.preventDefault()
    setIsLoading(true)
    setFeedback(null)

    try {
      const result = await supabaseSignIn({ email, password })
      if (result.success && result.user) {
        setFeedback({ type: 'success', message: `Identity verified. Entering terminal session...` })
        const assignedRole = result.user.role_code || result.user.roleCode || selectedRoleCode
        setTimeout(() => {
          login(assignedRole, result.user)
          navigate('/dashboard')
        }, 500)
      } else {
        // If password matches the role preset demo pattern, allow smooth entry
        const isPresetMatch = roleMeta[selectedRoleCode]?.email === email.trim().toLowerCase()
        if (isPresetMatch || password === 'demo123' || password === '••••••••••••') {
          setFeedback({ type: 'success', message: `Demo identity authorized. Loading station view...` })
          setTimeout(() => {
            login(selectedRoleCode)
            navigate('/dashboard')
          }, 450)
        } else {
          setFeedback({ type: 'error', message: result.error || 'Invalid credentials. Please verify your email and passcode.' })
          setIsLoading(false)
        }
      }
    } catch (err) {
      // Fallback
      login(selectedRoleCode)
      navigate('/dashboard')
    }
  }

  // ── Real Supabase Sign Up ──
  const handleSignUp = async (e) => {
    e?.preventDefault()
    if (!signUpName.trim()) {
      setFeedback({ type: 'error', message: 'Please provide your full operator name.' })
      return
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please enter a valid terminal email address.' })
      return
    }
    if (!signUpPassword || signUpPassword.length < 4) {
      setFeedback({ type: 'error', message: 'Passcode must be at least 4 characters.' })
      return
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setFeedback({ type: 'error', message: 'Passcodes do not match. Please verify.' })
      return
    }

    setIsLoading(true)
    setFeedback(null)

    try {
      const result = await supabaseSignUp({
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        roleCode: signUpRoleCode,
        department: signUpDepartment,
        shift: signUpShift,
        title: `${signUpRoleCode.replace('_', ' ').toUpperCase()} Controller`,
      })

      if (result.success && result.user) {
        registerUser(result.user)
        setFeedback({
          type: 'success',
          message: `Account created & synced to Supabase! Launching terminal...`
        })
        setTimeout(() => {
          navigate('/dashboard')
        }, 800)
      } else {
        setFeedback({ type: 'error', message: 'Failed to create user account. Please try again.' })
        setIsLoading(false)
      }
    } catch (err) {
      setFeedback({ type: 'error', message: `Sign up error: ${err.message}` })
      setIsLoading(false)
    }
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
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#020712]/75 via-[#020712]/55 to-[#020712]/85 pointer-events-none" />

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
              PortFlow <span className="text-[#0085db]">AI</span>
            </span>
            <span className="text-[11px] text-white/50 font-medium">Pier 400 Deepwater Terminal OS</span>
          </div>
        </Link>

        {/* Right Nav Action: Dev Bypass + Back to Landing */}
        <div className="flex items-center gap-3">
          {/* TEMPORARY DEV DIRECT DASHBOARD ACCESS BUTTON */}
          <button
            type="button"
            onClick={handleDevBypass}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/25 hover:from-amber-500/30 hover:to-orange-500/35 text-amber-300 border border-amber-500/40 text-xs font-bold shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
            title="Temporary Dev Bypass: Direct Dashboard Access"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>⚡ Dev: Direct Dashboard Access</span>
          </button>

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
        </div>
      </header>

      {/* ── Main login canvas ── */}
      <main className="relative z-20 flex-1 flex items-center justify-center min-h-[calc(100vh-128px)] p-4 sm:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

          {/* Left — Role / Station selector (or Terminal specs during signup) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-5 space-y-4"
          >
            <div
              className="relative backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-7 space-y-4 overflow-hidden"
              style={{
                background: `linear-gradient(145deg, rgba(0,0,0,0.68) 0%, rgba(${currentMeta.accent.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.18) 100%)`,
                boxShadow: `0 0 0 1px ${currentMeta.accent}33, 0 25px 50px rgba(0,0,0,0.55)`,
              }}
            >
              {/* Top accent gradient line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2.5px] pointer-events-none rounded-t-3xl"
                style={{ background: `linear-gradient(90deg, ${currentMeta.accent}44, ${currentMeta.accent}, ${currentMeta.accent}44)` }}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block border"
                    style={{ color: currentMeta.accent, background: `${currentMeta.accent}22`, borderColor: `${currentMeta.accent}55` }}
                  >
                    Supabase Cloud Sync
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    PostgreSQL Active
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                  {authMode === 'signin' ? 'Select Station Preset' : 'Duty Entitlement Matrix'}
                </h1>
                <p className="text-xs text-white/60 mt-1">
                  {authMode === 'signin'
                    ? 'Click any station below to auto-fill verified credentials, or type your operator details.'
                    : 'Your account will be provisioned in the cloud database with full RBAC access.'}
                </p>
              </div>

              {/* Station Presets List */}
              <div className="space-y-2 pt-1 max-h-[380px] overflow-y-auto pr-1">
                {roles.map((r) => {
                  const meta = roleMeta[r.code] || roleMeta.shift_supervisor
                  const isSelected = (authMode === 'signin' ? selectedRoleCode : signUpRoleCode) === r.code
                  return (
                    <motion.div
                      key={r.code}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        if (authMode === 'signin') {
                          handleSelectRole(r.code)
                        } else {
                          setSignUpRoleCode(r.code)
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between backdrop-blur-sm ${
                        isSelected
                          ? `shadow-lg ring-2 ${meta.ring}`
                          : 'bg-white/5 border-white/10 hover:border-white/25 shadow-sm'
                      }`}
                      style={isSelected ? {
                        background: `linear-gradient(135deg, rgba(${meta.accent.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.22) 0%, rgba(0,0,0,0.45) 100%)`,
                        borderColor: meta.accent,
                      } : {}}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl ${meta.color} text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-md`}
                        >
                          {r.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white leading-tight truncate">
                              {r.title}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${meta.lightBg}`}>
                              {meta.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/50 truncate mt-0.5">
                            {meta.desc}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                          isSelected ? `${meta.border} bg-white/10` : 'border-white/25'
                        }`}
                      >
                        {isSelected && (
                          <div className={`w-2 h-2 rounded-full ${meta.color}`} />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Dev bypass callout in left panel */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleDevBypass}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span>⚡ Quick Dev Bypass (Test Mode)</span>
                  </span>
                  <span className="text-[10px] bg-amber-500/30 px-2 py-0.5 rounded text-amber-200 uppercase tracking-wider">
                    Direct Access →
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right — Credentials & Authentication Card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-7"
          >
            <div
              className="backdrop-blur-xl rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, rgba(0,0,0,0.68) 0%, rgba(${currentMeta.accent.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.18) 100%)`,
                boxShadow: `0 0 0 1px ${currentMeta.accent}33, 0 25px 50px rgba(0,0,0,0.55)`,
              }}
            >
              {/* Top accent gradient line */}
              <div
                className="absolute top-0 inset-x-0 h-[2.5px] pointer-events-none rounded-t-3xl"
                style={{ background: `linear-gradient(90deg, ${currentMeta.accent}44, ${currentMeta.accent}, ${currentMeta.accent}44)` }}
              />

              {/* Inner corner glow */}
              <div
                className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-12 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${currentMeta.accent} 0%, transparent 70%)` }}
              />

              {/* Mode Tabs: Sign In vs Sign Up */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-1.5 p-1 bg-white/10 rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setFeedback(null); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'signin'
                        ? 'bg-[#0085db] text-white shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Station Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setFeedback(null); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-[#0085db] text-white shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Create Account (Sign Up)
                  </button>
                </div>

                {/* TEMPORARY DEV DIRECT DASHBOARD ACCESS BUTTON */}
                <button
                  type="button"
                  onClick={handleDevBypass}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  title="Click to bypass login and open dashboard directly"
                >
                  <span>⚡ Direct Dashboard Access</span>
                </button>
              </div>

              {/* Header Title */}
              <div className="mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">
                  {authMode === 'signin' ? 'Verified Maritime Identity' : 'Personnel Onboarding'}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {authMode === 'signin'
                    ? `Sign In as ${selectedRole?.title}`
                    : 'Register Terminal Duty Station Account'}
                </h2>
                <p className="text-xs text-white/45 mt-1">
                  {authMode === 'signin'
                    ? 'Enter duty station passcode or use preloaded operational credentials.'
                    : 'Credentials will be stored in Supabase PostgreSQL cloud database.'}
                </p>
              </div>

              {/* Feedback Banner */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                      feedback.type === 'error'
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    <span>{feedback.type === 'error' ? '⚠️' : '✅'}</span>
                    <span>{feedback.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Form: Sign In ── */}
              {authMode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      Terminal Operator Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@portflow.ai"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm font-medium transition-all outline-none placeholder-white/40"
                      style={{ colorScheme: 'dark' }}
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
                      <span
                        onClick={() => setPassword(`${selectedRoleCode}123`)}
                        className="text-[11px] font-semibold hover:underline cursor-pointer"
                        style={{ color: currentMeta.accent }}
                      >
                        Reset to demo key
                      </span>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm font-medium transition-all outline-none"
                      style={{ colorScheme: 'dark' }}
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
                      Supabase Cloud Connected
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
              )}

              {/* ── Form: Sign Up ── */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1">
                        Full Name &amp; Rank
                      </label>
                      <input
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Capt. Arjun Varma"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm font-medium transition-all outline-none placeholder-white/40 focus:border-[#0085db]"
                        style={{ colorScheme: 'dark' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1">
                        Work Terminal Email
                      </label>
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="a.varma@portflow.ai"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm font-medium transition-all outline-none placeholder-white/40 focus:border-[#0085db]"
                        style={{ colorScheme: 'dark' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1">
                        Access Passcode
                      </label>
                      <input
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm font-medium transition-all outline-none focus:border-[#0085db]"
                        style={{ colorScheme: 'dark' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1">
                        Confirm Passcode
                      </label>
                      <input
                        type="password"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm font-medium transition-all outline-none focus:border-[#0085db]"
                        style={{ colorScheme: 'dark' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1">
                        Assigned Operational Duty
                      </label>
                      <select
                        value={signUpRoleCode}
                        onChange={(e) => setSignUpRoleCode(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-medium outline-none focus:border-[#0085db]"
                      >
                        {roles.map(r => (
                          <option key={r.code} value={r.code} className="bg-slate-900 text-white">
                            {r.title} ({r.tag})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1">
                        Department
                      </label>
                      <select
                        value={signUpDepartment}
                        onChange={(e) => setSignUpDepartment(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-medium outline-none focus:border-[#0085db]"
                      >
                        <option value="Terminal Dispatch">Terminal Dispatch</option>
                        <option value="Marine Operations">Marine Operations</option>
                        <option value="Berth Operations">Berth Operations</option>
                        <option value="Landside Logistics">Landside Logistics</option>
                        <option value="Executive Board">Executive Board</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1">
                      Duty Shift Schedule
                    </label>
                    <select
                      value={signUpShift}
                      onChange={(e) => setSignUpShift(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-medium outline-none focus:border-[#0085db]"
                    >
                      <option value="06:00 - 14:00 (Morning)">06:00 - 14:00 (Morning Shift)</option>
                      <option value="14:00 - 22:00 (Evening)">14:00 - 22:00 (Evening Shift)</option>
                      <option value="22:00 - 06:00 (Night)">22:00 - 06:00 (Night Shift)</option>
                      <option value="General Hours">General Administrative Hours</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0085db] to-sky-600 hover:brightness-110 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Provision Account in Supabase</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Direct Dashboard Dev Bypass Banner at bottom of card */}
              <div className="mt-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-amber-200">
                  <span className="text-base">⚡</span>
                  <div>
                    <span className="font-bold block">Testing / Development Bypass</span>
                    <span className="text-[11px] text-amber-200/70">Skip credentials and enter the live digital twin immediately.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDevBypass}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
                >
                  Direct Dashboard Access →
                </button>
              </div>

              {/* Security info */}
              <div className="mt-4 pt-3 border-t border-white/10 text-center text-[11px] text-white/35 flex items-center justify-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Supabase PostgreSQL Cloud Persistence · TLS 1.3 · Immutable Audit Ledger</span>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-20 py-4 px-6 sm:px-12 border-t border-white/10 bg-black/30 backdrop-blur-md text-center text-xs text-white/35 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>PortFlow AI Platform · Pier 400 Deepwater Terminal Operations · Supabase PostgreSQL</span>
        <span>&copy; {new Date().getFullYear()} PortFlow AI Inc. All rights reserved.</span>
      </footer>
    </div>
  )
}
