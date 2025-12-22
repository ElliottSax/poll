'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, Vote, Clock, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface StatsData {
  totalRaces: number
  totalPolls: number
  totalPollsters: number
  lastUpdated: string
}

// Demo stats for when API is not available
const DEMO_STATS: StatsData = {
  totalRaces: 8,
  totalPolls: 347,
  totalPollsters: 20,
  lastUpdated: new Date().toISOString(),
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  return date.toLocaleDateString()
}

export function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/races/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          setStats(DEMO_STATS)
        }
      } catch {
        setStats(DEMO_STATS)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) return null

  const statItems = [
    {
      icon: Vote,
      label: 'Active Races',
      value: stats.totalRaces,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: BarChart3,
      label: 'Total Polls',
      value: stats.totalPolls,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Users,
      label: 'Pollsters',
      value: stats.totalPollsters,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Clock,
      label: 'Last Updated',
      value: formatTimeAgo(stats.lastUpdated),
      isText: true,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="p-5 text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.bgColor} mb-3`}>
            <item.icon className={`w-6 h-6 ${item.color}`} />
          </div>
          <div className={`text-2xl font-bold ${item.isText ? 'text-sm' : ''}`}>
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
        </Card>
      ))}
    </div>
  )
}
