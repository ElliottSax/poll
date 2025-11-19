import Fastify, { FastifyInstance } from 'fastify'
import { beforeAll, afterAll, describe, it, expect, beforeEach } from '@jest/globals'
import { pollsRoutes } from '../src/routes/polls'
import { prisma } from '../src/utils/prisma'
import { cache } from '../src/utils/redis'

describe('Polls Routes', () => {
  let app: FastifyInstance
  let testRaceId: string
  let testPollsterId: string
  let testPollId: string

  beforeAll(async () => {
    app = Fastify()
    await app.register(pollsRoutes, { prefix: '/api/polls' })
    await app.ready()

    // Create test race
    const race = await prisma.race.create({
      data: {
        name: '2024 Test Senate Race',
        slug: 'test-senate-2024',
        raceType: 'senate',
        state: 'PA',
        electionDate: new Date('2024-11-05'),
        status: 'active',
        importanceScore: 85,
      },
    })
    testRaceId = race.id

    // Create test pollster
    const pollster = await prisma.pollster.create({
      data: {
        name: 'Test Polling Company',
        slug: 'test-polling-company',
      },
    })
    testPollsterId = pollster.id

    // Create test poll
    const poll = await prisma.poll.create({
      data: {
        raceId: testRaceId,
        pollsterId: testPollsterId,
        pollDate: new Date('2024-10-01'),
        sampleSize: 1500,
        marginOfError: 2.5,
        methodology: 'phone',
        candidateResults: {
          'John Smith': 48.5,
          'Jane Doe': 45.2,
          'Other': 6.3,
        },
      },
    })
    testPollId = poll.id
  })

  afterAll(async () => {
    // Clean up test data
    if (testPollId) {
      await prisma.poll.deleteMany({ where: { id: testPollId } })
    }
    if (testPollsterId) {
      await prisma.poll.deleteMany({ where: { pollsterId: testPollsterId } })
      await prisma.pollster.deleteMany({ where: { id: testPollsterId } })
    }
    if (testRaceId) {
      await prisma.poll.deleteMany({ where: { raceId: testRaceId } })
      await prisma.forecast.deleteMany({ where: { raceId: testRaceId } })
      await prisma.race.deleteMany({ where: { id: testRaceId } })
    }
    await app.close()
    await prisma.$disconnect()
    await cache.quit()
  })

  beforeEach(async () => {
    // Clear Redis cache before each test
    await cache.flushall()
  })

  describe('GET /api/polls', () => {
    it('should return all polls with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/polls?limit=10&offset=0',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls).toBeDefined()
      expect(Array.isArray(body.polls)).toBe(true)
      expect(body.meta).toBeDefined()
      expect(body.meta.total).toBeGreaterThanOrEqual(0)
      expect(body.meta.limit).toBe(10)
      expect(body.meta.offset).toBe(0)
      expect(typeof body.meta.hasMore).toBe('boolean')
    })

    it('should include pollster and race info', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/polls',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      if (body.polls.length > 0) {
        const poll = body.polls[0]
        expect(poll.pollster).toBeDefined()
        expect(poll.pollster.name).toBeDefined()
        expect(poll.pollster.slug).toBeDefined()
        expect(poll.race).toBeDefined()
        expect(poll.race.id).toBeDefined()
        expect(poll.race.slug).toBeDefined()
      }
    })

    it('should filter polls by raceId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls?raceId=${testRaceId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls).toBeDefined()

      // All returned polls should be for the specified race
      body.polls.forEach((poll: any) => {
        expect(poll.raceId).toBe(testRaceId)
      })
    })

    it('should filter polls by pollsterId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls?pollsterId=${testPollsterId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls).toBeDefined()

      // All returned polls should be from the specified pollster
      body.polls.forEach((poll: any) => {
        expect(poll.pollsterId).toBe(testPollsterId)
      })
    })

    it('should filter by both raceId and pollsterId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls?raceId=${testRaceId}&pollsterId=${testPollsterId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls).toBeDefined()

      // All returned polls should match both filters
      body.polls.forEach((poll: any) => {
        expect(poll.raceId).toBe(testRaceId)
        expect(poll.pollsterId).toBe(testPollsterId)
      })
    })

    it('should respect limit parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/polls?limit=5',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls.length).toBeLessThanOrEqual(5)
    })

    it('should respect offset parameter', async () => {
      const response1 = await app.inject({
        method: 'GET',
        url: '/api/polls?limit=1&offset=0',
      })

      const response2 = await app.inject({
        method: 'GET',
        url: '/api/polls?limit=1&offset=1',
      })

      expect(response1.statusCode).toBe(200)
      expect(response2.statusCode).toBe(200)

      const body1 = JSON.parse(response1.body)
      const body2 = JSON.parse(response2.body)

      // If there are at least 2 polls, they should be different
      if (body1.meta.total >= 2) {
        expect(body1.polls[0]?.id).not.toBe(body2.polls[0]?.id)
      }
    })

    it('should order polls by date descending', async () => {
      // Create multiple polls with different dates
      for (let i = 0; i < 3; i++) {
        await prisma.poll.create({
          data: {
            raceId: testRaceId,
            pollsterId: testPollsterId,
            pollDate: new Date(Date.now() - i * 86400000), // Each day earlier
            sampleSize: 1000,
            marginOfError: 3.0,
            methodology: 'online',
            candidateResults: {
              'Candidate A': 45 + i,
              'Candidate B': 42 + i,
            },
          },
        })
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/polls?raceId=${testRaceId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      // Verify polls are ordered by date descending (most recent first)
      for (let i = 1; i < body.polls.length; i++) {
        const prevDate = new Date(body.polls[i - 1].pollDate).getTime()
        const currDate = new Date(body.polls[i].pollDate).getTime()
        expect(prevDate).toBeGreaterThanOrEqual(currDate)
      }

      // Cleanup
      await prisma.poll.deleteMany({
        where: {
          raceId: testRaceId,
          id: { not: testPollId },
        },
      })
    })

    it('should cache results', async () => {
      // First request - should hit database
      const response1 = await app.inject({
        method: 'GET',
        url: `/api/polls?raceId=${testRaceId}`,
      })

      expect(response1.statusCode).toBe(200)

      // Second request - should hit cache
      const response2 = await app.inject({
        method: 'GET',
        url: `/api/polls?raceId=${testRaceId}`,
      })

      expect(response2.statusCode).toBe(200)
      expect(response1.body).toBe(response2.body)
    })

    it('should use default limit of 50', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/polls',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls.length).toBeLessThanOrEqual(50)
    })

    it('should use default offset of 0', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/polls',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.meta.offset).toBe(0)
    })
  })

  describe('GET /api/polls/:id', () => {
    it('should return poll by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.id).toBe(testPollId)
      expect(body.raceId).toBe(testRaceId)
      expect(body.pollsterId).toBe(testPollsterId)
      expect(body.sampleSize).toBe(1500)
      expect(body.marginOfError).toBe(2.5)
      expect(body.methodology).toBe('phone')
      expect(body.candidateResults).toBeDefined()
    })

    it('should include pollster information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.pollster).toBeDefined()
      expect(body.pollster.id).toBe(testPollsterId)
      expect(body.pollster.name).toBe('Test Polling Company')
      expect(body.pollster.slug).toBe('test-polling-company')
    })

    it('should include race information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.race).toBeDefined()
      expect(body.race.id).toBe(testRaceId)
      expect(body.race.slug).toBe('test-senate-2024')
      expect(body.race.name).toBe('2024 Test Senate Race')
    })

    it('should cache poll details', async () => {
      // Clear cache
      await cache.flushall()

      // First request
      const response1 = await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })

      expect(response1.statusCode).toBe(200)

      // Second request - should hit cache
      const response2 = await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })

      expect(response2.statusCode).toBe(200)
      expect(response1.body).toBe(response2.body)
    })

    it('should return 404 for non-existent poll', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/polls/non-existent-poll-id-12345',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Poll not found')
    })

    it('should validate candidate results format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(typeof body.candidateResults).toBe('object')
      expect(body.candidateResults['John Smith']).toBe(48.5)
      expect(body.candidateResults['Jane Doe']).toBe(45.2)
      expect(body.candidateResults['Other']).toBe(6.3)
    })

    it('should include all poll metadata', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.pollDate).toBeDefined()
      expect(body.sampleSize).toBeDefined()
      expect(body.marginOfError).toBeDefined()
      expect(body.methodology).toBeDefined()
      expect(body.createdAt).toBeDefined()
      expect(body.updatedAt).toBeDefined()
    })
  })

  describe('Data Integrity', () => {
    it('should ensure poll date is valid', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      const pollDate = new Date(body.pollDate)
      expect(pollDate.toString()).not.toBe('Invalid Date')
      expect(pollDate.getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should ensure sample size is positive', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.sampleSize).toBeGreaterThan(0)
    })

    it('should ensure margin of error is reasonable', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.marginOfError).toBeGreaterThan(0)
      expect(body.marginOfError).toBeLessThan(100)
    })

    it('should ensure candidate results sum to approximately 100', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      const total = Object.values(body.candidateResults as Record<string, number>).reduce(
        (sum, val) => sum + val,
        0
      )
      // Allow some tolerance for rounding
      expect(total).toBeGreaterThan(95)
      expect(total).toBeLessThan(105)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Force a database error by disconnecting
      await prisma.$disconnect()

      const response = await app.inject({
        method: 'GET',
        url: '/api/polls',
      })

      expect(response.statusCode).toBe(500)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Internal server error')

      // Reconnect for other tests
      await prisma.$connect()
    })

    it('should handle invalid UUID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/polls/not-a-valid-uuid',
      })

      // Should return 404 since the poll won't be found
      expect(response.statusCode).toBe(404)
    })
  })

  describe('Performance', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now()

      const response = await app.inject({
        method: 'GET',
        url: '/api/polls?limit=50',
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime

      expect(response.statusCode).toBe(200)
      // Should respond within 1 second for 50 polls
      expect(responseTime).toBeLessThan(1000)
    })

    it('should leverage caching for repeated requests', async () => {
      // First request (uncached)
      const start1 = Date.now()
      await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })
      const time1 = Date.now() - start1

      // Second request (cached)
      const start2 = Date.now()
      await app.inject({
        method: 'GET',
        url: `/api/polls/${testPollId}`,
      })
      const time2 = Date.now() - start2

      // Cached request should be faster (or at least not significantly slower)
      expect(time2).toBeLessThanOrEqual(time1 * 2)
    })
  })
})
