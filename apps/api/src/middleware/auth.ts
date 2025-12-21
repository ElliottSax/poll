import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { config } from '../config/env'
import { prisma } from '../utils/prisma'
import { UnauthorizedError, ForbiddenError } from './errorHandler'

export interface AuthUser {
  id: string
  email: string
  role: 'user' | 'admin' | 'moderator'
}

export interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'admin' | 'moderator'
  iat?: number
  exp?: number
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser
  }
}

/**
 * Middleware to verify API key authentication
 * Used for system-to-system authentication
 */
export async function verifyApiKey(request: FastifyRequest, _reply: FastifyReply) {
  const apiKey = request.headers['x-api-key'] as string

  if (!apiKey) {
    throw new UnauthorizedError('API key is required')
  }

  // Verify API key against configured secret
  if (apiKey !== config.apiSecret) {
    throw new UnauthorizedError('Invalid API key')
  }

  // Attach system user to request
  request.user = {
    id: 'system',
    email: 'api@pollingdashboard.com',
    role: 'admin',
  }
}

/**
 * Middleware to verify JWT authentication
 * Used for user authentication
 */
export async function verifyJWT(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Bearer token is required')
  }

  const token = authHeader.substring(7)

  try {
    // Verify and decode JWT token
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload

    // Optionally verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isBanned: true,
      },
    })

    if (!user) {
      throw new UnauthorizedError('User not found')
    }

    if (user.isBanned) {
      throw new ForbiddenError('User account is banned')
    }

    // Attach user to request
    request.user = {
      id: user.id,
      email: user.email,
      role: user.role as 'user' | 'admin' | 'moderator',
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token')
    }
    throw error
  }
}

/**
 * Middleware to check if user is admin
 */
export async function requireAdmin(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.user) {
    throw new UnauthorizedError('Authentication required')
  }

  if (request.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required')
  }
}

/**
 * Middleware to check if user is moderator or admin
 */
export async function requireModerator(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.user) {
    throw new UnauthorizedError('Authentication required')
  }

  if (request.user.role !== 'admin' && request.user.role !== 'moderator') {
    throw new ForbiddenError('Moderator or admin access required')
  }
}

/**
 * Generate JWT token for a user
 */
export function generateToken(user: { id: string; email: string; role: string }): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as 'user' | 'admin' | 'moderator',
  }

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    issuer: 'polling-dashboard-api',
  })
}

/**
 * Verify and decode JWT token without throwing
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as JWTPayload
  } catch {
    return null
  }
}
