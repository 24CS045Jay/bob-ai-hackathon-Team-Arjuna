export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  pulse = false,
  className = ''
}) {
  const variants = {
    ok: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    warn: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    crit: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
    brand: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }

  const dotColors = {
    ok: 'bg-emerald-500',
    warn: 'bg-amber-500',
    crit: 'bg-rose-500',
    brand: 'bg-sky-500',
    purple: 'bg-purple-500',
    neutral: 'bg-slate-400'
  }

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-medium tracking-tight',
    md: 'text-[11.5px] px-2.5 py-0.5 gap-1.5 font-medium',
    lg: 'text-xs px-3 py-1 gap-2 font-semibold'
  }

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full select-none ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
    >
      {pulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-current'} animate-pulse flex-none`}
        />
      )}
      <span>{children}</span>
    </span>
  )
}
