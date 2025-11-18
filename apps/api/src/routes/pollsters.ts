import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { cache } from '../utils/redis'

const getPollstersQuerySchema = z.object({
  grade: z.string().optional(),
  partisanLean: z.string().optional(),
  limit: z.string().transform(Number).default('50'),
  offset: z.string().transform(Number).default('0'),
})

export async function pollstersRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Get all pollsters
  fastify.get('/', {
    schema: {
      description: 'Get all pollsters with optional filtering',
      tags: ['pollsters'],
      querystring: {
        type: 'object',
        properties: {
          grade: { type: 'string' },
          partisanLean: { type: 'string' },
          limit: { type: 'number' },
          offset: { type: 'number' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const query = getPollstersQuerySchema.parse(request.query)

        const where: any = {}
        if (query.grade) where.grade = query.grade
        if (query.partisanLean) where.partisanLean = query.partisanLean

        const cacheKey = `pollsters:${JSON.stringify(where)}:${query.limit}:${query.offset}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const [pollsters, total] = await Promise.all([
          prisma.pollster.findMany({
            where,
            take: query.limit,
            skip: query.offset,
            orderBy: [
              { grade: 'asc' },
              { name: 'asc' },
            ],
          }),
          prisma.pollster.count({ where }),
        ])

        const response = {
          pollsters,
          meta: {
            total,
            limit: query.limit,
            offset: query.offset,
            hasMore: total > query.offset + query.limit,
          },
        }

        await cache.set(cacheKey, response, 600) // Cache for 10 minutes

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

        const cacheKey = `pollster:${slug}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const pollster = await prisma.pollster.findUnique({
          where: { slug },
          include: {
            polls: {
              take: 10,
              orderBy: { pollDate: 'desc' },
              include: {
                race: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                  },
                },
              },
            },
          },
        })

        if (!pollster) {
          return reply.code(404).send({ error: 'Pollster not found' })
        }

        await cache.set(cacheKey, pollster, 600)

        return reply.send(pollster)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })
}
