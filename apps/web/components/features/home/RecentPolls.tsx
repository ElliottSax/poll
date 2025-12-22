'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, ExternalLink, Users, BarChart3, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface Poll {
  id: string
  pollDate: string
  sampleSize: number
  marginOfError: number
  methodology: string
  results: Record<string, number>
  race: {
    slug: string
    raceName: string
    raceType: string
    state: string | null
  }
  pollster: {
    name: string
    slug: string
    methodologyGrade: string
  }
}

// Demo data for when API is not available
const DEMO_POLLS: Poll[] = [
  {
    id: '1',
    pollDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sampleSize: 1247,
    marginOfError: 2.8,
    methodology: 'online',
    results: { 'Donald Trump': 47.5, 'Kamala Harris': 46.8 },
    race: { slug: 'president-2024', raceName: '2024 Presidential Election', raceType: 'president', state: null },
    pollster: { name: 'Monmouth University', slug: 'monmouth', methodologyGrade: 'A+' },
  },
  {
    id: '2',
    pollDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    sampleSize: 892,
    marginOfError: 3.3,
    methodology: 'phone',
    results: { 'Bob Casey': 49.2, 'Dave McCormick': 44.8 },
    race: { slug: 'senate-pa-2024', raceName: 'Pennsylvania Senate', raceType: 'senate', state: 'PA' },
    pollster: { name: 'Quinnipiac University', slug: 'quinnipiac', methodologyGrade: 'A' },
  },
  {
    id: '3',
    pollDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    sampleSize: 1103,
    marginOfError: 2.9,
    methodology: 'mixed',
    results: { 'Ruben Gallego': 48.5, 'Kari Lake': 45.2 },
    race: { slug: 'senate-az-2024', raceName: 'Arizona Senate', raceType: 'senate', state: 'AZ' },
    pollster: { name: 'Fox News', slug: 'fox-news', methodologyGrade: 'A' },
  },
  {
    id: '4',
    pollDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    sampleSize: 956,
    marginOfError: 3.2,
    methodology: 'online',
    results: { 'Jacky Rosen': 49.8, 'Sam Brown': 43.5 },
    race: { slug: 'senate-nv-2024', raceName: 'Nevada Senate', raceType: 'senate', state: 'NV' },
    pollster: { name: 'NY Times/Siena', slug: 'nyt-siena', methodologyGrade: 'A+' },
  },
  {
    id: '5',
    pollDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    sampleSize: 1089,
    marginOfError: 3.0,
    methodology: 'phone',
    results: { 'Elissa Slotkin': 47.8, 'Mike Rogers': 46.2 },
    race: { slug: 'senate-mi-2024', raceName: 'Michigan Senate', raceType: 'senate', state: 'MI' },
    pollster: { name: 'Emerson College', slug: 'emerson', methodologyGrade: 'A-' },
  },
  {
    id: '6',
    pollDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sampleSize: 872,
    marginOfError: 3.4,
    methodology: 'online',
    results: { 'Donald Trump': 48.1, 'Kamala Harris': 47.2 },
    race: { slug: 'president-2024', raceName: '2024 Presidential Election', raceType: 'president', state: null },
    pollster: { name: 'Morning Consult', slug: 'morning-consult', methodologyGrade: 'B+' },
  },
]

// Known party affiliations for demo candidates
const PARTY_MAP: Record<string, 'D' | 'R'> = {
  // Democrats
  'Kamala Harris': 'D',
  'Joe Biden': 'D',
  'Bob Casey': 'D',
  'Jacky Rosen': 'D',
  'Ruben Gallego': 'D',
  'Elissa Slotkin': 'D',
  'Tammy Baldwin': 'D',
  'Sherrod Brown': 'D',
  'Jon Tester': 'D',
  // Republicans
  'Donald Trump': 'R',
  'Dave McCormick': 'R',
  'Sam Brown': 'R',
  'Kari Lake': 'R',
  'Mike Rogers': 'R',
  'Eric Hovde': 'R',
  'Bernie Moreno': 'R',
  'Tim Sheehy': 'R',
}

function getParty(name: string): 'D' | 'R' {
  return PARTY_MAP[name] || 'R' // Default to R if unknown
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  return `${diffDays}d ago`
}

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-green-500 bg-green-500/10 border-green-500/20'
  if (grade.startsWith('B')) return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  if (grade.startsWith('C')) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
  return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
}

export function RecentPolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPolls() {
      try {
        const response = await fetch('/api/polls/recent?limit=6')
        if (response.ok) {
          const data = await response.json()
          setPolls(data)
        } else {
          setPolls(DEMO_POLLS)
        }
      } catch {
        setPolls(DEMO_POLLS)
      } finally {
        setLoading(false)
      }
    }
    fetchPolls()
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
      {polls.map((poll) => {
        const candidates = Object.entries(poll.results).sort(([, a], [, b]) => b - a)
        const leader = candidates[0]
        const runnerUp = candidates[1]
        const margin = leader && runnerUp ? leader[1] - runnerUp[1] : 0

        return (
          <Card key={poll.id} hover className="p-5 group">
            <div className="flex items-start justify-between gap-4">
              {/* Left side - Poll info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href={`/races/${poll.race.slug}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                  >
                    {poll.race.raceName}
                  </Link>
                  {poll.race.state && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {poll.race.state}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <Link
                    href={`/pollsters/${poll.pollster.slug}`}
                    className="hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <span>{poll.pollster.name}</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${getGradeColor(poll.pollster.methodologyGrade)}`}>
                      {poll.pollster.methodologyGrade}
                    </span>
                  </Link>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimeAgo(poll.pollDate)}
                  </span>
                </div>

                {/* Results bar */}
                <div className="flex items-center gap-3">
                  {candidates.slice(0, 2).map(([name, pct]) => {
                    const party = getParty(name)
                    return (
                      <div key={name} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${party === 'D' ? 'bg-democrat' : 'bg-republican'}`} />
                        <span className="text-sm font-medium">{name.split(' ').pop()}</span>
                        <span className={`text-sm font-bold ${party === 'D' ? 'text-democrat' : 'text-republican'}`}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    )
                  })}
                  {margin > 0 && (
                    <span className="text-xs text-muted-foreground">
                      (+{margin.toFixed(1)})
                    </span>
                  )}
                </div>
              </div>

              {/* Right side - Stats */}
              <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground shrink-0">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>n={poll.sampleSize.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>MoE: ±{poll.marginOfError.toFixed(1)}%</span>
                </div>
                <span className="capitalize px-2 py-0.5 rounded bg-muted">
                  {poll.methodology}
                </span>
              </div>
            </div>
          </Card>
        )
      })}

      <div className="text-center pt-4">
        <Link
          href="/polls"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View all polls
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
