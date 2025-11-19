/**
 * Format a date as a relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`
  return `${Math.floor(seconds / 31536000)} years ago`
}

/**
 * Format a date as "Month Day, Year" (e.g., "January 1, 2024")
 */
export function formatLongDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a date as "Mon DD, YYYY" (e.g., "Jan 1, 2024")
 */
export function formatShortDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date as "MM/DD/YYYY"
 */
export function formatNumericDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US')
}

/**
 * Format a date as ISO string (e.g., "2024-01-01")
 */
export function formatISODate(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0]
}

/**
 * Calculate days until a future date
 */
export function daysUntil(date: Date | string): number {
  const now = new Date()
  const future = new Date(date)
  const diff = future.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Calculate days since a past date
 */
export function daysSince(date: Date | string): number {
  const now = new Date()
  const past = new Date(date)
  const diff = now.getTime() - past.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  return new Date(date).getTime() < Date.now()
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string): boolean {
  return new Date(date).getTime() > Date.now()
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const today = new Date()
  const compare = new Date(date)
  return (
    compare.getDate() === today.getDate() &&
    compare.getMonth() === today.getMonth() &&
    compare.getFullYear() === today.getFullYear()
  )
}

/**
 * Format date range (e.g., "Jan 1 - Jan 5, 2024")
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)

  if (startDate.getFullYear() === endDate.getFullYear()) {
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`
    }
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${startDate.getFullYear()}`
  }

  return `${formatShortDate(start)} - ${formatShortDate(end)}`
}
