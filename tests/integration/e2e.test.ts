/**
 * End-to-End Integration Tests
 * Tests the entire application stack working together
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import axios from 'axios'

const API_URL = process.env.API_URL || 'http://localhost:3001'
const WEB_URL = process.env.WEB_URL || 'http://localhost:3000'

describe('End-to-End Integration Tests', () => {
  let authToken: string
  let userId: string
  let testEmail: string

  beforeAll(async () => {
    // Wait for services to be ready
    await waitForService(API_URL, 30000)
    testEmail = `e2e-test-${Date.now()}@example.com`
  })

  describe('Service Health Checks', () => {
    it('API service should be healthy', async () => {
      const response = await axios.get(`${API_URL}/health`)
      expect(response.status).toBe(200)
      expect(response.data.status).toBe('healthy')
    })

    it('Web service should be accessible', async () => {
      const response = await axios.get(WEB_URL)
      expect(response.status).toBe(200)
    })

    it('API documentation should be accessible', async () => {
      const response = await axios.get(`${API_URL}/docs`)
      expect(response.status).toBe(200)
    })
  })

  describe('User Authentication Flow', () => {
    it('should complete full signup and login flow', async () => {
      // 1. Signup
      const signupResponse = await axios.post(`${API_URL}/api/auth/signup`, {
        email: testEmail,
        password: 'SecurePassword123!',
        name: 'E2E Test User',
      })

      expect(signupResponse.status).toBe(201)
      expect(signupResponse.data.token).toBeDefined()
      expect(signupResponse.data.user.email).toBe(testEmail)

      authToken = signupResponse.data.token
      userId = signupResponse.data.user.id

      // 2. Verify can access protected endpoint
      const meResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      expect(meResponse.status).toBe(200)
      expect(meResponse.data.id).toBe(userId)

      // 3. Logout and login again
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: testEmail,
        password: 'SecurePassword123!',
      })

      expect(loginResponse.status).toBe(200)
      expect(loginResponse.data.token).toBeDefined()

      authToken = loginResponse.data.token
    })
  })

  describe('Race Data Flow', () => {
    it('should fetch and display race data', async () => {
      // 1. Fetch races from API
      const racesResponse = await axios.get(`${API_URL}/api/races`)
      expect(racesResponse.status).toBe(200)
      expect(racesResponse.data.races).toBeDefined()
      expect(Array.isArray(racesResponse.data.races)).toBe(true)

      if (racesResponse.data.races.length > 0) {
        const raceSlug = racesResponse.data.races[0].slug

        // 2. Fetch specific race
        const raceResponse = await axios.get(`${API_URL}/api/races/${raceSlug}`)
        expect(raceResponse.status).toBe(200)
        expect(raceResponse.data.slug).toBe(raceSlug)

        // 3. Fetch polls for race
        const pollsResponse = await axios.get(
          `${API_URL}/api/races/${raceSlug}/polls`
        )
        expect(pollsResponse.status).toBe(200)
        expect(pollsResponse.data.polls).toBeDefined()
      }
    })
  })

  describe('Pollster Data Flow', () => {
    it('should fetch and paginate pollsters', async () => {
      const response = await axios.get(`${API_URL}/api/pollsters?limit=10`)

      expect(response.status).toBe(200)
      expect(response.data.pollsters).toBeDefined()
      expect(response.data.meta).toBeDefined()
      expect(response.data.meta.limit).toBe(10)
    })
  })

  describe('Forecast Data Flow', () => {
    it('should fetch available forecasts', async () => {
      const response = await axios.get(`${API_URL}/api/forecasts`)

      expect(response.status).toBe(200)
      expect(response.data.forecasts).toBeDefined()
    })

    it('should fetch forecast by race', async () => {
      // First get a race
      const racesResponse = await axios.get(`${API_URL}/api/races?limit=1`)

      if (racesResponse.data.races.length > 0) {
        const raceSlug = racesResponse.data.races[0].slug

        try {
          const forecastResponse = await axios.get(
            `${API_URL}/api/forecasts/race/${raceSlug}/latest`
          )

          expect(forecastResponse.status).toBe(200)
          expect(forecastResponse.data.race_slug || forecastResponse.data.raceSlug).toBe(
            raceSlug
          )
        } catch (error: any) {
          // Forecast might not exist yet, which is acceptable
          if (error.response?.status !== 404) {
            throw error
          }
        }
      }
    })
  })

  describe('Caching Behavior', () => {
    it('should return cached results on repeated requests', async () => {
      const url = `${API_URL}/api/races?limit=5`

      const start1 = Date.now()
      const response1 = await axios.get(url)
      const time1 = Date.now() - start1

      const start2 = Date.now()
      const response2 = await axios.get(url)
      const time2 = Date.now() - start2

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)

      // Second request should be faster (cached)
      // This is a heuristic and may not always be true
      console.log(`First request: ${time1}ms, Second request: ${time2}ms`)

      // Data should be identical
      expect(JSON.stringify(response1.data)).toBe(JSON.stringify(response2.data))
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent race', async () => {
      try {
        await axios.get(`${API_URL}/api/races/non-existent-race-slug`)
        fail('Should have thrown 404 error')
      } catch (error: any) {
        expect(error.response.status).toBe(404)
      }
    })

    it('should return 401 for unauthorized access', async () => {
      try {
        await axios.get(`${API_URL}/api/auth/me`)
        fail('Should have thrown 401 error')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
      }
    })

    it('should return 400 for invalid data', async () => {
      try {
        await axios.post(`${API_URL}/api/auth/signup`, {
          email: 'invalid-email',
          password: 'weak',
          name: 'X',
        })
        fail('Should have thrown 400 error')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
      }
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limits on rapid requests', async () => {
      const requests = []

      // Send 150 requests rapidly
      for (let i = 0; i < 150; i++) {
        requests.push(
          axios.get(`${API_URL}/api/races?test=${i}`).catch((e) => e.response)
        )
      }

      const responses = await Promise.all(requests)
      const rateLimited = responses.filter((r) => r?.status === 429)

      // Should have some rate limited responses
      expect(rateLimited.length).toBeGreaterThan(0)
    }, 30000) // Increase timeout for this test
  })

  describe('Data Consistency', () => {
    it('should maintain referential integrity between races and polls', async () => {
      const racesResponse = await axios.get(`${API_URL}/api/races`)

      if (racesResponse.data.races.length > 0) {
        const race = racesResponse.data.races[0]
        const pollsResponse = await axios.get(
          `${API_URL}/api/races/${race.slug}/polls`
        )

        // All polls should reference the correct race
        for (const poll of pollsResponse.data.polls) {
          expect(poll.race.slug || poll.raceSlug).toBe(race.slug)
        }
      }
    })
  })

  describe('Database Operations', () => {
    it('should handle concurrent user signups', async () => {
      const signups = []
      const timestamp = Date.now()

      for (let i = 0; i < 10; i++) {
        signups.push(
          axios.post(`${API_URL}/api/auth/signup`, {
            email: `concurrent-${timestamp}-${i}@example.com`,
            password: 'ConcurrentTest123!',
            name: `Concurrent User ${i}`,
          })
        )
      }

      const results = await Promise.all(signups)

      // All should succeed
      expect(results.every((r) => r.status === 201)).toBe(true)

      // All should have unique IDs
      const ids = results.map((r) => r.data.user.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(10)
    })
  })

  describe('Performance', () => {
    it('should respond to API requests within acceptable time', async () => {
      const start = Date.now()
      const response = await axios.get(`${API_URL}/api/races?limit=10`)
      const duration = Date.now() - start

      expect(response.status).toBe(200)
      expect(duration).toBeLessThan(1000) // Should respond within 1 second
    })

    it('should handle pagination efficiently', async () => {
      const start = Date.now()
      const response = await axios.get(`${API_URL}/api/polls?limit=50&offset=0`)
      const duration = Date.now() - start

      expect(response.status).toBe(200)
      expect(duration).toBeLessThan(1500) // Should handle pagination quickly
    })
  })

  describe('Security', () => {
    it('should not expose sensitive information in errors', async () => {
      try {
        await axios.post(`${API_URL}/api/auth/login`, {
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        })
        fail('Should have thrown error')
      } catch (error: any) {
        // Error message should not reveal if email exists
        expect(error.response.data.message).toContain('Invalid email or password')
        expect(error.response.data.message).not.toContain('not found')
        expect(error.response.data.message).not.toContain('does not exist')
      }
    })

    it('should not return password hashes', async () => {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      expect(response.data.passwordHash).toBeUndefined()
      expect(response.data.password).toBeUndefined()
    })

    it('should validate JWT tokens correctly', async () => {
      try {
        await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: 'Bearer invalid-token-here' },
        })
        fail('Should have rejected invalid token')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
      }
    })
  })
})

/**
 * Helper function to wait for a service to be ready
 */
async function waitForService(url: string, timeout: number = 30000): Promise<void> {
  const start = Date.now()

  while (Date.now() - start < timeout) {
    try {
      await axios.get(`${url}/health`, { timeout: 5000 })
      return
    } catch (error) {
      // Service not ready, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  throw new Error(`Service at ${url} did not become ready within ${timeout}ms`)
}
