'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'

export interface TrendDataPoint {
  date: Date
  [candidateId: string]: number | Date
}

export interface CandidateInfo {
  id: string
  name: string
  party: 'democrat' | 'republican' | 'independent' | 'other'
  color?: string
}

export interface ReferenceEvent {
  date: Date
  label: string
  color?: string
}

export interface TrendChartProps {
  title?: string
  description?: string
  data: TrendDataPoint[]
  candidates: CandidateInfo[]
  referenceEvents?: ReferenceEvent[]
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  className?: string
  yAxisDomain?: [number, number]
  dateFormat?: 'short' | 'medium' | 'long'
}

const PARTY_COLORS = {
  democrat: '#2563eb', // blue-600
  republican: '#dc2626', // red-600
  independent: '#9333ea', // purple-600
  other: '#6b7280', // gray-500
}

export function TrendChart({
  title,
  description,
  data,
  candidates,
  referenceEvents = [],
  height = 400,
  showLegend = true,
  showGrid = true,
  className,
  yAxisDomain = [0, 100],
  dateFormat = 'short',
}: TrendChartProps) {
  // Transform data to use timestamps for proper sorting
  const chartData = data
    .map((point) => ({
      ...point,
      timestamp: new Date(point.date).getTime(),
      dateStr: formatDate(new Date(point.date), dateFormat),
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  function formatDate(date: Date, format: 'short' | 'medium' | 'long'): string {
    switch (format) {
      case 'short':
        return `${date.getMonth() + 1}/${date.getDate()}`
      case 'medium':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case 'long':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const candidate = candidates.find((c) => c.id === entry.dataKey)
            return (
              <div key={index} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{candidate?.name || entry.dataKey}</span>
                </div>
                <span className="font-semibold tabular-nums">{entry.value.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const candidate = candidates.find((c) => c.id === entry.dataKey)
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">{candidate?.name || entry.value}</span>
              {candidate && (
                <Badge variant={candidate.party as any} size="sm">
                  {candidate.party.charAt(0).toUpperCase()}
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}

        <XAxis
          dataKey="dateStr"
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={{ stroke: '#d1d5db' }}
        />

        <YAxis
          domain={yAxisDomain}
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={{ stroke: '#d1d5db' }}
          tickFormatter={(value) => `${value}%`}
        />

        <Tooltip content={<CustomTooltip />} />

        {showLegend && <Legend content={<CustomLegend />} />}

        {/* Reference lines for events */}
        {referenceEvents.map((event, index) => (
          <ReferenceLine
            key={index}
            x={formatDate(event.date, dateFormat)}
            stroke={event.color || '#9ca3af'}
            strokeDasharray="3 3"
            label={{
              value: event.label,
              position: 'top',
              fill: '#6b7280',
              fontSize: 11,
            }}
          />
        ))}

        {/* Lines for each candidate */}
        {candidates.map((candidate) => (
          <Line
            key={candidate.id}
            type="monotone"
            dataKey={candidate.id}
            name={candidate.name}
            stroke={candidate.color || PARTY_COLORS[candidate.party]}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )

  // If title/description provided, wrap in Card
  if (title || description) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{chart}</CardContent>
      </Card>
    )
  }

  // Otherwise return chart directly
  return <div className={className}>{chart}</div>
}

// Preset: Simple two-candidate race chart
export interface SimpleTrendChartProps {
  title?: string
  description?: string
  candidate1: { name: string; party: 'democrat' | 'republican'; data: Array<{ date: Date; value: number }> }
  candidate2: { name: string; party: 'democrat' | 'republican'; data: Array<{ date: Date; value: number }> }
  referenceEvents?: ReferenceEvent[]
  className?: string
}

export function SimpleTrendChart({
  title,
  description,
  candidate1,
  candidate2,
  referenceEvents,
  className,
}: SimpleTrendChartProps) {
  // Merge data points by date
  const dataMap = new Map<number, any>()

  candidate1.data.forEach((point) => {
    const timestamp = new Date(point.date).getTime()
    if (!dataMap.has(timestamp)) {
      dataMap.set(timestamp, { date: point.date })
    }
    dataMap.get(timestamp)!.candidate1 = point.value
  })

  candidate2.data.forEach((point) => {
    const timestamp = new Date(point.date).getTime()
    if (!dataMap.has(timestamp)) {
      dataMap.set(timestamp, { date: point.date })
    }
    dataMap.get(timestamp)!.candidate2 = point.value
  })

  const data = Array.from(dataMap.values())

  const candidates: CandidateInfo[] = [
    { id: 'candidate1', name: candidate1.name, party: candidate1.party },
    { id: 'candidate2', name: candidate2.name, party: candidate2.party },
  ]

  return (
    <TrendChart
      title={title}
      description={description}
      data={data}
      candidates={candidates}
      referenceEvents={referenceEvents}
      className={className}
    />
  )
}
