'use client'

import { useEffect, useState } from 'react'
import { api, type Pollster } from '@/lib/api'
import Link from 'next/link'

export default function PollustersPage() {
  const [pollsters, setPollsters] = useState<Pollster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'accuracy' | 'pollCount'>('accuracy')

  useEffect(() => {
    async function loadPollsters() {
      try {
        setLoading(true)
        setError(null)

        const data = await api.getPollsters({
          orderBy: sortBy,
          limit: 100,
        })

        setPollsters(data.pollsters)
      } catch (err) {
        console.error('Failed to load pollsters:', err)
        setError(err instanceof Error ? err.message : 'Failed to load pollsters')
      } finally {
        setLoading(false)
      }
    }

    loadPollsters()
  }, [sortBy])

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
    if (!lean) return 'text-gray-600'
    if (lean === 'DEMOCRAT') return 'text-blue-600'
    if (lean === 'REPUBLICAN') return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to homepage
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pollsters Directory
          </h1>
          <p className="text-lg text-gray-600">
            {pollsters.length} polling organizations ranked by accuracy and methodology
          </p>
        </div>

        {/* Sort Controls */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('accuracy')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'accuracy'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Accuracy
            </button>
            <button
              onClick={() => setSortBy('pollCount')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'pollCount'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Poll Count
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'name'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Name
            </button>
          </div>
        </div>

        {/* Pollsters Grid */}
        {pollsters.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No pollsters found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pollsters.map((pollster) => (
              <Link
                key={pollster.id}
                href={`/pollsters/${pollster.slug}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Pollster Name */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {pollster.name}
                  </h2>
                  {pollster.organization && (
                    <p className="text-sm text-gray-600">{pollster.organization}</p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="space-y-3 mb-4">
                  {/* Methodology Grade */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Grade:</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-bold ${getGradeColor(pollster.methodologyGrade)}`}>
                      {formatGrade(pollster.methodologyGrade)}
                    </span>
                  </div>

                  {/* Accuracy */}
                  {pollster.overallAccuracy !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Accuracy:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {pollster.overallAccuracy.toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {/* Transparency */}
                  {pollster.transparencyScore !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Transparency:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {pollster.transparencyScore.toFixed(1)}/10
                      </span>
                    </div>
                  )}

                  {/* Partisan Lean */}
                  {pollster.partisanLean && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Lean:</span>
                      <span className={`text-sm font-semibold ${getPartisanColor(pollster.partisanLean)}`}>
                        {pollster.partisanLean}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Polls conducted:</span>
                    <span className="font-semibold text-gray-900">{pollster.pollCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
