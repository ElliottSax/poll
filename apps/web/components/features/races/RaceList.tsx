'use client'

import { useQuery } from '@tanstack/react-query'
import { RaceCard } from './RaceCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Race {
  id: string
  slug: string
  title: string
  state: string
  office: string
  year: number
  description: string | null
  featured: boolean
  leader?: {
    candidate: string
    margin: number
  }
}

async function fetchRaces(): Promise<Race[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const res = await fetch(`${apiUrl}/api/races`)

  if (!res.ok) {
    throw new Error('Failed to fetch races')
  }

  const data = await res.json()
  return data.races || []
}

export function RaceList() {
  const { data: races, isLoading, error } = useQuery({
    queryKey: ['races'],
    queryFn: fetchRaces,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Failed to load races</p>
        <p className="text-red-600 text-sm mt-1">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  if (!races || races.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 text-lg">No races found</p>
        <p className="text-gray-500 text-sm mt-1">
          Check back later for updates
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {races.length} race{races.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {races.map((race) => (
          <RaceCard key={race.id} race={race} />
        ))}
      </div>
    </div>
  )
}
