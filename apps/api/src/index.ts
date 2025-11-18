/**
 * Polling Dashboard API Server
 *
 * Fastify-based REST API for the polling dashboard
 */

import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { connectDatabase } from '@poll/database'
import { config } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'

// Routes
import { raceRoutes } from './routes/races.js'
import { pollRoutes } from './routes/polls.js'
import { pollsterRoutes } from './routes/pollsters.js'
import { exportRoutes } from './routes/export.js'

const server = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    transport:
      config.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
})

async function start() {
  try {
    // ============================================
    // Security & CORS
    // ============================================
    await server.register(helmet, {
      contentSecurityPolicy: config.NODE_ENV === 'production',
    })

    await server.register(cors, {
      origin: config.ALLOWED_ORIGINS,
      credentials: true,
    })

    // ============================================
    // Rate Limiting
    // ============================================
    await server.register(rateLimit, {
      max: config.RATE_LIMIT_MAX,
      timeWindow: config.RATE_LIMIT_WINDOW,
      cache: 10000,
      allowList: ['127.0.0.1'],
      redis: config.REDIS_URL ? { url: config.REDIS_URL } : undefined,
    })

    // ============================================
    // API Documentation
    // ============================================
    await server.register(swagger, {
      openapi: {
        info: {
          title: 'Polling Dashboard API',
          description: 'REST API for election polling data, forecasts, and analysis',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${config.PORT}`,
            description: 'Development server',
          },
        ],
        tags: [
          { name: 'races', description: 'Election race endpoints' },
          { name: 'polls', description: 'Poll data endpoints' },
          { name: 'pollsters', description: 'Pollster information endpoints' },
          { name: 'export', description: 'Data export endpoints (CSV/JSON)' },
          { name: 'forecasts', description: 'Forecast and prediction endpoints' },
          { name: 'health', description: 'Health check endpoints' },
        ],
      },
    })

    await server.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
    })

    // ============================================
    // Database Connection
    // ============================================
    await connectDatabase()

    // ============================================
    // Health Check
    // ============================================
    server.get('/health', {
      schema: {
        tags: ['health'],
        description: 'Health check endpoint',
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
    }, async (request, reply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      }
    })

    // ============================================
    // API Routes
    // ============================================
    await server.register(raceRoutes, { prefix: '/api/races' })
    await server.register(pollRoutes, { prefix: '/api/polls' })
    await server.register(pollsterRoutes, { prefix: '/api/pollsters' })
    await server.register(exportRoutes, { prefix: '/api/export' })

    // ============================================
    // Error Handler
    // ============================================
    server.setErrorHandler(errorHandler)

    // ============================================
    // Start Server
    // ============================================
    await server.listen({
      port: config.PORT,
      host: config.HOST,
    })

    console.log('')
    console.log('🚀 Polling Dashboard API Server')
    console.log('================================')
    console.log(`📍 Server:  http://${config.HOST}:${config.PORT}`)
    console.log(`📚 Docs:    http://${config.HOST}:${config.PORT}/docs`)
    console.log(`💚 Health:  http://${config.HOST}:${config.PORT}/health`)
    console.log(`🌍 Env:     ${config.NODE_ENV}`)
    console.log('================================')
    console.log('')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM']
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received, shutting down gracefully...`)
    await server.close()
    process.exit(0)
  })
})

start()
