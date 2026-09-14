import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion } from '../../utils/motion.js'

export default function Tooltip({ text, children, position = 'top', className = '' }) {
  const [visible, setVisible] = useState(false)
  const prefersReduced = usePrefersReducedMotion()

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && text && (
          <motion.div
            key="tooltip-content"
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: position === 'top' ? 3 : -3, scale: 0.96 }}
            animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12, ease: [0.25, 1, 0.5, 1] }}
            role="tooltip"
            className={`absolute z-50 pointer-events-none whitespace-nowrap glass-strong border border-lineSoft text-ink text-[11px] font-medium py-1 px-2.5 rounded-md shadow-xl ${positions[position]}`}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
