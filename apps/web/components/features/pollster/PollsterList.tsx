'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

interface Pollster {
  id: string
  name: string
  slug: string
  overallAccuracy: number
  methodologyGrade: string
  pollCount: number
  lastPollDate: string
}

interface PollsterListProps {
  orderBy?: 'accuracy' | 'pollCount' | 'grade' | 'name'
}

export async function PollsterList({ orderBy = 'accuracy' }: PollsterListProps) {
  // TODO: Fetch from API
  const pollsters = await getMockPollsters()

  // Sort pollsters based on orderBy
  const sorted = [...pollsters].sort((a, b) => {
    switch (orderBy) {
      case 'accuracy':
        return b.overallAccuracy - a.overallAccuracy
      case 'pollCount':
        return b.pollCount - a.pollCount
      case 'grade':
        return (a.methodologyGrade || 'F').localeCompare(b.methodologyGrade || 'F')
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return b.overallAccuracy - a.overallAccuracy
    }
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b text-sm font-semibold text-muted-foreground">
        <div className="col-span-1">Rank</div>
        <div className="col-span-4">Pollster</div>
        <div className="col-span-2">Grade</div>
        <div className="col-span-2">Accuracy</div>
        <div className="col-span-2">Polls</div>
        <div className="col-span-1">Last Poll</div>
      </div>

      {/* Pollster Rows */}
      {sorted.map((pollster, index) => (
        <PollsterRow key={pollster.id} pollster={pollster} rank={index + 1} />
      ))}
    </div>
  )
}

function PollsterRow({ pollster, rank }: { pollster: Pollster; rank: number }) {
  const getGradeColor = (grade: string) => {
    const letter = grade.charAt(0)
    if (letter === 'A') return 'success'
    if (letter === 'B') return 'info'
    if (letter === 'C') return 'warning'
    return 'error'
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  return (
    <Link
      href={`/pollsters/${pollster.slug}`}
      className="grid grid-cols-12 gap-4 px-4 py-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
    >
      <div className="col-span-1 flex items-center font-semibold">
        {getRankBadge(rank)}
      </div>

      <div className="col-span-4 flex items-center">
        <div>
          <div className="font-semibold">{pollster.name}</div>
          <div className="text-sm text-muted-foreground">
            {pollster.pollCount} polls conducted
          </div>
        </div>
      </div>

      <div className="col-span-2 flex items-center">
        <Badge variant={getGradeColor(pollster.methodologyGrade) as any} size="lg">
          {pollster.methodologyGrade}
        </Badge>
      </div>

      <div className="col-span-2 flex items-center">
        <div>
          <div className="text-2xl font-bold">{pollster.overallAccuracy.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Historical</div>
        </div>
      </div>

      <div className="col-span-2 flex items-center text-center">
        <div>
          <div className="text-xl font-semibold">{pollster.pollCount}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>

      <div className="col-span-1 flex items-center text-xs text-muted-foreground">
        {new Date(pollster.lastPollDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </div>
    </Link>
  )
}

async function getMockPollsters(): Promise<Pollster[]> {
  return [
    {
      id: '1',
      name: 'Monmouth University',
      slug: 'monmouth',
      overallAccuracy: 94.2,
      methodologyGrade: 'A+',
      pollCount: 187,
      lastPollDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Quinnipiac University',
      slug: 'quinnipiac',
      overallAccuracy: 91.5,
      methodologyGrade: 'A-',
      pollCount: 245,
      lastPollDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Emerson College',
      slug: 'emerson',
      overallAccuracy: 89.3,
      methodologyGrade: 'A-',
      pollCount: 312,
      lastPollDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      name: 'Marist College',
      slug: 'marist',
      overallAccuracy: 92.1,
      methodologyGrade: 'A',
      pollCount: 156,
      lastPollDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      name: 'Siena College',
      slug: 'siena',
      overallAccuracy: 88.7,
      methodologyGrade: 'B+',
      pollCount: 134,
      lastPollDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      name: 'Rasmussen Reports',
      slug: 'rasmussen',
      overallAccuracy: 79.4,
      methodologyGrade: 'C+',
      pollCount: 428,
      lastPollDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      name: 'SurveyUSA',
      slug: 'surveyusa',
      overallAccuracy: 87.2,
      methodologyGrade: 'B+',
      pollCount: 289,
      lastPollDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '8',
      name: 'Morning Consult',
      slug: 'morning-consult',
      overallAccuracy: 85.9,
      methodologyGrade: 'B',
      pollCount: 512,
      lastPollDate: new Date().toISOString(),
    },
  ]
}
