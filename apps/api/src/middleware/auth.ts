import { FastifyRequest, FastifyReply } from 'fastify'

export interface AuthUser {
  id: string
  email: string
  role: 'user' | 'admin' | 'moderator'
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser
  }
}

/**
 * Middleware to verify API key authentication
 */
export async function verifyApiKey(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = request.headers['x-api-key'] as string

  if (!apiKey) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'API key is required',
    })
  }

  // TODO: Verify API key against database
  // For now, just check if it exists
  if (apiKey !== process.env.API_KEY) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid API key',
    })
  }

  // TODO: Attach user to request
  request.user = {
    id: 'system',
    email: 'api@pollingdashboard.com',
    role: 'admin',
  }
}

/**
 * Middleware to verify JWT authentication
 */
export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Bearer token is required',
    })
  }

  const token = authHeader.substring(7)

  try {
    // TODO: Verify JWT token
    // For now, just validate format
    if (!token || token.length < 10) {
      throw new Error('Invalid token format')
    }

    // TODO: Decode and validate token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET)

    request.user = {
      id: 'user-123',
      email: 'user@example.com',
      role: 'user',
    }
  } catch (error) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    })
  }
}

/**
 * Middleware to check if user is admin
 */
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    })
  }

  if (request.user.role !== 'admin') {
    return reply.code(403).send({
      error: 'Forbidden',
      message: 'Admin access required',
    })
  }
}

/**
 * Middleware to check if user is moderator or admin
 */
export async function requireModerator(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    })
  }

  if (request.user.role !== 'admin' && request.user.role !== 'moderator') {
    return reply.code(403).send({
      error: 'Forbidden',
      message: 'Moderator or admin access required',
    })
  }
}
