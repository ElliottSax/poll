import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import Fastify, { FastifyInstance } from 'fastify'
import { authRoutes } from '../src/routes/auth'
import { prisma } from '../src/utils/prisma'
import { sign } from 'jsonwebtoken'
import { config } from '../src/config/env'

describe('Auth Routes', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = Fastify()
    await app.register(authRoutes, { prefix: '/api/auth' })
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    })
  })

  describe('POST /api/auth/signup', () => {
    it('should create a new user account', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'test@example.com',
          password: 'SecurePassword123!',
          name: 'Test User',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.user).toBeDefined()
      expect(body.user.email).toBe('test@example.com')
      expect(body.user.name).toBe('Test User')
      expect(body.token).toBeDefined()
      expect(body.user.passwordHash).toBeUndefined() // Should not expose password
    })

    it('should reject duplicate email', async () => {
      // Create first user
      await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'test@example.com',
          password: 'Password123!',
          name: 'User One',
        },
      })

      // Try to create duplicate
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'test@example.com',
          password: 'DifferentPass123!',
          name: 'User Two',
        },
      })

      expect(response.statusCode).toBe(409)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Conflict')
    })

    it('should reject weak passwords', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'invalid-email',
          password: 'SecurePassword123!',
          name: 'Test User',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should handle SQL injection attempts in email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: "test'; DROP TABLE users; --@example.com",
          password: 'SecurePassword123!',
          name: 'Test User',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'testlogin@example.com',
          password: 'LoginPassword123!',
          name: 'Login Test',
        },
      })
    })

    it('should login with correct credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'testlogin@example.com',
          password: 'LoginPassword123!',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.token).toBeDefined()
      expect(body.user.email).toBe('testlogin@example.com')
      expect(body.expiresIn).toBe(604800) // 7 days
    })

    it('should reject wrong password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'testlogin@example.com',
          password: 'WrongPassword123!',
        },
      })

      expect(response.statusCode).toBe(401)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Unauthorized')
    })

    it('should reject non-existent user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        },
      })

      expect(response.statusCode).toBe(401)
    })

    it('should be case-sensitive for email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'TESTLOGIN@EXAMPLE.COM',
          password: 'LoginPassword123!',
        },
      })

      // This might fail - email should be normalized to lowercase
      expect(response.statusCode).toBe(401)
    })
  })

  describe('GET /api/auth/me', () => {
    let token: string
    let userId: string

    beforeEach(async () => {
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'testme@example.com',
          password: 'MePassword123!',
          name: 'Me Test',
        },
      })

      const body = JSON.parse(signupResponse.body)
      token = body.token
      userId = body.user.id
    })

    it('should return current user with valid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.id).toBe(userId)
      expect(body.email).toBe('testme@example.com')
      expect(body.passwordHash).toBeUndefined()
    })

    it('should reject missing token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
      })

      expect(response.statusCode).toBe(401)
    })

    it('should reject invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: 'Bearer invalid-token-here',
        },
      })

      expect(response.statusCode).toBe(401)
    })

    it('should reject expired token', async () => {
      const expiredToken = sign(
        { id: userId, email: 'testme@example.com', role: 'user', tier: 'free' },
        config.jwtSecret,
        { expiresIn: '-1h' }
      )

      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${expiredToken}`,
        },
      })

      expect(response.statusCode).toBe(401)
    })
  })

  describe('POST /api/auth/change-password', () => {
    let token: string

    beforeEach(async () => {
      const signupResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'testpass@example.com',
          password: 'OldPassword123!',
          name: 'Password Test',
        },
      })

      const body = JSON.parse(signupResponse.body)
      token = body.token
    })

    it('should change password with correct current password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/change-password',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!',
        },
      })

      expect(response.statusCode).toBe(200)

      // Verify can login with new password
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'testpass@example.com',
          password: 'NewPassword456!',
        },
      })

      expect(loginResponse.statusCode).toBe(200)
    })

    it('should reject wrong current password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/change-password',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword456!',
        },
      })

      expect(response.statusCode).toBe(401)
    })

    it('should reject weak new password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/change-password',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          currentPassword: 'OldPassword123!',
          newPassword: 'weak',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('Security Tests', () => {
    it('should not expose sensitive data in error messages', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'AnyPassword123!',
        },
      })

      const body = JSON.parse(response.body)
      expect(body.message).not.toContain('not found')
      expect(body.message).not.toContain('does not exist')
      // Should use generic message
      expect(body.message).toContain('Invalid email or password')
    })

    it('should rate limit signup attempts', async () => {
      const promises = []

      for (let i = 0; i < 150; i++) {
        promises.push(
          app.inject({
            method: 'POST',
            url: '/api/auth/signup',
            payload: {
              email: `test${i}@example.com`,
              password: 'Password123!',
              name: `User ${i}`,
            },
          })
        )
      }

      const responses = await Promise.all(promises)
      const tooManyRequests = responses.filter(r => r.statusCode === 429)

      expect(tooManyRequests.length).toBeGreaterThan(0)
    })

    it('should use secure bcrypt rounds', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'bcrypttest@example.com',
          password: 'TestPassword123!',
          name: 'Bcrypt Test',
        },
      })

      const user = await prisma.user.findUnique({
        where: { email: 'bcrypttest@example.com' },
      })

      // Bcrypt hash should start with $2b$12$ (12 rounds)
      expect(user?.passwordHash).toMatch(/^\$2b\$12\$/)
    })
  })
})
