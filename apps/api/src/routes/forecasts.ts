import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { cache } from '../utils/redis'

const getForecastsQuerySchema = z.object({
  raceId: z.string().optional(),
  limit: z.string().transform(Number).default('20'),
  offset: z.string().transform(Number).default('0'),
})

export async function forecastsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Get all forecasts
  fastify.get('/', {
    schema: {
      description: 'Get all forecasts with optional filtering',
      tags: ['forecasts'],
      querystring: {
        type: 'object',
        properties: {
          raceId: { type: 'string' },
          limit: { type: 'number' },
          offset: { type: 'number' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const query = getForecastsQuerySchema.parse(request.query)

        const where: any = {}
        if (query.raceId) where.raceId = query.raceId

        const cacheKey = `forecasts:${JSON.stringify(where)}:${query.limit}:${query.offset}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const [forecasts, total] = await Promise.all([
          prisma.forecast.findMany({
            where,
            take: query.limit,
            skip: query.offset,
            orderBy: { forecastDate: 'desc' },
            include: {
              race: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                },
              },
              results: {
                include: {
                  candidate: true,
                },
              },
            },
          }),
          prisma.forecast.count({ where }),
        ])

        const response = {
          forecasts,
          meta: {
            total,
            limit: query.limit,
            offset: query.offset,
            hasMore: total > query.offset + query.limit,
          },
        }

        await cache.set(cacheKey, response, 300)

        return reply.send(response)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get forecast by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get a single forecast by ID',
      tags: ['forecasts'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string }

        const cacheKey = `forecast:${id}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const forecast = await prisma.forecast.findUnique({
          where: { id },
          include: {
            race: true,
            results: {
              include: {
                candidate: true,
              },
              orderBy: {
                winProbability: 'desc',
              },
            },
          },
        })

        if (!forecast) {
          return reply.code(404).send({ error: 'Forecast not found' })
        }

        await cache.set(cacheKey, forecast, 300)

        return reply.send(forecast)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get latest forecast for a race
  fastify.get('/race/:slug/latest', {
    schema: {
      description: 'Get the latest forecast for a specific race',
      tags: ['forecasts'],
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
    },
    handler: async (request, reply) => {
      try {
        const { slug } = request.params as { slug: string }

        const cacheKey = `forecast:race:${slug}:latest`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        // First get the race
        const race = await prisma.race.findUnique({
          where: { slug },
          select: { id: true },
        })

        if (!race) {
          return reply.code(404).send({ error: 'Race not found' })
        }

        // Get latest forecast for this race
        const forecast = await prisma.forecast.findFirst({
          where: { raceId: race.id },
          orderBy: { forecastDate: 'desc' },
          include: {
            race: true,
            results: {
              include: {
                candidate: true,
              },
              orderBy: {
                winProbability: 'desc',
              },
            },
          },
        })

        if (!forecast) {
          return reply.code(404).send({ error: 'No forecast found for this race' })
        }

        await cache.set(cacheKey, forecast, 300)

        return reply.send(forecast)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })
}
