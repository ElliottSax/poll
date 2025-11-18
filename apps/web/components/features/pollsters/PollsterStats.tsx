'use client'

import { useQuery } from '@tanstack/react-query'
import { Target, TrendingUp, Calendar, BarChart2, Users } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface PollsterStatsData {
  totalPolls: number
  avgSampleSize: number
  mostCommonMethodology: string | null
  recentPollsCount: number
  accuracyTrend: number | null
  coverageByType: Record<string, number>
}

interface PollsterStatsProps {
  pollsterSlug: string
}

async function fetchPollsterStats(
  pollsterSlug: string
): Promise<PollsterStatsData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const res = await fetch(`${apiUrl}/api/pollsters/${pollsterSlug}`)

  if (!res.ok) {
    throw new Error('Failed to fetch pollster stats')
  }

  const data = await res.json()
  const polls = data.polls || []

  // Calculate statistics
  const totalPolls = polls.length
  const avgSampleSize =
    polls.reduce((sum: number, p: any) => sum + (p.sampleSize || 0), 0) /
      totalPolls || 0

  // Find most common methodology
  const methodologyCounts: Record<string, number> = {}
  polls.forEach((p: any) => {
    if (p.methodology) {
      methodologyCounts[p.methodology] =
        (methodologyCounts[p.methodology] || 0) + 1
    }
  })
  const mostCommonMethodology =
    Object.keys(methodologyCounts).length > 0
      ? Object.keys(methodologyCounts).reduce((a, b) =>
          methodologyCounts[a] > methodologyCounts[b] ? a : b
        )
      : null

  // Recent polls (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentPollsCount = polls.filter((p: any) => {
    const endDate = new Date(p.endDate)
    return endDate > thirtyDaysAgo
  }).length

  // Coverage by race type
  const coverageByType: Record<string, number> = {}
  polls.forEach((p: any) => {
    if (p.race?.type) {
      coverageByType[p.race.type] = (coverageByType[p.race.type] || 0) + 1
    }
  })

  return {
    totalPolls,
    avgSampleSize: Math.round(avgSampleSize),
    mostCommonMethodology,
    recentPollsCount,
    accuracyTrend: data.accuracy || null,
    coverageByType,
  }
}

export function PollsterStats({ pollsterSlug }: PollsterStatsProps) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['pollster-stats', pollsterSlug],
    queryFn: () => fetchPollsterStats(pollsterSlug),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load statistics</p>
      </div>
    )
  }

  const statCards = [
    {
      icon: BarChart2,
      label: 'Total Polls',
      value: stats.totalPolls.toLocaleString(),
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      label: 'Avg Sample Size',
      value: stats.avgSampleSize.toLocaleString(),
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: Calendar,
      label: 'Recent Polls (30d)',
      value: stats.recentPollsCount.toLocaleString(),
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    ...(stats.accuracyTrend !== null
      ? [
          {
            icon: Target,
            label: 'Accuracy',
            value: `${stats.accuracyTrend.toFixed(1)}%`,
            color: 'text-orange-500',
            bgColor: 'bg-orange-50',
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Coverage Breakdown */}
      {Object.keys(stats.coverageByType).length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Coverage by Race Type</h3>
          <div className="space-y-3">
            {Object.entries(stats.coverageByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const percentage = ((count / stats.totalPolls) * 100).toFixed(1)
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{type}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} polls ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Methodology Info */}
      {stats.mostCommonMethodology && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Primary Methodology</h3>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-lg">
            <BarChart2 className="h-4 w-4" />
            <span className="font-medium capitalize">
              {stats.mostCommonMethodology}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
