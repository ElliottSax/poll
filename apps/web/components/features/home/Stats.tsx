'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, BarChart3, Users, Calendar } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface StatsData {
  totalRaces: number
  totalPolls: number
  totalPollsters: number
  recentPolls: number
}

async function fetchStats(): Promise<StatsData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  // Fetch data from multiple endpoints
  const [racesRes, pollsRes, pollstersRes] = await Promise.all([
    fetch(`${apiUrl}/api/races?limit=1`),
    fetch(`${apiUrl}/api/polls?limit=1`),
    fetch(`${apiUrl}/api/pollsters?limit=1`),
  ])

  const racesData = await racesRes.json()
  const pollsData = await pollsRes.json()
  const pollstersData = await pollstersRes.json()

  return {
    totalRaces: racesData.meta?.total || 0,
    totalPolls: pollsData.meta?.total || 0,
    totalPollsters: pollstersData.meta?.total || 0,
    recentPolls: pollsData.meta?.total || 0, // Can be refined to last 7 days
  }
}

export function Stats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !stats) {
    return null // Fail silently for stats
  }

  const statItems = [
    {
      icon: BarChart3,
      label: 'Active Races',
      value: stats.totalRaces,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: 'Total Polls',
      value: stats.totalPolls,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: Users,
      label: 'Pollsters',
      value: stats.totalPollsters,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Calendar,
      label: 'Recent Polls',
      value: stats.recentPolls,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                <p className="text-3xl font-bold">{item.value.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
