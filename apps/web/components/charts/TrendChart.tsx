'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { format, parseISO } from 'date-fns'

export interface TrendDataPoint {
  date: string
  [candidate: string]: number | string
}

export interface TrendChartProps {
  data: TrendDataPoint[]
  candidates: {
    name: string
    color: string
    key: string
  }[]
  title?: string
  height?: number
  showLegend?: boolean
  yAxisDomain?: [number, number]
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !label) return null

  return (
    <div className="glass p-3 rounded-lg border shadow-lg">
      <p className="font-semibold mb-2">
        {format(parseISO(label), 'MMM d, yyyy')}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.name}:</span>
          <span className="font-semibold">{entry.value.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

export function TrendChart({
  data,
  candidates,
  title,
  height = 400,
  showLegend = true,
  yAxisDomain = [0, 100],
}: TrendChartProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [data])

  const formatXAxis = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={sortedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            domain={yAxisDomain}
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '14px' }}
              iconType="line"
            />
          )}
          {candidates.map((candidate) => (
            <Line
              key={candidate.key}
              type="monotone"
              dataKey={candidate.key}
              stroke={candidate.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name={candidate.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TrendChart
