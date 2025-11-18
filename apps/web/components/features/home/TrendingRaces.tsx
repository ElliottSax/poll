'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Race {
  id: string
  slug: string
  title: string
  type: string
  state?: string
  status?: string
}

async function fetchTrendingRaces(): Promise<Race[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const res = await fetch(`${apiUrl}/api/races?limit=6`)

  if (!res.ok) {
    throw new Error('Failed to fetch trending races')
  }

  const data = await res.json()
  return data.races || []
}

export function TrendingRaces() {
  const { data: races, isLoading, error } = useQuery({
    queryKey: ['trending-races'],
    queryFn: fetchTrendingRaces,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load trending races</p>
      </div>
    )
  }

  if (!races || races.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No trending races available</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {races.map((race, index) => (
        <Link
          key={race.id}
          href={`/races/${race.slug}`}
          className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow group"
        >
          {/* Trending indicator */}
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {index % 2 === 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>

          {/* Race info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {race.type}
              </span>
              {race.state && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {race.state}
                  </span>
                </>
              )}
            </div>
            <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
              {race.title}
            </h3>
          </div>

          {/* Status badge */}
          {race.status && (
            <div className="flex-shrink-0">
              <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">
                {race.status}
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
