import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { cache } from '../utils/redis'

const getPollstersQuerySchema = z.object({
  orderBy: z.enum(['accuracy', 'pollCount', 'grade', 'name']).default('accuracy'),
  limit: z.string().transform(Number).default('50'),
  offset: z.string().transform(Number).default('0'),
})

export async function pollstersRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Get all pollsters with rankings
  fastify.get('/', {
    schema: {
      description: 'Get all pollsters with rankings',
      tags: ['pollsters'],
      querystring: {
        type: 'object',
        properties: {
          orderBy: {
            type: 'string',
            enum: ['accuracy', 'pollCount', 'grade', 'name']
          },
          limit: { type: 'number' },
          offset: { type: 'number' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const query = getPollstersQuerySchema.parse(request.query)

        // Try cache first
        const cacheKey = `pollsters:${query.orderBy}:${query.limit}:${query.offset}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        // Determine order by
        let orderBy: any = {}
        switch (query.orderBy) {
          case 'accuracy':
            orderBy = { overallAccuracy: 'desc' }
            break
          case 'pollCount':
            orderBy = { pollCount: 'desc' }
            break
          case 'grade':
            orderBy = { methodologyGrade: 'asc' }
            break
          case 'name':
            orderBy = { name: 'asc' }
            break
        }

        // Get pollsters from database
        const [pollsters, total] = await Promise.all([
          prisma.pollster.findMany({
            take: query.limit,
            skip: query.offset,
            orderBy,
          }),
          prisma.pollster.count(),
        ])

        const response = {
          data: pollsters,
          meta: {
            total,
            limit: query.limit,
            offset: query.offset,
            hasMore: total > query.offset + query.limit,
          },
        }

        // Cache for 1 hour (pollster data doesn't change often)
        await cache.set(cacheKey, response, 3600)

        return reply.send(response)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get pollster by slug
  fastify.get('/:slug', {
    schema: {
      description: 'Get a single pollster by slug',
      tags: ['pollsters'],
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
        const cacheKey = `pollster:${slug}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const pollster = await prisma.pollster.findUnique({
          where: { slug },
          include: {
            polls: {
              take: 20,
              orderBy: { pollDate: 'desc' },
              include: {
                race: {
                  select: {
                    slug: true,
                    raceName: true,
                    raceType: true,
                    state: true,
                  },
                },
              },
            },
          },
        })

        if (!pollster) {
          return reply.code(404).send({ error: 'Pollster not found' })
        }

        // Cache for 1 hour
        await cache.set(cacheKey, pollster, 3600)

        return reply.send(pollster)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get pollster accuracy history
  fastify.get('/:slug/accuracy', {
    schema: {
      description: 'Get pollster accuracy history',
      tags: ['pollsters'],
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
        const cacheKey = `pollster:${slug}:accuracy`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const pollster = await prisma.pollster.findUnique({
          where: { slug },
          select: {
            name: true,
            slug: true,
            overallAccuracy: true,
            methodologyGrade: true,
            partisanLean: true,
            houseEffect: true,
          },
        })

        if (!pollster) {
          return reply.code(404).send({ error: 'Pollster not found' })
        }

        // TODO: Add historical accuracy data by year/race type
        const response = {
          ...pollster,
          historicalAccuracy: {
            overall: pollster.overallAccuracy,
            byYear: [], // Placeholder
            byRaceType: {}, // Placeholder
          },
        }

        // Cache for 1 hour
        await cache.set(cacheKey, response, 3600)

        return reply.send(response)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get top pollsters (for homepage/rankings)
  fastify.get('/rankings/top', {
    schema: {
      description: 'Get top-ranked pollsters',
      tags: ['pollsters'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 10 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { limit = 10 } = request.query as { limit?: number }

        // Try cache first
        const cacheKey = `pollsters:top:${limit}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const pollsters = await prisma.pollster.findMany({
          take: limit,
          orderBy: [
            { overallAccuracy: 'desc' },
            { pollCount: 'desc' },
          ],
          select: {
            name: true,
            slug: true,
            overallAccuracy: true,
            methodologyGrade: true,
            pollCount: true,
          },
        })

        // Cache for 1 hour
        await cache.set(cacheKey, pollsters, 3600)

        return reply.send(pollsters)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })
}
