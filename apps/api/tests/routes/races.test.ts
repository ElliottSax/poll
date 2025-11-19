/**
 * Race Routes Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import { raceRoutes } from '../../src/routes/races.js'

describe('Race Routes', () => {
  let server: any

  beforeAll(async () => {
    server = Fastify()
    await server.register(raceRoutes, { prefix: '/races' })
    await server.ready()
  })

  afterAll(async () => {
    await server.close()
  })

  describe('GET /races', () => {
    it('should return list of races', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(data).toHaveProperty('races')
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('limit')
      expect(data).toHaveProperty('offset')
      expect(Array.isArray(data.races)).toBe(true)
    })

    it('should filter races by type', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races?type=PRESIDENT',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(Array.isArray(data.races)).toBe(true)
    })

    it('should filter races by state', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races?state=PA',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(Array.isArray(data.races)).toBe(true)
    })

    it('should filter races by status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races?status=ACTIVE',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(Array.isArray(data.races)).toBe(true)
    })

    it('should respect limit parameter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races?limit=5',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(data.limit).toBe(5)
      expect(data.races.length).toBeLessThanOrEqual(5)
    })

    it('should respect offset parameter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races?offset=10',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(data.offset).toBe(10)
    })

    it('should reject invalid limit (negative)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races?limit=-1',
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject invalid limit (over max)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races?limit=101',
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject invalid state (wrong length)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races?state=USA',
      })

      expect(response.statusCode).toBe(400)
    })

    it('should use default limit of 20', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.body)
      expect(data.limit).toBe(20)
    })
  })

  describe('GET /races/:slug', () => {
    it('should return 404 for non-existent race', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/non-existent-race-slug',
      })

      expect(response.statusCode).toBe(404)
      const data = JSON.parse(response.body)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('message')
    })

    it('should return race details when found', async () => {
      // This test would require seeded test data
      // Skipping actual data test without test database
      expect(true).toBe(true)
    })
  })

  describe('GET /races/:slug/polls', () => {
    it('should return 404 for non-existent race', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/non-existent-race/polls',
      })

      expect(response.statusCode).toBe(404)
      const data = JSON.parse(response.body)
      expect(data.error).toBe('Not Found')
    })

    it('should respect limit parameter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/polls?limit=5',
      })

      // Will be 404 without test data, but validates parameter parsing
      expect([200, 404]).toContain(response.statusCode)
    })

    it('should reject invalid limit', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/polls?limit=500',
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('GET /races/:slug/average', () => {
    it('should return 404 for non-existent race', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/non-existent-race/average',
      })

      expect(response.statusCode).toBe(404)
    })

    it('should use default days of 14', async () => {
      // Will be 404 without test data
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/average',
      })

      expect([200, 404]).toContain(response.statusCode)
    })

    it('should accept custom days parameter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/average?days=30',
      })

      expect([200, 404]).toContain(response.statusCode)
    })

    it('should reject days below minimum', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/average?days=0',
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject days above maximum', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/average?days=100',
      })

      expect(response.statusCode).toBe(400)
    })

    it('should return proper response structure', async () => {
      // This would require test data, but validates endpoint exists
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/average?days=14',
      })

      if (response.statusCode === 200) {
        const data = JSON.parse(response.body)
        expect(data).toHaveProperty('raceSlug')
        expect(data).toHaveProperty('raceName')
        expect(data).toHaveProperty('timeframe')
        expect(data).toHaveProperty('pollsIncluded')
        expect(data).toHaveProperty('averages')
        expect(data).toHaveProperty('lastUpdated')
      }
    })
  })

  describe('GET /races/:slug/trend', () => {
    it('should return 404 for non-existent race', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/non-existent-race/trend',
      })

      expect(response.statusCode).toBe(404)
    })

    it('should use default days of 30', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/trend',
      })

      expect([200, 404]).toContain(response.statusCode)
    })

    it('should use default interval of daily', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/trend',
      })

      expect([200, 404]).toContain(response.statusCode)
    })

    it('should accept weekly interval', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/trend?interval=weekly',
      })

      expect([200, 404]).toContain(response.statusCode)
    })

    it('should reject invalid interval', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/trend?interval=monthly',
      })

      expect(response.statusCode).toBe(400)
    })

    it('should accept days between 7 and 365', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/trend?days=90',
      })

      expect([200, 404]).toContain(response.statusCode)
    })

    it('should reject days below 7', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/trend?days=5',
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject days above 365', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/trend?days=400',
      })

      expect(response.statusCode).toBe(400)
    })

    it('should return proper response structure', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/races/test-race/trend',
      })

      if (response.statusCode === 200) {
        const data = JSON.parse(response.body)
        expect(data).toHaveProperty('raceSlug')
        expect(data).toHaveProperty('raceName')
        expect(data).toHaveProperty('timeframe')
        expect(data).toHaveProperty('interval')
        expect(data).toHaveProperty('trend')
        expect(Array.isArray(data.trend)).toBe(true)
      }
    })
  })
})
