import Redis from 'ioredis'
import { config } from '../config/env'
import { logger } from './logger'

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    logger.warn(`Redis retry attempt ${times}, waiting ${delay}ms`)
    return delay
  },
})

redis.on('connect', () => {
  logger.info('Redis client connected')
})

redis.on('error', (err) => {
  logger.error({ err }, 'Redis error')
})

redis.on('ready', () => {
  logger.info('Redis client ready')
})

redis.on('close', () => {
  logger.warn('Redis connection closed')
})

redis.on('reconnecting', () => {
  logger.warn('Redis client reconnecting')
})

// Helper functions for caching
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  },

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await redis.setex(key, ttl, serialized)
    } else {
      await redis.set(key, serialized)
    }
  },

  async del(key: string): Promise<void> {
    await redis.del(key)
  },

  async flush(): Promise<void> {
    await redis.flushdb()
  },
}
