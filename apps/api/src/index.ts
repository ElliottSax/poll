import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import websocket from '@fastify/websocket'
import { config } from './config/env'
import { prisma } from './utils/prisma'
import { redis } from './utils/redis'

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { logRequest, logResponse } from './middleware/logging'

// Import routes
import { racesRoutes } from './routes/races'
import { pollsRoutes } from './routes/polls'
import { pollstersRoutes } from './routes/pollsters'
import { forecastsRoutes } from './routes/forecasts'
import { healthRoutes } from './routes/health'
import { scraperRoutes } from './routes/scraper'

// Import services
import { initializeWebSocketService, WebSocketService } from './services/websocket'

// Create Fastify instance with inline logger config
const fastify = Fastify({
  logger: config.isDevelopment
    ? {
        level: config.logLevel,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        level: config.logLevel,
      },
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  trustProxy: true,
})

// Global WebSocket service reference
let wsService: WebSocketService | null = null

// Graceful shutdown
const closeGracefully = async (signal: string) => {
  fastify.log.info(`Received ${signal}, closing gracefully...`)

  // Set timeout for forced shutdown
  const forceShutdownTimeout = setTimeout(() => {
    fastify.log.error('Forced shutdown due to timeout')
    process.exit(1)
  }, 10000) // 10 seconds max

  try {
    // Close WebSocket connections
    if (wsService) {
      await wsService.shutdown()
    }

    // Close other connections
    await prisma.$disconnect()
    await redis.quit()
    await fastify.close()

    clearTimeout(forceShutdownTimeout)
    process.exit(0)
  } catch (error) {
    fastify.log.error({ error }, 'Error during shutdown')
    clearTimeout(forceShutdownTimeout)
    process.exit(1)
  }
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
        { name: 'scraper', description: 'Poll scraping and scheduling' },
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

  // Request/Response logging hooks
  fastify.addHook('onRequest', logRequest)
  fastify.addHook('onResponse', logResponse)

  // Error handlers
  fastify.setErrorHandler(errorHandler)
  fastify.setNotFoundHandler(notFoundHandler)
}

// Register routes
async function registerRoutes() {
  await fastify.register(healthRoutes, { prefix: '/health' })
  await fastify.register(racesRoutes, { prefix: '/api/races' })
  await fastify.register(pollsRoutes, { prefix: '/api/polls' })
  await fastify.register(pollstersRoutes, { prefix: '/api/pollsters' })
  await fastify.register(forecastsRoutes, { prefix: '/api/forecasts' })
  await fastify.register(scraperRoutes, { prefix: '/api/scraper' })
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

    // Initialize WebSocket service
    wsService = initializeWebSocketService(fastify)
    await wsService.initialize()
    fastify.log.info('WebSocket service initialized')

    // Start listening
    await fastify.listen({
      port: config.port,
      host: config.host,
    })

    fastify.log.info(`Server running at http://${config.host}:${config.port}`)
    fastify.log.info(`API documentation at http://${config.host}:${config.port}/docs`)
    fastify.log.info(`WebSocket available at ws://${config.host}:${config.port}/ws`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
