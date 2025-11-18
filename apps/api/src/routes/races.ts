/**
 * Race Routes
 *
 * GET /api/races - List all races
 * GET /api/races/:slug - Get race by slug
 * GET /api/races/:slug/polls - Get polls for a race
 */

import { FastifyInstance } from 'fastify'
import { prisma, RaceType, RaceStatus } from '@poll/database'
import { z } from 'zod'

const listRacesSchema = z.object({
  type: z.nativeEnum(RaceType).optional(),
  state: z.string().length(2).optional(),
  status: z.nativeEnum(RaceStatus).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

const getRaceSchema = z.object({
  slug: z.string().min(1),
})

const getRacePollsSchema = z.object({
  slug: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function raceRoutes(server: FastifyInstance) {
  // ============================================
  // GET /api/races - List all races
  // ============================================
  server.get('/', {
    schema: {
      tags: ['races'],
      description: 'List all election races with optional filtering',
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: Object.values(RaceType) },
          state: { type: 'string', minLength: 2, maxLength: 2 },
          status: { type: 'string', enum: Object.values(RaceStatus) },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            races: { type: 'array' },
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const query = listRacesSchema.parse(request.query)

    const where: any = {}
    if (query.type) where.raceType = query.type
    if (query.state) where.state = query.state.toUpperCase()
    if (query.status) where.status = query.status

    const [races, total] = await Promise.all([
      prisma.race.findMany({
        where,
        take: query.limit,
        skip: query.offset,
        orderBy: [
          { electionDate: 'desc' },
          { importanceScore: 'desc' },
        ],
        select: {
          id: true,
          raceType: true,
          raceName: true,
          slug: true,
          state: true,
          electionDate: true,
          status: true,
          candidates: true,
          currentLeader: true,
          competitiveRating: true,
          importanceScore: true,
          _count: {
            select: { polls: true },
          },
        },
      }),
      prisma.race.count({ where }),
    ])

    return {
      races,
      total,
      limit: query.limit,
      offset: query.offset,
    }
  })

  // ============================================
  // GET /api/races/:slug - Get race by slug
  // ============================================
  server.get('/:slug', {
    schema: {
      tags: ['races'],
      description: 'Get detailed information about a specific race',
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
    const params = getRaceSchema.parse(request.params)

    const race = await prisma.race.findUnique({
      where: { slug: params.slug },
      include: {
        polls: {
          include: {
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
          take: 10,
        },
        forecasts: {
          orderBy: { forecastDate: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            polls: true,
            forecasts: true,
          },
        },
      },
    })

    if (!race) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Race with slug '${params.slug}' not found`,
      })
    }

    return race
  })

  // ============================================
  // GET /api/races/:slug/polls - Get race polls
  // ============================================
  server.get('/:slug/polls', {
    schema: {
      tags: ['races'],
      description: 'Get all polls for a specific race',
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
    const params = getRaceSchema.parse(request.params)
    const query = z.object({
      limit: z.coerce.number().int().min(1).max(100).default(20),
      offset: z.coerce.number().int().min(0).default(0),
    }).parse(request.query)

    // Check if race exists
    const race = await prisma.race.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })

    if (!race) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Race with slug '${params.slug}' not found`,
      })
    }

    const [polls, total] = await Promise.all([
      prisma.poll.findMany({
        where: { raceId: race.id },
        include: {
          pollster: {
            select: {
              id: true,
              name: true,
              slug: true,
              methodologyGrade: true,
              partisanLean: true,
            },
          },
        },
        orderBy: { pollDate: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.poll.count({ where: { raceId: race.id } }),
    ])

    return {
      polls,
      total,
      limit: query.limit,
      offset: query.offset,
    }
  })
}
