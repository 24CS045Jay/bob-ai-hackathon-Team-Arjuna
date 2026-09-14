export default function MapLegend() {
  const items = [
    { color: 'bg-ok', label: 'Normal / Clear' },
    { color: 'bg-amber', label: 'Elevated / 2–5h delay' },
    { color: 'bg-crit', label: 'Critical / Demurrage Risk' }
  ]

  return (
    <div className="absolute left-3.5 bottom-3.5 glass-strong border border-lineSoft rounded-xl p-2.5 sm:p-3 text-[11px] shadow-lg select-none z-10 pointer-events-none sm:pointer-events-auto">
      <div className="text-[10px] font-mono uppercase tracking-wider text-inksoft mb-2 flex items-center justify-between gap-4">
        <span>Twin Entity Status</span>
        <span className="text-[9px] text-inksoft/60">AIS + RFID</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${it.color} flex-none`} />
            <span className="text-[11px] text-ink">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
