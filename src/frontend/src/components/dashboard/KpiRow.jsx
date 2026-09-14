import { useEffect, useState } from 'react'
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
    const durationMs = 650
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

  // 4 Pastel Stat Cards strictly matching MaterialM Screenshot 2
  const cards = [
    {
      title: 'Total Crane Moves',
      value: '34.8',
      suffix: ' GMPH',
      subtext: 'vs 32.0 SLA benchmark',
      trend: '+14.6%',
      trendPositive: true,
      iconBg: 'bg-[#FEF5E5] text-[#FFAE1F] dark:bg-amber-950/40 dark:text-amber-300',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
    {
      title: 'Peak Congestion',
      value: `${peakCongestion}%`,
      subtext: 'Zone B active hotspot',
      trend: '+9.2%',
      trendPositive: false,
      iconBg: 'bg-[#FDEDE8] text-[#FA896B] dark:bg-rose-950/40 dark:text-rose-300',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      title: 'Active Fleet Lineup',
      value: `${activeVesselsCount}`,
      suffix: ' Vessels',
      subtext: '45.1k TEU underway',
      trend: '+12.5%',
      trendPositive: true,
      iconBg: 'bg-[#E6FFFA] text-[#13DEB9] dark:bg-emerald-950/40 dark:text-emerald-300',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'Demurrage Incurred',
      value: '$0.00',
      subtext: '72h rolling window zero risk',
      trend: '-16.3%',
      trendPositive: true,
      iconBg: 'bg-[#EBF3FE] text-[#0085db] dark:bg-sky-950/40 dark:text-sky-300',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((c, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.05 }}
          className="bg-surface rounded-2xl p-5 border border-line shadow-card hover:shadow-card-hover transition-all flex items-center justify-between"
        >
          {/* Left: Metric Info */}
          <div>
            <span className="text-xs font-semibold text-inksoft block mb-1.5">{c.title}</span>
            <div className="text-2xl sm:text-[26px] font-bold text-ink tracking-tight font-sans leading-none">
              <CountUpValue value={c.value} />
              {c.suffix && <span className="text-xs font-medium text-inksoft ml-1">{c.suffix}</span>}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span
                className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                  c.trendPositive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                }`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  {c.trendPositive ? (
                    <polyline points="18 15 12 9 6 15" />
                  ) : (
                    <polyline points="6 9 12 15 18 9" />
                  )}
                </svg>
                {c.trend}
              </span>
              <span className="text-[11px] text-inksoft truncate max-w-[120px]">{c.subtext}</span>
            </div>
          </div>

          {/* Right: Pastel Squircle Icon (MaterialM Signature) */}
          <div className={`w-13 h-13 rounded-2xl flex items-center justify-center p-3.5 shrink-0 ${c.iconBg}`}>
            {c.icon}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
