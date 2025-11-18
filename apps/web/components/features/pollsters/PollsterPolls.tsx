'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Calendar, Users } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Poll {
  id: string
  race: {
    id: string
    slug: string
    title: string
    type: string
  }
  startDate: string
  endDate: string
  sampleSize: number
  methodology: string | null
  results: Array<{
    candidateId: string
    value: number
    candidate: {
      name: string
      party: string
    }
  }>
}

interface PollsterPollsProps {
  pollsterSlug: string
}

async function fetchPollsterPolls(pollsterSlug: string): Promise<Poll[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const res = await fetch(`${apiUrl}/api/pollsters/${pollsterSlug}`)

  if (!res.ok) {
    throw new Error('Failed to fetch pollster polls')
  }

  const data = await res.json()
  return data.polls || []
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getPartyColor(party: string): string {
  if (party === 'D') return 'text-blue-600'
  if (party === 'R') return 'text-red-600'
  return 'text-gray-600'
}

export function PollsterPolls({ pollsterSlug }: PollsterPollsProps) {
  const { data: polls, isLoading, error } = useQuery({
    queryKey: ['pollster-polls', pollsterSlug],
    queryFn: () => fetchPollsterPolls(pollsterSlug),
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
        <p className="text-muted-foreground">Failed to load polls</p>
      </div>
    )
  }

  if (!polls || polls.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No polls available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {polls.map((poll) => (
        <Link
          key={poll.id}
          href={`/races/${poll.race.slug}`}
          className="block bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          {/* Poll Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                {poll.race.type}
              </div>
              <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                {poll.race.title}
              </h3>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(poll.endDate)}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{poll.sampleSize.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Results */}
          {poll.results && poll.results.length > 0 && (
            <div className="space-y-2">
              {poll.results
                .sort((a, b) => b.value - a.value)
                .map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${getPartyColor(
                          result.candidate.party
                        )}`}
                      >
                        {result.candidate.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({result.candidate.party})
                      </span>
                    </div>
                    <span className="font-semibold text-lg">
                      {result.value.toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Methodology */}
          {poll.methodology && (
            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Methodology:{' '}
                <span className="font-medium capitalize">{poll.methodology}</span>
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
