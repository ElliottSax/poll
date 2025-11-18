'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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
  },
]

export function FeaturedRaces() {
  const getRatingColor = (rating: string) => {
    if (rating.includes('D')) return 'text-democrat'
    if (rating.includes('R')) return 'text-republican'
    return 'text-tossup'
  }

  const getPartyColor = (party: string) => {
    return party === 'D' ? 'bg-democrat' : 'bg-republican'
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockRaces.map((race) => (
        <Link
          key={race.id}
          href={`/races/${race.slug}`}
          className="block p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                {race.type}
              </div>
              <h3 className="font-semibold text-lg">{race.name}</h3>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${getRatingColor(
                race.rating
              )} bg-accent`}
            >
              {race.rating}
            </span>
          </div>

          {/* Candidates */}
          <div className="space-y-3 mb-4">
            {race.candidates.map((candidate, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${getPartyColor(
                        candidate.party
                      )}`}
                    />
                    <span className="text-sm font-medium">{candidate.name}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {candidate.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getPartyColor(candidate.party)}`}
                    style={{ width: `${candidate.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{race.pollCount} polls</span>
            <span>{race.lastUpdate}</span>
          </div>

          {/* View details */}
          <div className="mt-4 flex items-center text-primary text-sm font-medium group">
            <span>View details</span>
            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      ))}
    </div>
  )
}
