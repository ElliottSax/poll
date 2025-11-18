import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import websocket from '@fastify/websocket'
import { config } from './config/env'
import { logger } from './utils/logger'
import { prisma } from './utils/prisma'
import { redis } from './utils/redis'

// Import routes
import { racesRoutes } from './routes/races'
import { pollsRoutes } from './routes/polls'
import { pollstersRoutes } from './routes/pollsters'
import { forecastsRoutes } from './routes/forecasts'
import { healthRoutes } from './routes/health'

// Create Fastify instance
const fastify = Fastify({
  logger: logger,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  trustProxy: true,
})

// Graceful shutdown
const closeGracefully = async (signal: string) => {
  fastify.log.info(`Received ${signal}, closing gracefully...`)

  // Close connections
  await prisma.$disconnect()
  await redis.quit()
  await fastify.close()

  process.exit(0)
}

process.on('SIGINT', () => closeGracefully('SIGINT'))
process.on('SIGTERM', () => closeGracefully('SIGTERM'))

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: config.allowedOrigins,
    credentials: true,
  })

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })

  // Rate limiting
  await fastify.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: config.rateLimitWindow,
    cache: 10000,
    redis,
  })

  // WebSocket support
  await fastify.register(websocket)

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Polling Dashboard API',
        description: 'API for election polling data and forecasts',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'health', description: 'Health check endpoints' },
        { name: 'races', description: 'Race endpoints' },
        { name: 'polls', description: 'Poll endpoints' },
        { name: 'pollsters', description: 'Pollster endpoints' },
        { name: 'forecasts', description: 'Forecast endpoints' },
      ],
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  })
}

// Register routes
async function registerRoutes() {
  await fastify.register(healthRoutes, { prefix: '/health' })
  await fastify.register(racesRoutes, { prefix: '/api/races' })
  await fastify.register(pollsRoutes, { prefix: '/api/polls' })
  await fastify.register(pollstersRoutes, { prefix: '/api/pollsters' })
  await fastify.register(forecastsRoutes, { prefix: '/api/forecasts' })
}

// Start server
async function start() {
  try {
    // Test database connection
    await prisma.$connect()
    fastify.log.info('Database connected successfully')

    // Test Redis connection
    await redis.ping()
    fastify.log.info('Redis connected successfully')

    // Register plugins and routes
    await registerPlugins()
    await registerRoutes()

    // Start listening
    await fastify.listen({
      port: config.port,
      host: config.host,
    })

    fastify.log.info(`Server running at http://${config.host}:${config.port}`)
    fastify.log.info(`API documentation at http://${config.host}:${config.port}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
