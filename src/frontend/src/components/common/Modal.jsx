import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  modalBackdropVariants,
  modalPanelVariants,
  usePrefersReducedMotion
} from '../../utils/motion.js'

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
  footer = null
}) {
  const panelRef = useRef(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      // Focus initial element inside modal
      setTimeout(() => {
        panelRef.current?.focus()
      }, 50)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            key="modal-panel"
            ref={panelRef}
            tabIndex={-1}
            variants={prefersReduced ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : modalPanelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`w-full ${maxWidth} glass-strong border border-lineSoft rounded-2xl shadow-2xl overflow-hidden focus:outline-none`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-5 border-b border-line bg-obsidian-800/40">
              <div>
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                {subtitle && <p className="text-xs text-inksoft mt-1 leading-normal">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="text-inksoft hover:text-ink w-7 h-7 rounded-lg flex items-center justify-center hover:bg-obsidian-700/60 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>

            {footer && (
              <div className="p-4 bg-obsidian-800/80 border-t border-line flex items-center justify-end gap-2.5">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
