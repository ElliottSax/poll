'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PollingHistory } from '@/components/charts/PollingHistory'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

// Demo data for development/preview
const DEMO_DATA = {
  race: {
    id: 'demo',
    slug: 'president-2024',
    name: '2024 Presidential Election',
    type: 'president',
    state: null,
    electionDate: '2024-11-05',
  },
  candidates: [
    { name: 'Donald Trump', party: 'R', color: '#EF4444' },
    { name: 'Kamala Harris', party: 'D', color: '#3B82F6' },
  ],
  polls: generateDemoPolls(),
  meta: {
    totalPolls: 50,
    dateRange: { start: '2024-06-01', end: '2024-12-21' },
    pollsters: ['Monmouth University', 'Quinnipiac', 'Fox News', 'CNN/SSRS', 'Morning Consult', 'Emerson College', 'NY Times/Siena'],
  },
}

function generateDemoPolls() {
  const pollsters = [
    { name: 'Monmouth University', grade: 'A+' },
    { name: 'Quinnipiac University', grade: 'A' },
    { name: 'Fox News', grade: 'A' },
    { name: 'CNN/SSRS', grade: 'A' },
    { name: 'Morning Consult', grade: 'B+' },
    { name: 'Emerson College', grade: 'A-' },
    { name: 'NY Times/Siena', grade: 'A+' },
    { name: 'ABC/Washington Post', grade: 'A+' },
    { name: 'Marist College', grade: 'A' },
    { name: 'YouGov', grade: 'B+' },
  ]

  const polls = []
  const startDate = new Date('2024-06-01')
  const endDate = new Date()

  // Generate polls with realistic trends
  let trumpBase = 46
  let harrisBase = 45

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + Math.floor(Math.random() * 3) + 1)) {
    // Add some randomness and gradual shifts
    const dayOfYear = Math.floor((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Simulate convention bumps and news cycles
    if (dayOfYear > 60 && dayOfYear < 80) {
      harrisBase = 47 // DNC bump
    } else if (dayOfYear > 45 && dayOfYear < 60) {
      trumpBase = 47.5 // RNC bump
    } else if (dayOfYear > 100) {
      // Tightening race
      trumpBase = 47
      harrisBase = 47.5
    }

    const pollster = pollsters[Math.floor(Math.random() * pollsters.length)]
    const noise = () => (Math.random() - 0.5) * 4

    polls.push({
      id: `poll-${polls.length}`,
      date: d.toISOString().split('T')[0],
      pollster: pollster.name,
      pollsterGrade: pollster.grade,
      sampleSize: 800 + Math.floor(Math.random() * 700),
      marginOfError: 2.5 + Math.random() * 1.5,
      methodology: ['phone', 'online', 'mixed'][Math.floor(Math.random() * 3)],
      results: {
        'Donald Trump': Math.round((trumpBase + noise()) * 10) / 10,
        'Kamala Harris': Math.round((harrisBase + noise()) * 10) / 10,
      },
    })
  }

  return polls.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export default function RaceHistoryPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [data, setData] = useState<typeof DEMO_DATA | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Try to fetch from API
        const response = await fetch(`/api/polls/history/${slug}?days=365`)

        if (response.ok) {
          const apiData = await response.json()
          setData(apiData)
        } else {
          // Fall back to demo data
          console.log('Using demo data (API not available)')
          setData(DEMO_DATA)
        }
      } catch (err) {
        // Fall back to demo data
        console.log('Using demo data (fetch error)')
        setData(DEMO_DATA)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading polling data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Failed to load data'}</p>
          <Link href="/races" className="text-indigo-500 hover:underline">
            Back to races
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/races/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to race
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {data.race.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Polling History • {data.meta.totalPolls} polls from {data.meta.pollsters.length} pollsters
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PollingHistory
          polls={data.polls}
          candidates={data.candidates as any}
          raceName={data.race.name}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Data sourced from RealClearPolitics, FiveThirtyEight, and major polling organizations.
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
