import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { FastifyInstance } from 'fastify'
import { buildTestApp, createMockPoll, generateTestToken } from '../test/helpers'

// Mock Prisma
vi.mock('../utils/prisma', () => ({
  prisma: {
    poll: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Mock Redis cache
vi.mock('../utils/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    quit: vi.fn(),
    ping: vi.fn(),
  },
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}))

import { prisma } from '../utils/prisma'
import { cache } from '../utils/redis'

describe('Polls API Integration Tests', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildTestApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/polls', () => {
    it('should return list of polls with metadata', async () => {
      const mockPolls = [createMockPoll(), createMockPoll({ id: 'poll-456' })]

      vi.mocked(cache.get).mockResolvedValue(null)
      vi.mocked(prisma.poll.findMany).mockResolvedValue(mockPolls as any)
      vi.mocked(prisma.poll.count).mockResolvedValue(2)

      const response = await app.inject({
        method: 'GET',
        url: '/api/polls',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.data).toHaveLength(2)
      expect(body.meta.total).toBe(2)
      expect(body.meta.limit).toBe(20)
      expect(body.meta.offset).toBe(0)
    })

    it('should filter polls by raceId', async () => {
      const mockPolls = [createMockPoll({ raceId: 'race-123' })]

      vi.mocked(cache.get).mockResolvedValue(null)
      vi.mocked(prisma.poll.findMany).mockResolvedValue(mockPolls as any)
      vi.mocked(prisma.poll.count).mockResolvedValue(1)

      const response = await app.inject({
        method: 'GET',
        url: '/api/polls?raceId=race-123',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.data).toHaveLength(1)
      expect(body.data[0].raceId).toBe('race-123')
    })

    it('should validate UUID format for raceId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/polls?raceId=invalid-uuid',
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('ValidationError')
    })

    it('should use cached data when available', async () => {
      const cachedData = {
        data: [createMockPoll()],
        meta: { total: 1, limit: 20, offset: 0 },
      }

      vi.mocked(cache.get).mockResolvedValue(cachedData)

      const response = await app.inject({
        method: 'GET',
        url: '/api/polls',
      })

      expect(response.statusCode).toBe(200)
      expect(prisma.poll.findMany).not.toHaveBeenCalled()
    })

    it('should respect limit and offset parameters', async () => {
      vi.mocked(cache.get).mockResolvedValue(null)
      vi.mocked(prisma.poll.findMany).mockResolvedValue([])
      vi.mocked(prisma.poll.count).mockResolvedValue(100)

      const response = await app.inject({
        method: 'GET',
        url: '/api/polls?limit=10&offset=20',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.meta.limit).toBe(10)
      expect(body.meta.offset).toBe(20)
    })
  })

  describe('GET /api/polls/:id', () => {
    it('should return a single poll by ID', async () => {
      const mockPoll = createMockPoll()

      vi.mocked(cache.get).mockResolvedValue(null)
      vi.mocked(prisma.poll.findUnique).mockResolvedValue(mockPoll as any)

      const response = await app.inject({
        method: 'GET',
        url: '/api/polls/poll-123',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.id).toBe('poll-123')
    })

    it('should return 404 when poll not found', async () => {
      vi.mocked(cache.get).mockResolvedValue(null)
      vi.mocked(prisma.poll.findUnique).mockResolvedValue(null)

      const response = await app.inject({
        method: 'GET',
        url: '/api/polls/nonexistent-id',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Poll not found')
    })

    it('should use cache for individual polls', async () => {
      const cachedPoll = createMockPoll()
      vi.mocked(cache.get).mockResolvedValue(cachedPoll)

      const response = await app.inject({
        method: 'GET',
        url: '/api/polls/poll-123',
      })

      expect(response.statusCode).toBe(200)
      expect(prisma.poll.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/polls/race/:raceId', () => {
    it('should return polls for a specific race', async () => {
      const mockPolls = [
        createMockPoll({ raceId: 'race-123' }),
        createMockPoll({ id: 'poll-456', raceId: 'race-123' }),
      ]

      vi.mocked(cache.get).mockResolvedValue(null)
      vi.mocked(prisma.poll.findMany).mockResolvedValue(mockPolls as any)

      const response = await app.inject({
        method: 'GET',
        url: '/api/polls/race/race-123',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveLength(2)
      expect(body[0].raceId).toBe('race-123')
    })

    it('should respect limit parameter for race polls', async () => {
      vi.mocked(cache.get).mockResolvedValue(null)
      vi.mocked(prisma.poll.findMany).mockResolvedValue([])

      await app.inject({
        method: 'GET',
        url: '/api/polls/race/race-123?limit=5',
      })

      expect(prisma.poll.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          where: { raceId: 'race-123' },
        })
      )
    })
  })

  describe('GET /api/polls/recent', () => {
    it('should return most recent polls', async () => {
      const mockPolls = [
        createMockPoll({ createdAt: new Date('2024-01-17') }),
        createMockPoll({ id: 'poll-456', createdAt: new Date('2024-01-16') }),
      ]

      vi.mocked(cache.get).mockResolvedValue(null)
      vi.mocked(prisma.poll.findMany).mockResolvedValue(mockPolls as any)

      const response = await app.inject({
        method: 'GET',
        url: '/api/polls/recent',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveLength(2)
    })

    it('should use default limit of 10', async () => {
      vi.mocked(cache.get).mockResolvedValue(null)
      vi.mocked(prisma.poll.findMany).mockResolvedValue([])

      await app.inject({
        method: 'GET',
        url: '/api/polls/recent',
      })

      expect(prisma.poll.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      )
    })
  })
})
