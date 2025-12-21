import { FastifyRequest, FastifyReply } from 'fastify'
import { z, ZodSchema } from 'zod'
import { ValidationError } from './errorHandler'

/**
 * Validation middleware factory
 * Creates middleware that validates request data against a Zod schema
 */

export interface ValidationOptions {
  query?: ZodSchema
  params?: ZodSchema
  body?: ZodSchema
}

/**
 * Create a validation middleware for Fastify routes
 */
export function validate(options: ValidationOptions) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      // Validate query parameters
      if (options.query) {
        request.query = options.query.parse(request.query)
      }

      // Validate route parameters
      if (options.params) {
        request.params = options.params.parse(request.params)
      }

      // Validate request body
      if (options.body) {
        request.body = options.body.parse(request.body)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors into a user-friendly message
        const messages = error.errors.map((err) => {
          const path = err.path.join('.')
          return `${path}: ${err.message}`
        })

        throw new ValidationError(messages.join(', '))
      }
      throw error
    }
  }
}

/**
 * Validate data against a schema and return typed result
 */
export function validateData<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => {
        const path = err.path.join('.')
        return `${path}: ${err.message}`
      })
      throw new ValidationError(messages.join(', '))
    }
    throw error
  }
}

/**
 * Safe parse that returns success/error result
 */
export function safeValidate<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const messages = result.error.errors.map((err) => {
    const path = err.path.join('.')
    return `${path}: ${err.message}`
  })

  return { success: false, error: messages.join(', ') }
}

/**
 * Sanitize input by removing potentially harmful content
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/[^\w\s.,!?@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, '') // Remove special chars
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as any
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value)
    } else {
      sanitized[key as keyof T] = value
    }
  }

  return sanitized
}
