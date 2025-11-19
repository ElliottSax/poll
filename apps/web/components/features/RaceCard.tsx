'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { ArrowUp, ArrowDown, Minus, TrendingUp } from 'lucide-react'

export interface Candidate {
  id: string
  name: string
  party: 'democrat' | 'republican' | 'independent' | 'other'
  percentage: number
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
}

export interface RaceCardProps {
  id: string
  title: string
  state: string
  office: string
  year: number
  candidates: Candidate[]
  lastUpdated?: Date
  pollCount?: number
  href?: string
  className?: string
  compact?: boolean
}

export function RaceCard({
  id,
  title,
  state,
  office,
  year,
  candidates,
  lastUpdated,
  pollCount,
  href,
  className,
  compact = false,
}: RaceCardProps) {
  // Sort candidates by percentage descending
  const sortedCandidates = [...candidates].sort((a, b) => b.percentage - a.percentage)
  const leader = sortedCandidates[0]
  const margin = sortedCandidates.length > 1 ? leader.percentage - sortedCandidates[1].percentage : 0

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-600" />
      case 'down':
        return <ArrowDown className="h-3 w-3 text-red-600" />
      case 'stable':
        return <Minus className="h-3 w-3 text-gray-400" />
      default:
        return null
    }
  }

  const getPartyColor = (party: Candidate['party']) => {
    switch (party) {
      case 'democrat':
        return 'bg-blue-500'
      case 'republican':
        return 'bg-red-500'
      case 'independent':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const cardContent = (
    <Card className={className} hoverable={!!href}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>
              {state} • {office} {year}
            </CardDescription>
          </div>
          {margin > 0 && (
            <Badge variant="outline" className="shrink-0">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{margin.toFixed(1)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {sortedCandidates.map((candidate) => (
            <div key={candidate.id} className="space-y-1">
              {/* Candidate info row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Badge variant={candidate.party} size="sm">
                    {candidate.party.charAt(0).toUpperCase()}
                  </Badge>
                  <span className="font-medium truncate">{candidate.name}</span>
                  {candidate.trend && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      {getTrendIcon(candidate.trend)}
                      {candidate.trendValue && (
                        <span>{Math.abs(candidate.trendValue).toFixed(1)}</span>
                      )}
                    </span>
                  )}
                </div>
                <span className="font-semibold tabular-nums ml-2">
                  {candidate.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              {!compact && (
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getPartyColor(candidate.party)}`}
                    style={{ width: `${candidate.percentage}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer info */}
        {(lastUpdated || pollCount) && (
          <div className="mt-4 pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
            {lastUpdated && (
              <span>
                Updated {new Date(lastUpdated).toLocaleDateString()}
              </span>
            )}
            {pollCount && (
              <span>
                {pollCount} {pollCount === 1 ? 'poll' : 'polls'}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
