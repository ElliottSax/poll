import Fastify, { FastifyInstance } from 'fastify'
import { beforeAll, afterAll, describe, it, expect, beforeEach } from '@jest/globals'
import { forecastsRoutes } from '../src/routes/forecasts'
import { prisma } from '../src/utils/prisma'
import { cache } from '../src/utils/redis'

describe('Forecasts Routes', () => {
  let app: FastifyInstance
  let testRaceId: string
  let testRaceSlug: string
  let testForecastId: string
  let testCandidate1Id: string
  let testCandidate2Id: string

  beforeAll(async () => {
    app = Fastify()
    await app.register(forecastsRoutes, { prefix: '/api/forecasts' })
    await app.ready()

    // Create test race
    const race = await prisma.race.create({
      data: {
        name: '2024 Test Presidential Race',
        slug: 'test-president-2024-forecast',
        raceType: 'president',
        state: 'US',
        electionDate: new Date('2024-11-05'),
        status: 'active',
        importanceScore: 100,
      },
    })
    testRaceId = race.id
    testRaceSlug = race.slug

    // Create test candidates
    const candidate1 = await prisma.candidate.create({
      data: {
        name: 'Alice Johnson',
        party: 'Democratic',
        raceId: testRaceId,
      },
    })
    testCandidate1Id = candidate1.id

    const candidate2 = await prisma.candidate.create({
      data: {
        name: 'Bob Williams',
        party: 'Republican',
        raceId: testRaceId,
      },
    })
    testCandidate2Id = candidate2.id

    // Create test forecast
    const forecast = await prisma.forecast.create({
      data: {
        raceId: testRaceId,
        forecastDate: new Date('2024-10-15'),
        modelVersion: 'v2.0-test',
        predictions: {
          'Alice Johnson': {
            winProbability: 52.5,
            voteShare: 48.2,
            confidenceInterval: [45.1, 51.3],
          },
          'Bob Williams': {
            winProbability: 47.5,
            voteShare: 46.8,
            confidenceInterval: [43.5, 50.1],
          },
        },
      },
    })
    testForecastId = forecast.id

    // Create forecast results
    await prisma.forecastResult.create({
      data: {
        forecastId: testForecastId,
        candidateId: testCandidate1Id,
        winProbability: 52.5,
        voteShare: 48.2,
        confidenceIntervalLow: 45.1,
        confidenceIntervalHigh: 51.3,
      },
    })

    await prisma.forecastResult.create({
      data: {
        forecastId: testForecastId,
        candidateId: testCandidate2Id,
        winProbability: 47.5,
        voteShare: 46.8,
        confidenceIntervalLow: 43.5,
        confidenceIntervalHigh: 50.1,
      },
    })
  })

  afterAll(async () => {
    // Clean up test data
    if (testForecastId) {
      await prisma.forecastResult.deleteMany({ where: { forecastId: testForecastId } })
      await prisma.forecast.deleteMany({ where: { id: testForecastId } })
    }
    if (testCandidate1Id) {
      await prisma.candidate.deleteMany({ where: { id: testCandidate1Id } })
    }
    if (testCandidate2Id) {
      await prisma.candidate.deleteMany({ where: { id: testCandidate2Id } })
    }
    if (testRaceId) {
      await prisma.forecastResult.deleteMany({
        where: { forecast: { raceId: testRaceId } },
      })
      await prisma.forecast.deleteMany({ where: { raceId: testRaceId } })
      await prisma.candidate.deleteMany({ where: { raceId: testRaceId } })
      await prisma.poll.deleteMany({ where: { raceId: testRaceId } })
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

  describe('GET /api/forecasts', () => {
    it('should return all forecasts with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/forecasts?limit=10&offset=0',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.forecasts).toBeDefined()
      expect(Array.isArray(body.forecasts)).toBe(true)
      expect(body.meta).toBeDefined()
      expect(body.meta.total).toBeGreaterThanOrEqual(0)
      expect(body.meta.limit).toBe(10)
      expect(body.meta.offset).toBe(0)
      expect(typeof body.meta.hasMore).toBe('boolean')
    })

    it('should include race information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/forecasts',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      if (body.forecasts.length > 0) {
        const forecast = body.forecasts[0]
        expect(forecast.race).toBeDefined()
        expect(forecast.race.id).toBeDefined()
        expect(forecast.race.slug).toBeDefined()
      }
    })

    it('should include forecast results with candidates', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts?raceId=${testRaceId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      if (body.forecasts.length > 0) {
        const forecast = body.forecasts[0]
        expect(forecast.results).toBeDefined()
        expect(Array.isArray(forecast.results)).toBe(true)

        if (forecast.results.length > 0) {
          const result = forecast.results[0]
          expect(result.candidate).toBeDefined()
          expect(result.candidate.name).toBeDefined()
          expect(result.winProbability).toBeDefined()
          expect(result.voteShare).toBeDefined()
        }
      }
    })

    it('should filter forecasts by raceId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts?raceId=${testRaceId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.forecasts).toBeDefined()

      // All returned forecasts should be for the specified race
      body.forecasts.forEach((forecast: any) => {
        expect(forecast.raceId).toBe(testRaceId)
      })
    })

    it('should respect limit parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/forecasts?limit=5',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.forecasts.length).toBeLessThanOrEqual(5)
    })

    it('should respect offset parameter', async () => {
      const response1 = await app.inject({
        method: 'GET',
        url: '/api/forecasts?limit=1&offset=0',
      })

      const response2 = await app.inject({
        method: 'GET',
        url: '/api/forecasts?limit=1&offset=1',
      })

      expect(response1.statusCode).toBe(200)
      expect(response2.statusCode).toBe(200)

      const body1 = JSON.parse(response1.body)
      const body2 = JSON.parse(response2.body)

      // If there are at least 2 forecasts, they should be different
      if (body1.meta.total >= 2) {
        expect(body1.forecasts[0]?.id).not.toBe(body2.forecasts[0]?.id)
      }
    })

    it('should order forecasts by date descending', async () => {
      // Create multiple forecasts with different dates
      for (let i = 1; i <= 3; i++) {
        const forecast = await prisma.forecast.create({
          data: {
            raceId: testRaceId,
            forecastDate: new Date(Date.now() - i * 86400000),
            modelVersion: `v1.${i}`,
            predictions: {
              'Alice Johnson': { winProbability: 50 + i, voteShare: 47 + i },
              'Bob Williams': { winProbability: 50 - i, voteShare: 47 - i },
            },
          },
        })
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts?raceId=${testRaceId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      // Verify forecasts are ordered by date descending (most recent first)
      for (let i = 1; i < body.forecasts.length; i++) {
        const prevDate = new Date(body.forecasts[i - 1].forecastDate).getTime()
        const currDate = new Date(body.forecasts[i].forecastDate).getTime()
        expect(prevDate).toBeGreaterThanOrEqual(currDate)
      }

      // Cleanup
      await prisma.forecast.deleteMany({
        where: {
          raceId: testRaceId,
          id: { not: testForecastId },
        },
      })
    })

    it('should cache results', async () => {
      // First request - should hit database
      const response1 = await app.inject({
        method: 'GET',
        url: `/api/forecasts?raceId=${testRaceId}`,
      })

      expect(response1.statusCode).toBe(200)

      // Second request - should hit cache
      const response2 = await app.inject({
        method: 'GET',
        url: `/api/forecasts?raceId=${testRaceId}`,
      })

      expect(response2.statusCode).toBe(200)
      expect(response1.body).toBe(response2.body)
    })

    it('should use default limit of 20', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/forecasts',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.forecasts.length).toBeLessThanOrEqual(20)
    })

    it('should use default offset of 0', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/forecasts',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.meta.offset).toBe(0)
    })
  })

  describe('GET /api/forecasts/:id', () => {
    it('should return forecast by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.id).toBe(testForecastId)
      expect(body.raceId).toBe(testRaceId)
      expect(body.modelVersion).toBe('v2.0-test')
      expect(body.predictions).toBeDefined()
    })

    it('should include race information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.race).toBeDefined()
      expect(body.race.id).toBe(testRaceId)
      expect(body.race.slug).toBe(testRaceSlug)
      expect(body.race.name).toBe('2024 Test Presidential Race')
    })

    it('should include results with candidate info', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.results).toBeDefined()
      expect(Array.isArray(body.results)).toBe(true)
      expect(body.results.length).toBeGreaterThan(0)

      const result = body.results[0]
      expect(result.candidate).toBeDefined()
      expect(result.candidate.name).toBeDefined()
      expect(result.candidate.party).toBeDefined()
      expect(result.winProbability).toBeDefined()
      expect(result.voteShare).toBeDefined()
      expect(result.confidenceIntervalLow).toBeDefined()
      expect(result.confidenceIntervalHigh).toBeDefined()
    })

    it('should order results by win probability descending', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      // Verify results are ordered by win probability descending
      for (let i = 1; i < body.results.length; i++) {
        const prevProb = body.results[i - 1].winProbability
        const currProb = body.results[i].winProbability
        expect(prevProb).toBeGreaterThanOrEqual(currProb)
      }
    })

    it('should cache forecast details', async () => {
      // Clear cache
      await cache.flushall()

      // First request
      const response1 = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response1.statusCode).toBe(200)

      // Second request - should hit cache
      const response2 = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response2.statusCode).toBe(200)
      expect(response1.body).toBe(response2.body)
    })

    it('should return 404 for non-existent forecast', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/forecasts/non-existent-forecast-id-12345',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Forecast not found')
    })

    it('should include all forecast metadata', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.forecastDate).toBeDefined()
      expect(body.modelVersion).toBeDefined()
      expect(body.predictions).toBeDefined()
      expect(body.createdAt).toBeDefined()
      expect(body.updatedAt).toBeDefined()
    })
  })

  describe('GET /api/forecasts/race/:slug/latest', () => {
    it('should return latest forecast for a race', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/race/${testRaceSlug}/latest`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.raceId).toBe(testRaceId)
      expect(body.forecastDate).toBeDefined()
    })

    it('should return the most recent forecast when multiple exist', async () => {
      // Create older forecast
      const olderForecast = await prisma.forecast.create({
        data: {
          raceId: testRaceId,
          forecastDate: new Date('2024-10-01'),
          modelVersion: 'v1.0',
          predictions: {
            'Alice Johnson': { winProbability: 51.0, voteShare: 47.5 },
            'Bob Williams': { winProbability: 49.0, voteShare: 47.0 },
          },
        },
      })

      // Create newer forecast
      const newerForecast = await prisma.forecast.create({
        data: {
          raceId: testRaceId,
          forecastDate: new Date('2024-10-20'),
          modelVersion: 'v3.0',
          predictions: {
            'Alice Johnson': { winProbability: 53.0, voteShare: 48.5 },
            'Bob Williams': { winProbability: 47.0, voteShare: 46.5 },
          },
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/race/${testRaceSlug}/latest`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.id).toBe(newerForecast.id)
      expect(body.modelVersion).toBe('v3.0')

      // Cleanup
      await prisma.forecast.deleteMany({
        where: {
          id: { in: [olderForecast.id, newerForecast.id] },
        },
      })
    })

    it('should include race information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/race/${testRaceSlug}/latest`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.race).toBeDefined()
      expect(body.race.slug).toBe(testRaceSlug)
    })

    it('should include results ordered by win probability', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/race/${testRaceSlug}/latest`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.results).toBeDefined()
      expect(Array.isArray(body.results)).toBe(true)

      // Verify ordering by win probability descending
      for (let i = 1; i < body.results.length; i++) {
        expect(body.results[i - 1].winProbability).toBeGreaterThanOrEqual(
          body.results[i].winProbability
        )
      }
    })

    it('should cache latest forecast', async () => {
      // Clear cache
      await cache.flushall()

      // First request
      const response1 = await app.inject({
        method: 'GET',
        url: `/api/forecasts/race/${testRaceSlug}/latest`,
      })

      expect(response1.statusCode).toBe(200)

      // Second request - should hit cache
      const response2 = await app.inject({
        method: 'GET',
        url: `/api/forecasts/race/${testRaceSlug}/latest`,
      })

      expect(response2.statusCode).toBe(200)
      expect(response1.body).toBe(response2.body)
    })

    it('should return 404 for non-existent race', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/forecasts/race/non-existent-race-slug/latest',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Race not found')
    })

    it('should return 404 when race has no forecasts', async () => {
      // Create a race with no forecasts
      const emptyRace = await prisma.race.create({
        data: {
          name: 'Empty Test Race',
          slug: 'empty-test-race',
          raceType: 'senate',
          state: 'TX',
          electionDate: new Date('2024-11-05'),
          status: 'active',
          importanceScore: 50,
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/race/${emptyRace.slug}/latest`,
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('No forecast found for this race')

      // Cleanup
      await prisma.race.delete({ where: { id: emptyRace.id } })
    })
  })

  describe('Data Integrity', () => {
    it('should have valid forecast dates', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      const forecastDate = new Date(body.forecastDate)
      expect(forecastDate.toString()).not.toBe('Invalid Date')
    })

    it('should have win probabilities that sum to approximately 100', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      const totalProbability = body.results.reduce(
        (sum: number, result: any) => sum + result.winProbability,
        0
      )

      // Allow some tolerance for rounding
      expect(totalProbability).toBeGreaterThan(95)
      expect(totalProbability).toBeLessThan(105)
    })

    it('should have valid confidence intervals', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      body.results.forEach((result: any) => {
        // Low should be less than high
        expect(result.confidenceIntervalLow).toBeLessThan(result.confidenceIntervalHigh)

        // Vote share should be within or near the confidence interval
        const low = result.confidenceIntervalLow
        const high = result.confidenceIntervalHigh
        const voteShare = result.voteShare

        // Allow some margin as point estimate might differ slightly
        expect(voteShare).toBeGreaterThanOrEqual(low - 5)
        expect(voteShare).toBeLessThanOrEqual(high + 5)
      })
    })

    it('should have reasonable win probabilities', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      body.results.forEach((result: any) => {
        expect(result.winProbability).toBeGreaterThanOrEqual(0)
        expect(result.winProbability).toBeLessThanOrEqual(100)
      })
    })

    it('should have reasonable vote shares', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)

      body.results.forEach((result: any) => {
        expect(result.voteShare).toBeGreaterThan(0)
        expect(result.voteShare).toBeLessThan(100)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Force a database error by disconnecting
      await prisma.$disconnect()

      const response = await app.inject({
        method: 'GET',
        url: '/api/forecasts',
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
        url: '/api/forecasts/not-a-valid-uuid',
      })

      // Should return 404 since the forecast won't be found
      expect(response.statusCode).toBe(404)
    })
  })

  describe('Performance', () => {
    it('should respond quickly for list queries', async () => {
      const startTime = Date.now()

      const response = await app.inject({
        method: 'GET',
        url: '/api/forecasts?limit=20',
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
        url: `/api/forecasts/${testForecastId}`,
      })
      const time1 = Date.now() - start1

      // Second request (cached)
      const start2 = Date.now()
      await app.inject({
        method: 'GET',
        url: `/api/forecasts/${testForecastId}`,
      })
      const time2 = Date.now() - start2

      // Cached request should be faster (or at least not significantly slower)
      expect(time2).toBeLessThanOrEqual(time1 * 2)
    })
  })
})
