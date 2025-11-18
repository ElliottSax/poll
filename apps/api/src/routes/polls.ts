/**
 * Poll Routes
 *
 * GET /api/polls - List all polls
 * GET /api/polls/:id - Get poll by ID
 */

import { FastifyInstance } from 'fastify'
import { prisma, PollMethodology, PopulationType } from '@poll/database'
import { z } from 'zod'

const listPollsSchema = z.object({
  methodology: z.nativeEnum(PollMethodology).optional(),
  populationType: z.nativeEnum(PopulationType).optional(),
  pollsterId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

const getPollSchema = z.object({
  id: z.string().uuid(),
})

export async function pollRoutes(server: FastifyInstance) {
  // ============================================
  // GET /api/polls - List all polls
  // ============================================
  server.get('/', {
    schema: {
      tags: ['polls'],
      description: 'List all polls with optional filtering',
      querystring: {
        type: 'object',
        properties: {
          methodology: { type: 'string', enum: Object.values(PollMethodology) },
          populationType: { type: 'string', enum: Object.values(PopulationType) },
          pollsterId: { type: 'string', format: 'uuid' },
          fromDate: { type: 'string', format: 'date' },
          toDate: { type: 'string', format: 'date' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            polls: { type: 'array' },
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const query = listPollsSchema.parse(request.query)

    const where: any = {}
    if (query.methodology) where.methodology = query.methodology
    if (query.populationType) where.populationType = query.populationType
    if (query.pollsterId) where.pollsterId = query.pollsterId
    if (query.fromDate || query.toDate) {
      where.pollDate = {}
      if (query.fromDate) where.pollDate.gte = query.fromDate
      if (query.toDate) where.pollDate.lte = query.toDate
    }

    const [polls, total] = await Promise.all([
      prisma.poll.findMany({
        where,
        include: {
          race: {
            select: {
              id: true,
              raceName: true,
              slug: true,
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
            },
          },
        },
        orderBy: { pollDate: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.poll.count({ where }),
    ])

    return {
      polls,
      total,
      limit: query.limit,
      offset: query.offset,
    }
  })

  // ============================================
  // GET /api/polls/:id - Get poll by ID
  // ============================================
  server.get('/:id', {
    schema: {
      tags: ['polls'],
      description: 'Get detailed information about a specific poll',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const params = getPollSchema.parse(request.params)

    const poll = await prisma.poll.findUnique({
      where: { id: params.id },
      include: {
        race: {
          select: {
            id: true,
            raceName: true,
            slug: true,
            raceType: true,
            state: true,
            candidates: true,
          },
        },
        pollster: true,
      },
    })

    if (!poll) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Poll with ID '${params.id}' not found`,
      })
    }

    return poll
  })
}
