/**
 * Race Detail Page
 *
 * Shows detailed information about a specific race including:
 * - Race metadata
 * - Recent polls
 * - Poll trend chart
 */

'use client'

import { useEffect, useState } from 'react'
import { api, Race, Poll } from '@/lib/api'
import { format } from 'date-fns'
import PollTrendChart from '@/components/charts/PollTrendChart'

interface PageProps {
  params: {
    slug: string
  }
}

export default function RaceDetailPage({ params }: PageProps) {
  const [race, setRace] = useState<Race | null>(null)
  const [allPolls, setAllPolls] = useState<Poll[]>([])
  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [methodologyFilter, setMethodologyFilter] = useState<string>('all')
  const [populationFilter, setPopulationFilter] = useState<string>('all')

  useEffect(() => {
    async function loadRaceData() {
      try {
        setLoading(true)

        // Fetch race details and polls in parallel
        const [raceData, pollsData] = await Promise.all([
          api.getRace(params.slug),
          api.getRacePolls(params.slug, { limit: 20 })
        ])

        setRace(raceData)
        setAllPolls(pollsData.polls)
        setFilteredPolls(pollsData.polls)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load race')
      } finally {
        setLoading(false)
      }
    }

    loadRaceData()
  }, [params.slug])

  // Filter polls when filters change
  useEffect(() => {
    let filtered = [...allPolls]

    if (methodologyFilter !== 'all') {
      filtered = filtered.filter(poll => poll.methodology === methodologyFilter)
    }

    if (populationFilter !== 'all') {
      filtered = filtered.filter(poll => poll.populationType === populationFilter)
    }

    setFilteredPolls(filtered)
  }, [methodologyFilter, populationFilter, allPolls])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading race details...</p>
        </div>
      </div>
    )
  }

  if (error || !race) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error</p>
          <p className="text-gray-600">{error || 'Race not found'}</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to homepage
          </a>
        </div>
      </div>
    )
  }

  // Extract candidates from race data
  const candidates = race.candidates?.candidates || []

  // Get unique methodologies and population types from all polls
  const uniqueMethodologies = Array.from(new Set(allPolls.map(p => p.methodology).filter(Boolean)))
  const uniquePopulations = Array.from(new Set(allPolls.map(p => p.populationType).filter(Boolean)))

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to all races
          </a>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{race.raceName}</h1>

          <div className="flex items-center gap-4 mt-4">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 rounded">
              {race.raceType}
            </span>
            {race.state && (
              <span className="text-gray-600">{race.state}</span>
            )}
            {race.competitiveRating && (
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                race.competitiveRating.includes('Toss')
                  ? 'bg-yellow-50 text-yellow-700'
                  : race.competitiveRating.includes('Lean')
                  ? 'bg-purple-50 text-purple-700'
                  : 'bg-gray-50 text-gray-700'
              }`}>
                {race.competitiveRating}
              </span>
            )}
            <span className="text-gray-500">
              Election: {format(new Date(race.electionDate), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Candidates */}
            {candidates.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Candidates</h2>
                <div className="space-y-3">
                  {candidates.map((candidate: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-semibold text-gray-900">{candidate.name}</span>
                        {candidate.incumbent && (
                          <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            Incumbent
                          </span>
                        )}
                      </div>
                      <span className={`font-semibold ${
                        candidate.party === 'D' ? 'text-blue-600' :
                        candidate.party === 'R' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {candidate.party}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Poll Trend Chart */}
            {allPolls.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Poll Trend</h2>
                <PollTrendChart polls={filteredPolls} candidates={candidates} />
              </div>
            )}

            {/* Recent Polls Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Polls ({filteredPolls.length}{filteredPolls.length !== allPolls.length ? ` of ${allPolls.length}` : ''})
                </h2>
              </div>

              {/* Filters */}
              {allPolls.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-4">
                  {/* Methodology Filter */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="methodology" className="text-sm font-medium text-gray-700">
                      Methodology:
                    </label>
                    <select
                      id="methodology"
                      value={methodologyFilter}
                      onChange={(e) => setMethodologyFilter(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      {uniqueMethodologies.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  {/* Population Type Filter */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="population" className="text-sm font-medium text-gray-700">
                      Population:
                    </label>
                    <select
                      id="population"
                      value={populationFilter}
                      onChange={(e) => setPopulationFilter(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      {uniquePopulations.map(pop => (
                        <option key={pop} value={pop}>{pop}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  {(methodologyFilter !== 'all' || populationFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setMethodologyFilter('all')
                        setPopulationFilter('all')
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}

              {filteredPolls.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No polls available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pollster
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sample
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Results
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPolls.map((poll) => (
                        <tr key={poll.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {poll.pollster?.name || 'Unknown'}
                            </div>
                            {poll.pollster?.methodologyGrade && (
                              <div className="text-xs text-gray-500">
                                Grade: {poll.pollster.methodologyGrade}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(poll.pollDate), 'MMM d, yyyy')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {poll.sampleSize ? `${poll.sampleSize} ${poll.populationType || ''}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm space-y-1">
                              {Object.entries(poll.results).map(([candidate, percentage]) => (
                                <div key={candidate} className="flex justify-between">
                                  <span className="text-gray-700">{candidate}:</span>
                                  <span className="font-semibold">{percentage}%</span>
                                </div>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Race Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Race Information</h3>
              <dl className="space-y-3">
                {race.currentLeader && (
                  <div>
                    <dt className="text-sm text-gray-500">Current Leader</dt>
                    <dd className="text-sm font-medium text-gray-900">{race.currentLeader}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className="text-sm font-medium text-gray-900">{race.status}</dd>
                </div>
                {race.importanceScore && (
                  <div>
                    <dt className="text-sm text-gray-500">Importance</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {race.importanceScore}/10
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">Total Polls</dt>
                  <dd className="text-sm font-medium text-gray-900">{allPolls.length}</dd>
                </div>
              </dl>
            </div>

            {/* Description */}
            {race.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-sm text-gray-600">{race.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
