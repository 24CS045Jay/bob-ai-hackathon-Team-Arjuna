export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  pulse = false,
  className = ''
}) {
  const variants = {
    ok: 'bg-ok/10 text-ok border-ok/30',
    warn: 'bg-amber/10 text-amber border-amber/30',
    crit: 'bg-crit/10 text-crit border-crit/30',
    brand: 'bg-brand/15 text-brand-glow border-brand/35',
    neutral: 'bg-obsidian-800/60 text-inksoft border-line'
  }

  const dotColors = {
    ok: 'bg-ok',
    warn: 'bg-amber',
    crit: 'bg-crit',
    brand: 'bg-brand-glow',
    neutral: 'bg-inksoft'
  }

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11.5px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2'
  }

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full select-none ${variants[variant] || variants.neutral} ${sizes[size]} ${className}`}
    >
      {pulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-current'} animate-pulseDot flex-none`}
        />
      )}
      {children}
    </span>
  )
}
