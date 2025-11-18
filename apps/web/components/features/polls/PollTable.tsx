'use client'

import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ExternalLink } from 'lucide-react'

interface Poll {
  id: string
  pollDate: string
  pollster: {
    name: string
    slug: string
  }
  sampleSize: number
  methodology: string
  population: string
  results: Record<string, number>
}

interface PollTableProps {
  raceSlug: string
}

async function fetchPolls(raceSlug: string): Promise<Poll[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const res = await fetch(`${apiUrl}/api/races/${raceSlug}/polls`)

  if (!res.ok) {
    throw new Error('Failed to fetch polls')
  }

  const data = await res.json()
  return data.polls || []
}

export function PollTable({ raceSlug }: PollTableProps) {
  const { data: polls, isLoading, error } = useQuery({
    queryKey: ['polls', raceSlug],
    queryFn: () => fetchPolls(raceSlug),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">Failed to load polls</p>
      </div>
    )
  }

  if (!polls || polls.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No polls available for this race yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pollster
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Results
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sample
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {polls.map((poll) => (
            <tr key={poll.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(poll.pollDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {poll.pollster.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-3">
                  {Object.entries(poll.results).map(([candidate, percentage]) => (
                    <div key={candidate} className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">{candidate}:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                {poll.sampleSize ? `${poll.sampleSize} ${poll.population}` : 'N/A'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                  {poll.methodology}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
