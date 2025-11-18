'use client'

import { useQuery } from '@tanstack/react-query'
import { PollsterCard } from './PollsterCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Pollster {
  id: string
  slug: string
  name: string
  grade?: string | null
  accuracyScore?: number | null
  methodologyScore?: number | null
  partisanLean?: string | null
  website?: string | null
}

async function fetchPollsters(): Promise<Pollster[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const res = await fetch(`${apiUrl}/api/pollsters`)

  if (!res.ok) {
    throw new Error('Failed to fetch pollsters')
  }

  const data = await res.json()
  return data.pollsters || []
}

export function PollsterList() {
  const { data: pollsters, isLoading, error } = useQuery({
    queryKey: ['pollsters'],
    queryFn: fetchPollsters,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Failed to load pollsters</p>
      </div>
    )
  }

  if (!pollsters || pollsters.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 text-lg">No pollsters found</p>
      </div>
    )
  }

  // Sort by grade (A+ first)
  const sortedPollsters = [...pollsters].sort((a, b) => {
    if (!a.grade) return 1
    if (!b.grade) return -1
    return a.grade.localeCompare(b.grade)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {sortedPollsters.length} pollster{sortedPollsters.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedPollsters.map((pollster) => (
          <PollsterCard key={pollster.id} pollster={pollster} />
        ))}
      </div>
    </div>
  )
}
