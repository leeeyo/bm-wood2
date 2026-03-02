import * as React from 'react'

// Breakpoints following Tailwind CSS conventions
export const BREAKPOINTS = {
  sm: 640,   // Small devices (mobile landscape)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktop)
  xl: 1280,  // Extra large devices
  '2xl': 1536, // 2X large devices
} as const

const MOBILE_BREAKPOINT = BREAKPOINTS.md
const TABLET_BREAKPOINT = BREAKPOINTS.lg

/**
 * Hook to detect if the current viewport is mobile (< 768px)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}

/**
 * Hook to detect if the current viewport is tablet (>= 768px and < 1024px)
 */
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkIsTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }
    
    const mqlMobile = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`)
    const mqlTablet = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    
    const onChange = () => checkIsTablet()
    
    mqlMobile.addEventListener('change', onChange)
    mqlTablet.addEventListener('change', onChange)
    checkIsTablet()
    
    return () => {
      mqlMobile.removeEventListener('change', onChange)
      mqlTablet.removeEventListener('change', onChange)
    }
  }, [])

  return !!isTablet
}

/**
 * Hook to detect if the current viewport is mobile or tablet (< 1024px)
 */
export function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobileOrTablet(window.innerWidth < TABLET_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobileOrTablet(window.innerWidth < TABLET_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobileOrTablet
}

/**
 * Hook to get responsive breakpoint information
 */
export function useResponsive() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isMobileOrTablet = useIsMobileOrTablet()

  return {
    isMobile,
    isTablet,
    isMobileOrTablet,
    isDesktop: !isMobileOrTablet,
  }
}

/**
 * Hook to detect if device supports touch
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false)

  React.useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    )
  }, [])

  return isTouch
}
