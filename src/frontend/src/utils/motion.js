import { useEffect, useState } from 'react'

/**
 * Standardized motion curves and durations for Tideline operations tool.
 * High-speed, professional, zero bounce/overshoot.
 */
export const MOTION_TIMING = {
  pressDuration: 0.12,
  microDuration: 0.15,
  enterDuration: 0.22,
  exitDuration: 0.18,
  staggerDelay: 0.07,
  easeStandard: [0.25, 1, 0.5, 1], // snappy cubic bezier
  easeOut: [0.16, 1, 0.3, 1]
}

/**
 * Scroll reveal variants for page sections.
 */
export const scrollRevealVariants = {
  initial: { opacity: 0, y: 20 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: MOTION_TIMING.easeOut }
  },
  viewport: { once: true, amount: 0.25 }
}

/**
 * Hook to determine if user prefers reduced motion.
 * Gating all non-essential motion behind this check.
 */
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReduced(mediaQuery.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}

/**
 * Route / Page transition variants (<250ms, no overshoot).
 */
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 6
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_TIMING.enterDuration,
      ease: MOTION_TIMING.easeStandard
    }
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: MOTION_TIMING.exitDuration,
      ease: MOTION_TIMING.easeStandard
    }
  }
}

/**
 * Reduced motion fallback for page transitions.
 */
export const pageReducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.1 } }
}

/**
 * Stagger container for card grids (e.g. KpiRow, role cards).
 */
export const staggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: MOTION_TIMING.staggerDelay,
      delayChildren: 0.03
    }
  }
}

export const staggerItemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_TIMING.enterDuration,
      ease: MOTION_TIMING.easeStandard
    }
  }
}

/**
 * Modal & dialog scale-and-fade animation.
 * 0.96 -> 1.0 with backdrop fade.
 */
export const modalBackdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: MOTION_TIMING.microDuration } },
  exit: { opacity: 0, transition: { duration: MOTION_TIMING.microDuration } }
}

export const modalPanelVariants = {
  initial: { opacity: 0, scale: 0.96, y: 4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION_TIMING.enterDuration,
      ease: MOTION_TIMING.easeStandard
    }
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 2,
    transition: {
      duration: MOTION_TIMING.exitDuration,
      ease: MOTION_TIMING.easeStandard
    }
  }
}

/**
 * Alert / list item insertion and dismissal variants.
 */
export const listItemVariants = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: MOTION_TIMING.enterDuration, ease: MOTION_TIMING.easeStandard }
  },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: 'hidden',
    transition: { duration: MOTION_TIMING.exitDuration, ease: MOTION_TIMING.easeStandard }
  }
}

/**
 * Micro-interaction tap/hover config for buttons & interactive items.
 */
export const buttonPressInteraction = {
  scale: 0.98,
  transition: {
    duration: MOTION_TIMING.pressDuration,
    ease: MOTION_TIMING.easeStandard
  }
}
