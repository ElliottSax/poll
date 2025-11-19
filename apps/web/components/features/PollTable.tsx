'use client'

import { useState, useMemo } from 'react'
import { Badge } from '../ui/Badge'
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'

export interface PollResult {
  candidateId: string
  candidateName: string
  party: 'democrat' | 'republican' | 'independent' | 'other'
  percentage: number
}

export interface Poll {
  id: string
  pollster: string
  pollsterGrade?: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F'
  date: Date
  sampleSize: number
  methodology: 'LV' | 'RV' | 'A' // Likely Voters, Registered Voters, Adults
  results: PollResult[]
  url?: string
  sponsor?: string
}

export interface PollTableProps {
  polls: Poll[]
  className?: string
  compact?: boolean
  showGrade?: boolean
}

type SortField = 'date' | 'pollster' | 'sampleSize'
type SortDirection = 'asc' | 'desc'

export function PollTable({ polls, className, compact = false, showGrade = true }: PollTableProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedPolls = useMemo(() => {
    return [...polls].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'pollster':
          comparison = a.pollster.localeCompare(b.pollster)
          break
        case 'sampleSize':
          comparison = a.sampleSize - b.sampleSize
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [polls, sortField, sortDirection])

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors"
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-30" />
      )}
    </button>
  )

  const getGradeColor = (grade?: Poll['pollsterGrade']) => {
    if (!grade) return 'default'
    if (grade.startsWith('A')) return 'success'
    if (grade.startsWith('B')) return 'info'
    if (grade.startsWith('C')) return 'warning'
    return 'danger'
  }

  const getMethodologyLabel = (methodology: Poll['methodology']) => {
    switch (methodology) {
      case 'LV':
        return 'Likely Voters'
      case 'RV':
        return 'Registered Voters'
      case 'A':
        return 'Adults'
    }
  }

  const getPartyBadgeVariant = (party: PollResult['party']) => {
    return party as 'democrat' | 'republican' | 'independent'
  }

  if (compact) {
    // Mobile/compact view - card-based
    return (
      <div className={`space-y-4 ${className || ''}`}>
        {sortedPolls.map((poll) => (
          <div key={poll.id} className="border rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{poll.pollster}</span>
                  {showGrade && poll.pollsterGrade && (
                    <Badge variant={getGradeColor(poll.pollsterGrade)} size="sm">
                      {poll.pollsterGrade}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(poll.date).toLocaleDateString()} • n={poll.sampleSize} • {poll.methodology}
                </div>
              </div>
              {poll.url && (
                <a
                  href={poll.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="space-y-2">
              {poll.results.map((result) => (
                <div key={result.candidateId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getPartyBadgeVariant(result.party)} size="sm">
                      {result.party.charAt(0).toUpperCase()}
                    </Badge>
                    <span className="text-sm">{result.candidateName}</span>
                  </div>
                  <span className="font-semibold tabular-nums">{result.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>

            {poll.sponsor && (
              <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                Sponsored by {poll.sponsor}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Desktop view - table
  // Get unique candidates across all polls for column headers
  const candidateColumns = useMemo(() => {
    const candidateMap = new Map<string, { name: string; party: PollResult['party'] }>()
    polls.forEach((poll) => {
      poll.results.forEach((result) => {
        if (!candidateMap.has(result.candidateId)) {
          candidateMap.set(result.candidateId, {
            name: result.candidateName,
            party: result.party,
          })
        }
      })
    })
    return Array.from(candidateMap.entries()).map(([id, data]) => ({ id, ...data }))
  }, [polls])

  return (
    <div className={`overflow-x-auto ${className || ''}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-3 text-left text-sm">
              <SortButton field="pollster">Pollster</SortButton>
            </th>
            <th className="px-4 py-3 text-left text-sm">
              <SortButton field="date">Date</SortButton>
            </th>
            <th className="px-4 py-3 text-left text-sm">
              <SortButton field="sampleSize">Sample</SortButton>
            </th>
            {candidateColumns.map((candidate) => (
              <th key={candidate.id} className="px-4 py-3 text-right text-sm font-semibold">
                <div className="flex items-center justify-end gap-1">
                  <Badge variant={getPartyBadgeVariant(candidate.party)} size="sm">
                    {candidate.party.charAt(0).toUpperCase()}
                  </Badge>
                  <span className="hidden lg:inline">{candidate.name}</span>
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-center text-sm font-semibold w-12"></th>
          </tr>
        </thead>
        <tbody>
          {sortedPolls.map((poll, index) => (
            <tr
              key={poll.id}
              className={`border-b hover:bg-gray-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
              }`}
            >
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{poll.pollster}</span>
                  {showGrade && poll.pollsterGrade && (
                    <Badge variant={getGradeColor(poll.pollsterGrade)} size="sm">
                      {poll.pollsterGrade}
                    </Badge>
                  )}
                </div>
                {poll.sponsor && (
                  <div className="text-xs text-gray-500 mt-0.5">via {poll.sponsor}</div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {new Date(poll.date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <div>{poll.sampleSize.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{poll.methodology}</div>
              </td>
              {candidateColumns.map((candidate) => {
                const result = poll.results.find((r) => r.candidateId === candidate.id)
                return (
                  <td key={candidate.id} className="px-4 py-3 text-right text-sm font-semibold tabular-nums">
                    {result ? `${result.percentage.toFixed(1)}%` : '—'}
                  </td>
                )
              })}
              <td className="px-4 py-3 text-center">
                {poll.url && (
                  <a
                    href={poll.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-blue-600 hover:text-blue-700"
                    aria-label="View poll details"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sortedPolls.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No polls found</p>
        </div>
      )}
    </div>
  )
}
