import { redis } from './redis'
import { logger } from './logger'

/**
 * Cache invalidation utilities
 * Provides patterns for invalidating related cache entries
 */

export class CacheInvalidation {
  /**
   * Invalidate all caches matching a pattern
   */
  static async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length === 0) {
        return 0
      }

      await redis.del(...keys)
      logger.info({ pattern, count: keys.length }, 'Cache invalidated by pattern')
      return keys.length
    } catch (error) {
      logger.error({ error, pattern }, 'Error invalidating cache pattern')
      return 0
    }
  }

  /**
   * Invalidate all poll-related caches
   */
  static async invalidatePolls(): Promise<void> {
    await this.invalidatePattern('polls:*')
    await this.invalidatePattern('poll:*')
  }

  /**
   * Invalidate caches for a specific poll
   */
  static async invalidatePoll(pollId: string): Promise<void> {
    await redis.del(`poll:${pollId}`)
  }

  /**
   * Invalidate caches for a specific race's polls
   */
  static async invalidateRacePolls(raceId: string): Promise<void> {
    await this.invalidatePattern(`polls:race:${raceId}:*`)
    await this.invalidatePattern(`polls:*"raceId":"${raceId}"*`)
  }

  /**
   * Invalidate all race-related caches
   */
  static async invalidateRaces(): Promise<void> {
    await this.invalidatePattern('races:*')
    await this.invalidatePattern('race:*')
  }

  /**
   * Invalidate caches for a specific race
   */
  static async invalidateRace(raceId: string): Promise<void> {
    await redis.del(`race:${raceId}`)
    await this.invalidateRacePolls(raceId)
  }

  /**
   * Invalidate all pollster-related caches
   */
  static async invalidatePollsters(): Promise<void> {
    await this.invalidatePattern('pollsters:*')
    await this.invalidatePattern('pollster:*')
  }

  /**
   * Invalidate caches for a specific pollster
   */
  static async invalidatePollster(pollsterId: string): Promise<void> {
    await redis.del(`pollster:${pollsterId}`)
    await this.invalidatePattern(`pollster:${pollsterId}:*`)
  }

  /**
   * Invalidate all forecast-related caches
   */
  static async invalidateForecasts(): Promise<void> {
    await this.invalidatePattern('forecast:*')
  }

  /**
   * Invalidate caches for a specific race's forecast
   */
  static async invalidateRaceForecast(raceId: string): Promise<void> {
    await this.invalidatePattern(`forecast:race:${raceId}*`)
  }

  /**
   * Invalidate all caches (use with caution)
   */
  static async invalidateAll(): Promise<void> {
    logger.warn('Invalidating all caches')
    await redis.flushdb()
  }
}

/**
 * Decorator to automatically invalidate cache after function execution
 * Usage: @InvalidateCache('polls')
 */
export function InvalidateCache(
  cacheType: 'polls' | 'races' | 'pollsters' | 'forecasts'
) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args)

      // Invalidate cache after successful execution
      switch (cacheType) {
        case 'polls':
          await CacheInvalidation.invalidatePolls()
          break
        case 'races':
          await CacheInvalidation.invalidateRaces()
          break
        case 'pollsters':
          await CacheInvalidation.invalidatePollsters()
          break
        case 'forecasts':
          await CacheInvalidation.invalidateForecasts()
          break
      }

      return result
    }

    return descriptor
  }
}
