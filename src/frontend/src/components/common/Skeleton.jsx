export default function Skeleton({ className = '', height = 'h-4', width = 'w-full', rounded = 'rounded-md' }) {
  return (
    <div
      className={`relative overflow-hidden bg-obsidian-800/80 border border-line ${height} ${width} ${rounded} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-lineSoft to-transparent animate-shimmer" />
    </div>
  )
}

export function BentoCardSkeleton({ title = true, lines = 3, className = '' }) {
  return (
    <div className={`glass rounded-[14px] p-5 space-y-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <Skeleton height="h-4" width="w-1/3" />
          <Skeleton height="h-3" width="w-16" rounded="rounded-full" />
        </div>
      )}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height="h-3.5" width={i === lines - 1 ? 'w-2/3' : 'w-full'} />
        ))}
      </div>
    </div>
  )
}
