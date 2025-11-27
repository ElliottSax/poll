import { FastifyRequest, FastifyReply } from 'fastify'
import { logger } from '../utils/logger'

/**
 * Request logging middleware
 * Logs structured information about each request/response
 */

export interface RequestLog {
  requestId: string
  method: string
  url: string
  params?: Record<string, any>
  query?: Record<string, any>
  userAgent?: string
  ip?: string
  userId?: string
  statusCode: number
  responseTime: number
  error?: string
}

/**
 * Hook to log incoming requests
 */
export async function logRequest(request: FastifyRequest, reply: FastifyReply) {
  const startTime = Date.now()

  // Store start time for response logging
  ;(request as any).startTime = startTime

  logger.info({
    requestId: request.id,
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
    userId: request.user?.id,
  }, 'Incoming request')
}

/**
 * Hook to log response
 */
export async function logResponse(request: FastifyRequest, reply: FastifyReply) {
  const startTime = (request as any).startTime || Date.now()
  const responseTime = Date.now() - startTime

  const logData: RequestLog = {
    requestId: request.id,
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    responseTime,
    userId: request.user?.id,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  }

  // Add query params if present (filter sensitive data)
  if (Object.keys(request.query as object).length > 0) {
    logData.query = sanitizeLogData(request.query as Record<string, any>)
  }

  // Add route params if present
  if (Object.keys(request.params as object).length > 0) {
    logData.params = request.params as Record<string, any>
  }

  // Log based on status code
  if (reply.statusCode >= 500) {
    logger.error(logData, 'Request failed with server error')
  } else if (reply.statusCode >= 400) {
    logger.warn(logData, 'Request failed with client error')
  } else {
    logger.info(logData, 'Request completed')
  }

  // Alert on slow requests (>2 seconds)
  if (responseTime > 2000) {
    logger.warn({
      ...logData,
      slowRequest: true,
    }, 'Slow request detected')
  }
}

/**
 * Remove sensitive data from logs
 */
function sanitizeLogData(data: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'authorization',
    'cookie',
    'sessionId',
    'session_id',
  ]

  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()

    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Log database queries (for debugging)
 */
export function logDatabaseQuery(query: string, duration: number, params?: any[]) {
  logger.debug({
    query,
    duration,
    params: params ? sanitizeLogData({ params }).params : undefined,
  }, 'Database query executed')
}

/**
 * Log cache operations
 */
export function logCacheOperation(
  operation: 'get' | 'set' | 'del',
  key: string,
  hit?: boolean,
  ttl?: number
) {
  logger.debug({
    operation,
    key,
    hit,
    ttl,
  }, 'Cache operation')
}

/**
 * Log external API calls
 */
export function logExternalRequest(
  url: string,
  method: string,
  statusCode?: number,
  duration?: number,
  error?: string
) {
  const logData = {
    externalRequest: true,
    url,
    method,
    statusCode,
    duration,
    error,
  }

  if (error || (statusCode && statusCode >= 400)) {
    logger.warn(logData, 'External request failed')
  } else {
    logger.info(logData, 'External request completed')
  }
}

/**
 * Log authentication events
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'token_refresh' | 'auth_failed',
  userId?: string,
  reason?: string,
  ip?: string
) {
  const logData = {
    authEvent: event,
    userId,
    reason,
    ip,
  }

  if (event === 'auth_failed') {
    logger.warn(logData, 'Authentication failed')
  } else {
    logger.info(logData, 'Authentication event')
  }
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, any>
) {
  const logData = {
    securityEvent: event,
    severity,
    ...details,
  }

  if (severity === 'critical' || severity === 'high') {
    logger.error(logData, 'Security event detected')
  } else if (severity === 'medium') {
    logger.warn(logData, 'Security event detected')
  } else {
    logger.info(logData, 'Security event detected')
  }
}
