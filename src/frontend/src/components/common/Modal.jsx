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
  maxWidth = 'max-w-lg',
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
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
            className={`w-full ${maxWidth} bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden focus:outline-none flex flex-col max-h-[90vh]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-line bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-ink tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs sm:text-sm text-inksoft mt-1 leading-normal">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="text-inksoft hover:text-ink w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer flex-none ml-3"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/50 border-t border-line flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
