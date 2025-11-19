/**
 * CSV Utility Tests
 *
 * Tests for CSV conversion and escaping logic
 */

import { describe, it, expect } from 'vitest'

// Helper function to test CSV escaping
function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return ''

  const csvHeaders = headers || Object.keys(data[0])
  const headerRow = csvHeaders.join(',')

  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header]
      if (value === null || value === undefined) return ''

      if (typeof value === 'object') {
        const stringified = JSON.stringify(value)
        return `"${stringified.replace(/"/g, '""')}"`
      }

      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }

      return value
    }).join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

describe('CSV Conversion', () => {
  describe('Basic Functionality', () => {
    it('should handle empty array', () => {
      const result = convertToCSV([])
      expect(result).toBe('')
    })

    it('should create CSV headers from object keys', () => {
      const data = [{ name: 'John', age: 30 }]
      const result = convertToCSV(data)
      expect(result).toContain('name,age')
    })

    it('should handle simple data without escaping', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ]
      const result = convertToCSV(data)
      expect(result).toBe('name,age\nJohn,30\nJane,25')
    })

    it('should use custom headers when provided', () => {
      const data = [{ name: 'John', age: 30 }]
      const result = convertToCSV(data, ['name'])
      expect(result).toBe('name\nJohn')
    })
  })

  describe('Null and Undefined Handling', () => {
    it('should handle null values', () => {
      const data = [{ name: 'John', age: null }]
      const result = convertToCSV(data)
      expect(result).toBe('name,age\nJohn,')
    })

    it('should handle undefined values', () => {
      const data = [{ name: 'John', age: undefined }]
      const result = convertToCSV(data)
      expect(result).toBe('name,age\nJohn,')
    })
  })

  describe('Comma Escaping', () => {
    it('should escape commas in values', () => {
      const data = [{ name: 'Doe, John' }]
      const result = convertToCSV(data)
      expect(result).toBe('name\n"Doe, John"')
    })

    it('should handle multiple commas', () => {
      const data = [{ address: '123 Main St, Apt 4, City, State' }]
      const result = convertToCSV(data)
      expect(result).toBe('address\n"123 Main St, Apt 4, City, State"')
    })
  })

  describe('Quote Escaping', () => {
    it('should escape quotes in values', () => {
      const data = [{ name: 'John "Johnny" Doe' }]
      const result = convertToCSV(data)
      expect(result).toBe('name\n"John ""Johnny"" Doe"')
    })

    it('should escape quotes and commas together', () => {
      const data = [{ name: 'Doe, "Johnny"' }]
      const result = convertToCSV(data)
      expect(result).toBe('name\n"Doe, ""Johnny"""')
    })

    it('should handle multiple quotes', () => {
      const data = [{ quote: 'He said "hello" and she said "goodbye"' }]
      const result = convertToCSV(data)
      expect(result).toBe('quote\n"He said ""hello"" and she said ""goodbye"""')
    })
  })

  describe('Newline Escaping', () => {
    it('should escape newlines in values', () => {
      const data = [{ description: 'Line 1\nLine 2' }]
      const result = convertToCSV(data)
      expect(result).toBe('description\n"Line 1\nLine 2"')
    })

    it('should handle multiple newlines', () => {
      const data = [{ text: 'A\nB\nC' }]
      const result = convertToCSV(data)
      expect(result).toBe('text\n"A\nB\nC"')
    })
  })

  describe('Object Handling', () => {
    it('should stringify objects', () => {
      const data = [{ meta: { key: 'value' } }]
      const result = convertToCSV(data)
      expect(result).toContain('"{""key"":""value""}"')
    })

    it('should handle nested objects', () => {
      const data = [{ data: { user: { name: 'John' } } }]
      const result = convertToCSV(data)
      expect(result).toContain('data')
      expect(result).toContain('user')
      expect(result).toContain('John')
    })

    it('should handle arrays as objects', () => {
      const data = [{ tags: ['tag1', 'tag2', 'tag3'] }]
      const result = convertToCSV(data)
      expect(result).toContain('tags')
      expect(result).toContain('tag1')
    })
  })

  describe('Number Handling', () => {
    it('should handle integers', () => {
      const data = [{ count: 42 }]
      const result = convertToCSV(data)
      expect(result).toBe('count\n42')
    })

    it('should handle floats', () => {
      const data = [{ price: 19.99 }]
      const result = convertToCSV(data)
      expect(result).toBe('price\n19.99')
    })

    it('should handle zero', () => {
      const data = [{ value: 0 }]
      const result = convertToCSV(data)
      expect(result).toBe('value\n0')
    })

    it('should handle negative numbers', () => {
      const data = [{ temperature: -5 }]
      const result = convertToCSV(data)
      expect(result).toBe('temperature\n-5')
    })
  })

  describe('Boolean Handling', () => {
    it('should handle true', () => {
      const data = [{ active: true }]
      const result = convertToCSV(data)
      expect(result).toBe('active\ntrue')
    })

    it('should handle false', () => {
      const data = [{ active: false }]
      const result = convertToCSV(data)
      expect(result).toBe('active\nfalse')
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle mixed data types', () => {
      const data = [{
        name: 'John',
        age: 30,
        active: true,
        score: null,
        address: '123 Main St, Apt 4'
      }]
      const result = convertToCSV(data)
      expect(result).toContain('name,age,active,score,address')
      expect(result).toContain('John,30,true,,"123 Main St, Apt 4"')
    })

    it('should handle all special characters together', () => {
      const data = [{
        field: 'Value with "quotes", commas, and\nnewlines'
      }]
      const result = convertToCSV(data)
      expect(result).toBe('field\n"Value with ""quotes"", commas, and\nnewlines"')
    })

    it('should handle multiple rows with different escaping needs', () => {
      const data = [
        { name: 'John', city: 'New York' },
        { name: 'Jane, Mary', city: 'Los Angeles' },
        { name: 'Bob "The Builder"', city: 'Chicago' }
      ]
      const result = convertToCSV(data)
      const lines = result.split('\n')
      expect(lines[0]).toBe('name,city')
      expect(lines[1]).toBe('John,New York')
      expect(lines[2]).toBe('"Jane, Mary",Los Angeles')
      expect(lines[3]).toBe('"Bob ""The Builder""",Chicago')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const data = [{ name: '' }]
      const result = convertToCSV(data)
      expect(result).toBe('name\n')
    })

    it('should handle whitespace-only strings', () => {
      const data = [{ name: '   ' }]
      const result = convertToCSV(data)
      expect(result).toBe('name\n   ')
    })

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000)
      const data = [{ text: longString }]
      const result = convertToCSV(data)
      expect(result).toContain(longString)
    })

    it('should handle unicode characters', () => {
      const data = [{ emoji: '😀🎉' }]
      const result = convertToCSV(data)
      expect(result).toBe('emoji\n😀🎉')
    })

    it('should handle special characters in headers', () => {
      const data = [{ 'field-name': 'value' }]
      const result = convertToCSV(data)
      expect(result).toContain('field-name')
    })
  })
})
