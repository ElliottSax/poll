import Fastify, { FastifyInstance } from 'fastify'
import { config } from '../config/env'

/**
 * Test helpers for integration testing
 */

/**
 * Create a test Fastify instance
 * Replicates production setup without starting server
 */
export async function buildTestApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false, // Disable logging in tests
  })

  // Import and register plugins/routes
  const cors = await import('@fastify/cors')
  const helmet = await import('@fastify/helmet')

  await fastify.register(cors.default, {
    origin: config.allowedOrigins,
    credentials: true,
  })

  await fastify.register(helmet.default, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })

  // Register error handlers
  const { errorHandler, notFoundHandler } = await import('../middleware/errorHandler')
  fastify.setErrorHandler(errorHandler)
  fastify.setNotFoundHandler(notFoundHandler)

  // Register routes
  const { healthRoutes } = await import('../routes/health')
  const { pollsRoutes } = await import('../routes/polls')
  const { racesRoutes } = await import('../routes/races')

  await fastify.register(healthRoutes, { prefix: '/health' })
  await fastify.register(pollsRoutes, { prefix: '/api/polls' })
  await fastify.register(racesRoutes, { prefix: '/api/races' })

  return fastify
}

/**
 * Generate test JWT token
 */
export function generateTestToken(user?: {
  id?: string
  email?: string
  role?: string
}): string {
  const { generateToken } = require('../middleware/auth')
  return generateToken({
    id: user?.id || 'test-user-id',
    email: user?.email || 'test@example.com',
    role: user?.role || 'user',
  })
}

/**
 * Create mock poll data
 */
export function createMockPoll(overrides?: any) {
  return {
    id: 'poll-123',
    raceId: 'race-123',
    pollsterId: 'pollster-123',
    pollDate: new Date('2024-01-15'),
    sampleSize: 1000,
    methodology: 'phone',
    results: {
      'Candidate A': 48.5,
      'Candidate B': 46.2,
    },
    marginOfError: 3.1,
    isPartisan: false,
    isOutlier: false,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create mock race data
 */
export function createMockRace(overrides?: any) {
  return {
    id: 'race-123',
    slug: 'us-president-2024',
    raceType: 'president',
    raceName: 'US Presidential Election 2024',
    country: 'USA',
    electionDate: new Date('2024-11-05'),
    isSpecialElection: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create mock pollster data
 */
export function createMockPollster(overrides?: any) {
  return {
    id: 'pollster-123',
    name: 'Quality Polling Institute',
    slug: 'quality-polling',
    overallAccuracy: 92.5,
    methodologyGrade: 'A',
    pollCount: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
