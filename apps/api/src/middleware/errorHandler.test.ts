import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from './errorHandler'

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 500)
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.isOperational).toBe(true)
    })

    it('should default to status 500', () => {
      const error = new AppError('Test error')
      expect(error.statusCode).toBe(500)
    })

    it('should be instance of Error', () => {
      const error = new AppError('Test error')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
    })

    it('should capture stack trace', () => {
      const error = new AppError('Test error')
      expect(error.stack).toBeTruthy()
    })
  })

  describe('ValidationError', () => {
    it('should create validation error with status 400', () => {
      const error = new ValidationError('Invalid input')
      expect(error.message).toBe('Invalid input')
      expect(error.statusCode).toBe(400)
      expect(error).toBeInstanceOf(AppError)
    })
  })

  describe('NotFoundError', () => {
    it('should create not found error with status 404', () => {
      const error = new NotFoundError('User')
      expect(error.message).toBe('User not found')
      expect(error.statusCode).toBe(404)
    })

    it('should use default message if no resource specified', () => {
      const error = new NotFoundError()
      expect(error.message).toBe('Resource not found')
    })
  })

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with status 401', () => {
      const error = new UnauthorizedError('Invalid token')
      expect(error.message).toBe('Invalid token')
      expect(error.statusCode).toBe(401)
    })

    it('should use default message', () => {
      const error = new UnauthorizedError()
      expect(error.message).toBe('Unauthorized')
    })
  })

  describe('ForbiddenError', () => {
    it('should create forbidden error with status 403', () => {
      const error = new ForbiddenError('Admin access required')
      expect(error.message).toBe('Admin access required')
      expect(error.statusCode).toBe(403)
    })

    it('should use default message', () => {
      const error = new ForbiddenError()
      expect(error.message).toBe('Forbidden')
    })
  })
})
