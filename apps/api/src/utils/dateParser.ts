import { logger } from './logger'

/**
 * Robust date parsing utilities for poll data
 * Handles various date formats from different polling sources
 */

export class DateParser {
  /**
   * Parse poll date strings to ISO format
   * Handles formats like:
   * - "1/14 - 1/17" (take end date)
   * - "Jan 14-17" (take end date)
   * - "January 14-17, 2024"
   * - "1/14/2024"
   * - ISO strings
   */
  static parsePollDate(dateStr: string, defaultYear?: number): string | null {
    if (!dateStr || typeof dateStr !== 'string') {
      logger.warn({ dateStr }, 'Invalid date string')
      return null
    }

    const trimmed = dateStr.trim()

    // Try parsing as ISO date first
    if (this.isISODate(trimmed)) {
      const date = new Date(trimmed)
      if (this.isValidDate(date)) {
        return date.toISOString().split('T')[0]
      }
    }

    // Handle date ranges - take the end date
    let endDateStr = trimmed
    if (trimmed.includes('-') || trimmed.includes('–')) {
      const parts = trimmed.split(/[-–]/)
      endDateStr = parts[parts.length - 1].trim()
    }

    // Extract year if present
    const yearMatch = endDateStr.match(/\b(20\d{2})\b/)
    const year = yearMatch ? parseInt(yearMatch[1]) : defaultYear || new Date().getFullYear()

    // Try various date formats
    const parsedDate =
      this.parseMonthDayYear(endDateStr, year) ||
      this.parseNumericDate(endDateStr, year) ||
      this.parseMonthDay(endDateStr, year)

    if (parsedDate && this.isValidDate(parsedDate)) {
      return parsedDate.toISOString().split('T')[0]
    }

    logger.warn({ dateStr, endDateStr }, 'Unable to parse date')
    return null
  }

  /**
   * Check if string is in ISO date format
   */
  private static isISODate(str: string): boolean {
    return /^\d{4}-\d{2}-\d{2}/.test(str)
  }

  /**
   * Parse "Month Day, Year" or "Month Day"
   */
  private static parseMonthDayYear(str: string, defaultYear: number): Date | null {
    const months: Record<string, number> = {
      jan: 0, january: 0,
      feb: 1, february: 1,
      mar: 2, march: 2,
      apr: 3, april: 3,
      may: 4,
      jun: 5, june: 5,
      jul: 6, july: 6,
      aug: 7, august: 7,
      sep: 8, sept: 8, september: 8,
      oct: 9, october: 9,
      nov: 10, november: 10,
      dec: 11, december: 11,
    }

    // Match "January 14, 2024" or "Jan 14"
    const match = str.match(/\b([a-z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?\b/i)
    if (match) {
      const monthName = match[1].toLowerCase()
      const day = parseInt(match[2])
      const year = match[3] ? parseInt(match[3]) : defaultYear

      const month = months[monthName]
      if (month !== undefined && day >= 1 && day <= 31) {
        return new Date(year, month, day)
      }
    }

    return null
  }

  /**
   * Parse numeric dates like "1/14/2024" or "1/14"
   */
  private static parseNumericDate(str: string, defaultYear: number): Date | null {
    // Match M/D/YYYY or M/D
    const match = str.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/)
    if (match) {
      const month = parseInt(match[1]) - 1 // 0-indexed
      const day = parseInt(match[2])
      let year = defaultYear

      if (match[3]) {
        year = parseInt(match[3])
        // Handle 2-digit years
        if (year < 100) {
          year += year < 50 ? 2000 : 1900
        }
      }

      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        return new Date(year, month, day)
      }
    }

    return null
  }

  /**
   * Parse "Month Day" format
   */
  private static parseMonthDay(str: string, defaultYear: number): Date | null {
    // Just a number like "14" - extract day
    const dayMatch = str.match(/\b(\d{1,2})\b/)
    if (dayMatch) {
      const day = parseInt(dayMatch[1])
      if (day >= 1 && day <= 31) {
        // Use current month if no month specified
        const now = new Date()
        return new Date(defaultYear, now.getMonth(), day)
      }
    }

    return null
  }

  /**
   * Validate date object
   */
  private static isValidDate(date: Date): boolean {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false
    }

    // Sanity check: date should be within reasonable range
    const year = date.getFullYear()
    if (year < 1900 || year > 2100) {
      return false
    }

    return true
  }

  /**
   * Parse date range and return start and end dates
   */
  static parseDateRange(dateStr: string): { start: string | null; end: string | null } {
    if (!dateStr || typeof dateStr !== 'string') {
      return { start: null, end: null }
    }

    const parts = dateStr.split(/[-–]/).map(s => s.trim())

    if (parts.length === 1) {
      const date = this.parsePollDate(parts[0])
      return { start: date, end: date }
    }

    // Handle "1/14 - 1/17" format
    if (parts.length === 2) {
      const end = this.parsePollDate(parts[1])

      // If start doesn't have full date, infer from end
      let start: string | null = null
      if (end) {
        const endDate = new Date(end)
        const year = endDate.getFullYear()
        const month = endDate.getMonth()

        const startDayMatch = parts[0].match(/\b(\d{1,2})\b/)
        if (startDayMatch) {
          const day = parseInt(startDayMatch[1])
          const startDate = new Date(year, month, day)
          if (this.isValidDate(startDate)) {
            start = startDate.toISOString().split('T')[0]
          }
        }
      }

      return { start, end }
    }

    return { start: null, end: null }
  }

  /**
   * Format date to human-readable string
   */
  static formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date

    if (!this.isValidDate(d)) {
      return 'Invalid date'
    }

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  /**
   * Get days ago from a date
   */
  static daysAgo(date: Date | string): number {
    const d = typeof date === 'string' ? new Date(date) : date

    if (!this.isValidDate(d)) {
      return -1
    }

    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    return Math.floor(diffMs / (1000 * 60 * 60 * 24))
  }
}
