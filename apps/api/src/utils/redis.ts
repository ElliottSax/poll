/**
 * Stub Redis/Cache implementation for MVP
 * No caching - all operations are no-ops
 * This allows code to compile without requiring Redis infrastructure
 */

import { logger } from './logger'

// Stub redis client (no-op)
export const redis = {
  async ping() {
    return 'PONG'
  },
  async quit() {
    return 'OK'
  },
}

// No-op cache implementation
export const cache = {
  async get<T>(_key: string): Promise<T | null> {
    // Always return null (cache miss)
    return null
  },

  async set(_key: string, _value: any, _ttl?: number): Promise<void> {
    // No-op
    logger.debug('Cache set called (no-op in MVP)')
  },

  async del(_key: string): Promise<void> {
    // No-op
  },

  async flush(): Promise<void> {
    // No-op
  },
}
