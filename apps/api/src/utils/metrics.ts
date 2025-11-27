import { logger } from './logger'

/**
 * Application metrics and monitoring utilities
 * Tracks key performance indicators and system health
 */

export interface Metric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map()
  private readonly maxMetricsPerKey = 1000

  /**
   * Record a metric value
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    }

    const existing = this.metrics.get(name) || []
    existing.push(metric)

    // Keep only recent metrics
    if (existing.length > this.maxMetricsPerKey) {
      existing.shift()
    }

    this.metrics.set(name, existing)

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug({ metric }, 'Metric recorded')
    }
  }

  /**
   * Increment a counter
   */
  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    const current = this.getLatest(name)
    this.record(name, (current?.value || 0) + value, tags)
  }

  /**
   * Record a timing/duration in milliseconds
   */
  timing(name: string, duration: number, tags?: Record<string, string>): void {
    this.record(`${name}.duration`, duration, tags)

    // Also track percentiles
    const durations = this.getRecent(name, 100).map(m => m.value)
    if (durations.length > 0) {
      this.record(`${name}.p50`, this.percentile(durations, 50), tags)
      this.record(`${name}.p95`, this.percentile(durations, 95), tags)
      this.record(`${name}.p99`, this.percentile(durations, 99), tags)
    }
  }

  /**
   * Record a gauge (current value)
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.record(name, value, tags)
  }

  /**
   * Get latest metric value
   */
  getLatest(name: string): Metric | undefined {
    const metrics = this.metrics.get(name)
    return metrics?.[metrics.length - 1]
  }

  /**
   * Get recent metrics
   */
  getRecent(name: string, count: number): Metric[] {
    const metrics = this.metrics.get(name) || []
    return metrics.slice(-count)
  }

  /**
   * Get all metrics for a name
   */
  getAll(name: string): Metric[] {
    return this.metrics.get(name) || []
  }

  /**
   * Get metrics summary
   */
  getSummary(name: string): {
    count: number
    min: number
    max: number
    avg: number
    latest: number
  } | null {
    const metrics = this.metrics.get(name)
    if (!metrics || metrics.length === 0) return null

    const values = metrics.map(m => m.value)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
      latest: values[values.length - 1],
    }
  }

  /**
   * Calculate percentile
   */
  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }

  /**
   * Clear old metrics
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * Export all metrics
   */
  export(): Record<string, Metric[]> {
    const result: Record<string, Metric[]> = {}
    this.metrics.forEach((value, key) => {
      result[key] = value
    })
    return result
  }
}

// Export singleton instance
export const metrics = new MetricsCollector()

/**
 * Track API endpoint performance
 */
export function trackEndpoint(method: string, path: string, duration: number, statusCode: number) {
  metrics.timing(`api.request.duration`, duration, {
    method,
    path,
    status: statusCode.toString(),
  })

  metrics.increment(`api.request.count`, 1, {
    method,
    path,
    status: statusCode.toString(),
  })

  if (statusCode >= 500) {
    metrics.increment('api.errors.5xx', 1, { method, path })
  } else if (statusCode >= 400) {
    metrics.increment('api.errors.4xx', 1, { method, path })
  }
}

/**
 * Track database query performance
 */
export function trackDatabaseQuery(operation: string, duration: number) {
  metrics.timing('database.query.duration', duration, { operation })
  metrics.increment('database.query.count', 1, { operation })

  if (duration > 1000) {
    logger.warn({ operation, duration }, 'Slow database query detected')
    metrics.increment('database.slow_queries', 1)
  }
}

/**
 * Track cache operations
 */
export function trackCacheOperation(operation: 'get' | 'set' | 'del', hit: boolean = false) {
  metrics.increment(`cache.${operation}.count`, 1)

  if (operation === 'get') {
    if (hit) {
      metrics.increment('cache.hits', 1)
    } else {
      metrics.increment('cache.misses', 1)
    }

    // Calculate hit rate
    const hits = metrics.getLatest('cache.hits')?.value || 0
    const misses = metrics.getLatest('cache.misses')?.value || 0
    const total = hits + misses

    if (total > 0) {
      const hitRate = (hits / total) * 100
      metrics.gauge('cache.hit_rate', hitRate)
    }
  }
}

/**
 * Track external API calls
 */
export function trackExternalAPI(service: string, duration: number, success: boolean) {
  metrics.timing(`external.${service}.duration`, duration)
  metrics.increment(`external.${service}.${success ? 'success' : 'failure'}`, 1)
}

/**
 * Track WebSocket connections
 */
export function trackWebSocket(event: 'connect' | 'disconnect', count: number) {
  if (event === 'connect') {
    metrics.increment('websocket.connections', 1)
    metrics.gauge('websocket.active', count)
  } else {
    metrics.increment('websocket.disconnections', 1)
    metrics.gauge('websocket.active', count)
  }
}

/**
 * Get system metrics
 */
export function getSystemMetrics() {
  const mem = process.memoryUsage()

  return {
    uptime: process.uptime(),
    memory: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
      heapUsedPercentage: (mem.heapUsed / mem.heapTotal) * 100,
    },
    cpu: process.cpuUsage(),
  }
}
