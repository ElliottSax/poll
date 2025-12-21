/**
 * Scraper API Routes
 * Endpoints for managing poll data scraping
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { pollingService, RACE_CONFIGS } from '../services/pollingService'
import { scheduler } from '../services/scheduler'
import { logger } from '../utils/logger'

// Request schemas
interface ScrapeRaceParams {
  slug: string
}

export async function scraperRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /scraper/status
   * Get scraping statistics and scheduler status
   */
  fastify.get('/status', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const [stats, schedulerStatus] = await Promise.all([
        pollingService.getScrapingStats(),
        scheduler.getStatus(),
      ])

      return {
        success: true,
        data: {
          stats,
          scheduler: schedulerStatus,
          configuredRaces: RACE_CONFIGS.map((r) => ({
            slug: r.slug,
            name: r.name,
            hasRcpUrl: !!r.rcpUrl,
            hasFteSlug: !!r.fteSlug,
          })),
        },
      }
    } catch (error) {
      logger.error({ error }, 'Error getting scraper status')
      return reply.status(500).send({
        success: false,
        error: 'Failed to get scraper status',
      })
    }
  })

  /**
   * POST /scraper/run
   * Trigger a full scrape of all races
   */
  fastify.post('/run', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      logger.info('Manual scrape triggered via API')

      // Run in background
      pollingService.scrapeAllRaces().then((result) => {
        logger.info({ result }, 'Manual scrape completed')
      }).catch((error) => {
        logger.error({ error }, 'Manual scrape failed')
      })

      return {
        success: true,
        message: 'Scrape started in background',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      logger.error({ error }, 'Error starting scrape')
      return reply.status(500).send({
        success: false,
        error: 'Failed to start scrape',
      })
    }
  })

  /**
   * POST /scraper/run/:slug
   * Trigger a scrape for a specific race
   */
  fastify.post<{ Params: ScrapeRaceParams }>(
    '/run/:slug',
    async (request: FastifyRequest<{ Params: ScrapeRaceParams }>, reply: FastifyReply) => {
      const { slug } = request.params

      const raceConfig = RACE_CONFIGS.find((r) => r.slug === slug)
      if (!raceConfig) {
        return reply.status(404).send({
          success: false,
          error: 'Race not found',
          availableRaces: RACE_CONFIGS.map((r) => r.slug),
        })
      }

      try {
        logger.info({ slug }, 'Manual scrape triggered for specific race')

        const count = await pollingService.scrapeRace(raceConfig)

        return {
          success: true,
          message: `Scraped ${count} new polls for ${raceConfig.name}`,
          race: slug,
          pollsAdded: count,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        logger.error({ error, slug }, 'Error scraping race')
        return reply.status(500).send({
          success: false,
          error: 'Failed to scrape race',
        })
      }
    }
  )

  /**
   * POST /scraper/scheduler/start
   * Start the scheduler
   */
  fastify.post('/scheduler/start', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      scheduler.start()
      return {
        success: true,
        message: 'Scheduler started',
        status: scheduler.getStatus(),
      }
    } catch (error) {
      logger.error({ error }, 'Error starting scheduler')
      return reply.status(500).send({
        success: false,
        error: 'Failed to start scheduler',
      })
    }
  })

  /**
   * POST /scraper/scheduler/stop
   * Stop the scheduler
   */
  fastify.post('/scheduler/stop', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      scheduler.stop()
      return {
        success: true,
        message: 'Scheduler stopped',
        status: scheduler.getStatus(),
      }
    } catch (error) {
      logger.error({ error }, 'Error stopping scheduler')
      return reply.status(500).send({
        success: false,
        error: 'Failed to stop scheduler',
      })
    }
  })

  /**
   * GET /scraper/races
   * List all configured races
   */
  fastify.get('/races', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      success: true,
      data: RACE_CONFIGS.map((r) => ({
        slug: r.slug,
        name: r.name,
        raceType: r.raceType,
        state: r.state,
        electionDate: r.electionDate.toISOString().split('T')[0],
        candidates: r.candidates,
        sources: {
          rcp: r.rcpUrl ? true : false,
          fte: r.fteSlug ? true : false,
        },
      })),
    }
  })

  /**
   * POST /scraper/races
   * Add a new race configuration (runtime only, not persisted)
   */
  fastify.post('/races', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any

    if (!body.slug || !body.name || !body.candidates) {
      return reply.status(400).send({
        success: false,
        error: 'Missing required fields: slug, name, candidates',
      })
    }

    const newConfig = {
      slug: body.slug,
      name: body.name,
      raceType: body.raceType || 'president',
      state: body.state,
      rcpUrl: body.rcpUrl,
      fteSlug: body.fteSlug,
      candidates: body.candidates,
      electionDate: new Date(body.electionDate || '2024-11-05'),
    }

    RACE_CONFIGS.push(newConfig)

    logger.info({ slug: newConfig.slug }, 'Added new race configuration')

    return {
      success: true,
      message: 'Race configuration added',
      race: newConfig,
    }
  })
}
