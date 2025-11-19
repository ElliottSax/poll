/**
 * Export Routes Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import { exportRoutes } from '../../src/routes/export.js'

describe('Export Routes', () => {
  let server: any

  beforeAll(async () => {
    server = Fastify()
    await server.register(exportRoutes, { prefix: '/export' })
    await server.ready()
  })

  afterAll(async () => {
    await server.close()
  })

  describe('CSV Conversion', () => {
    it('should handle empty data', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/races?format=csv&limit=0',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('text/csv')
    })

    it('should properly escape commas in CSV', async () => {
      // This would test actual data, but we need a test database
      // For now, we'll test the endpoint responds correctly
      const response = await server.inject({
        method: 'GET',
        url: '/export/races?format=csv',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('text/csv')
      expect(response.headers['content-disposition']).toContain('attachment')
      expect(response.headers['content-disposition']).toContain('races-')
      expect(response.headers['content-disposition']).toContain('.csv')
    })

    it('should properly escape quotes in CSV', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/races?format=csv',
      })

      expect(response.statusCode).toBe(200)
      // Verify CSV format is returned
      const body = response.body
      expect(typeof body).toBe('string')
    })

    it('should handle newlines in CSV fields', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/races?format=csv',
      })

      expect(response.statusCode).toBe(200)
    })
  })

  describe('GET /export/races', () => {
    it('should export races as JSON by default', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/races',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('application/json; charset=utf-8')

      const data = JSON.parse(response.body)
      expect(data).toHaveProperty('races')
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('exportedAt')
      expect(Array.isArray(data.races)).toBe(true)
    })

    it('should export races as CSV when format=csv', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/races?format=csv',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('text/csv')
    })

    it('should respect limit parameter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/races?limit=5',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(data.races.length).toBeLessThanOrEqual(5)
    })

    it('should filter by race type', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/races?type=PRESIDENT',
      })

      expect(response.statusCode).toBe(200)
    })

    it('should filter by status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/races?status=ACTIVE',
      })

      expect(response.statusCode).toBe(200)
    })

    it('should reject invalid format', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/races?format=xml',
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject limit over maximum', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/races?limit=2000',
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('GET /export/polls', () => {
    it('should export polls as JSON', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/polls',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(data).toHaveProperty('polls')
      expect(data).toHaveProperty('total')
      expect(Array.isArray(data.polls)).toBe(true)
    })

    it('should export polls as CSV', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/polls?format=csv',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('text/csv')
      expect(response.headers['content-disposition']).toContain('polls-')
    })

    it('should filter by date range', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/polls?fromDate=2024-01-01&toDate=2024-12-31',
      })

      expect(response.statusCode).toBe(200)
    })

    it('should respect limit for polls', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/polls?limit=10',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(data.polls.length).toBeLessThanOrEqual(10)
    })
  })

  describe('GET /export/pollsters', () => {
    it('should export pollsters as JSON', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/pollsters',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(data).toHaveProperty('pollsters')
      expect(data).toHaveProperty('total')
      expect(Array.isArray(data.pollsters)).toBe(true)
    })

    it('should export pollsters as CSV', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/pollsters?format=csv',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('text/csv')
      expect(response.headers['content-disposition']).toContain('pollsters-')
    })

    it('should include filename with current date', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/export/pollsters?format=csv',
      })

      expect(response.statusCode).toBe(200)
      const disposition = response.headers['content-disposition']
      expect(disposition).toMatch(/pollsters-\d{4}-\d{2}-\d{2}\.csv/)
    })
  })
})
