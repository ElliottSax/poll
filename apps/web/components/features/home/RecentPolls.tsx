'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Calendar, Users } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Poll {
  id: string
  pollster: {
    id: string
    slug: string
    name: string
  }
  race: {
    id: string
    slug: string
    title: string
  }
  startDate: string
  endDate: string
  sampleSize: number
  methodology?: string
}

async function fetchRecentPolls(): Promise<Poll[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const res = await fetch(`${apiUrl}/api/polls?limit=8&sort=endDate&order=desc`)

  if (!res.ok) {
    throw new Error('Failed to fetch recent polls')
  }

  const data = await res.json()
  return data.polls || []
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function RecentPolls() {
  const { data: polls, isLoading, error } = useQuery({
    queryKey: ['recent-polls'],
    queryFn: fetchRecentPolls,
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
        <p className="text-muted-foreground">Failed to load recent polls</p>
      </div>
    )
  }

  if (!polls || polls.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No recent polls available</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {polls.map((poll) => (
        <Link
          key={poll.id}
          href={`/races/${poll.race.slug}`}
          className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
        >
          {/* Poll header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 hover:text-primary transition-colors">
                {poll.race.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {poll.pollster.name}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(poll.endDate)}</span>
            </div>
          </div>

          {/* Poll metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{poll.sampleSize.toLocaleString()} voters</span>
            </div>
            {poll.methodology && (
              <div className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">
                {poll.methodology}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
