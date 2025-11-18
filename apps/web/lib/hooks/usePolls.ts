import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export function usePolls(params?: {
  raceId?: string
  pollsterId?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ['polls', params],
    queryFn: () => api.getPolls(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

export function useRacePolls(raceId: string, limit?: number) {
  return useQuery({
    queryKey: ['polls', 'race', raceId, limit],
    queryFn: () => api.getRacePolls(raceId, limit),
    staleTime: 3 * 60 * 1000,
  })
}

export function useRecentPolls(limit?: number) {
  return useQuery({
    queryKey: ['polls', 'recent', limit],
    queryFn: () => api.getRecentPolls(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
