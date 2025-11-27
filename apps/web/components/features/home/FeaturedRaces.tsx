'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'

// This will be replaced with actual data from API
const mockRaces = [
  {
    id: '1',
    slug: '2024-presidential',
    name: '2024 Presidential Election',
    type: 'Presidential',
    rating: 'Toss-up',
    candidates: [
      { name: 'Joe Biden', party: 'D', percentage: 48.2 },
      { name: 'Donald Trump', party: 'R', percentage: 47.8 },
    ],
    pollCount: 127,
    lastUpdate: '2 hours ago',
    isFeatured: true,
  },
  {
    id: '2',
    slug: 'pa-senate-2024',
    name: 'Pennsylvania Senate',
    type: 'Senate',
    rating: 'Lean D',
    candidates: [
      { name: 'Bob Casey', party: 'D', percentage: 49.5 },
      { name: 'Dave McCormick', party: 'R', percentage: 45.2 },
    ],
    pollCount: 23,
    lastUpdate: '5 hours ago',
    isFeatured: false,
  },
  {
    id: '3',
    slug: 'ga-senate-2024',
    name: 'Georgia Senate',
    type: 'Senate',
    rating: 'Toss-up',
    candidates: [
      { name: 'Raphael Warnock', party: 'D', percentage: 48.7 },
      { name: 'Herschel Walker', party: 'R', percentage: 48.1 },
    ],
    pollCount: 31,
    lastUpdate: '1 day ago',
    isFeatured: false,
  },
]

export function FeaturedRaces() {
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

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade-in">
      {mockRaces.map((race, index) => {
        const spread = Math.abs(race.candidates[0].percentage - race.candidates[1].percentage)
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
                {race.candidates.map((candidate, idx) => (
                  <div key={idx} className="group/candidate">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3 h-3 rounded-full ${getPartyColor(candidate.party)} shadow-md`} />
                        <span className="text-sm font-semibold">{candidate.name}</span>
                      </div>
                      <span className={`text-lg font-bold ${candidate.party === 'D' ? 'text-democrat' : 'text-republican'}`}>
                        {candidate.percentage}%
                      </span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPartyGradient(candidate.party)} poll-bar transition-all duration-1000 ease-out rounded-full`}
                        style={{
                          width: `${candidate.percentage}%`,
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
