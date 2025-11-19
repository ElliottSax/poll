// Time constants for date calculations
export const TIME_CONSTANTS = {
  MINUTE_IN_MS: 60 * 1000,
  HOUR_IN_MS: 60 * 60 * 1000,
  DAY_IN_MS: 24 * 60 * 60 * 1000,
  WEEK_IN_MS: 7 * 24 * 60 * 60 * 1000,
} as const

// Helper functions for date calculations
export const getTimeAgo = {
  minutes: (minutes: number) => new Date(Date.now() - minutes * TIME_CONSTANTS.MINUTE_IN_MS),
  hours: (hours: number) => new Date(Date.now() - hours * TIME_CONSTANTS.HOUR_IN_MS),
  days: (days: number) => new Date(Date.now() - days * TIME_CONSTANTS.DAY_IN_MS),
  weeks: (weeks: number) => new Date(Date.now() - weeks * TIME_CONSTANTS.WEEK_IN_MS),
} as const

// Date formatting options
export const DATE_FORMAT_OPTIONS = {
  short: { month: 'short' as const, day: 'numeric' as const },
  medium: { month: 'short' as const, day: 'numeric' as const, year: 'numeric' as const },
  long: {
    weekday: 'long' as const,
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const
  },
} as const

// Locale for consistent formatting
export const DEFAULT_LOCALE = 'en-US'
