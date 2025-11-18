/**
 * API Client
 *
 * Type-safe API client for polling dashboard backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface Race {
  id: string
  raceType: string
  raceName: string
  slug: string
  state: string | null
  electionDate: string
  status: string
  candidates: any
  currentLeader: string | null
  competitiveRating: string | null
  importanceScore: number | null
  _count?: {
    polls: number
  }
}

export interface Poll {
  id: string
  raceId: string
  pollsterId: string
  pollDate: string
  sampleSize: number | null
  methodology: string | null
  populationType: string | null
  results: Record<string, number>
  marginOfError: number | null
  pollster?: {
    id: string
    name: string
    slug: string
    methodologyGrade: string | null
  }
}

export interface Pollster {
  id: string
  name: string
  slug: string
  organization: string | null
  overallAccuracy: number | null
  methodologyGrade: string | null
  transparencyScore: number | null
  partisanLean: string | null
  pollCount: number
  lastPollDate: string | null
}

export interface ListResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Races
  async getRaces(params?: {
    type?: string
    state?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.set('type', params.type)
    if (params?.state) searchParams.set('state', params.state)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    return this.request<{ races: Race[]; total: number; limit: number; offset: number }>(
      `/api/races${query ? `?${query}` : ''}`
    )
  }

  async getRace(slug: string) {
    return this.request<Race>(`/api/races/${slug}`)
  }

  async getRacePolls(slug: string, params?: { limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    return this.request<{ polls: Poll[]; total: number; limit: number; offset: number }>(
      `/api/races/${slug}/polls${query ? `?${query}` : ''}`
    )
  }

  // Polls
  async getPolls(params?: {
    methodology?: string
    populationType?: string
    pollsterId?: string
    fromDate?: string
    toDate?: string
    limit?: number
    offset?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.methodology) searchParams.set('methodology', params.methodology)
    if (params?.populationType) searchParams.set('populationType', params.populationType)
    if (params?.pollsterId) searchParams.set('pollsterId', params.pollsterId)
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate)
    if (params?.toDate) searchParams.set('toDate', params.toDate)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    return this.request<{ polls: Poll[]; total: number; limit: number; offset: number }>(
      `/api/polls${query ? `?${query}` : ''}`
    )
  }

  async getPoll(id: string) {
    return this.request<Poll>(`/api/polls/${id}`)
  }

  // Pollsters
  async getPollsters(params?: {
    orderBy?: 'name' | 'accuracy' | 'pollCount'
    limit?: number
    offset?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.orderBy) searchParams.set('orderBy', params.orderBy)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    return this.request<{ pollsters: Pollster[]; total: number; limit: number; offset: number }>(
      `/api/pollsters${query ? `?${query}` : ''}`
    )
  }

  async getPollster(slug: string) {
    return this.request<Pollster>(`/api/pollsters/${slug}`)
  }

  async getPollsterPolls(slug: string, params?: { limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    return this.request<{ polls: Poll[]; total: number; limit: number; offset: number }>(
      `/api/pollsters/${slug}/polls${query ? `?${query}` : ''}`
    )
  }

  // Polling Averages
  async getRaceAverage(slug: string, days: number = 14) {
    return this.request<{
      raceSlug: string
      raceName: string
      timeframe: number
      pollsIncluded: number
      averages: Record<string, number>
      lastUpdated: string
    }>(`/api/races/${slug}/average?days=${days}`)
  }
}

export const api = new ApiClient()
