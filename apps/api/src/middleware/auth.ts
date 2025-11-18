import { FastifyRequest, FastifyReply } from 'fastify'
import { verify } from 'jsonwebtoken'
import { config } from '../config/env'

export interface AuthenticatedUser {
  id: string
  email: string
  role: 'user' | 'admin' | 'developer'
  tier: 'free' | 'premium' | 'developer' | 'professional' | 'enterprise'
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser
  }
}

/**
 * Verify JWT token from Authorization header
 */
export async function verifyToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = verify(token, config.jwtSecret) as AuthenticatedUser
      request.user = decoded
    } catch (error) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      })
    }
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to verify authentication',
    })
  }
}

/**
 * Optional authentication - sets user if token is valid, but doesn't fail if missing
 */
export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - continue without user
      return
    }

    const token = authHeader.substring(7)

    try {
      const decoded = verify(token, config.jwtSecret) as AuthenticatedUser
      request.user = decoded
    } catch (error) {
      // Invalid token - continue without user
      request.log.warn('Invalid token provided in optional auth')
    }
  } catch (error) {
    request.log.error(error)
  }
}

/**
 * Require admin role
 */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    })
  }

  if (request.user.role !== 'admin') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Admin access required',
    })
  }
}

/**
 * Require developer or higher tier
 */
export async function requireDeveloper(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    })
  }

  const allowedTiers = ['developer', 'professional', 'enterprise']
  if (!allowedTiers.includes(request.user.tier)) {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Developer tier or higher required',
    })
  }
}

/**
 * Require premium tier or higher
 */
export async function requirePremium(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    })
  }

  const allowedTiers = ['premium', 'developer', 'professional', 'enterprise']
  if (!allowedTiers.includes(request.user.tier)) {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Premium tier or higher required',
    })
  }
}

/**
 * Verify API key from X-API-Key header
 */
export async function verifyApiKey(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const apiKey = request.headers['x-api-key'] as string

    if (!apiKey) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing API key',
      })
    }

    // TODO: Implement API key validation against database
    // For now, just check if it matches a simple pattern
    if (!apiKey.startsWith('pk_') && !apiKey.startsWith('sk_')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid API key format',
      })
    }

    // TODO: Fetch user details from API key and set request.user
    // const apiKeyRecord = await prisma.apiKey.findUnique({ where: { key: apiKey } })
    // request.user = apiKeyRecord.user

  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to verify API key',
    })
  }
}

/**
 * Check if user owns the resource
 */
export function requireOwnership(resourceUserIdField: string = 'userId') {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
      })
    }

    // Admin can access any resource
    if (request.user.role === 'admin') {
      return
    }

    // Get resource from request params or body
    const resourceUserId =
      (request.params as any)[resourceUserIdField] ||
      (request.body as any)?.[resourceUserIdField]

    if (!resourceUserId) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Resource user ID not found',
      })
    }

    if (resourceUserId !== request.user.id) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      })
    }
  }
}
