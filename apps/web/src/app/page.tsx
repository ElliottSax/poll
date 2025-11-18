/**
 * Homepage - Featured Races
 */

'use client'

import { useEffect, useState } from 'react'
import { api, Race } from '@/lib/api'
import RaceComparisonCard from '@/components/RaceComparisonCard'

export default function HomePage() {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [comparedRaces, setComparedRaces] = useState<string[]>([])

  useEffect(() => {
    async function loadRaces() {
      try {
        setLoading(true)
        const data = await api.getRaces({ status: 'ACTIVE', limit: 10 })
        setRaces(data.races)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load races')
      } finally {
        setLoading(false)
      }
    }

    loadRaces()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading races...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Polling Dashboard</h1>
          <p className="mt-2 text-gray-600">Real-time election polling data and forecasts</p>

          {/* Navigation */}
          <nav className="mt-4 flex gap-4">
            <a
              href="/"
              className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1"
            >
              Races
            </a>
            <a
              href="/pollsters"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-1"
            >
              Pollsters
            </a>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Race Comparison Section */}
        {showComparison && comparedRaces.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Race Comparison</h2>
              <button
                onClick={() => setShowComparison(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Hide comparison
              </button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {comparedRaces.map((slug) => (
                <RaceComparisonCard
                  key={slug}
                  raceSlug={slug}
                  onRemove={() => setComparedRaces(prev => prev.filter(s => s !== slug))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Featured Races Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Races</h2>
          {!showComparison && comparedRaces.length > 0 && (
            <button
              onClick={() => setShowComparison(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Compare Races ({comparedRaces.length})
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {races.map((race) => (
            <div
              key={race.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded">
                    {race.raceType}
                  </span>
                  {race.state && (
                    <span className="ml-2 text-sm text-gray-500">{race.state}</span>
                  )}
                </div>
                {race.competitiveRating && (
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      race.competitiveRating.includes('Toss')
                        ? 'bg-yellow-50 text-yellow-700'
                        : race.competitiveRating.includes('Lean')
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {race.competitiveRating}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{race.raceName}</h3>

              {race.currentLeader && (
                <p className="text-sm text-gray-600 mb-3">
                  Current Leader: <span className="font-medium">{race.currentLeader}</span>
                </p>
              )}

              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {race._count?.polls || 0} polls
                  </span>
                  <a
                    href={`/races/${race.slug}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View Details →
                  </a>
                </div>
                {comparedRaces.includes(race.slug) ? (
                  <button
                    onClick={() => setComparedRaces(prev => prev.filter(s => s !== race.slug))}
                    className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Remove from comparison
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setComparedRaces(prev => [...prev, race.slug])
                      setShowComparison(true)
                    }}
                    className="w-full px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    Add to comparison
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {races.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No active races found</p>
          </div>
        )}
      </div>
    </main>
  )
}
