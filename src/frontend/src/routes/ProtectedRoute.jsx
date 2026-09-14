import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRole } from '../context/RoleContext.jsx'
import AppShell from '../components/layout/AppShell.jsx'
import { buttonPressInteraction } from '../utils/motion.js'

export default function ProtectedRoute({ children, requiredPermission = null }) {
  const { activeRole, can, roles, login } = useRole()
  const navigate = useNavigate()

  if (!activeRole) {
    return <Navigate to="/" replace />
  }

  if (requiredPermission && !can(requiredPermission)) {
    return (
      <AppShell crumb="Restricted Operational View">
        <div className="max-w-xl mx-auto mt-16 glass-strong rounded-2xl p-8 border border-lineSoft text-center animate-fadeUp">
          <div className="w-12 h-12 rounded-2xl bg-amber/15 text-amber border border-amber/30 flex items-center justify-center mx-auto mb-4 text-xl">
            🔒
          </div>
          <h2 className="text-lg font-bold text-ink mb-2">
            Access Restricted: {activeRole.title}
          </h2>
          <p className="text-xs text-inksoft leading-relaxed mb-6 font-sans">
            Active role lacks operational entitlement{' '}
            <code className="text-amber font-mono bg-amber/10 px-1.5 py-0.5 rounded border border-amber/25">
              {requiredPermission}
            </code>
            . Adjust permissions in RBAC policy or switch to an authorized shift perspective.
          </p>

          <div className="border-t border-line pt-6 mb-6">
            <span className="text-[11px] text-inksoft uppercase font-mono tracking-wider block mb-3">
              Authorized Shift Perspectives:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {roles
                .filter((r) => r.permissions[requiredPermission])
                .map((r) => (
                  <motion.button
                    whileTap={buttonPressInteraction}
                    key={r.code}
                    onClick={() => login(r.code)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg glass border border-line hover:border-brand/50 hover:bg-brand/10 text-ink transition-colors font-mono"
                  >
                    Enter as {r.title} →
                  </motion.button>
                ))}
            </div>
          </div>

          <motion.button
            whileTap={buttonPressInteraction}
            onClick={() => navigate('/dashboard')}
            className="text-xs text-inksoft hover:text-ink font-semibold"
          >
            ← Return to Port Overview
          </motion.button>
        </div>
      </AppShell>
    )
  }

  return children
}
