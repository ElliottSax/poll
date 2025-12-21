/**
 * Scheduler Service - Manages automated poll scraping jobs
 *
 * Uses a simple interval-based scheduler (no external dependencies)
 * For production, consider using BullMQ for more robust job management
 */

import { logger } from '../utils/logger'
import { pollingService } from './pollingService'

interface ScheduledJob {
  name: string
  interval: number // milliseconds
  lastRun: Date | null
  nextRun: Date
  running: boolean
  enabled: boolean
  handler: () => Promise<void>
}

class Scheduler {
  private jobs: Map<string, ScheduledJob> = new Map()
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private isRunning = false

  constructor() {
    // Register default jobs
    this.registerJob({
      name: 'poll-scraper',
      interval: 4 * 60 * 60 * 1000, // 4 hours
      enabled: true,
      handler: async () => {
        logger.info('Starting scheduled poll scrape')
        const result = await pollingService.scrapeAllRaces()
        logger.info({ result }, 'Scheduled poll scrape completed')
      },
    })

    this.registerJob({
      name: 'poll-scraper-quick',
      interval: 30 * 60 * 1000, // 30 minutes (for testing/high-activity periods)
      enabled: false, // Disabled by default
      handler: async () => {
        logger.info('Starting quick poll scrape')
        const result = await pollingService.scrapeAllRaces()
        logger.info({ result }, 'Quick poll scrape completed')
      },
    })
  }

  /**
   * Register a new scheduled job
   */
  registerJob(config: {
    name: string
    interval: number
    enabled?: boolean
    handler: () => Promise<void>
  }): void {
    const job: ScheduledJob = {
      name: config.name,
      interval: config.interval,
      lastRun: null,
      nextRun: new Date(Date.now() + config.interval),
      running: false,
      enabled: config.enabled ?? true,
      handler: config.handler,
    }

    this.jobs.set(config.name, job)
    logger.info({ name: config.name, interval: config.interval }, 'Registered scheduled job')
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Scheduler is already running')
      return
    }

    this.isRunning = true
    logger.info('Starting scheduler')

    for (const [name, job] of this.jobs) {
      if (job.enabled) {
        this.scheduleJob(name, job)
      }
    }
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false
    logger.info('Stopping scheduler')

    for (const [name, timer] of this.timers) {
      clearTimeout(timer)
      this.timers.delete(name)
    }
  }

  /**
   * Schedule a single job
   */
  private scheduleJob(name: string, job: ScheduledJob): void {
    const timer = setTimeout(async () => {
      if (!this.isRunning || !job.enabled) return

      job.running = true
      job.lastRun = new Date()

      try {
        await job.handler()
      } catch (error) {
        logger.error({ error, job: name }, 'Scheduled job failed')
      } finally {
        job.running = false
        job.nextRun = new Date(Date.now() + job.interval)

        // Reschedule
        if (this.isRunning && job.enabled) {
          this.scheduleJob(name, job)
        }
      }
    }, job.interval)

    this.timers.set(name, timer)
  }

  /**
   * Enable a job
   */
  enableJob(name: string): boolean {
    const job = this.jobs.get(name)
    if (!job) return false

    job.enabled = true
    job.nextRun = new Date(Date.now() + job.interval)

    if (this.isRunning) {
      this.scheduleJob(name, job)
    }

    logger.info({ name }, 'Enabled scheduled job')
    return true
  }

  /**
   * Disable a job
   */
  disableJob(name: string): boolean {
    const job = this.jobs.get(name)
    if (!job) return false

    job.enabled = false

    const timer = this.timers.get(name)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(name)
    }

    logger.info({ name }, 'Disabled scheduled job')
    return true
  }

  /**
   * Run a job immediately (manual trigger)
   */
  async runNow(name: string): Promise<boolean> {
    const job = this.jobs.get(name)
    if (!job) return false

    if (job.running) {
      logger.warn({ name }, 'Job is already running')
      return false
    }

    job.running = true
    job.lastRun = new Date()

    try {
      await job.handler()
      return true
    } catch (error) {
      logger.error({ error, job: name }, 'Manual job run failed')
      return false
    } finally {
      job.running = false
      job.nextRun = new Date(Date.now() + job.interval)
    }
  }

  /**
   * Get status of all jobs
   */
  getStatus(): {
    isRunning: boolean
    jobs: Array<{
      name: string
      enabled: boolean
      running: boolean
      lastRun: Date | null
      nextRun: Date
      intervalMinutes: number
    }>
  } {
    const jobs = Array.from(this.jobs.values()).map((job) => ({
      name: job.name,
      enabled: job.enabled,
      running: job.running,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
      intervalMinutes: Math.round(job.interval / 60000),
    }))

    return {
      isRunning: this.isRunning,
      jobs,
    }
  }
}

// Export singleton
export const scheduler = new Scheduler()

// Auto-start scheduler in production
if (process.env.NODE_ENV === 'production' && process.env.ENABLE_SCHEDULER === 'true') {
  scheduler.start()
}
