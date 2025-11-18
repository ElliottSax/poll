import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { cache } from '../utils/redis'

const getCandidatesQuerySchema = z.object({
  party: z.string().optional(),
  raceId: z.string().optional(),
  search: z.string().optional(),
  limit: z.string().transform(Number).default('50'),
  offset: z.string().transform(Number).default('0'),
})

const createCandidateSchema = z.object({
  name: z.string().min(1),
  party: z.string().min(1),
  photoUrl: z.string().url().optional(),
  bio: z.string().optional(),
})

const updateCandidateSchema = z.object({
  name: z.string().min(1).optional(),
  party: z.string().optional(),
  photoUrl: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
})

export async function candidatesRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Get all candidates
  fastify.get('/', {
    schema: {
      description: 'Get all candidates with optional filtering',
      tags: ['candidates'],
      querystring: {
        type: 'object',
        properties: {
          party: { type: 'string' },
          raceId: { type: 'string' },
          search: { type: 'string' },
          limit: { type: 'number' },
          offset: { type: 'number' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const query = getCandidatesQuerySchema.parse(request.query)

        const where: any = {}
        if (query.party) where.party = query.party
        if (query.search) {
          where.name = {
            contains: query.search,
            mode: 'insensitive',
          }
        }
        if (query.raceId) {
          where.results = {
            some: {
              raceId: query.raceId,
            },
          }
        }

        const cacheKey = `candidates:${JSON.stringify(where)}:${query.limit}:${query.offset}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const [candidates, total] = await Promise.all([
          prisma.candidate.findMany({
            where,
            take: query.limit,
            skip: query.offset,
            orderBy: { name: 'asc' },
          }),
          prisma.candidate.count({ where }),
        ])

        const response = {
          candidates,
          meta: {
            total,
            limit: query.limit,
            offset: query.offset,
          },
        }

        await cache.set(cacheKey, response, 300) // 5 minutes TTL
        return reply.send(response)
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({
          error: 'Failed to fetch candidates',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
  })

  // Get single candidate by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get a single candidate by ID',
      tags: ['candidates'],
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

        const cacheKey = `candidate:${id}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const candidate = await prisma.candidate.findUnique({
          where: { id },
          include: {
            results: {
              include: {
                race: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                    type: true,
                  },
                },
              },
            },
          },
        })

        if (!candidate) {
          return reply.status(404).send({ error: 'Candidate not found' })
        }

        await cache.set(cacheKey, candidate, 300) // 5 minutes TTL
        return reply.send(candidate)
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({
          error: 'Failed to fetch candidate',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
  })

  // Create new candidate
  fastify.post('/', {
    schema: {
      description: 'Create a new candidate',
      tags: ['candidates'],
      body: {
        type: 'object',
        required: ['name', 'party'],
        properties: {
          name: { type: 'string' },
          party: { type: 'string' },
          photoUrl: { type: 'string' },
          bio: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const data = createCandidateSchema.parse(request.body)

        const candidate = await prisma.candidate.create({
          data,
        })

        // Invalidate cache
        await cache.del('candidates:*')

        return reply.status(201).send(candidate)
      } catch (error) {
        fastify.log.error(error)
        return reply.status(400).send({
          error: 'Failed to create candidate',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
  })

  // Update candidate
  fastify.patch('/:id', {
    schema: {
      description: 'Update an existing candidate',
      tags: ['candidates'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          party: { type: 'string' },
          photoUrl: { type: 'string' },
          bio: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const data = updateCandidateSchema.parse(request.body)

        const candidate = await prisma.candidate.update({
          where: { id },
          data,
        })

        // Invalidate cache
        await cache.del(`candidate:${id}`)
        await cache.del('candidates:*')

        return reply.send(candidate)
      } catch (error) {
        fastify.log.error(error)
        if (error instanceof Error && error.message.includes('Record to update not found')) {
          return reply.status(404).send({ error: 'Candidate not found' })
        }
        return reply.status(400).send({
          error: 'Failed to update candidate',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
  })

  // Delete candidate
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a candidate',
      tags: ['candidates'],
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

        await prisma.candidate.delete({
          where: { id },
        })

        // Invalidate cache
        await cache.del(`candidate:${id}`)
        await cache.del('candidates:*')

        return reply.status(204).send()
      } catch (error) {
        fastify.log.error(error)
        if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
          return reply.status(404).send({ error: 'Candidate not found' })
        }
        return reply.status(500).send({
          error: 'Failed to delete candidate',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
  })
}
