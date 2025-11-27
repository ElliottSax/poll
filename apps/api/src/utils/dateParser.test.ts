import { describe, it, expect } from 'vitest'
import { DateParser } from './dateParser'

describe('DateParser', () => {
  describe('parsePollDate', () => {
    it('should parse ISO date strings', () => {
      const result = DateParser.parsePollDate('2024-01-15')
      expect(result).toBe('2024-01-15')
    })

    it('should parse numeric dates M/D/YYYY', () => {
      const result = DateParser.parsePollDate('1/15/2024')
      expect(result).toBe('2024-01-15')
    })

    it('should parse month name dates', () => {
      const result = DateParser.parsePollDate('January 15, 2024')
      expect(result).toBe('2024-01-15')
    })

    it('should parse abbreviated month names', () => {
      const result = DateParser.parsePollDate('Jan 15, 2024')
      expect(result).toBe('2024-01-15')
    })

    it('should handle date ranges and take end date', () => {
      const result = DateParser.parsePollDate('1/14 - 1/17/2024')
      expect(result).toBe('2024-01-17')
    })

    it('should handle date ranges with month names', () => {
      const result = DateParser.parsePollDate('Jan 14-17, 2024')
      expect(result).toBe('2024-01-17')
    })

    it('should use default year when not specified', () => {
      const currentYear = new Date().getFullYear()
      const result = DateParser.parsePollDate('1/15', currentYear)
      expect(result).toBe(`${currentYear}-01-15`)
    })

    it('should return null for invalid dates', () => {
      const result = DateParser.parsePollDate('invalid date')
      expect(result).toBeNull()
    })

    it('should return null for null/undefined input', () => {
      expect(DateParser.parsePollDate(null as any)).toBeNull()
      expect(DateParser.parsePollDate(undefined as any)).toBeNull()
    })

    it('should handle 2-digit years', () => {
      const result = DateParser.parsePollDate('1/15/24')
      expect(result).toBe('2024-01-15')
    })
  })

  describe('parseDateRange', () => {
    it('should parse date range and return both dates', () => {
      const result = DateParser.parseDateRange('1/14/2024 - 1/17/2024')
      expect(result.start).toBe('2024-01-14')
      expect(result.end).toBe('2024-01-17')
    })

    it('should handle single date as both start and end', () => {
      const result = DateParser.parseDateRange('1/15/2024')
      expect(result.start).toBe('2024-01-15')
      expect(result.end).toBe('2024-01-15')
    })

    it('should return nulls for invalid range', () => {
      const result = DateParser.parseDateRange('invalid')
      expect(result.start).toBeNull()
      expect(result.end).toBeNull()
    })
  })

  describe('formatDate', () => {
    it('should format Date objects', () => {
      const date = new Date('2024-01-15')
      const result = DateParser.formatDate(date)
      expect(result).toMatch(/Jan.*15.*2024/)
    })

    it('should format date strings', () => {
      const result = DateParser.formatDate('2024-01-15')
      expect(result).toMatch(/Jan.*15.*2024/)
    })

    it('should return "Invalid date" for invalid input', () => {
      const result = DateParser.formatDate('invalid')
      expect(result).toBe('Invalid date')
    })
  })

  describe('daysAgo', () => {
    it('should calculate days ago for recent date', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const result = DateParser.daysAgo(yesterday)
      expect(result).toBe(1)
    })

    it('should return 0 for today', () => {
      const today = new Date()
      const result = DateParser.daysAgo(today)
      expect(result).toBe(0)
    })

    it('should return -1 for invalid date', () => {
      const result = DateParser.daysAgo('invalid')
      expect(result).toBe(-1)
    })
  })
})
