import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion, MOTION_TIMING } from '../../utils/motion.js'

export default function SmartPortShowcase() {
  const containerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.35 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const shouldAnimate = isVisible && !prefersReduced

  return (
    <section className="py-14 px-6 sm:px-12 max-w-6xl mx-auto w-full">
      {/* Section Header (Minimal, per prompt) */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-2 bg-brand/10 border border-brand/20 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <span>Live Terminal Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-2">
          See your port move in real time
        </h2>
        <p className="text-sm text-inksoft">
          Autonomous quay crane scheduling, dynamic fairway under-keel clearance, and AI-grounded dispatch.
        </p>
      </div>

      {/* Showcase Card Container (Rounded-3xl white card with embed chrome) */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5, ease: MOTION_TIMING.easeOut }}
        className="rounded-3xl border border-line bg-surface shadow-xl overflow-hidden"
      >
        {/* Full-Bleed Animated Isometric Port Canvas (Option B) */}
        <div className="relative w-full h-[360px] sm:h-[440px] bg-gradient-to-b from-sky-50 via-sky-100/40 to-slate-100 overflow-hidden flex items-center justify-center select-none">
          <svg
            viewBox="0 0 900 480"
            className="w-full h-full object-cover"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="pierGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>
              <linearGradient id="hullGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="60%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>

            {/* Ocean Water Plane */}
            <rect x="0" y="240" width="900" height="240" fill="url(#waterGrad)" />

            {/* Subtle Water Shimmer Lines */}
            <motion.path
              d="M 50 320 Q 200 310, 350 320 T 650 320 T 900 320"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeOpacity="0.5"
              fill="none"
              animate={shouldAnimate ? { x: [-20, 20, -20] } : {}}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d="M 0 380 Q 250 370, 500 380 T 900 380"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              fill="none"
              animate={shouldAnimate ? { x: [20, -20, 20] } : {}}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Concrete Quay / Pier Platform (Isometric Angle) */}
            <polygon points="0,180 900,180 900,280 0,280" fill="url(#pierGrad)" />
            {/* Quay Edge Bollards & Fender Line */}
            <line x1="0" y1="280" x2="900" y2="280" stroke="#94A3B8" strokeWidth="4" />
            <line x1="0" y1="230" x2="900" y2="230" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="12 12" />

            {/* Crane Rail Lines */}
            <line x1="0" y1="210" x2="900" y2="210" stroke="#64748B" strokeWidth="3" />
            <line x1="0" y1="260" x2="900" y2="260" stroke="#64748B" strokeWidth="3" />

            {/* Stacked Container Yard (Background Blocks) */}
            <g transform="translate(40, 110)">
              {/* Stack 1 */}
              <rect x="0" y="40" width="60" height="24" rx="2" fill="#0284C7" />
              <rect x="65" y="40" width="60" height="24" rx="2" fill="#14B8A6" />
              <rect x="130" y="40" width="60" height="24" rx="2" fill="#7C6CF6" />
              <rect x="30" y="14" width="60" height="24" rx="2" fill="#0369A1" />
              <rect x="95" y="14" width="60" height="24" rx="2" fill="#0D9488" />
              {/* Stack 2 */}
              <rect x="660" y="40" width="60" height="24" rx="2" fill="#14B8A6" />
              <rect x="725" y="40" width="60" height="24" rx="2" fill="#0284C7" />
              <rect x="690" y="14" width="60" height="24" rx="2" fill="#7C6CF6" />
            </g>

            {/* Terminal Trucks Driving Across Dock Road (Animated Loop) */}
            <motion.g
              animate={
                shouldAnimate
                  ? { x: [-120, 960] }
                  : { x: 300 }
              }
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {/* Truck 1 with container */}
              <g transform="translate(0, 190)">
                <rect x="0" y="0" width="55" height="18" rx="2" fill="#0284C7" />
                <rect x="56" y="4" width="16" height="14" rx="2" fill="#0F172A" />
                <circle cx="10" cy="18" r="4" fill="#334155" />
                <circle cx="45" cy="18" r="4" fill="#334155" />
                <circle cx="64" cy="18" r="4" fill="#334155" />
              </g>
            </motion.g>

            <motion.g
              animate={
                shouldAnimate
                  ? { x: [960, -140] }
                  : { x: 600 }
              }
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
                delay: 4,
              }}
            >
              {/* Truck 2 empty / chassis */}
              <g transform="translate(0, 192)">
                <rect x="0" y="4" width="55" height="12" rx="1" fill="#64748B" />
                <rect x="-16" y="2" width="15" height="14" rx="2" fill="#14B8A6" />
                <circle cx="-10" cy="16" r="4" fill="#334155" />
                <circle cx="10" cy="16" r="4" fill="#334155" />
                <circle cx="45" cy="16" r="4" fill="#334155" />
              </g>
            </motion.g>

            {/* Container Vessel Moored at Berth (Gentle Vertical Bobbing) */}
            <motion.g
              transform="translate(180, 275)"
              animate={shouldAnimate ? { y: [-3, 3, -3] } : {}}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Ship Hull */}
              <path
                d="M 0 40 L 40 100 L 480 100 L 520 40 Z"
                fill="url(#hullGrad)"
              />
              {/* Red Antifouling Bottom Stripe */}
              <path
                d="M 25 80 L 40 100 L 480 100 L 495 80 Z"
                fill="#E11D48"
              />
              {/* Superstructure & Bridge Tower */}
              <rect x="420" y="-20" width="50" height="60" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
              <rect x="430" y="-35" width="30" height="16" rx="2" fill="#F8FAFC" />
              <rect x="438" y="-45" width="14" height="12" rx="1" fill="#0284C7" />
              {/* Bridge Windows */}
              <rect x="432" y="-12" width="38" height="6" fill="#0284C7" opacity="0.8" />

              {/* Onboard Stacked Containers (Bays) */}
              <g transform="translate(50, -10)">
                {/* Bay 1 */}
                <rect x="0" y="25" width="50" height="24" rx="2" fill="#0284C7" />
                <rect x="0" y="0" width="50" height="24" rx="2" fill="#14B8A6" />
                <rect x="0" y="-25" width="50" height="24" rx="2" fill="#7C6CF6" />
                {/* Bay 2 */}
                <rect x="58" y="25" width="50" height="24" rx="2" fill="#10B981" />
                <rect x="58" y="0" width="50" height="24" rx="2" fill="#0284C7" />
                <rect x="58" y="-25" width="50" height="24" rx="2" fill="#0369A1" />
                {/* Bay 3 */}
                <rect x="116" y="25" width="50" height="24" rx="2" fill="#7C6CF6" />
                <rect x="116" y="0" width="50" height="24" rx="2" fill="#14B8A6" />
                {/* Bay 4 */}
                <rect x="174" y="25" width="50" height="24" rx="2" fill="#0284C7" />
                <rect x="174" y="0" width="50" height="24" rx="2" fill="#0D9488" />
                {/* Bay 5 */}
                <rect x="232" y="25" width="50" height="24" rx="2" fill="#14B8A6" />
                <rect x="232" y="0" width="50" height="24" rx="2" fill="#7C6CF6" />
                {/* Bay 6 */}
                <rect x="290" y="25" width="50" height="24" rx="2" fill="#0284C7" />
              </g>

              {/* Ship Name Plate */}
              <text x="70" y="65" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif" letterSpacing="2">
                MSC ARJUNA — PORT OF ARJUNA
              </text>
            </motion.g>

            {/* Quay Crane 1 (STS-01) with Animated Trolley and Container Hoist */}
            <g transform="translate(260, 40)">
              {/* Crane Portal Legs & Frame */}
              <line x1="10" y1="210" x2="40" y2="40" stroke="#0284C7" strokeWidth="8" strokeLinecap="round" />
              <line x1="70" y1="210" x2="50" y2="40" stroke="#0284C7" strokeWidth="8" strokeLinecap="round" />
              <line x1="40" y1="40" x2="50" y2="40" stroke="#0369A1" strokeWidth="10" />
              {/* Horizontal Out-Reach Boom extending over ship */}
              <line x1="-30" y1="40" x2="190" y2="40" stroke="#0284C7" strokeWidth="6" />
              {/* Diagonal Cable Stays */}
              <line x1="45" y1="0" x2="-30" y2="40" stroke="#64748B" strokeWidth="1.5" />
              <line x1="45" y1="0" x2="190" y2="40" stroke="#64748B" strokeWidth="1.5" />
              <polygon points="35,40 55,40 45,0" fill="#0369A1" />

              {/* Sliding Trolley (Animated Horizontal Slide) */}
              <motion.g
                animate={
                  shouldAnimate
                    ? { x: [10, 110, 10] }
                    : { x: 60 }
                }
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Trolley Box */}
                <rect x="0" y="32" width="22" height="14" rx="2" fill="#0F172A" />

                {/* Hoist Cable & Container (Rises & Lowers in sync) */}
                <motion.g
                  animate={
                    shouldAnimate
                      ? { y: [0, 90, 0] }
                      : { y: 40 }
                  }
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Two Steel Hoist Cables */}
                  <line x1="4" y1="46" x2="4" y2="90" stroke="#334155" strokeWidth="1.5" />
                  <line x1="18" y1="46" x2="18" y2="90" stroke="#334155" strokeWidth="1.5" />
                  {/* Spreader Bar */}
                  <rect x="-4" y="90" width="30" height="4" fill="#0F172A" rx="1" />
                  {/* Suspended 40ft Container */}
                  <rect x="-10" y="94" width="42" height="18" rx="1.5" fill="#14B8A6" stroke="#0D9488" strokeWidth="1" />
                  <line x1="11" y1="94" x2="11" y2="112" stroke="#FFFFFF" strokeOpacity="0.4" />
                </motion.g>
              </motion.g>
            </g>

            {/* Quay Crane 2 (STS-02) */}
            <g transform="translate(480, 40)">
              {/* Crane Portal Legs & Frame */}
              <line x1="10" y1="210" x2="40" y2="40" stroke="#0369A1" strokeWidth="8" strokeLinecap="round" />
              <line x1="70" y1="210" x2="50" y2="40" stroke="#0369A1" strokeWidth="8" strokeLinecap="round" />
              <line x1="-30" y1="40" x2="190" y2="40" stroke="#0284C7" strokeWidth="6" />
              <line x1="45" y1="0" x2="-30" y2="40" stroke="#64748B" strokeWidth="1.5" />
              <line x1="45" y1="0" x2="190" y2="40" stroke="#64748B" strokeWidth="1.5" />
              <polygon points="35,40 55,40 45,0" fill="#0369A1" />

              {/* Trolley 2 */}
              <motion.g
                animate={
                  shouldAnimate
                    ? { x: [120, 20, 120] }
                    : { x: 70 }
                }
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <rect x="0" y="32" width="22" height="14" rx="2" fill="#0F172A" />
                <line x1="4" y1="46" x2="4" y2="70" stroke="#334155" strokeWidth="1.5" />
                <line x1="18" y1="46" x2="18" y2="70" stroke="#334155" strokeWidth="1.5" />
                <rect x="-4" y="70" width="30" height="4" fill="#0F172A" rx="1" />
                <rect x="-10" y="74" width="42" height="18" rx="1.5" fill="#7C6CF6" stroke="#6D5DF0" strokeWidth="1" />
              </motion.g>
            </g>

            {/* Real-time Telemetry Overlay Chips on Canvas */}
            <g transform="translate(30, 30)">
              <rect width="180" height="34" rx="17" fill="#FFFFFF" fillOpacity="0.92" stroke="#E2E8F0" />
              <circle cx="16" cy="17" r="4" fill="#10B981" />
              <text x="28" y="21" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="sans-serif">
                Quayside Throughput: 92 Moves/h
              </text>
            </g>

            <g transform="translate(670, 30)">
              <rect width="190" height="34" rx="17" fill="#FFFFFF" fillOpacity="0.92" stroke="#E2E8F0" />
              <circle cx="16" cy="17" r="4" fill="#0284C7" />
              <text x="28" y="21" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="sans-serif">
                Fairway UKC: +2.4m Safe Margin
              </text>
            </g>
          </svg>
        </div>

        {/* Thin Live Caption / Player Chrome Row Underneath (Light Theme per Prompt) */}
        <div className="px-6 py-3.5 bg-surface border-t border-line flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ok opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ok" />
            </span>
            <span className="font-semibold text-ink">Smart Port Operations Preview</span>
            <span className="text-inksoft hidden sm:inline">· 72-Hour Discrete Simulation</span>
          </div>

          <div className="flex items-center gap-4 text-inksoft font-mono text-[11px]">
            <span className="hidden md:inline">Simulation Loop: 18s</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-ink font-semibold">
              Live State: Synchronized
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
