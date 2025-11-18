'use client'

import { useEffect, useState } from 'react'
import { api, type Race } from '@/lib/api'

interface RaceComparisonCardProps {
  raceSlug: string
  onRemove?: () => void
}

export default function RaceComparisonCard({ raceSlug, onRemove }: RaceComparisonCardProps) {
  const [race, setRace] = useState<Race | null>(null)
  const [average, setAverage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRaceData() {
      try {
        setLoading(true)
        const [raceData, avgData] = await Promise.all([
          api.getRace(raceSlug),
          api.getRaceAverage(raceSlug, 14),
        ])
        setRace(raceData)
        setAverage(avgData)
      } catch (err) {
        console.error('Failed to load race data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadRaceData()
  }, [raceSlug])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!race) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Race not found</p>
      </div>
    )
  }

  const candidates = Object.entries(average?.averages || {}).sort(
    ([, a], [, b]) => (b as number) - (a as number)
  )

  const getBarWidth = (percentage: number) => {
    const maxPercentage = candidates.length > 0 ? (candidates[0][1] as number) : 100
    return `${(percentage / maxPercentage) * 100}%`
  }

  const getBarColor = (index: number) => {
    if (index === 0) return 'bg-blue-600'
    if (index === 1) return 'bg-red-500'
    return 'bg-gray-400'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{race.raceName}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm px-2 py-1 bg-blue-50 text-blue-600 rounded font-medium">
              {race.raceType}
            </span>
            {race.state && (
              <span className="text-sm text-gray-500">{race.state}</span>
            )}
          </div>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-gray-600 text-xl"
            aria-label="Remove race"
          >
            ×
          </button>
        )}
      </div>

      {/* Polling Average */}
      {average && average.pollsIncluded > 0 ? (
        <div>
          <div className="text-xs text-gray-500 mb-3">
            14-day average ({average.pollsIncluded} polls)
          </div>
          <div className="space-y-3">
            {candidates.map(([candidate, percentage], index) => (
              <div key={candidate}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{candidate}</span>
                  <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getBarColor(index)}`}
                    style={{ width: getBarWidth(percentage as number) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm">
          No recent polls available
        </div>
      )}

      {/* View Details Link */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <a
          href={`/races/${race.slug}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View full details →
        </a>
      </div>
    </div>
  )
}
