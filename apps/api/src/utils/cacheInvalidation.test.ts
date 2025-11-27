import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CacheInvalidation } from './cacheInvalidation'

// Mock redis
vi.mock('./redis', () => ({
  redis: {
    keys: vi.fn(),
    del: vi.fn(),
    flushdb: vi.fn(),
  },
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

// Mock logger
vi.mock('./logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

import { redis } from './redis'

describe('CacheInvalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('invalidatePattern', () => {
    it('should delete keys matching pattern', async () => {
      const mockKeys = ['polls:123', 'polls:456']
      vi.mocked(redis.keys).mockResolvedValue(mockKeys)
      vi.mocked(redis.del).mockResolvedValue(2)

      const result = await CacheInvalidation.invalidatePattern('polls:*')

      expect(redis.keys).toHaveBeenCalledWith('polls:*')
      expect(redis.del).toHaveBeenCalledWith(...mockKeys)
      expect(result).toBe(2)
    })

    it('should return 0 if no keys found', async () => {
      vi.mocked(redis.keys).mockResolvedValue([])

      const result = await CacheInvalidation.invalidatePattern('polls:*')

      expect(redis.keys).toHaveBeenCalledWith('polls:*')
      expect(redis.del).not.toHaveBeenCalled()
      expect(result).toBe(0)
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(redis.keys).mockRejectedValue(new Error('Redis error'))

      const result = await CacheInvalidation.invalidatePattern('polls:*')

      expect(result).toBe(0)
    })
  })

  describe('invalidatePoll', () => {
    it('should delete specific poll cache', async () => {
      vi.mocked(redis.del).mockResolvedValue(1)

      await CacheInvalidation.invalidatePoll('poll-123')

      expect(redis.del).toHaveBeenCalledWith('poll:poll-123')
    })
  })

  describe('invalidateRacePolls', () => {
    it('should invalidate race-related poll caches', async () => {
      vi.mocked(redis.keys).mockResolvedValue([])

      await CacheInvalidation.invalidateRacePolls('race-123')

      expect(redis.keys).toHaveBeenCalledWith('polls:race:race-123:*')
      expect(redis.keys).toHaveBeenCalledWith('polls:*"raceId":"race-123"*')
    })
  })

  describe('invalidateAll', () => {
    it('should flush entire database', async () => {
      vi.mocked(redis.flushdb).mockResolvedValue('OK')

      await CacheInvalidation.invalidateAll()

      expect(redis.flushdb).toHaveBeenCalled()
    })
  })
})
