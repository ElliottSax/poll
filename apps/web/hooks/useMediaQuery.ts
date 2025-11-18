'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Create listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    media.addEventListener('change', listener)

    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// Preset breakpoint hooks following Tailwind's defaults
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 640px)')
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}

export function useBreakpoint() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()

  return {
    isMobile,
    isTablet,
    isDesktop,
    // Tailwind breakpoints
    sm: useMediaQuery('(min-width: 640px)'),
    md: useMediaQuery('(min-width: 768px)'),
    lg: useMediaQuery('(min-width: 1024px)'),
    xl: useMediaQuery('(min-width: 1280px)'),
    '2xl': useMediaQuery('(min-width: 1536px)'),
  }
}
