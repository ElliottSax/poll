import { FastifyError, FastifyRequest, FastifyReply } from 'fastify'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403)
  }
}

/**
 * Global error handler middleware
 */
export async function errorHandler(
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error
  request.log.error({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    requestId: request.id,
    url: request.url,
    method: request.method,
  })

  // Handle known errors
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error: error.name,
      message: error.message,
      statusCode: error.statusCode,
      requestId: request.id,
    })
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.code(400).send({
      error: 'ValidationError',
      message: 'Request validation failed',
      details: error.validation,
      statusCode: 400,
      requestId: request.id,
    })
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any

    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return reply.code(409).send({
        error: 'ConflictError',
        message: 'Resource already exists',
        statusCode: 409,
        requestId: request.id,
      })
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return reply.code(404).send({
        error: 'NotFoundError',
        message: 'Resource not found',
        statusCode: 404,
        requestId: request.id,
      })
    }
  }

  // Handle rate limit errors
  if (error.statusCode === 429) {
    return reply.code(429).send({
      error: 'TooManyRequestsError',
      message: 'Too many requests, please try again later',
      statusCode: 429,
      requestId: request.id,
      retryAfter: reply.getHeader('Retry-After'),
    })
  }

  // Default error response
  const statusCode = error.statusCode || 500
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message || 'Internal server error'

  return reply.code(statusCode).send({
    error: 'InternalServerError',
    message,
    statusCode,
    requestId: request.id,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  })
}

/**
 * Not found handler
 */
export async function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.code(404).send({
    error: 'NotFoundError',
    message: `Route ${request.method}:${request.url} not found`,
    statusCode: 404,
    requestId: request.id,
  })
}
