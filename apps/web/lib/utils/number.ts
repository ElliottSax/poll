/**
 * Format a number with commas (e.g., 1000 -> "1,000")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Format a number as a percentage (e.g., 0.525 -> "52.5%")
 */
export function formatPercent(num: number, decimals: number = 1): string {
  return `${(num * 100).toFixed(decimals)}%`
}

/**
 * Format a decimal as a percentage (e.g., 52.5 -> "52.5%")
 */
export function formatPercentDirect(num: number, decimals: number = 1): string {
  return `${num.toFixed(decimals)}%`
}

/**
 * Format a number with sign (e.g., 5 -> "+5", -3 -> "-3")
 */
export function formatWithSign(num: number, decimals: number = 0): string {
  const formatted = num.toFixed(decimals)
  return num > 0 ? `+${formatted}` : formatted
}

/**
 * Format a large number with abbreviations (e.g., 1500 -> "1.5K", 1000000 -> "1M")
 */
export function formatCompact(num: number, decimals: number = 1): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(decimals)}B`
  if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`
  return num.toString()
}

/**
 * Format a number as currency (e.g., 1234.56 -> "$1,234.56")
 */
export function formatCurrency(num: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num)
}

/**
 * Format a number as an ordinal (e.g., 1 -> "1st", 2 -> "2nd", 3 -> "3rd")
 */
export function formatOrdinal(num: number): string {
  const j = num % 10
  const k = num % 100

  if (j === 1 && k !== 11) return `${num}st`
  if (j === 2 && k !== 12) return `${num}nd`
  if (j === 3 && k !== 13) return `${num}rd`
  return `${num}th`
}

/**
 * Clamp a number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

/**
 * Round a number to a specific number of decimal places
 */
export function roundTo(num: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals)
  return Math.round(num * multiplier) / multiplier
}

/**
 * Calculate percentage of a value relative to a total
 */
export function percentOf(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Calculate the difference between two numbers as a percentage
 */
export function percentDifference(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * Format a margin of error (e.g., 3.5 -> "±3.5%")
 */
export function formatMarginOfError(moe: number, decimals: number = 1): string {
  return `±${moe.toFixed(decimals)}%`
}

/**
 * Format electoral votes or seat counts
 */
export function formatSeats(seats: number, total: number): string {
  return `${seats}/${total} (${formatPercentDirect(percentOf(seats, total))})`
}

/**
 * Parse a string to a number, returning 0 if invalid
 */
export function parseNumberSafe(value: string | number): number {
  if (typeof value === 'number') return value
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}
