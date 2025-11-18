import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export function useRaces(params?: {
  type?: string
  state?: string
  status?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ['races', params],
    queryFn: () => api.getRaces(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useRace(slug: string) {
  return useQuery({
    queryKey: ['race', slug],
    queryFn: () => api.getRace(slug),
    staleTime: 5 * 60 * 1000,
  })
}
