'use client'

import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

interface Poll {
  id: string
  pollster: {
    name: string
    methodologyGrade: string
  }
  pollDate: string
  sampleSize: number
  marginOfError?: number
  methodology: string
  results: Record<string, number>
}

interface RacePollsProps {
  polls: Poll[]
}

export function RacePolls({ polls }: RacePollsProps) {
  if (!polls || polls.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No polls available for this race yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  )
}

function PollCard({ poll }: { poll: Poll }) {
  const getGradeColor = (grade: string) => {
    const letter = grade?.charAt(0)
    if (letter === 'A') return 'success'
    if (letter === 'B') return 'info'
    if (letter === 'C') return 'warning'
    return 'error'
  }

  // Sort results by percentage (descending)
  const sortedResults = Object.entries(poll.results).sort(([, a], [, b]) => b - a)

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/pollsters/${poll.pollster.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-lg font-semibold hover:text-primary transition-colors"
          >
            {poll.pollster.name}
          </Link>
          {poll.pollster.methodologyGrade && (
            <Badge variant={getGradeColor(poll.pollster.methodologyGrade) as any} size="sm">
              {poll.pollster.methodologyGrade}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {new Date(poll.pollDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span>•</span>
          <span>n = {poll.sampleSize.toLocaleString()}</span>
          {poll.marginOfError && (
            <>
              <span>•</span>
              <span>MOE ±{poll.marginOfError}%</span>
            </>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {sortedResults.map(([candidate, percentage], index) => {
          const isLeader = index === 0
          return (
            <div key={candidate} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${isLeader ? 'text-primary' : ''}`}>
                    {candidate}
                  </span>
                  <span className={`text-lg font-bold ${isLeader ? 'text-primary' : ''}`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      isLeader ? 'bg-primary' : 'bg-gray-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
        <span>{poll.methodology}</span>
        <span className="capitalize">
          {Math.ceil((Date.now() - new Date(poll.pollDate).getTime()) / (1000 * 60 * 60 * 24))}{' '}
          days ago
        </span>
      </div>
    </div>
  )
}
