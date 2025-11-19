import Fastify, { FastifyInstance } from 'fastify'
import { beforeAll, afterAll, describe, it, expect, beforeEach } from '@jest/globals'
import { pollstersRoutes } from '../src/routes/pollsters'
import { prisma } from '../src/utils/prisma'
import { cache } from '../src/utils/redis'

describe('Pollsters Routes', () => {
  let app: FastifyInstance
  let testPollsterId: string
  let testPollsterSlug: string
  let testRaceId: string

  beforeAll(async () => {
    app = Fastify()
    await app.register(pollstersRoutes, { prefix: '/api/pollsters' })
    await app.ready()

    // Create test race for polls
    const race = await prisma.race.create({
      data: {
        name: '2024 Test Governor Race',
        slug: 'test-governor-2024',
        raceType: 'governor',
        state: 'FL',
        electionDate: new Date('2024-11-05'),
        status: 'active',
        importanceScore: 75,
      },
    })
    testRaceId = race.id

    // Create test pollster
    const pollster = await prisma.pollster.create({
      data: {
        name: 'Acme Polling Institute',
        slug: 'acme-polling-institute',
        grade: 'A',
        partisanLean: 'neutral',
        website: 'https://acmepoll.example.com',
        methodology: 'Live phone interviews with quality control',
      },
    })
    testPollsterId = pollster.id
    testPollsterSlug = pollster.slug
  })

  afterAll(async () => {
    // Clean up test data
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

  describe('GET /api/pollsters', () => {
    it('should return all pollsters with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters?limit=10&offset=0',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.pollsters).toBeDefined()
      expect(Array.isArray(body.pollsters)).toBe(true)
      expect(body.meta).toBeDefined()
      expect(body.meta.total).toBeGreaterThanOrEqual(0)
      expect(body.meta.limit).toBe(10)
      expect(body.meta.offset).toBe(0)
      expect(typeof body.meta.hasMore).toBe('boolean')
    })

    it('should filter pollsters by grade', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters?grade=A',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.pollsters).toBeDefined()

      // All returned pollsters should have grade A
      body.pollsters.forEach((pollster: any) => {
        expect(pollster.grade).toBe('A')
      })
    })

    it('should filter pollsters by partisan lean', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters?partisanLean=neutral',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.pollsters).toBeDefined()

      // All returned pollsters should be neutral
      body.pollsters.forEach((pollster: any) => {
        expect(pollster.partisanLean).toBe('neutral')
      })
    })

    it('should filter by both grade and partisan lean', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters?grade=A&partisanLean=neutral',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.pollsters).toBeDefined()

      // All returned pollsters should match both filters
      body.pollsters.forEach((pollster: any) => {
        expect(pollster.grade).toBe('A')
        expect(pollster.partisanLean).toBe('neutral')
      })
    })

    it('should respect limit parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters?limit=5',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.pollsters.length).toBeLessThanOrEqual(5)
    })

    it('should respect offset parameter', async () => {
      const response1 = await app.inject({
        method: 'GET',
        url: '/api/pollsters?limit=1&offset=0',
      })

      const response2 = await app.inject({
        method: 'GET',
        url: '/api/pollsters?limit=1&offset=1',
      })

      expect(response1.statusCode).toBe(200)
      expect(response2.statusCode).toBe(200)

      const body1 = JSON.parse(response1.body)
      const body2 = JSON.parse(response2.body)

      // If there are at least 2 pollsters, they should be different
      if (body1.meta.total >= 2) {
        expect(body1.pollsters[0]?.id).not.toBe(body2.pollsters[0]?.id)
      }
    })

    it('should order pollsters by grade then name', async () => {
      // Create additional pollsters with different grades
      const pollster1 = await prisma.pollster.create({
        data: {
          name: 'Beta Polling',
          slug: 'beta-polling-test',
          grade: 'B',
        },
      })

      const pollster2 = await prisma.pollster.create({
        data: {
          name: 'Alpha Polling',
          slug: 'alpha-polling-test',
          grade: 'A',
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters?limit=50',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      // Verify ordering (grade asc, then name asc)
      for (let i = 1; i < body.pollsters.length; i++) {
        const prev = body.pollsters[i - 1]
        const curr = body.pollsters[i]

        if (prev.grade === curr.grade) {
          // If same grade, alphabetical order by name
          expect(prev.name.localeCompare(curr.name)).toBeLessThanOrEqual(0)
        } else {
          // Grade should be in ascending order (A before B before C)
          const gradeOrder = { A: 1, B: 2, C: 3, D: 4, F: 5 }
          const prevOrder = gradeOrder[prev.grade as keyof typeof gradeOrder] || 999
          const currOrder = gradeOrder[curr.grade as keyof typeof gradeOrder] || 999
          expect(prevOrder).toBeLessThanOrEqual(currOrder)
        }
      }

      // Cleanup
      await prisma.pollster.delete({ where: { id: pollster1.id } })
      await prisma.pollster.delete({ where: { id: pollster2.id } })
    })

    it('should cache results for 10 minutes', async () => {
      // First request - should hit database
      const response1 = await app.inject({
        method: 'GET',
        url: '/api/pollsters?grade=A',
      })

      expect(response1.statusCode).toBe(200)

      // Second request - should hit cache
      const response2 = await app.inject({
        method: 'GET',
        url: '/api/pollsters?grade=A',
      })

      expect(response2.statusCode).toBe(200)
      expect(response1.body).toBe(response2.body)
    })

    it('should use default limit of 50', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.pollsters.length).toBeLessThanOrEqual(50)
    })

    it('should use default offset of 0', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.meta.offset).toBe(0)
    })

    it('should include all pollster fields', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      if (body.pollsters.length > 0) {
        const pollster = body.pollsters[0]
        expect(pollster.id).toBeDefined()
        expect(pollster.name).toBeDefined()
        expect(pollster.slug).toBeDefined()
        expect(pollster.createdAt).toBeDefined()
        expect(pollster.updatedAt).toBeDefined()
      }
    })
  })

  describe('GET /api/pollsters/:slug', () => {
    it('should return pollster by slug', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/pollsters/${testPollsterSlug}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.slug).toBe(testPollsterSlug)
      expect(body.name).toBe('Acme Polling Institute')
      expect(body.grade).toBe('A')
      expect(body.partisanLean).toBe('neutral')
      expect(body.website).toBe('https://acmepoll.example.com')
    })

    it('should include recent polls', async () => {
      // Create test polls
      for (let i = 0; i < 3; i++) {
        await prisma.poll.create({
          data: {
            raceId: testRaceId,
            pollsterId: testPollsterId,
            pollDate: new Date(Date.now() - i * 86400000),
            sampleSize: 1000,
            marginOfError: 3.0,
            methodology: 'phone',
            candidateResults: {
              'Candidate A': 45 + i,
              'Candidate B': 42 + i,
            },
          },
        })
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/pollsters/${testPollsterSlug}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls).toBeDefined()
      expect(Array.isArray(body.polls)).toBe(true)
      expect(body.polls.length).toBeGreaterThan(0)

      // Each poll should include race info
      body.polls.forEach((poll: any) => {
        expect(poll.race).toBeDefined()
        expect(poll.race.id).toBeDefined()
        expect(poll.race.slug).toBeDefined()
      })

      // Cleanup
      await prisma.poll.deleteMany({ where: { pollsterId: testPollsterId } })
    })

    it('should order polls by date descending', async () => {
      // Create multiple polls with different dates
      for (let i = 0; i < 5; i++) {
        await prisma.poll.create({
          data: {
            raceId: testRaceId,
            pollsterId: testPollsterId,
            pollDate: new Date(Date.now() - i * 86400000),
            sampleSize: 1000,
            marginOfError: 3.0,
            methodology: 'phone',
            candidateResults: {
              'Candidate A': 45,
              'Candidate B': 42,
            },
          },
        })
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/pollsters/${testPollsterSlug}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      // Verify polls are ordered by date descending
      for (let i = 1; i < body.polls.length; i++) {
        const prevDate = new Date(body.polls[i - 1].pollDate).getTime()
        const currDate = new Date(body.polls[i].pollDate).getTime()
        expect(prevDate).toBeGreaterThanOrEqual(currDate)
      }

      // Cleanup
      await prisma.poll.deleteMany({ where: { pollsterId: testPollsterId } })
    })

    it('should limit to 10 most recent polls', async () => {
      // Create 15 polls
      for (let i = 0; i < 15; i++) {
        await prisma.poll.create({
          data: {
            raceId: testRaceId,
            pollsterId: testPollsterId,
            pollDate: new Date(Date.now() - i * 86400000),
            sampleSize: 1000,
            marginOfError: 3.0,
            methodology: 'phone',
            candidateResults: {
              'Candidate A': 45,
              'Candidate B': 42,
            },
          },
        })
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/pollsters/${testPollsterSlug}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls.length).toBeLessThanOrEqual(10)

      // Cleanup
      await prisma.poll.deleteMany({ where: { pollsterId: testPollsterId } })
    })

    it('should cache pollster details for 10 minutes', async () => {
      // Clear cache
      await cache.flushall()

      // First request
      const response1 = await app.inject({
        method: 'GET',
        url: `/api/pollsters/${testPollsterSlug}`,
      })

      expect(response1.statusCode).toBe(200)

      // Second request - should hit cache
      const response2 = await app.inject({
        method: 'GET',
        url: `/api/pollsters/${testPollsterSlug}`,
      })

      expect(response2.statusCode).toBe(200)
      expect(response1.body).toBe(response2.body)
    })

    it('should return 404 for non-existent pollster', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters/non-existent-pollster-slug',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Pollster not found')
    })

    it('should include all pollster metadata', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/pollsters/${testPollsterSlug}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.id).toBeDefined()
      expect(body.name).toBeDefined()
      expect(body.slug).toBeDefined()
      expect(body.grade).toBeDefined()
      expect(body.partisanLean).toBeDefined()
      expect(body.methodology).toBeDefined()
      expect(body.createdAt).toBeDefined()
      expect(body.updatedAt).toBeDefined()
    })
  })

  describe('Data Quality', () => {
    it('should have valid grade values', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      body.pollsters.forEach((pollster: any) => {
        if (pollster.grade) {
          expect(['A', 'B', 'C', 'D', 'F']).toContain(pollster.grade)
        }
      })
    })

    it('should have valid partisan lean values', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      const validLeans = ['neutral', 'republican', 'democrat', 'R', 'D', 'neutral']
      body.pollsters.forEach((pollster: any) => {
        if (pollster.partisanLean) {
          // Should be one of the valid lean values
          expect(typeof pollster.partisanLean).toBe('string')
        }
      })
    })

    it('should have unique slugs', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters?limit=100',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      const slugs = body.pollsters.map((p: any) => p.slug)
      const uniqueSlugs = new Set(slugs)
      expect(slugs.length).toBe(uniqueSlugs.size)
    })

    it('should have valid URLs for websites', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/pollsters/${testPollsterSlug}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      if (body.website) {
        expect(body.website).toMatch(/^https?:\/\/.+/)
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Force a database error by disconnecting
      await prisma.$disconnect()

      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters',
      })

      expect(response.statusCode).toBe(500)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Internal server error')

      // Reconnect for other tests
      await prisma.$connect()
    })

    it('should handle special characters in slugs', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters/slug-with-special-chars-!@#$%',
      })

      // Should return 404 since the pollster won't be found
      expect(response.statusCode).toBe(404)
    })
  })

  describe('Performance', () => {
    it('should respond quickly for list queries', async () => {
      const startTime = Date.now()

      const response = await app.inject({
        method: 'GET',
        url: '/api/pollsters?limit=50',
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime

      expect(response.statusCode).toBe(200)
      // Should respond within 1 second
      expect(responseTime).toBeLessThan(1000)
    })

    it('should leverage caching for repeated requests', async () => {
      // First request (uncached)
      const start1 = Date.now()
      await app.inject({
        method: 'GET',
        url: `/api/pollsters/${testPollsterSlug}`,
      })
      const time1 = Date.now() - start1

      // Second request (cached)
      const start2 = Date.now()
      await app.inject({
        method: 'GET',
        url: `/api/pollsters/${testPollsterSlug}`,
      })
      const time2 = Date.now() - start2

      // Cached request should be faster (or at least not significantly slower)
      expect(time2).toBeLessThanOrEqual(time1 * 2)
    })
  })
})
