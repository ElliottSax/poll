import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { prisma } from '../utils/prisma'
import { cache } from '../utils/redis'

export async function forecastsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Get presidential forecast
  fastify.get('/presidential', {
    schema: {
      description: 'Get the current presidential forecast',
      tags: ['forecasts'],
    },
    handler: async (request, reply) => {
      try {
        // Try cache first
        const cacheKey = 'forecast:presidential:latest'
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        // Get the latest presidential forecast
        const presidentialRace = await prisma.race.findFirst({
          where: { raceType: 'president' },
          orderBy: { electionDate: 'desc' },
        })

        if (!presidentialRace) {
          return reply.code(404).send({ error: 'Presidential race not found' })
        }

        const forecast = await prisma.forecast.findFirst({
          where: { raceId: presidentialRace.id },
          orderBy: { forecastDate: 'desc' },
        })

        if (!forecast) {
          return reply.code(404).send({ error: 'No forecast available yet' })
        }

        const response = {
          ...forecast,
          race: {
            id: presidentialRace.id,
            slug: presidentialRace.slug,
            name: presidentialRace.raceName,
            electionDate: presidentialRace.electionDate,
          },
        }

        // Cache for 10 minutes
        await cache.set(cacheKey, response, 600)

        return reply.send(response)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get Senate forecast
  fastify.get('/senate', {
    schema: {
      description: 'Get the current Senate control forecast',
      tags: ['forecasts'],
    },
    handler: async (request, reply) => {
      try {
        // Try cache first
        const cacheKey = 'forecast:senate:latest'
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        // Get all Senate races
        const senateRaces = await prisma.race.findMany({
          where: { raceType: 'senate', status: 'active' },
          include: {
            forecasts: {
              take: 1,
              orderBy: { forecastDate: 'desc' },
            },
          },
        })

        // Calculate Senate control probabilities
        // This is a simplified version - the real calculation would be more complex
        const response = {
          lastUpdated: new Date().toISOString(),
          seats: {
            D: 50, // Placeholder
            R: 50, // Placeholder
          },
          probabilities: {
            D_control: 0.52,
            R_control: 0.48,
          },
          races: senateRaces.map((race) => ({
            id: race.id,
            slug: race.slug,
            name: race.raceName,
            state: race.state,
            forecast: race.forecasts[0] || null,
          })),
        }

        // Cache for 10 minutes
        await cache.set(cacheKey, response, 600)

        return reply.send(response)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get House forecast
  fastify.get('/house', {
    schema: {
      description: 'Get the current House control forecast',
      tags: ['forecasts'],
    },
    handler: async (request, reply) => {
      try {
        // Try cache first
        const cacheKey = 'forecast:house:latest'
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        // Get competitive House races
        const houseRaces = await prisma.race.findMany({
          where: {
            raceType: 'house',
            status: 'active',
            competitiveRating: {
              in: ['tossup', 'lean_d', 'lean_r'],
            },
          },
          include: {
            forecasts: {
              take: 1,
              orderBy: { forecastDate: 'desc' },
            },
          },
        })

        // Calculate House control probabilities
        const response = {
          lastUpdated: new Date().toISOString(),
          seats: {
            D: 212, // Placeholder
            R: 223, // Placeholder
          },
          probabilities: {
            D_control: 0.42,
            R_control: 0.58,
          },
          competitiveRaces: houseRaces.length,
          races: houseRaces.slice(0, 20).map((race) => ({
            id: race.id,
            slug: race.slug,
            name: race.raceName,
            district: race.district,
            forecast: race.forecasts[0] || null,
          })),
        }

        // Cache for 10 minutes
        await cache.set(cacheKey, response, 600)

        return reply.send(response)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get forecast for a specific race
  fastify.get('/race/:raceId', {
    schema: {
      description: 'Get the forecast for a specific race',
      tags: ['forecasts'],
      params: {
        type: 'object',
        properties: {
          raceId: { type: 'string' },
        },
        required: ['raceId'],
      },
    },
    handler: async (request, reply) => {
      try {
        const { raceId } = request.params as { raceId: string }

        // Try cache first
        const cacheKey = `forecast:race:${raceId}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const forecast = await prisma.forecast.findFirst({
          where: { raceId },
          orderBy: { forecastDate: 'desc' },
          include: {
            race: {
              select: {
                id: true,
                slug: true,
                raceName: true,
                raceType: true,
                state: true,
                electionDate: true,
              },
            },
          },
        })

        if (!forecast) {
          return reply.code(404).send({ error: 'No forecast available for this race' })
        }

        // Cache for 10 minutes
        await cache.set(cacheKey, forecast, 600)

        return reply.send(forecast)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get forecast history for a race
  fastify.get('/race/:raceId/history', {
    schema: {
      description: 'Get forecast history for a specific race',
      tags: ['forecasts'],
      params: {
        type: 'object',
        properties: {
          raceId: { type: 'string' },
        },
        required: ['raceId'],
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 30 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { raceId } = request.params as { raceId: string }
        const { limit = 30 } = request.query as { limit?: number }

        // Try cache first
        const cacheKey = `forecast:race:${raceId}:history:${limit}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const forecasts = await prisma.forecast.findMany({
          where: { raceId },
          take: limit,
          orderBy: { forecastDate: 'desc' },
        })

        // Cache for 30 minutes
        await cache.set(cacheKey, forecasts, 1800)

        return reply.send(forecasts)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })
}
