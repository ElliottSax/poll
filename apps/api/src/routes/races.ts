import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { cache } from '../utils/redis'

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return new Date(date).toLocaleDateString()
}

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

  // Get featured races (for homepage)
  fastify.get('/featured', {
    schema: {
      description: 'Get featured races for homepage',
      tags: ['races'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 6 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { limit = 6 } = request.query as { limit?: number }

        // Try cache first
        const cacheKey = `races:featured:${limit}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        // Get top races by importance, with their latest poll data
        const races = await prisma.race.findMany({
          where: { status: 'active' },
          take: limit,
          orderBy: [
            { importanceScore: 'desc' },
            { electionDate: 'asc' },
          ],
          include: {
            candidates: {
              select: {
                id: true,
                name: true,
                party: true,
              },
            },
            polls: {
              take: 1,
              orderBy: { pollDate: 'desc' },
              select: {
                pollDate: true,
                results: true,
              },
            },
            _count: {
              select: { polls: true },
            },
          },
        })

        // Transform for frontend consumption
        const featuredRaces = races.map((race) => {
          const latestPoll = race.polls[0]
          const results = (latestPoll?.results as Record<string, number>) || {}

          // Calculate candidate percentages from latest poll
          const candidatesWithPercent = race.candidates.map((c) => ({
            name: c.name,
            party: c.party,
            percentage: results[c.name] || 0,
          }))

          // Determine race rating based on margin
          const sorted = [...candidatesWithPercent].sort((a, b) => b.percentage - a.percentage)
          const margin = sorted[0] && sorted[1] ? sorted[0].percentage - sorted[1].percentage : 0
          let rating = 'Toss-up'
          if (margin > 5) rating = sorted[0]?.party === 'D' ? 'Likely D' : 'Likely R'
          else if (margin > 3) rating = sorted[0]?.party === 'D' ? 'Lean D' : 'Lean R'
          else if (margin > 1) rating = sorted[0]?.party === 'D' ? 'Tilt D' : 'Tilt R'

          return {
            id: race.id,
            slug: race.slug,
            name: race.raceName,
            type: race.raceType === 'president' ? 'Presidential' :
                  race.raceType.charAt(0).toUpperCase() + race.raceType.slice(1),
            state: race.state,
            rating,
            candidates: candidatesWithPercent,
            pollCount: race._count.polls,
            lastUpdate: latestPoll?.pollDate
              ? formatTimeAgo(latestPoll.pollDate)
              : 'No polls yet',
            isFeatured: race.importanceScore >= 9,
          }
        })

        // Cache for 3 minutes
        await cache.set(cacheKey, featuredRaces, 180)

        return reply.send(featuredRaces)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get trending races (most active polling)
  fastify.get('/trending', {
    schema: {
      description: 'Get races with most recent polling activity',
      tags: ['races'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 5 },
          days: { type: 'number', default: 7 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { limit = 5, days = 7 } = request.query as { limit?: number; days?: number }

        // Try cache first
        const cacheKey = `races:trending:${limit}:${days}`
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        // Get races with most recent polls
        const races = await prisma.race.findMany({
          where: {
            status: 'active',
            polls: {
              some: {
                pollDate: { gte: cutoffDate },
              },
            },
          },
          include: {
            candidates: {
              select: { name: true, party: true },
            },
            polls: {
              where: { pollDate: { gte: cutoffDate } },
              orderBy: { pollDate: 'desc' },
              take: 5,
              select: {
                pollDate: true,
                results: true,
                pollster: { select: { name: true } },
              },
            },
            _count: {
              select: { polls: true },
            },
          },
          orderBy: { importanceScore: 'desc' },
          take: 20, // Get more than needed, will sort by activity
        })

        // Sort by number of recent polls
        const sorted = races
          .map((race) => ({
            ...race,
            recentPollCount: race.polls.length,
          }))
          .sort((a, b) => b.recentPollCount - a.recentPollCount)
          .slice(0, limit)

        // Transform for frontend
        const trendingRaces = sorted.map((race) => {
          const latestPoll = race.polls[0]
          const results = (latestPoll?.results as Record<string, number>) || {}

          return {
            id: race.id,
            slug: race.slug,
            name: race.raceName,
            type: race.raceType,
            state: race.state,
            recentPollCount: race.recentPollCount,
            totalPollCount: race._count.polls,
            candidates: race.candidates.map((c) => ({
              name: c.name,
              party: c.party,
              percentage: results[c.name] || 0,
            })),
            lastPollster: latestPoll?.pollster?.name || 'N/A',
            lastUpdate: latestPoll?.pollDate
              ? formatTimeAgo(latestPoll.pollDate)
              : 'No polls yet',
          }
        })

        // Cache for 5 minutes
        await cache.set(cacheKey, trendingRaces, 300)

        return reply.send(trendingRaces)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  // Get aggregate stats for homepage
  fastify.get('/stats', {
    schema: {
      description: 'Get aggregate stats for homepage',
      tags: ['races'],
    },
    handler: async (request, reply) => {
      try {
        // Try cache first
        const cacheKey = 'races:stats'
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        const [raceCount, pollCount, pollsterCount, latestPoll] = await Promise.all([
          prisma.race.count({ where: { status: 'active' } }),
          prisma.poll.count(),
          prisma.pollster.count(),
          prisma.poll.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
          }),
        ])

        const stats = {
          totalRaces: raceCount,
          totalPolls: pollCount,
          totalPollsters: pollsterCount,
          lastUpdated: latestPoll?.createdAt || new Date(),
        }

        // Cache for 2 minutes
        await cache.set(cacheKey, stats, 120)

        return reply.send(stats)
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
