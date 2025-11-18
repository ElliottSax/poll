import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { cache } from '../utils/redis'

const getPollsQuerySchema = z.object({
  raceId: z.string().optional(),
  pollsterId: z.string().optional(),
  limit: z.string().transform(Number).default('50'),
  offset: z.string().transform(Number).default('0'),
})

export async function pollsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Get all polls with filtering
  fastify.get('/', {
    schema: {
      description: 'Get all polls with optional filtering',
      tags: ['polls'],
      querystring: {
        type: 'object',
        properties: {
          raceId: { type: 'string' },
          pollsterId: { type: 'string' },
          limit: { type: 'number' },
          offset: { type: 'number' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const query = getPollsQuerySchema.parse(request.query)

        const where: any = {}
        if (query.raceId) where.raceId = query.raceId
        if (query.pollsterId) where.pollsterId = query.pollsterId

        const cacheKey = `polls:${JSON.stringify(where)}:${query.limit}:${query.offset}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const [polls, total] = await Promise.all([
          prisma.poll.findMany({
            where,
            take: query.limit,
            skip: query.offset,
            orderBy: { pollDate: 'desc' },
            include: {
              pollster: true,
              race: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                },
              },
            },
          }),
          prisma.poll.count({ where }),
        ])

        const response = {
          polls,
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

  // Get poll by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get a single poll by ID',
      tags: ['polls'],
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

        const cacheKey = `poll:${id}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const poll = await prisma.poll.findUnique({
          where: { id },
          include: {
            pollster: true,
            race: true,
          },
        })

        if (!poll) {
          return reply.code(404).send({ error: 'Poll not found' })
        }

        await cache.set(cacheKey, poll, 300)

        return reply.send(poll)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })
}
