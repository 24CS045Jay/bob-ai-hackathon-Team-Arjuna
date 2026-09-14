import { motion } from 'framer-motion'
import { STATUS_COLORS } from '../../data/mapEntities.mock.js'
import { usePrefersReducedMotion } from '../../utils/motion.js'

export default function MapDot({ entity, onHover, onLeave, onClick }) {
  const prefersReduced = usePrefersReducedMotion()
  const isCrit = entity.status === 'crit'
  const color = STATUS_COLORS[entity.status] || '#3B7CF6'
  const radius = isCrit ? 7.5 : 6
  const haloRadius = isCrit ? 16 : 12

  return (
    <g
      transform={`translate(${entity.x},${entity.y})`}
      className={`cursor-pointer select-none ${isCrit ? 'animate-critGlow' : ''}`}
      onMouseEnter={(e) => onHover(entity, e)}
      onMouseLeave={onLeave}
      onClick={() => onClick && onClick(entity)}
    >
      {/* Outer Halo */}
      <motion.circle
        r={haloRadius}
        animate={prefersReduced ? { fill: color } : { fill: color, r: haloRadius }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        opacity={0.22}
      />

      {/* Main Status Marker */}
      <motion.circle
        r={radius}
        animate={prefersReduced ? { fill: color } : { fill: color, r: radius }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        stroke="var(--bg-app, #0A0D12)"
        strokeWidth={2}
      />

      {/* Live Pulsing Center */}
      {isCrit && (
        <circle r={3} fill="#ffffff" className="animate-pulseDot" />
      )}
    </g>
  )
}
