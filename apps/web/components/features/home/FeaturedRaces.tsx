'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Clock, Loader2 } from 'lucide-react'
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
  rating: string
  candidates: Candidate[]
  pollCount: number
  lastUpdate: string
  isFeatured: boolean
}

// Demo data for when API is not available
const DEMO_RACES: Race[] = [
  {
    id: '1',
    slug: 'president-2024',
    name: '2024 Presidential Election',
    type: 'Presidential',
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
    rating: 'Lean D',
    candidates: [
      { name: 'Tammy Baldwin', party: 'D', percentage: 50.1 },
      { name: 'Eric Hovde', party: 'R', percentage: 45.3 },
    ],
    pollCount: 26,
    lastUpdate: '4 hours ago',
    isFeatured: false,
  },
]

export function FeaturedRaces() {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRaces() {
      try {
        const response = await fetch('/api/races/featured?limit=6')
        if (response.ok) {
          const data = await response.json()
          setRaces(data)
        } else {
          setRaces(DEMO_RACES)
        }
      } catch {
        setRaces(DEMO_RACES)
      } finally {
        setLoading(false)
      }
    }
    fetchRaces()
  }, [])

  const getRatingColor = (rating: string) => {
    if (rating.includes('D')) return 'bg-democrat/10 text-democrat border-democrat/20'
    if (rating.includes('R')) return 'bg-republican/10 text-republican border-republican/20'
    return 'bg-tossup/10 text-tossup border-tossup/20'
  }

  const getPartyColor = (party: string) => {
    return party === 'D' ? 'bg-democrat' : 'bg-republican'
  }

  const getPartyGradient = (party: string) => {
    return party === 'D'
      ? 'bg-gradient-to-r from-democrat/80 to-democrat'
      : 'bg-gradient-to-r from-republican/80 to-republican'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade-in">
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
              className="p-6 group relative overflow-hidden"
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
                    {isCloseRace && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                        <TrendingUp className="w-3 h-3" />
                        <span>Close</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                    {race.name}
                  </h3>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${getRatingColor(race.rating)}`}>
                  {race.rating}
                </span>
              </div>

              {/* Candidates with enhanced progress bars */}
              <div className="space-y-4 mb-5">
                {race.candidates.slice(0, 2).map((candidate, idx) => (
                  <div key={idx} className="group/candidate">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3 h-3 rounded-full ${getPartyColor(candidate.party)} shadow-md`} />
                        <span className="text-sm font-semibold">{candidate.name}</span>
                      </div>
                      <span className={`text-lg font-bold ${candidate.party === 'D' ? 'text-democrat' : 'text-republican'}`}>
                        {candidate.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPartyGradient(candidate.party)} poll-bar transition-all duration-1000 ease-out rounded-full`}
                        style={{
                          width: `${Math.min(candidate.percentage, 100)}%`,
                          transitionDelay: `${idx * 100}ms`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Footer with icons */}
              <div className="flex items-center justify-between py-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                    <span className="font-medium">{race.pollCount} polls</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{race.lastUpdate}</span>
                </div>
              </div>

              {/* View details with enhanced arrow */}
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
