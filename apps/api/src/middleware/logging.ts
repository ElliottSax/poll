import { FastifyRequest, FastifyReply } from 'fastify'

/**
 * Middleware to log all incoming requests
 */
export async function requestLogger(request: FastifyRequest, reply: FastifyReply) {
  const startTime = Date.now()

  reply.addHook('onSend', async (request, reply) => {
    const duration = Date.now() - startTime

    request.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      requestId: request.id,
    })
  })
}

/**
 * Middleware to log slow queries
 */
export async function slowQueryLogger(request: FastifyRequest, reply: FastifyReply) {
  const startTime = Date.now()
  const SLOW_THRESHOLD = 1000 // 1 second

  reply.addHook('onSend', async (request, reply) => {
    const duration = Date.now() - startTime

    if (duration > SLOW_THRESHOLD) {
      request.log.warn({
        type: 'slow_query',
        method: request.method,
        url: request.url,
        duration: `${duration}ms`,
        threshold: `${SLOW_THRESHOLD}ms`,
      })
    }
  })
}

/**
 * Middleware to log errors
 */
export function errorLogger(error: Error, request: FastifyRequest, reply: FastifyReply) {
  request.log.error({
    type: 'error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    method: request.method,
    url: request.url,
    requestId: request.id,
  })
}
