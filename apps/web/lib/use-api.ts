/**
 * React hooks for API calls
 * Uses TanStack Query for caching and state management
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api-client'

// Query keys
export const queryKeys = {
  races: {
    all: ['races'] as const,
    list: (params?: any) => ['races', 'list', params] as const,
    detail: (slug: string) => ['races', 'detail', slug] as const,
    featured: (limit?: number) => ['races', 'featured', limit] as const,
    trending: (params?: any) => ['races', 'trending', params] as const,
    stats: ['races', 'stats'] as const,
  },
  polls: {
    all: ['polls'] as const,
    list: (params?: any) => ['polls', 'list', params] as const,
    detail: (id: string) => ['polls', 'detail', id] as const,
    recent: (limit?: number) => ['polls', 'recent', limit] as const,
  },
  pollsters: {
    all: ['pollsters'] as const,
    list: (params?: any) => ['pollsters', 'list', params] as const,
    detail: (slug: string) => ['pollsters', 'detail', slug] as const,
  },
  forecasts: {
    presidential: ['forecasts', 'presidential'] as const,
    senate: ['forecasts', 'senate'] as const,
    race: (id: string) => ['forecasts', 'race', id] as const,
  },
  scraper: {
    status: ['scraper', 'status'] as const,
  },
}

// Race hooks
export function useRaces(params?: Parameters<typeof api.races.list>[0]) {
  return useQuery({
    queryKey: queryKeys.races.list(params),
    queryFn: () => api.races.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useRace(slug: string) {
  return useQuery({
    queryKey: queryKeys.races.detail(slug),
    queryFn: () => api.races.get(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFeaturedRaces(limit?: number) {
  return useQuery({
    queryKey: queryKeys.races.featured(limit),
    queryFn: () => api.races.featured(limit),
    staleTime: 3 * 60 * 1000, // 3 minutes (more frequent for homepage)
  })
}

export function useTrendingRaces(params?: Parameters<typeof api.races.trending>[0]) {
  return useQuery({
    queryKey: queryKeys.races.trending(params),
    queryFn: () => api.races.trending(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRaceStats() {
  return useQuery({
    queryKey: queryKeys.races.stats,
    queryFn: () => api.races.stats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Poll hooks
export function usePolls(params?: Parameters<typeof api.polls.list>[0]) {
  return useQuery({
    queryKey: queryKeys.polls.list(params),
    queryFn: () => api.polls.list(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePoll(id: string) {
  return useQuery({
    queryKey: queryKeys.polls.detail(id),
    queryFn: () => api.polls.get(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // Polls don't change often
  })
}

export function useRecentPolls(limit?: number) {
  return useQuery({
    queryKey: queryKeys.polls.recent(limit),
    queryFn: () => api.polls.recent(limit),
    staleTime: 3 * 60 * 1000,
  })
}

// Pollster hooks
export function usePollsters(params?: Parameters<typeof api.pollsters.list>[0]) {
  return useQuery({
    queryKey: queryKeys.pollsters.list(params),
    queryFn: () => api.pollsters.list(params),
    staleTime: 30 * 60 * 1000, // 30 minutes (pollster data rarely changes)
  })
}

export function usePollster(slug: string) {
  return useQuery({
    queryKey: queryKeys.pollsters.detail(slug),
    queryFn: () => api.pollsters.get(slug),
    enabled: !!slug,
    staleTime: 30 * 60 * 1000,
  })
}

// Forecast hooks
export function usePresidentialForecast() {
  return useQuery({
    queryKey: queryKeys.forecasts.presidential,
    queryFn: () => api.forecasts.presidential(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useSenateForecast() {
  return useQuery({
    queryKey: queryKeys.forecasts.senate,
    queryFn: () => api.forecasts.senate(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useRaceForecast(raceId: string) {
  return useQuery({
    queryKey: queryKeys.forecasts.race(raceId),
    queryFn: () => api.forecasts.race(raceId),
    enabled: !!raceId,
    staleTime: 10 * 60 * 1000,
  })
}

// Scraper hooks
export function useScraperStatus() {
  return useQuery({
    queryKey: queryKeys.scraper.status,
    queryFn: () => api.scraper.status(),
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useRunScraper() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.scraper.run(),
    onSuccess: () => {
      // Invalidate all data queries after scraper runs
      queryClient.invalidateQueries({ queryKey: queryKeys.races.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.polls.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.pollsters.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.scraper.status })
    },
  })
}
