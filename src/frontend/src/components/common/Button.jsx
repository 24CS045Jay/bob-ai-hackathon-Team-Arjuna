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
    'relative inline-flex items-center justify-center font-medium select-none rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-obsidian-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none transition-colors'

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs font-semibold px-3.5 py-2 gap-2',
    lg: 'text-sm font-semibold px-5 py-2.5 gap-2.5'
  }

  const variants = {
    primary:
      'bg-brand text-white hover:bg-brand-deep shadow-[0_0_14px_rgba(59,124,246,0.3)]',
    secondary:
      'glass text-ink border border-line hover:border-lineSoft hover:bg-obsidian-800/60',
    ghost:
      'bg-transparent text-inksoft hover:text-ink hover:bg-obsidian-800/50',
    danger:
      'bg-crit/15 border border-crit/40 text-crit hover:bg-crit/25',
    success:
      'bg-ok/15 border border-ok/40 text-ok hover:bg-ok/25'
  }

  return (
    <motion.button
      whileTap={disabled || loading ? undefined : buttonPressInteraction}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
      className={`bg-brand hover:bg-brand-deep text-white font-semibold text-sm rounded-full px-6 py-3 shadow-[0_0_20px_rgba(59,124,246,0.35)] transition-colors disabled:opacity-40 disabled:pointer-events-none ${className}`}
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
      className={`glass text-ink border border-lineSoft font-semibold text-sm rounded-full px-6 py-3 hover:bg-obsidian-800/60 transition-colors disabled:opacity-40 disabled:pointer-events-none ${className}`}
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
      className={`bg-crit/10 border border-crit/40 text-crit hover:bg-crit/20 font-semibold text-xs rounded-md px-3 py-1.5 transition-colors disabled:opacity-40 disabled:pointer-events-none ${className}`}
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
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
        active
          ? 'bg-brand/20 text-brand-glow border border-brand/50'
          : 'glass text-inksoft hover:text-ink hover:border-lineSoft'
      } ${className}`}
      {...props}
    >
      {icon}
    </motion.button>
  )
}
