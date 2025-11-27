import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { prisma } from '../utils/prisma'
import { redis } from '../utils/redis'
import { metrics, getSystemMetrics } from '../utils/metrics'

export async function healthRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Basic health check
  fastify.get('/', {
    schema: {
      description: 'Health check endpoint',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
          },
        },
      },
    },
    handler: async (_request, reply) => {
      return reply.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      })
    },
  })

  // Detailed health check
  fastify.get('/detailed', {
    schema: {
      description: 'Detailed health check with database and Redis status',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            database: { type: 'string' },
            redis: { type: 'string' },
            memory: { type: 'object' },
          },
        },
      },
    },
    handler: async (_request, reply) => {
      // Check database
      let databaseStatus = 'ok'
      try {
        await prisma.$queryRaw`SELECT 1`
      } catch (error) {
        databaseStatus = 'error'
      }

      // Check Redis
      let redisStatus = 'ok'
      try {
        await redis.ping()
      } catch (error) {
        redisStatus = 'error'
      }

      // Memory usage
      const memoryUsage = process.memoryUsage()
      const memory = {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      }

      return reply.send({
        status: databaseStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: databaseStatus,
        redis: redisStatus,
        memory,
      })
    },
  })

  // Metrics endpoint
  fastify.get('/metrics', {
    schema: {
      description: 'Application metrics and performance data',
      tags: ['health'],
    },
    handler: async (_request, reply) => {
      const systemMetrics = getSystemMetrics()

      // Get key application metrics
      const apiRequestCount = metrics.getSummary('api.request.count')
      const apiDuration = metrics.getSummary('api.request.duration')
      const cacheHitRate = metrics.getLatest('cache.hit_rate')
      const dbQueryCount = metrics.getSummary('database.query.count')
      const errors5xx = metrics.getLatest('api.errors.5xx')
      const errors4xx = metrics.getLatest('api.errors.4xx')
      const wsActive = metrics.getLatest('websocket.active')

      return reply.send({
        timestamp: new Date().toISOString(),
        system: {
          uptime: systemMetrics.uptime,
          memory: {
            rss: `${Math.round(systemMetrics.memory.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(systemMetrics.memory.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(systemMetrics.memory.heapTotal / 1024 / 1024)}MB`,
            heapUsedPercentage: `${systemMetrics.memory.heapUsedPercentage.toFixed(2)}%`,
          },
        },
        api: {
          requests: apiRequestCount,
          averageDuration: apiDuration?.avg ? `${apiDuration.avg.toFixed(2)}ms` : null,
          errors: {
            '4xx': errors4xx?.value || 0,
            '5xx': errors5xx?.value || 0,
          },
        },
        cache: {
          hitRate: cacheHitRate ? `${cacheHitRate.value.toFixed(2)}%` : null,
        },
        database: {
          queries: dbQueryCount,
        },
        websocket: {
          activeConnections: wsActive?.value || 0,
        },
      })
    },
  })
}
