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

const getRaceAverageSchema = z.object({
  slug: z.string().min(1),
  days: z.coerce.number().int().min(1).max(90).default(14),
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

  // ============================================
  // GET /api/races/:slug/average - Get polling average
  // ============================================
  server.get('/:slug/average', {
    schema: {
      tags: ['races'],
      description: 'Calculate weighted polling average for a race',
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
          days: { type: 'integer', minimum: 1, maximum: 90, default: 14 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            raceSlug: { type: 'string' },
            raceName: { type: 'string' },
            timeframe: { type: 'integer' },
            pollsIncluded: { type: 'integer' },
            averages: { type: 'object' },
            lastUpdated: { type: 'string' },
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
    const query = getRaceAverageSchema.parse(request.query)

    // Check if race exists
    const race = await prisma.race.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        raceName: true,
        slug: true,
        candidates: true,
      },
    })

    if (!race) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Race with slug '${params.slug}' not found`,
      })
    }

    // Get recent polls within timeframe
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - query.days)

    const polls = await prisma.poll.findMany({
      where: {
        raceId: race.id,
        pollDate: {
          gte: cutoffDate,
        },
      },
      include: {
        pollster: {
          select: {
            methodologyGrade: true,
          },
        },
      },
      orderBy: { pollDate: 'desc' },
    })

    if (polls.length === 0) {
      return {
        raceSlug: race.slug,
        raceName: race.raceName,
        timeframe: query.days,
        pollsIncluded: 0,
        averages: {},
        lastUpdated: new Date().toISOString(),
      }
    }

    // Calculate weighted averages
    const gradeWeights: Record<string, number> = {
      'A_PLUS': 1.0,
      'A': 0.95,
      'A_MINUS': 0.9,
      'B_PLUS': 0.85,
      'B': 0.8,
      'B_MINUS': 0.75,
      'C_PLUS': 0.7,
      'C': 0.65,
      'C_MINUS': 0.6,
      'D': 0.5,
      'F': 0.3,
    }

    const candidateData: Record<string, { weightedSum: number; totalWeight: number }> = {}

    polls.forEach((poll) => {
      const daysSincePoll = Math.floor((Date.now() - new Date(poll.pollDate).getTime()) / (1000 * 60 * 60 * 24))
      const recencyWeight = Math.max(0.5, 1 - (daysSincePoll / query.days) * 0.5)

      const gradeWeight = gradeWeights[poll.pollster.methodologyGrade] || 0.5
      const sampleWeight = Math.min(1, (poll.sampleSize || 500) / 1000)

      const totalWeight = recencyWeight * gradeWeight * sampleWeight

      Object.entries(poll.results as Record<string, number>).forEach(([candidate, percentage]) => {
        if (!candidateData[candidate]) {
          candidateData[candidate] = { weightedSum: 0, totalWeight: 0 }
        }
        candidateData[candidate].weightedSum += percentage * totalWeight
        candidateData[candidate].totalWeight += totalWeight
      })
    })

    const averages: Record<string, number> = {}
    Object.entries(candidateData).forEach(([candidate, data]) => {
      averages[candidate] = Math.round((data.weightedSum / data.totalWeight) * 10) / 10
    })

    return {
      raceSlug: race.slug,
      raceName: race.raceName,
      timeframe: query.days,
      pollsIncluded: polls.length,
      averages,
      lastUpdated: new Date().toISOString(),
    }
  })

  // ============================================
  // GET /api/races/:slug/trend - Get historical trend
  // ============================================
  server.get('/:slug/trend', {
    schema: {
      tags: ['races'],
      description: 'Get historical polling trend for a race',
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
          days: { type: 'integer', minimum: 7, maximum: 365, default: 30 },
          interval: { type: 'string', enum: ['daily', 'weekly'], default: 'daily' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            raceSlug: { type: 'string' },
            raceName: { type: 'string' },
            timeframe: { type: 'integer' },
            interval: { type: 'string' },
            trend: { type: 'array' },
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
      days: z.coerce.number().int().min(7).max(365).default(30),
      interval: z.enum(['daily', 'weekly']).default('daily'),
    }).parse(request.query)

    // Check if race exists
    const race = await prisma.race.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        raceName: true,
        slug: true,
        candidates: true,
      },
    })

    if (!race) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Race with slug '${params.slug}' not found`,
      })
    }

    // Get polls within timeframe
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - query.days)

    const polls = await prisma.poll.findMany({
      where: {
        raceId: race.id,
        pollDate: {
          gte: cutoffDate,
        },
      },
      include: {
        pollster: {
          select: {
            methodologyGrade: true,
          },
        },
      },
      orderBy: { pollDate: 'asc' },
    })

    if (polls.length === 0) {
      return {
        raceSlug: race.slug,
        raceName: race.raceName,
        timeframe: query.days,
        interval: query.interval,
        trend: [],
      }
    }

    // Group polls by interval
    const gradeWeights: Record<string, number> = {
      'A_PLUS': 1.0,
      'A': 0.95,
      'A_MINUS': 0.9,
      'B_PLUS': 0.85,
      'B': 0.8,
      'B_MINUS': 0.75,
      'C_PLUS': 0.7,
      'C': 0.65,
      'C_MINUS': 0.6,
      'D': 0.5,
      'F': 0.3,
    }

    const intervalInMs = query.interval === 'daily' ? 86400000 : 604800000 // 1 day or 7 days
    const trendData: Record<string, any> = {}

    polls.forEach((poll) => {
      // Determine interval bucket
      const pollTime = new Date(poll.pollDate).getTime()
      const bucketTime = Math.floor(pollTime / intervalInMs) * intervalInMs
      const bucketKey = new Date(bucketTime).toISOString().split('T')[0]

      if (!trendData[bucketKey]) {
        trendData[bucketKey] = {
          date: bucketKey,
          pollCount: 0,
          candidates: {},
        }
      }

      trendData[bucketKey].pollCount++

      // Weight polls by methodology grade and sample size
      const gradeWeight = gradeWeights[poll.pollster.methodologyGrade] || 0.5
      const sampleWeight = Math.min(1, (poll.sampleSize || 500) / 1000)
      const weight = gradeWeight * sampleWeight

      Object.entries(poll.results as Record<string, number>).forEach(([candidate, percentage]) => {
        if (!trendData[bucketKey].candidates[candidate]) {
          trendData[bucketKey].candidates[candidate] = {
            weightedSum: 0,
            totalWeight: 0,
            average: 0,
          }
        }
        trendData[bucketKey].candidates[candidate].weightedSum += percentage * weight
        trendData[bucketKey].candidates[candidate].totalWeight += weight
      })
    })

    // Calculate averages for each interval
    const trend = Object.values(trendData).map((bucket: any) => {
      const candidates: Record<string, number> = {}
      Object.entries(bucket.candidates).forEach(([name, data]: [string, any]) => {
        candidates[name] = Math.round((data.weightedSum / data.totalWeight) * 10) / 10
      })

      return {
        date: bucket.date,
        pollCount: bucket.pollCount,
        averages: candidates,
      }
    }).sort((a, b) => a.date.localeCompare(b.date))

    return {
      raceSlug: race.slug,
      raceName: race.raceName,
      timeframe: query.days,
      interval: query.interval,
      trend,
    }
  })
}
