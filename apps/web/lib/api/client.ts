import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

class ApiClient {
  private client: AxiosInstance

  constructor(baseURL: string = '/api') {
    // Use Next.js API routes as proxy to avoid exposing API keys
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Handle specific error codes
          switch (error.response.status) {
            case 401:
              console.error('Unauthorized: Invalid or missing API key')
              break
            case 404:
              console.error('Not found:', error.config.url)
              break
            case 429:
              console.error('Rate limit exceeded')
              break
            case 500:
              console.error('Server error')
              break
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config)
    return response.data
  }

  // Races
  async getRaces(params?: {
    type?: string
    state?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    return this.request({
      method: 'GET',
      url: '/races',
      params,
    })
  }

  async getRace(slug: string) {
    return this.request({
      method: 'GET',
      url: `/races/${slug}`,
    })
  }

  // Polls
  async getPolls(params?: {
    raceId?: string
    pollsterId?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) {
    return this.request({
      method: 'GET',
      url: '/polls',
      params,
    })
  }

  async getPoll(id: string) {
    return this.request({
      method: 'GET',
      url: `/polls/${id}`,
    })
  }

  async getRacePolls(raceId: string, limit?: number) {
    return this.request({
      method: 'GET',
      url: `/polls/race/${raceId}`,
      params: { limit },
    })
  }

  async getRecentPolls(limit?: number) {
    return this.request({
      method: 'GET',
      url: '/polls/recent',
      params: { limit },
    })
  }

  // Pollsters
  async getPollsters(params?: {
    orderBy?: 'accuracy' | 'pollCount' | 'grade' | 'name'
    limit?: number
    offset?: number
  }) {
    return this.request({
      method: 'GET',
      url: '/api/pollsters',
      params,
    })
  }

  async getPollster(slug: string) {
    return this.request({
      method: 'GET',
      url: `/api/pollsters/${slug}`,
    })
  }

  async getPollsterAccuracy(slug: string) {
    return this.request({
      method: 'GET',
      url: `/api/pollsters/${slug}/accuracy`,
    })
  }

  async getTopPollsters(limit?: number) {
    return this.request({
      method: 'GET',
      url: '/api/pollsters/rankings/top',
      params: { limit },
    })
  }

  // Forecasts
  async getPresidentialForecast() {
    return this.request({
      method: 'GET',
      url: '/api/forecasts/presidential',
    })
  }

  async getSenateForecast() {
    return this.request({
      method: 'GET',
      url: '/api/forecasts/senate',
    })
  }

  async getHouseForecast() {
    return this.request({
      method: 'GET',
      url: '/api/forecasts/house',
    })
  }

  async getRaceForecast(raceId: string) {
    return this.request({
      method: 'GET',
      url: `/api/forecasts/race/${raceId}`,
    })
  }

  async getRaceForecastHistory(raceId: string, limit?: number) {
    return this.request({
      method: 'GET',
      url: `/api/forecasts/race/${raceId}/history`,
      params: { limit },
    })
  }

  // Health
  async getHealth() {
    return this.request({
      method: 'GET',
      url: '/health',
    })
  }

  async getDetailedHealth() {
    return this.request({
      method: 'GET',
      url: '/health/detailed',
    })
  }
}

// Export singleton instance
export const api = new ApiClient()

// Export class for custom instances
export { ApiClient }
