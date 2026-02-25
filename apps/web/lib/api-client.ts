/**
 * Type-safe API client
 * Provides type-safe methods for calling the backend API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

async function fetcher<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new APIError(
        error.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        error
      )
    }

    return response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error',
      0
    )
  }
}

// Types
export interface Race {
  id: string
  slug: string
  raceType: 'president' | 'senate' | 'house' | 'governor'
  raceName: string
  state?: string
  district?: string
  electionDate: string
  status: 'upcoming' | 'active' | 'completed'
  currentLeader?: string
  currentMargin?: number
  competitiveRating?: string
  importanceScore?: number
  electoralVotes?: number
  createdAt: string
  updatedAt: string
}

export interface Poll {
  id: string
  raceId: string
  pollsterId: string
  pollDate: string
  fieldDateStart?: string
  fieldDateEnd?: string
  sampleSize?: number
  methodology?: 'phone' | 'online' | 'ivr' | 'sms' | 'mixed'
  populationType?: 'rv' | 'lv' | 'a'
  results: Record<string, number>
  marginOfError?: number
  sourceUrl?: string
  pollster?: {
    name: string
    slug: string
    methodologyGrade?: string
  }
  createdAt: string
}

export interface Pollster {
  id: string
  name: string
  slug: string
  organization?: string
  website?: string
  overallAccuracy?: number
  methodologyGrade?: string
  transparencyScore?: number
  partisanLean?: string
  pollCount: number
  firstPollDate?: string
  lastPollDate?: string
  createdAt: string
  updatedAt: string
}

export interface Forecast {
  id: string
  raceId: string
  forecastDate: string
  modelVersion: string
  probabilities: Record<string, number>
  predictedMargins: Record<string, string>
  predictedVoteShare: Record<string, number>
  simulationsRun: number
  volatilityIndex?: number
  contributingPolls?: number
  pollQualityScore?: number
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// API Client
export const api = {
  // Health
  health: {
    check: () => fetcher<{ status: string; timestamp: string }>('/health'),
  },

  // Races
  races: {
    list: (params?: {
      type?: string
      state?: string
      status?: string
      limit?: number
      offset?: number
    }) => {
      const query = new URLSearchParams(
        params as Record<string, string>
      ).toString()
      return fetcher<PaginatedResponse<Race>>(
        `/api/races${query ? `?${query}` : ''}`
      )
    },

    get: (slug: string) => fetcher<Race>(`/api/races/${slug}`),

    featured: (limit?: number) =>
      fetcher<Race[]>(`/api/races/featured${limit ? `?limit=${limit}` : ''}`),

    trending: (params?: { limit?: number; days?: number }) => {
      const query = new URLSearchParams(
        params as Record<string, string>
      ).toString()
      return fetcher<Race[]>(`/api/races/trending${query ? `?${query}` : ''}`)
    },

    stats: () =>
      fetcher<{
        totalRaces: number
        totalPolls: number
        totalPollsters: number
        lastUpdated: string
      }>('/api/races/stats'),
  },

  // Polls
  polls: {
    list: (params?: {
      raceId?: string
      pollsterId?: string
      startDate?: string
      endDate?: string
      limit?: number
      offset?: number
    }) => {
      const query = new URLSearchParams(
        params as Record<string, string>
      ).toString()
      return fetcher<PaginatedResponse<Poll>>(
        `/api/polls${query ? `?${query}` : ''}`
      )
    },

    get: (id: string) => fetcher<Poll>(`/api/polls/${id}`),

    recent: (limit?: number) =>
      fetcher<Poll[]>(`/api/polls/recent${limit ? `?limit=${limit}` : ''}`),
  },

  // Pollsters
  pollsters: {
    list: (params?: { orderBy?: string; limit?: number; offset?: number }) => {
      const query = new URLSearchParams(
        params as Record<string, string>
      ).toString()
      return fetcher<PaginatedResponse<Pollster>>(
        `/api/pollsters${query ? `?${query}` : ''}`
      )
    },

    get: (slug: string) => fetcher<Pollster>(`/api/pollsters/${slug}`),
  },

  // Forecasts
  forecasts: {
    presidential: () => fetcher<Forecast>('/api/forecasts/presidential'),
    senate: () => fetcher<Forecast>('/api/forecasts/senate'),
    race: (raceId: string) => fetcher<Forecast>(`/api/forecasts/race/${raceId}`),
  },

  // Scraper
  scraper: {
    run: () =>
      fetcher<{ success: boolean; summary: any; results: any[] }>(
        '/api/scraper/run',
        { method: 'POST' }
      ),

    status: () =>
      fetcher<{
        status: string
        lastScrape: string | null
        stats: {
          totalPolls: number
          totalRaces: number
          totalPollsters: number
        }
        availableScrapers: string[]
      }>('/api/scraper/status'),
  },
}

export { APIError }
