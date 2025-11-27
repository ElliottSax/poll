import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { FastifyInstance } from 'fastify'
import { buildTestApp } from '../test/helpers'

// Mock dependencies
vi.mock('../utils/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

vi.mock('../utils/redis', () => ({
  redis: {
    ping: vi.fn(),
    quit: vi.fn(),
  },
  cache: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

import { prisma } from '../utils/prisma'
import { redis } from '../utils/redis'

describe('Health API Integration Tests', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildTestApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.status).toBe('ok')
      expect(body.timestamp).toBeDefined()
      expect(body.uptime).toBeGreaterThan(0)
    })

    it('should return ISO timestamp', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      const body = JSON.parse(response.body)
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('GET /health/detailed', () => {
    it('should return detailed health status when all services healthy', async () => {
      vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }] as any)
      vi.mocked(redis.ping).mockResolvedValue('PONG')

      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.status).toBe('ok')
      expect(body.database).toBe('ok')
      expect(body.redis).toBe('ok')
      expect(body.memory).toBeDefined()
      expect(body.memory.rss).toMatch(/\d+MB/)
    })

    it('should return degraded status when database fails', async () => {
      vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('Database error'))
      vi.mocked(redis.ping).mockResolvedValue('PONG')

      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.status).toBe('degraded')
      expect(body.database).toBe('error')
      expect(body.redis).toBe('ok')
    })

    it('should return degraded status when redis fails', async () => {
      vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }] as any)
      vi.mocked(redis.ping).mockRejectedValue(new Error('Redis error'))

      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.status).toBe('degraded')
      expect(body.database).toBe('ok')
      expect(body.redis).toBe('error')
    })

    it('should include memory usage statistics', async () => {
      vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }] as any)
      vi.mocked(redis.ping).mockResolvedValue('PONG')

      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed',
      })

      const body = JSON.parse(response.body)
      expect(body.memory).toHaveProperty('rss')
      expect(body.memory).toHaveProperty('heapTotal')
      expect(body.memory).toHaveProperty('heapUsed')
      expect(body.memory).toHaveProperty('external')
    })
  })
})
