/**
 * Global Error Handler
 *
 * Catches and formats all errors in a consistent way
 */

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { Prisma } from '@poll/database'

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error)

  // Zod Validation Errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    })
  }

  // Prisma Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'A record with this value already exists',
        field: (error.meta?.target as string[])?.join(', '),
      })
    }

    // Record not found
    if (error.code === 'P2025') {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'The requested record was not found',
      })
    }

    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid reference to related record',
      })
    }
  }

  // Fastify Errors
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
    })
  }

  // Default 500 Error
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development'
      ? error.message
      : 'An unexpected error occurred',
  })
}
