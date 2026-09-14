import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useOperationalContext } from '../../context/OperationalContext.jsx'
import { useRole } from '../../context/RoleContext.jsx'
import { fetchHotspots } from '../../api/client.js'

function parseValueString(str) {
  if (typeof str !== 'string') return { prefix: '', number: Number(str) || 0, suffix: '', decimals: 0 }
  const match = str.match(/^([^\d.-]*)([-+]?[0-9]*\.?[0-9]+)(.*)$/)
  if (!match) return { prefix: '', number: 0, suffix: str, decimals: 0 }
  const prefix = match[1] || ''
  const numStr = match[2] || '0'
  const suffix = match[3] || ''
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0
  const number = parseFloat(numStr) || 0
  return { prefix, number, suffix, decimals }
}

function CountUpValue({ value }) {
  const { prefix, number, suffix, decimals } = parseValueString(value)
  const [displayNum, setDisplayNum] = useState(0)

  useEffect(() => {
    const startNum = 0
    const endNum = number
    const durationMs = 600
    const startTime = performance.now()

    let animationFrameId
    const step = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentVal = startNum + (endNum - startNum) * eased
      setDisplayNum(currentVal)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      } else {
        setDisplayNum(endNum)
      }
    }

    animationFrameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrameId)
  }, [number])

  const formatted = decimals > 0 ? displayNum.toFixed(decimals) : Math.round(displayNum)
  return <span>{prefix}{formatted}{suffix}</span>
}

export default function KpiRow() {
  const { can } = useRole()
  const { vessels, berths } = useOperationalContext()
  const [hotspotData, setHotspotData] = useState(null)

  useEffect(() => {
    fetchHotspots().then(data => {
      if (data) setHotspotData(data)
    })
  }, [])

  if (!can('viewKpis')) {
    return null
  }

  const activeVesselsCount = vessels?.length || 15
  const occupiedBerths = berths?.filter(b => b.isOccupied || b.vesselId).length || 8
  const totalBerths = berths?.length || 12
  const berthPct = Math.round((occupiedBerths / totalBerths) * 100)
  const peakCongestion = hotspotData?.hotspots?.[0]?.predicted_congestion_index || 81.6

  const cards = [
    {
      title: 'Total Inbound Vessels',
      value: `${activeVesselsCount}`,
      subtext: 'vs last shift 12',
      trend: '+10.8%',
      trendPositive: true,
    },
    {
      title: 'Active Berth Occupancy',
      value: `${berthPct}%`,
      subtext: `vs capacity ${totalBerths} berths`,
      trend: '+16.8%',
      trendPositive: true,
    },
    {
      title: 'Peak Congestion (Zone B)',
      value: `${peakCongestion}%`,
      subtext: 'vs nominal 45.0%',
      trend: '+12.9%',
      trendPositive: false,
      isBrandPill: true,
    },
    {
      title: 'Net Crane Moves / Hr',
      value: '92',
      suffix: ' moves/h',
      subtext: 'vs target 80 moves',
      trend: '+10.8%',
      trendPositive: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.05 }}
          className="glass-strong rounded-2xl p-5 border border-line flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          {/* Top Title & 3-dot action */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-inksoft">{c.title}</span>
            <button
              title="Card options"
              className="text-inksoft hover:text-ink p-1 rounded-lg hover:bg-obsidian-700/60 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>

          {/* Big Bold KPI Number (Image 1 style) */}
          <div className="mt-3.5 mb-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-sans">
              <CountUpValue value={c.value} />
              {c.suffix && <span className="text-xs font-medium text-inksoft ml-1 font-mono">{c.suffix}</span>}
            </div>
          </div>

          {/* Bottom Subtitle & Trend Badge */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-inksoft/80 font-medium text-[11.5px]">{c.subtext}</span>
            <span
              className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] font-mono ${
                c.isBrandPill
                  ? 'bg-brand/10 text-brand border border-brand/20'
                  : c.trendPositive
                  ? 'bg-ok/10 text-ok border border-ok/20'
                  : 'bg-crit/10 text-crit border border-crit/20'
              }`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              {c.trend}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
