import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { cache } from '../utils/redis'
import { ValidationError } from '../middleware/errorHandler'

const getPollsQuerySchema = z.object({
  raceId: z.string().uuid().optional(),
  pollsterId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  methodology: z.enum(['phone', 'online', 'ivr', 'sms', 'mixed']).optional(),
  limit: z.string().transform(Number).default('20'),
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
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          methodology: { type: 'string' },
          limit: { type: 'number' },
          offset: { type: 'number' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const query = getPollsQuerySchema.parse(request.query)

        // Build where clause
        const where = {
          ...(query.raceId && { raceId: query.raceId }),
          ...(query.pollsterId && { pollsterId: query.pollsterId }),
          ...(query.methodology && { methodology: query.methodology }),
          ...((query.startDate || query.endDate) && {
            pollDate: {
              ...(query.startDate && { gte: new Date(query.startDate) }),
              ...(query.endDate && { lte: new Date(query.endDate) }),
            },
          }),
        }

        // Try cache first
        const cacheKey = `polls:${JSON.stringify(where)}:${query.limit}:${query.offset}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        // Get polls from database
        const [polls, total] = await Promise.all([
          prisma.poll.findMany({
            where,
            take: query.limit,
            skip: query.offset,
            orderBy: { pollDate: 'desc' },
            include: {
              race: {
                select: {
                  id: true,
                  slug: true,
                  raceName: true,
                  raceType: true,
                  state: true,
                },
              },
              pollster: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  methodologyGrade: true,
                  overallAccuracy: true,
                },
              },
            },
          }),
          prisma.poll.count({ where }),
        ])

        const response = {
          data: polls,
          meta: {
            total,
            limit: query.limit,
            offset: query.offset,
            hasMore: total > query.offset + query.limit,
          },
        }

        // Cache for 3 minutes
        await cache.set(cacheKey, response, 180)

        return reply.send(response)
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new ValidationError(error.errors.map(e => e.message).join(', '))
        }
        throw error
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
      const { id } = request.params as { id: string }

      // Try cache first
      const cacheKey = `poll:${id}`
      const cached = await cache.get(cacheKey)
      if (cached) {
        return reply.send(cached)
      }

      const poll = await prisma.poll.findUnique({
        where: { id },
        include: {
          race: true,
          pollster: true,
        },
      })

      if (!poll) {
        return reply.code(404).send({ error: 'Poll not found' })
      }

      // Cache for 10 minutes
      await cache.set(cacheKey, poll, 600)

      return reply.send(poll)
    },
  })

  // Get polls for a specific race
  fastify.get('/race/:raceId', {
    schema: {
      description: 'Get all polls for a specific race',
      tags: ['polls'],
      params: {
        type: 'object',
        properties: {
          raceId: { type: 'string' },
        },
        required: ['raceId'],
      },
    },
    handler: async (request, reply) => {
      const { raceId } = request.params as { raceId: string }
      const { limit = 50 } = request.query as { limit?: number }

      // Try cache first
      const cacheKey = `polls:race:${raceId}:${limit}`
      const cached = await cache.get(cacheKey)
      if (cached) {
        return reply.send(cached)
      }

      const polls = await prisma.poll.findMany({
        where: { raceId },
        take: limit,
        orderBy: { pollDate: 'desc' },
        include: {
          pollster: {
            select: {
              name: true,
              slug: true,
              methodologyGrade: true,
            },
          },
        },
      })

      // Cache for 5 minutes
      await cache.set(cacheKey, polls, 300)

      return reply.send(polls)
    },
  })

  // Get polling history for charts (optimized for time series)
  fastify.get('/history/:raceSlug', {
    schema: {
      description: 'Get polling history for a race (optimized for charts)',
      tags: ['polls'],
      params: {
        type: 'object',
        properties: {
          raceSlug: { type: 'string' },
        },
        required: ['raceSlug'],
      },
      querystring: {
        type: 'object',
        properties: {
          days: { type: 'number', default: 90 },
        },
      },
    },
    handler: async (request, reply) => {
      const { raceSlug } = request.params as { raceSlug: string }
      const { days = 90 } = request.query as { days?: number }

      // Try cache first
      const cacheKey = `polls:history:${raceSlug}:${days}`
      const cached = await cache.get(cacheKey)
      if (cached) {
        return reply.send(cached)
      }

      // Get race by slug
      const race = await prisma.race.findUnique({
        where: { slug: raceSlug },
        include: {
          candidates: {
            select: {
              id: true,
              name: true,
              party: true,
            },
          },
        },
      })

      if (!race) {
        return reply.code(404).send({ error: 'Race not found' })
      }

      // Get polls within date range
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const polls = await prisma.poll.findMany({
        where: {
          raceId: race.id,
          pollDate: { gte: startDate },
        },
        orderBy: { pollDate: 'asc' },
        include: {
          pollster: {
            select: {
              id: true,
              name: true,
              methodologyGrade: true,
            },
          },
        },
      })

      // Transform data for chart consumption
      const chartData = polls.map((poll) => ({
        id: poll.id,
        date: poll.pollDate.toISOString().split('T')[0],
        pollster: poll.pollster.name,
        pollsterGrade: poll.pollster.methodologyGrade,
        sampleSize: poll.sampleSize,
        marginOfError: poll.marginOfError,
        methodology: poll.methodology,
        results: poll.results as Record<string, number>,
        sourceUrl: poll.sourceUrl,
      }))

      // Calculate aggregate stats
      const candidateColors: Record<string, string> = {
        D: '#3B82F6',
        R: '#EF4444',
        I: '#10B981',
      }

      const response = {
        race: {
          id: race.id,
          slug: race.slug,
          name: race.raceName,
          type: race.raceType,
          state: race.state,
          electionDate: race.electionDate,
        },
        candidates: race.candidates.map((c) => ({
          name: c.name,
          party: c.party,
          color: candidateColors[c.party] || '#6B7280',
        })),
        polls: chartData,
        meta: {
          totalPolls: polls.length,
          dateRange: {
            start: polls[0]?.pollDate.toISOString().split('T')[0] || null,
            end: polls[polls.length - 1]?.pollDate.toISOString().split('T')[0] || null,
          },
          pollsters: [...new Set(polls.map((p) => p.pollster.name))],
        },
      }

      // Cache for 5 minutes
      await cache.set(cacheKey, response, 300)

      return reply.send(response)
    },
  })

  // Get recent polls (homepage)
  fastify.get('/recent', {
    schema: {
      description: 'Get most recent polls across all races',
      tags: ['polls'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 10 },
        },
      },
    },
    handler: async (request, reply) => {
      const { limit = 10 } = request.query as { limit?: number }

      // Try cache first
      const cacheKey = `polls:recent:${limit}`
      const cached = await cache.get(cacheKey)
      if (cached) {
        return reply.send(cached)
      }

      const polls = await prisma.poll.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          race: {
            select: {
              slug: true,
              raceName: true,
              raceType: true,
              state: true,
            },
          },
          pollster: {
            select: {
              name: true,
              slug: true,
              methodologyGrade: true,
            },
          },
        },
      })

      // Cache for 2 minutes
      await cache.set(cacheKey, polls, 120)

      return reply.send(polls)
    },
  })
}
