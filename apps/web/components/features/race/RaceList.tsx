'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Clock, MapPin, Loader2, Vote } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface Candidate {
  name: string
  party: string
  percentage: number
}

interface Race {
  id: string
  slug: string
  name: string
  type: string
  state: string | null
  rating: string
  candidates: Candidate[]
  pollCount: number
  lastUpdate: string
  isFeatured: boolean
}

// Demo data for all races
const DEMO_RACES: Race[] = [
  {
    id: '1',
    slug: 'president-2024',
    name: '2024 Presidential Election',
    type: 'Presidential',
    state: null,
    rating: 'Toss-up',
    candidates: [
      { name: 'Donald Trump', party: 'R', percentage: 47.8 },
      { name: 'Kamala Harris', party: 'D', percentage: 47.2 },
    ],
    pollCount: 156,
    lastUpdate: '2 hours ago',
    isFeatured: true,
  },
  {
    id: '2',
    slug: 'senate-pa-2024',
    name: 'Pennsylvania Senate',
    type: 'Senate',
    state: 'PA',
    rating: 'Lean D',
    candidates: [
      { name: 'Bob Casey', party: 'D', percentage: 49.5 },
      { name: 'Dave McCormick', party: 'R', percentage: 45.2 },
    ],
    pollCount: 34,
    lastUpdate: '5 hours ago',
    isFeatured: false,
  },
  {
    id: '3',
    slug: 'senate-az-2024',
    name: 'Arizona Senate',
    type: 'Senate',
    state: 'AZ',
    rating: 'Toss-up',
    candidates: [
      { name: 'Ruben Gallego', party: 'D', percentage: 48.1 },
      { name: 'Kari Lake', party: 'R', percentage: 46.9 },
    ],
    pollCount: 28,
    lastUpdate: '1 day ago',
    isFeatured: false,
  },
  {
    id: '4',
    slug: 'senate-nv-2024',
    name: 'Nevada Senate',
    type: 'Senate',
    state: 'NV',
    rating: 'Lean D',
    candidates: [
      { name: 'Jacky Rosen', party: 'D', percentage: 49.2 },
      { name: 'Sam Brown', party: 'R', percentage: 44.8 },
    ],
    pollCount: 22,
    lastUpdate: '3 hours ago',
    isFeatured: false,
  },
  {
    id: '5',
    slug: 'senate-mi-2024',
    name: 'Michigan Senate',
    type: 'Senate',
    state: 'MI',
    rating: 'Toss-up',
    candidates: [
      { name: 'Elissa Slotkin', party: 'D', percentage: 47.5 },
      { name: 'Mike Rogers', party: 'R', percentage: 46.8 },
    ],
    pollCount: 31,
    lastUpdate: '6 hours ago',
    isFeatured: false,
  },
  {
    id: '6',
    slug: 'senate-wi-2024',
    name: 'Wisconsin Senate',
    type: 'Senate',
    state: 'WI',
    rating: 'Lean D',
    candidates: [
      { name: 'Tammy Baldwin', party: 'D', percentage: 50.1 },
      { name: 'Eric Hovde', party: 'R', percentage: 45.3 },
    ],
    pollCount: 26,
    lastUpdate: '4 hours ago',
    isFeatured: false,
  },
  {
    id: '7',
    slug: 'senate-oh-2024',
    name: 'Ohio Senate',
    type: 'Senate',
    state: 'OH',
    rating: 'Toss-up',
    candidates: [
      { name: 'Sherrod Brown', party: 'D', percentage: 46.8 },
      { name: 'Bernie Moreno', party: 'R', percentage: 46.2 },
    ],
    pollCount: 29,
    lastUpdate: '8 hours ago',
    isFeatured: false,
  },
  {
    id: '8',
    slug: 'senate-mt-2024',
    name: 'Montana Senate',
    type: 'Senate',
    state: 'MT',
    rating: 'Lean R',
    candidates: [
      { name: 'Jon Tester', party: 'D', percentage: 44.5 },
      { name: 'Tim Sheehy', party: 'R', percentage: 48.7 },
    ],
    pollCount: 18,
    lastUpdate: '12 hours ago',
    isFeatured: false,
  },
]

interface RaceListProps {
  type?: string
  state?: string
  status?: string
}

