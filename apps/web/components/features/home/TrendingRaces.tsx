'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, ArrowRight, Activity, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface TrendingRace {
  id: string
  slug: string
  name: string
  type: string
  state: string | null
  recentPollCount: number
  totalPollCount: number
  candidates: {
    name: string
    party: string
    percentage: number
  }[]
  lastPollster: string
  lastUpdate: string
}

// Demo data for when API is not available
const DEMO_TRENDING: TrendingRace[] = [
  {
    id: '1',
    slug: 'president-2024',
    name: '2024 Presidential Election',
    type: 'president',
    state: null,
    recentPollCount: 12,
    totalPollCount: 156,
    candidates: [
      { name: 'Donald Trump', party: 'R', percentage: 47.8 },
      { name: 'Kamala Harris', party: 'D', percentage: 47.2 },
    ],
    lastPollster: 'Monmouth University',
    lastUpdate: '2 hours ago',
  },
  {
    id: '2',
    slug: 'senate-pa-2024',
    name: 'Pennsylvania Senate',
    type: 'senate',
    state: 'PA',
    recentPollCount: 5,
    totalPollCount: 34,
    candidates: [
      { name: 'Bob Casey', party: 'D', percentage: 49.5 },
      { name: 'Dave McCormick', party: 'R', percentage: 45.2 },
    ],
    lastPollster: 'Quinnipiac University',
    lastUpdate: '5 hours ago',
  },
  {
    id: '3',
    slug: 'senate-mi-2024',
    name: 'Michigan Senate',
    type: 'senate',
    state: 'MI',
    recentPollCount: 4,
    totalPollCount: 31,
    candidates: [
      { name: 'Elissa Slotkin', party: 'D', percentage: 47.5 },
      { name: 'Mike Rogers', party: 'R', percentage: 46.8 },
    ],
    lastPollster: 'Emerson College',
    lastUpdate: '6 hours ago',
  },
  {
    id: '4',
    slug: 'senate-az-2024',
    name: 'Arizona Senate',
    type: 'senate',
    state: 'AZ',
    recentPollCount: 3,
    totalPollCount: 28,
    candidates: [
      { name: 'Ruben Gallego', party: 'D', percentage: 48.1 },
      { name: 'Kari Lake', party: 'R', percentage: 46.9 },
    ],
    lastPollster: 'Fox News',
    lastUpdate: '1 day ago',
  },
  {
    id: '5',
    slug: 'senate-nv-2024',
    name: 'Nevada Senate',
    type: 'senate',
    state: 'NV',
    recentPollCount: 3,
    totalPollCount: 22,
    candidates: [
      { name: 'Jacky Rosen', party: 'D', percentage: 49.2 },
      { name: 'Sam Brown', party: 'R', percentage: 44.8 },
    ],
    lastPollster: 'NY Times/Siena',
    lastUpdate: '3 hours ago',
  },
]

export function TrendingRaces() {
  const [races, setRaces] = useState<TrendingRace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRaces() {
      try {
        const response = await fetch('/api/races/trending?limit=5&days=7')
        if (response.ok) {
          const data = await response.json()
          setRaces(data)
        } else {
          setRaces(DEMO_TRENDING)
        }
      } catch {
        setRaces(DEMO_TRENDING)
      } finally {
        setLoading(false)
      }
    }
    fetchRaces()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {races.map((race, index) => {
        const leader = race.candidates[0]
        const runnerUp = race.candidates[1]
        const margin = leader && runnerUp
          ? Math.abs(leader.percentage - runnerUp.percentage)
          : 0

        return (
          <Link key={race.id} href={`/races/${race.slug}`}>
            <Card hover className="p-5 group">
              <div className="flex items-center gap-4">
                {/* Rank indicator */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 shrink-0">
                  <span className="text-lg font-bold text-primary">#{index + 1}</span>
                </div>

                {/* Race info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {race.name}
                    </h3>
                    {race.state && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                        {race.state}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-green-500" />
                      <span className="font-medium text-green-500">{race.recentPollCount} new</span>
                      <span>this week</span>
                    </span>
                    <span>{race.totalPollCount} total polls</span>
                  </div>
                </div>

                {/* Current standings */}
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  {race.candidates.slice(0, 2).map((candidate) => (
                    <div key={candidate.name} className="text-center">
                      <div className={`text-lg font-bold ${
                        candidate.party === 'D' ? 'text-democrat' : 'text-republican'
                      }`}>
                        {candidate.percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {candidate.name.split(' ').pop()}
                      </div>
                    </div>
                  ))}
                  {margin <= 2 && (
                    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      <TrendingUp className="w-3 h-3" />
                      Close
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </Card>
          </Link>
        )
      })}

      <div className="text-center pt-4">
        <Link
          href="/races"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View all races
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
