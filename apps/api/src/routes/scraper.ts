/**
 * Scraper API routes
 * Endpoints for triggering and monitoring polling data scrapers
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ScraperService } from '../scrapers'

export async function scraperRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  const scraperService = new ScraperService()

  // Run all scrapers
  fastify.post('/run', {
    schema: {
      description: 'Trigger all polling data scrapers',
      tags: ['scraper'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            summary: { type: 'object' },
            results: { type: 'array' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        fastify.log.info('Scraper run triggered')

        const { results, summary } = await scraperService.runAll()

        return reply.send({
          success: true,
          summary,
          results: results.map((r) => ({
            source: r.source,
            success: r.success,
            racesCount: r.races.length,
            pollsCount: r.races.reduce((sum, race) => sum + race.polls.length, 0),
            errors: r.errors,
            scrapedAt: r.scrapedAt,
          })),
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
          success: false,
          error: 'Failed to run scrapers',
          message: (error as Error).message,
        })
      }
    },
  })

  // Get scraper status
  fastify.get('/status', {
    schema: {
      description: 'Get scraper status and last run information',
      tags: ['scraper'],
    },
    handler: async (request, reply) => {
      try {
        // Get latest polls to determine last scrape time
        const latestPoll = await fastify.prisma.poll.findFirst({
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        })

        const pollCount = await fastify.prisma.poll.count()
        const raceCount = await fastify.prisma.race.count()
        const pollsterCount = await fastify.prisma.pollster.count()

        return reply.send({
          status: 'ready',
          lastScrape: latestPoll?.createdAt || null,
          stats: {
            totalPolls: pollCount,
            totalRaces: raceCount,
            totalPollsters: pollsterCount,
          },
          availableScrapers: ['RealClearPolitics'],
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Failed to get scraper status' })
      }
    },
  })
}
