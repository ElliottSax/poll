import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { cache } from '../utils/redis'

const getRacesQuerySchema = z.object({
  type: z.enum(['president', 'senate', 'house', 'governor', 'mayor']).optional(),
  state: z.string().length(2).optional(),
  status: z.enum(['upcoming', 'active', 'completed']).optional(),
  limit: z.string().transform(Number).default('20'),
  offset: z.string().transform(Number).default('0'),
})

export async function racesRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Get all races
  fastify.get('/', {
    schema: {
      description: 'Get all races with optional filtering',
      tags: ['races'],
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          state: { type: 'string' },
          status: { type: 'string' },
          limit: { type: 'number' },
          offset: { type: 'number' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const query = getRacesQuerySchema.parse(request.query)

        // Build where clause
        const where: any = {}
        if (query.type) where.raceType = query.type
        if (query.state) where.state = query.state
        if (query.status) where.status = query.status

        // Try cache first
        const cacheKey = `races:${JSON.stringify(where)}:${query.limit}:${query.offset}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        // Get races from database
        const [races, total] = await Promise.all([
          prisma.race.findMany({
            where,
            take: query.limit,
            skip: query.offset,
            orderBy: [
              { importanceScore: 'desc' },
              { electionDate: 'asc' },
            ],
          }),
          prisma.race.count({ where }),
        ])

        const response = {
          data: races,
          meta: {
            total,
            limit: query.limit,
            offset: query.offset,
            hasMore: total > query.offset + query.limit,
          },
        }

        // Cache for 5 minutes
        await cache.set(cacheKey, response, 300)

        return reply.send(response)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get race by slug
  fastify.get('/:slug', {
    schema: {
      description: 'Get a single race by slug',
      tags: ['races'],
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

        // Try cache first
        const cacheKey = `race:${slug}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const race = await prisma.race.findUnique({
          where: { slug },
          include: {
            polls: {
              take: 10,
              orderBy: { pollDate: 'desc' },
              include: {
                pollster: true,
              },
            },
            forecasts: {
              take: 1,
              orderBy: { forecastDate: 'desc' },
            },
          },
        })

        if (!race) {
          return reply.code(404).send({ error: 'Race not found' })
        }

        // Cache for 5 minutes
        await cache.set(cacheKey, race, 300)

        return reply.send(race)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })
}
