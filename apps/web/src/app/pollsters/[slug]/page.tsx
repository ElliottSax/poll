'use client'

import { useEffect, useState } from 'react'
import { api, type Pollster, type Poll } from '@/lib/api'
import { format } from 'date-fns'

interface PageProps {
  params: { slug: string }
}

export default function PollsterDetailPage({ params }: PageProps) {
  const [pollster, setPollster] = useState<Pollster | null>(null)
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPollsterData() {
      try {
        setLoading(true)
        setError(null)

        const [pollsterData, pollsData] = await Promise.all([
          api.getPollster(params.slug),
          api.getPollsterPolls(params.slug, { limit: 20 }),
        ])

        setPollster(pollsterData)
        setPolls(pollsData.polls)
      } catch (err) {
        console.error('Failed to load pollster data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load pollster data')
      } finally {
        setLoading(false)
      }
    }

    loadPollsterData()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !pollster) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error || 'Pollster not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'bg-gray-100 text-gray-800'
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800'
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800'
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const formatGrade = (grade: string | null) => {
    if (!grade) return 'N/A'
    return grade.replace('_PLUS', '+').replace('_MINUS', '-').replace('_', '/')
  }

  const getPartisanColor = (lean: string | null) => {
    if (!lean) return 'bg-gray-100 text-gray-800'
    if (lean === 'DEMOCRAT') return 'bg-blue-100 text-blue-800'
    if (lean === 'REPUBLICAN') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {pollster.name}
          </h1>
          {pollster.organization && (
            <p className="text-lg text-gray-600">{pollster.organization}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Methodology Grade */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Methodology Grade</h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-lg font-bold ${getGradeColor(pollster.methodologyGrade)}`}>
                {formatGrade(pollster.methodologyGrade)}
              </span>
            </div>
          </div>

          {/* Overall Accuracy */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Overall Accuracy</h3>
            <p className="text-3xl font-bold text-gray-900">
              {pollster.overallAccuracy !== null
                ? `${pollster.overallAccuracy.toFixed(1)}%`
                : 'N/A'
              }
            </p>
          </div>

          {/* Transparency Score */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Transparency Score</h3>
            <p className="text-3xl font-bold text-gray-900">
              {pollster.transparencyScore !== null
                ? `${pollster.transparencyScore.toFixed(1)}/10`
                : 'N/A'
              }
            </p>
          </div>

          {/* Partisan Lean */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Partisan Lean</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPartisanColor(pollster.partisanLean)}`}>
              {pollster.partisanLean || 'INDEPENDENT'}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Polling Activity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Polls</p>
              <p className="text-2xl font-bold text-gray-900">{pollster.pollCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Poll Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {pollster.lastPollDate
                  ? format(new Date(pollster.lastPollDate), 'MMM d, yyyy')
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Recent Polls */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Polls</h2>
          </div>

          {polls.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No polls found for this pollster
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Race
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sample Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Methodology
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Results
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {polls.map((poll) => (
                    <tr key={poll.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(poll.pollDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {poll.raceId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {poll.sampleSize ? poll.sampleSize.toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {poll.methodology || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(poll.results).map(([candidate, percentage]) => (
                            <span key={candidate} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {candidate}: {percentage}%
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
