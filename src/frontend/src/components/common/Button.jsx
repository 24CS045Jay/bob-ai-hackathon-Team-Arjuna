import { motion } from 'framer-motion'
import { buttonPressInteraction } from '../../utils/motion.js'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  icon = null,
  ...props
}) {
  const base =
    'relative inline-flex items-center justify-center font-medium select-none rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none transition-all cursor-pointer'

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-xs font-semibold px-4 py-2 gap-2',
    lg: 'text-sm font-semibold px-5 py-2.5 gap-2.5'
  }

  const variants = {
    primary:
      'bg-gradient-to-r from-[#0284C7] via-[#4F46E5] to-[#7C3AED] hover:from-[#0369A1] hover:via-[#4338CA] hover:to-[#6D28D9] text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.5)] active:scale-[0.98]',
    secondary:
      'bg-surface text-ink border border-line hover:border-indigo-400/50 dark:hover:border-indigo-500/50 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/60 active:scale-[0.98] hover:shadow-[0_4px_16px_rgba(99,102,241,0.12)]',
    ghost:
      'bg-transparent text-inksoft hover:text-ink hover:bg-slate-100/80 dark:hover:bg-slate-800/70',
    danger:
      'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 active:scale-[0.98]',
    success:
      'bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] active:scale-[0.98]',
    outline:
      'border border-indigo-500/30 bg-transparent text-ink hover:bg-indigo-500/10 hover:border-indigo-500/60'
  }

  return (
    <motion.button
      whileTap={disabled || loading ? undefined : buttonPressInteraction}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-none" />
      ) : (
        icon && <span className="flex-none">{icon}</span>
      )}
      <span>{children}</span>
    </motion.button>
  )
}

export function PrimaryButton({ children, onClick, className = '', disabled = false, ...props }) {
  return (
    <motion.button
      whileTap={disabled ? undefined : buttonPressInteraction}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-r from-[#0284C7] via-[#4F46E5] to-[#7C3AED] hover:from-[#0369A1] hover:via-[#4338CA] hover:to-[#6D28D9] text-white font-semibold text-sm rounded-xl px-5 py-2.5 shadow-[0_4px_20px_rgba(79,70,229,0.35)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function GhostButton({ children, onClick, className = '', disabled = false, ...props }) {
  return (
    <motion.button
      whileTap={disabled ? undefined : buttonPressInteraction}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bg-surface text-ink border border-line font-semibold text-sm rounded-xl px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function DangerButton({ children, onClick, className = '', disabled = false, ...props }) {
  return (
    <motion.button
      whileTap={disabled ? undefined : buttonPressInteraction}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-semibold text-xs rounded-xl px-3.5 py-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function IconButton({ icon, label, onClick, className = '', active = false, ...props }) {
  return (
    <motion.button
      whileTap={buttonPressInteraction}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
        active
          ? 'bg-sky-500/15 text-[#0284C7] dark:text-sky-400 border border-sky-500/40 shadow-xs'
          : 'bg-surface text-inksoft hover:text-ink hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-line hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
      } ${className}`}
      {...props}
    >
      {icon}
    </motion.button>
  )
}
