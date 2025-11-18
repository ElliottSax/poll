'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Race {
  id: string
  slug: string
  title: string
  type: string
  description?: string
  status?: string
}

async function fetchFeaturedRaces(): Promise<Race[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const res = await fetch(`${apiUrl}/api/races?limit=3`)

  if (!res.ok) {
    throw new Error('Failed to fetch featured races')
  }

  const data = await res.json()
  return data.races || []
}

export function FeaturedRaces() {
  const { data: races, isLoading, error } = useQuery({
    queryKey: ['featured-races'],
    queryFn: fetchFeaturedRaces,
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
        <p className="text-muted-foreground">Failed to load featured races</p>
      </div>
    )
  }

  if (!races || races.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No featured races available</p>
      </div>
    )
  }
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {races.map((race) => (
        <Link
          key={race.id}
          href={`/races/${race.slug}`}
          className="block p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow group"
        >
          {/* Header */}
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
              {race.type}
            </div>
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {race.title}
            </h3>
          </div>

          {/* Description */}
          {race.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {race.description}
            </p>
          )}

          {/* Status Badge */}
          {race.status && (
            <div className="mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                {race.status}
              </span>
            </div>
          )}

          {/* View details */}
          <div className="flex items-center text-primary text-sm font-medium">
            <span>View details</span>
            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      ))}
    </div>
  )
}
