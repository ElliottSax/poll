import Fastify, { FastifyInstance } from 'fastify'
import { beforeAll, afterAll, describe, it, expect, beforeEach } from '@jest/globals'
import { racesRoutes } from '../src/routes/races'
import { prisma } from '../src/utils/prisma'
import { cache } from '../src/utils/redis'

describe('Races Routes', () => {
  let app: FastifyInstance
  let testRaceId: string
  let testRaceSlug: string

  beforeAll(async () => {
    app = Fastify()
    await app.register(racesRoutes, { prefix: '/api/races' })
    await app.ready()
  })

  afterAll(async () => {
    // Clean up test data
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

  describe('GET /api/races', () => {
    beforeAll(async () => {
      // Create test race
      const race = await prisma.race.create({
        data: {
          name: '2024 Presidential Election',
          slug: 'us-president-2024-test',
          raceType: 'president',
          state: 'US',
          electionDate: new Date('2024-11-05'),
          status: 'active',
          importanceScore: 100,
        },
      })
      testRaceId = race.id
      testRaceSlug = race.slug
    })

    it('should return all races with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?limit=10&offset=0',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.races).toBeDefined()
      expect(Array.isArray(body.races)).toBe(true)
      expect(body.meta).toBeDefined()
      expect(body.meta.total).toBeGreaterThanOrEqual(0)
      expect(body.meta.limit).toBe(10)
      expect(body.meta.offset).toBe(0)
      expect(typeof body.meta.hasMore).toBe('boolean')
    })

    it('should filter races by type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?type=president',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.races).toBeDefined()

      // All returned races should be presidential races
      body.races.forEach((race: any) => {
        expect(race.raceType).toBe('president')
      })
    })

    it('should filter races by state', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?state=US',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.races).toBeDefined()

      // All returned races should be for US
      body.races.forEach((race: any) => {
        expect(race.state).toBe('US')
      })
    })

    it('should filter races by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?status=active',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.races).toBeDefined()

      // All returned races should be active
      body.races.forEach((race: any) => {
        expect(race.status).toBe('active')
      })
    })

    it('should combine multiple filters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?type=president&state=US&status=active',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.races).toBeDefined()

      // All returned races should match all filters
      body.races.forEach((race: any) => {
        expect(race.raceType).toBe('president')
        expect(race.state).toBe('US')
        expect(race.status).toBe('active')
      })
    })

    it('should respect limit parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?limit=5',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.races.length).toBeLessThanOrEqual(5)
    })

    it('should respect offset parameter', async () => {
      const response1 = await app.inject({
        method: 'GET',
        url: '/api/races?limit=1&offset=0',
      })

      const response2 = await app.inject({
        method: 'GET',
        url: '/api/races?limit=1&offset=1',
      })

      expect(response1.statusCode).toBe(200)
      expect(response2.statusCode).toBe(200)

      const body1 = JSON.parse(response1.body)
      const body2 = JSON.parse(response2.body)

      // If there are at least 2 races, they should be different
      if (body1.meta.total >= 2) {
        expect(body1.races[0]?.id).not.toBe(body2.races[0]?.id)
      }
    })

    it('should cache results', async () => {
      // First request - should hit database
      const response1 = await app.inject({
        method: 'GET',
        url: '/api/races?type=president',
      })

      expect(response1.statusCode).toBe(200)

      // Second request - should hit cache
      const response2 = await app.inject({
        method: 'GET',
        url: '/api/races?type=president',
      })

      expect(response2.statusCode).toBe(200)
      expect(response1.body).toBe(response2.body)
    })

    it('should reject invalid race type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?type=invalid',
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject invalid state code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?state=INVALID',
      })

      expect(response.statusCode).toBe(400)
    })

    it('should order races by importance and date', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?limit=50',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      // Verify ordering (importance desc, then election date asc)
      for (let i = 1; i < body.races.length; i++) {
        const prev = body.races[i - 1]
        const curr = body.races[i]

        if (prev.importanceScore === curr.importanceScore) {
          // If same importance, earlier date should come first
          expect(new Date(prev.electionDate).getTime()).toBeLessThanOrEqual(
            new Date(curr.electionDate).getTime()
          )
        } else {
          // Higher importance should come first
          expect(prev.importanceScore).toBeGreaterThanOrEqual(curr.importanceScore)
        }
      }
    })
  })

  describe('GET /api/races/:slug', () => {
    it('should return race by slug', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/races/${testRaceSlug}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.slug).toBe(testRaceSlug)
      expect(body.name).toBe('2024 Presidential Election')
      expect(body.raceType).toBe('president')
      expect(body.state).toBe('US')
    })

    it('should include related polls', async () => {
      // Create a test pollster
      const pollster = await prisma.pollster.create({
        data: {
          name: 'Test Pollster',
          slug: 'test-pollster-races',
        },
      })

      // Create a test poll for the race
      await prisma.poll.create({
        data: {
          raceId: testRaceId,
          pollsterId: pollster.id,
          pollDate: new Date(),
          sampleSize: 1000,
          marginOfError: 3.0,
          methodology: 'online',
          candidateResults: {
            'Candidate A': 45.5,
            'Candidate B': 42.3,
          },
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: `/api/races/${testRaceSlug}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls).toBeDefined()
      expect(Array.isArray(body.polls)).toBe(true)
      expect(body.polls.length).toBeGreaterThan(0)
      expect(body.polls[0].pollster).toBeDefined()

      // Cleanup
      await prisma.poll.deleteMany({ where: { pollsterId: pollster.id } })
      await prisma.pollster.delete({ where: { id: pollster.id } })
    })

    it('should include latest forecast', async () => {
      // Create a test forecast
      await prisma.forecast.create({
        data: {
          raceId: testRaceId,
          forecastDate: new Date(),
          modelVersion: 'v1.0',
          predictions: {
            'Candidate A': {
              winProbability: 55.5,
              voteShare: 48.2,
            },
            'Candidate B': {
              winProbability: 44.5,
              voteShare: 45.8,
            },
          },
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: `/api/races/${testRaceSlug}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.forecasts).toBeDefined()
      expect(Array.isArray(body.forecasts)).toBe(true)
      expect(body.forecasts.length).toBeGreaterThan(0)

      // Cleanup
      await prisma.forecast.deleteMany({ where: { raceId: testRaceId } })
    })

    it('should cache race details', async () => {
      // Clear cache
      await cache.flushall()

      // First request
      const response1 = await app.inject({
        method: 'GET',
        url: `/api/races/${testRaceSlug}`,
      })

      expect(response1.statusCode).toBe(200)

      // Second request - should hit cache
      const response2 = await app.inject({
        method: 'GET',
        url: `/api/races/${testRaceSlug}`,
      })

      expect(response2.statusCode).toBe(200)
      expect(response1.body).toBe(response2.body)
    })

    it('should return 404 for non-existent race', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races/non-existent-race-slug',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Race not found')
    })

    it('should limit polls to 10 most recent', async () => {
      // Create a test pollster
      const pollster = await prisma.pollster.create({
        data: {
          name: 'Test Pollster Many',
          slug: 'test-pollster-many',
        },
      })

      // Create 15 polls
      for (let i = 0; i < 15; i++) {
        await prisma.poll.create({
          data: {
            raceId: testRaceId,
            pollsterId: pollster.id,
            pollDate: new Date(Date.now() - i * 86400000), // Each day earlier
            sampleSize: 1000,
            marginOfError: 3.0,
            methodology: 'online',
            candidateResults: {
              'Candidate A': 45 + i * 0.1,
              'Candidate B': 42 + i * 0.1,
            },
          },
        })
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/races/${testRaceSlug}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls.length).toBeLessThanOrEqual(10)

      // Cleanup
      await prisma.poll.deleteMany({ where: { pollsterId: pollster.id } })
      await prisma.pollster.delete({ where: { id: pollster.id } })
    })
  })

  describe('GET /api/races/:slug/polls', () => {
    it('should return all polls for a race', async () => {
      // Create a test pollster
      const pollster = await prisma.pollster.create({
        data: {
          name: 'Test Pollster Polls',
          slug: 'test-pollster-polls',
        },
      })

      // Create test polls
      await prisma.poll.create({
        data: {
          raceId: testRaceId,
          pollsterId: pollster.id,
          pollDate: new Date(),
          sampleSize: 1000,
          marginOfError: 3.0,
          methodology: 'online',
          candidateResults: {
            'Candidate A': 45.5,
            'Candidate B': 42.3,
          },
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: `/api/races/${testRaceSlug}/polls`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls).toBeDefined()
      expect(Array.isArray(body.polls)).toBe(true)
      expect(body.polls.length).toBeGreaterThan(0)

      // Each poll should include pollster info
      body.polls.forEach((poll: any) => {
        expect(poll.pollster).toBeDefined()
        expect(poll.pollster.name).toBeDefined()
        expect(poll.pollster.slug).toBeDefined()
      })

      // Cleanup
      await prisma.poll.deleteMany({ where: { pollsterId: pollster.id } })
      await prisma.pollster.delete({ where: { id: pollster.id } })
    })

    it('should return 404 for non-existent race', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races/non-existent-race/polls',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Race not found')
    })

    it('should cache race polls', async () => {
      // Clear cache
      await cache.flushall()

      // First request
      const response1 = await app.inject({
        method: 'GET',
        url: `/api/races/${testRaceSlug}/polls`,
      })

      expect(response1.statusCode).toBe(200)

      // Second request - should hit cache
      const response2 = await app.inject({
        method: 'GET',
        url: `/api/races/${testRaceSlug}/polls`,
      })

      expect(response2.statusCode).toBe(200)
      expect(response1.body).toBe(response2.body)
    })

    it('should order polls by date descending', async () => {
      // Create a test pollster
      const pollster = await prisma.pollster.create({
        data: {
          name: 'Test Pollster Order',
          slug: 'test-pollster-order',
        },
      })

      // Create polls with different dates
      for (let i = 0; i < 5; i++) {
        await prisma.poll.create({
          data: {
            raceId: testRaceId,
            pollsterId: pollster.id,
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
        url: `/api/races/${testRaceSlug}/polls`,
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
      await prisma.poll.deleteMany({ where: { pollsterId: pollster.id } })
      await prisma.pollster.delete({ where: { id: pollster.id } })
    })

    it('should limit to 50 polls', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/races/${testRaceSlug}/polls`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.polls.length).toBeLessThanOrEqual(50)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Force a database error by disconnecting
      await prisma.$disconnect()

      const response = await app.inject({
        method: 'GET',
        url: '/api/races',
      })

      expect(response.statusCode).toBe(500)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Internal server error')

      // Reconnect for other tests
      await prisma.$connect()
    })
  })
})
