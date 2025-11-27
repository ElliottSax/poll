import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateToken, verifyToken } from './auth'

// Mock config
vi.mock('../config/env', () => ({
  config: {
    jwtSecret: 'test-secret-key-minimum-32-characters-long',
    jwtExpiresIn: '7d',
  },
}))

describe('Auth Utilities', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'user',
  }

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser)
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should include user information in token', () => {
      const token = generateToken(mockUser)
      const decoded = verifyToken(token)

      expect(decoded).toBeTruthy()
      expect(decoded?.userId).toBe(mockUser.id)
      expect(decoded?.email).toBe(mockUser.email)
      expect(decoded?.role).toBe(mockUser.role)
    })

    it('should generate different tokens for different users', () => {
      const token1 = generateToken(mockUser)
      const token2 = generateToken({ ...mockUser, id: 'user-456' })

      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyToken', () => {
    it('should verify and decode valid token', () => {
      const token = generateToken(mockUser)
      const decoded = verifyToken(token)

      expect(decoded).toBeTruthy()
      expect(decoded?.userId).toBe(mockUser.id)
    })

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid.token.here')
      expect(decoded).toBeNull()
    })

    it('should return null for empty token', () => {
      const decoded = verifyToken('')
      expect(decoded).toBeNull()
    })

    it('should return null for token with wrong signature', () => {
      const token = generateToken(mockUser)
      const tamperedToken = token.slice(0, -5) + 'xxxxx'
      const decoded = verifyToken(tamperedToken)
      expect(decoded).toBeNull()
    })
  })
})
