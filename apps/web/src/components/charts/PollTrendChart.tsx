/**
 * Poll Trend Chart
 *
 * Displays polling trends over time using Recharts
 */

'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { Poll } from '@/lib/api'

interface PollTrendChartProps {
  polls: Poll[]
  candidates: any[]
}

export default function PollTrendChart({ polls, candidates }: PollTrendChartProps) {
  // Process polls data for chart
  const chartData = useMemo(() => {
    // Sort polls by date
    const sortedPolls = [...polls].sort((a, b) =>
      new Date(a.pollDate).getTime() - new Date(b.pollDate).getTime()
    )

    // Transform to chart format
    return sortedPolls.map(poll => {
      const dataPoint: any = {
        date: format(new Date(poll.pollDate), 'MMM d'),
        fullDate: poll.pollDate,
        pollster: poll.pollster?.name || 'Unknown',
      }

      // Add each candidate's percentage
      Object.entries(poll.results).forEach(([candidate, percentage]) => {
        dataPoint[candidate] = percentage
      })

      return dataPoint
    })
  }, [polls])

  // Get unique candidate names for lines
  const candidateNames = useMemo(() => {
    const names = new Set<string>()
    polls.forEach(poll => {
      Object.keys(poll.results).forEach(name => names.add(name))
    })
    return Array.from(names).filter(name => name !== 'Undecided')
  }, [polls])

  // Color mapping for candidates
  const getColor = (candidateName: string, index: number) => {
    const candidate = candidates.find(c => c.name === candidateName)
    if (candidate?.party === 'D') return '#2563eb' // Blue
    if (candidate?.party === 'R') return '#dc2626' // Red
    if (candidate?.party === 'I') return '#9333ea' // Purple

    // Fallback colors
    const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    return colors[index % colors.length]
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No polling data available for chart
      </div>
    )
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
            label={{ value: 'Percentage', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
            formatter={(value: any) => `${value}%`}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
          />
          {candidateNames.map((name, index) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={getColor(name, index)}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
