import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { prisma } from '../utils/prisma'
import { redis } from '../utils/redis'

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
}