export function RaceList({ type, state, status }: RaceListProps) {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRaces() {
      try {
        const params = new URLSearchParams()
        if (type) params.set('type', type)
        if (state) params.set('state', state)
        if (status) params.set('status', status)

        const response = await fetch(`/api/races?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          // Transform API data to match our interface
          const transformedRaces = (data.data || data).map((race: any) => ({
            id: race.id,
            slug: race.slug,
            name: race.raceName || race.name,
            type: race.raceType === 'president' ? 'Presidential' :
                  race.raceType?.charAt(0).toUpperCase() + race.raceType?.slice(1) || 'Race',
            state: race.state,
            rating: race.competitiveRating || 'Toss-up',
            candidates: race.candidates || [],
            pollCount: race._count?.polls || race.pollCount || 0,
            lastUpdate: race.updatedAt ? formatTimeAgo(new Date(race.updatedAt)) : 'Recently',
            isFeatured: race.importanceScore >= 9,
          }))
          setRaces(transformedRaces.length > 0 ? transformedRaces : DEMO_RACES)
        } else {
          setRaces(filterDemoRaces(DEMO_RACES, type, state))
        }
      } catch {
        setRaces(filterDemoRaces(DEMO_RACES, type, state))
      } finally {
        setLoading(false)
      }
    }
    fetchRaces()
  }, [type, state, status])

  const getRatingColor = (rating: string) => {
    if (rating.includes('D')) return 'bg-democrat/10 text-democrat border-democrat/20'
    if (rating.includes('R')) return 'bg-republican/10 text-republican border-republican/20'
    return 'bg-tossup/10 text-tossup border-tossup/20'
  }

  const getPartyColor = (party: string) => {
    return party === 'D' ? 'bg-democrat' : party === 'R' ? 'bg-republican' : 'bg-gray-500'
  }

  const getPartyGradient = (party: string) => {
    return party === 'D'
      ? 'bg-gradient-to-r from-democrat/80 to-democrat'
      : party === 'R'
      ? 'bg-gradient-to-r from-republican/80 to-republican'
      : 'bg-gradient-to-r from-gray-400 to-gray-500'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading races...</p>
      </div>
    )
  }

  if (races.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Vote className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No races found</h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your filters or check back later for new races.
        </p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {races.map((race) => {
        const spread = race.candidates.length >= 2
          ? Math.abs(race.candidates[0].percentage - race.candidates[1].percentage)
          : 0
        const isCloseRace = spread < 2

        return (
          <Link key={race.id} href={`/races/${race.slug}`}>
            <Card
              variant={race.isFeatured ? 'premium' : 'default'}
              hover
              className="p-6 group relative overflow-hidden h-full"
            >
              {/* Featured indicator */}
              {race.isFeatured && (
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-5 relative">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {race.type}
                    </span>
                    {race.state && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {race.state}
                      </span>
                    )}
                    {isCloseRace && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                        <TrendingUp className="w-3 h-3" />
                        Close
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                    {race.name}
                  </h3>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0 ${getRatingColor(race.rating)}`}>
                  {race.rating}
                </span>
              </div>

              {/* Candidates with progress bars */}
              <div className="space-y-4 mb-5">
                {race.candidates.slice(0, 2).map((candidate, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3 h-3 rounded-full ${getPartyColor(candidate.party)} shadow-md`} />
                        <span className="text-sm font-semibold">{candidate.name}</span>
                      </div>
                      <span className={`text-lg font-bold ${
                        candidate.party === 'D' ? 'text-democrat' :
                        candidate.party === 'R' ? 'text-republican' : 'text-gray-600'
                      }`}>
                        {candidate.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPartyGradient(candidate.party)} transition-all duration-1000 ease-out rounded-full`}
                        style={{
                          width: `${Math.min(candidate.percentage, 100)}%`,
                          transitionDelay: `${idx * 100}ms`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between py-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="font-medium">{race.pollCount} polls</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{race.lastUpdate}</span>
                </div>
              </div>

              {/* View details */}
              <div className="mt-3 flex items-center text-primary text-sm font-semibold group-hover:gap-2 gap-1 transition-all">
                <span>View details</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl" />
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

function filterDemoRaces(races: Race[], type?: string, state?: string): Race[] {
  return races.filter((race) => {
    if (type && race.type.toLowerCase() !== type.toLowerCase()) return false
    if (state && race.state !== state) return false
    return true
  })
}
