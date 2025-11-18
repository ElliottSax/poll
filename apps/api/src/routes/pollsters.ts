/**
 * Pollster Routes
 *
 * GET /api/pollsters - List all pollsters
 * GET /api/pollsters/:slug - Get pollster by slug
 * GET /api/pollsters/:slug/polls - Get polls from pollster
 */

import { FastifyInstance } from 'fastify'
import { prisma } from '@poll/database'
import { z } from 'zod'

const listPollstersSchema = z.object({
  orderBy: z.enum(['name', 'accuracy', 'pollCount']).default('accuracy'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

const getPollsterSchema = z.object({
  slug: z.string().min(1),
})

export async function pollsterRoutes(server: FastifyInstance) {
  // ============================================
  // GET /api/pollsters - List all pollsters
  // ============================================
  server.get('/', {
    schema: {
      tags: ['pollsters'],
      description: 'List all pollsters with rankings',
      querystring: {
        type: 'object',
        properties: {
          orderBy: { type: 'string', enum: ['name', 'accuracy', 'pollCount'], default: 'accuracy' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            pollsters: { type: 'array' },
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const query = listPollstersSchema.parse(request.query)

    let orderBy: any = { name: 'asc' }
    if (query.orderBy === 'accuracy') {
      orderBy = { overallAccuracy: 'desc' }
    } else if (query.orderBy === 'pollCount') {
      orderBy = { pollCount: 'desc' }
    }

    const [pollsters, total] = await Promise.all([
      prisma.pollster.findMany({
        orderBy,
        take: query.limit,
        skip: query.offset,
        select: {
          id: true,
          name: true,
          slug: true,
          organization: true,
          overallAccuracy: true,
          methodologyGrade: true,
          transparencyScore: true,
          partisanLean: true,
          pollCount: true,
          lastPollDate: true,
          _count: {
            select: { polls: true },
          },
        },
      }),
      prisma.pollster.count(),
    ])

    return {
      pollsters,
      total,
      limit: query.limit,
      offset: query.offset,
    }
  })

  // ============================================
  // GET /api/pollsters/:slug - Get pollster
  // ============================================
  server.get('/:slug', {
    schema: {
      tags: ['pollsters'],
      description: 'Get detailed information about a specific pollster',
      params: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string' },
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
    const params = getPollsterSchema.parse(request.params)

    const pollster = await prisma.pollster.findUnique({
      where: { slug: params.slug },
      include: {
        polls: {
          include: {
            race: {
              select: {
                id: true,
                raceName: true,
                slug: true,
                raceType: true,
              },
            },
          },
          orderBy: { pollDate: 'desc' },
          take: 10,
        },
        _count: {
          select: { polls: true },
        },
      },
    })

    if (!pollster) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Pollster with slug '${params.slug}' not found`,
      })
    }

    return pollster
  })

  // ============================================
  // GET /api/pollsters/:slug/polls - Get polls
  // ============================================
  server.get('/:slug/polls', {
    schema: {
      tags: ['pollsters'],
      description: 'Get all polls from a specific pollster',
      params: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
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
    const params = getPollsterSchema.parse(request.params)
    const query = z.object({
      limit: z.coerce.number().int().min(1).max(100).default(20),
      offset: z.coerce.number().int().min(0).default(0),
    }).parse(request.query)

    // Check if pollster exists
    const pollster = await prisma.pollster.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })

    if (!pollster) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Pollster with slug '${params.slug}' not found`,
      })
    }

    const [polls, total] = await Promise.all([
      prisma.poll.findMany({
        where: { pollsterId: pollster.id },
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
        },
        orderBy: { pollDate: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.poll.count({ where: { pollsterId: pollster.id } }),
    ])

    return {
      polls,
      total,
      limit: query.limit,
      offset: query.offset,
    }
  })
}
