'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
  Area,
  ReferenceLine,
  Brush
} from 'recharts'
import { format, subDays, subMonths, isWithinInterval, parseISO } from 'date-fns'
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Table,
  BarChart3,
  ZoomIn,
  ZoomOut,
  RefreshCw
} from 'lucide-react'

// Types
interface Poll {
  id: string
  date: string
  pollster: string
  sampleSize: number
  marginOfError?: number
  methodology?: string
  results: Record<string, number>
  sourceUrl?: string
}

interface Candidate {
  name: string
  party: 'D' | 'R' | 'I'
  color: string
}

interface PollingHistoryProps {
  polls: Poll[]
  candidates: Candidate[]
  raceName: string
  className?: string
}

type DateRange = '7d' | '30d' | '90d' | '6m' | '1y' | 'all'
type ViewMode = 'chart' | 'table'

// Party colors
const PARTY_COLORS = {
  D: '#3B82F6', // Blue
  R: '#EF4444', // Red
  I: '#10B981', // Green
}

// Date range options
const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
]

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null

  const pollData = payload[0]?.payload

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl"
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="font-semibold text-gray-900 dark:text-white">
          {format(new Date(label), 'MMMM d, yyyy')}
        </span>
      </div>

      {pollData?.pollster && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {pollData.pollster} • n={pollData.sampleSize?.toLocaleString()}
          {pollData.marginOfError && ` • ±${pollData.marginOfError}%`}
        </p>
      )}

      <div className="space-y-2">
        {payload.map((entry: any, index: number) => {
          if (entry.dataKey === 'trendline') return null
          const trend = entry.payload[`${entry.dataKey}_trend`]

          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {entry.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: entry.color }}>
                  {typeof entry.value === 'number' ? entry.value.toFixed(1) : '--'}%
                </span>
                {trend !== undefined && (
                  <span className={`text-xs ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {trend > 0 ? '+' : ''}{trend.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Custom dot for scatter points
const CustomScatterDot = (props: any) => {
  const { cx, cy, payload, dataKey, color } = props
  const value = payload[dataKey]

  if (!value) return null

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke="white"
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
      />
    </g>
  )
}

export function PollingHistory({
  polls,
  candidates,
  raceName,
  className = ''
}: PollingHistoryProps) {
  const [dateRange, setDateRange] = useState<DateRange>('90d')
  const [viewMode, setViewMode] = useState<ViewMode>('chart')
  const [selectedPollsters, setSelectedPollsters] = useState<string[]>([])
  const [showTrendline, setShowTrendline] = useState(true)
  const [showIndividualPolls, setShowIndividualPolls] = useState(true)
  const [brushDomain, setBrushDomain] = useState<[number, number] | null>(null)

  // Get unique pollsters
  const pollsters = useMemo(() => {
    return [...new Set(polls.map(p => p.pollster))].sort()
  }, [polls])

  // Filter polls by date range and pollster
  const filteredPolls = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (dateRange) {
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case '90d':
        startDate = subDays(now, 90)
        break
      case '6m':
        startDate = subMonths(now, 6)
        break
      case '1y':
        startDate = subMonths(now, 12)
        break
      default:
        startDate = new Date(0)
    }

    return polls
      .filter(poll => {
        const pollDate = parseISO(poll.date)
        const inDateRange = isWithinInterval(pollDate, { start: startDate, end: now })
        const matchesPollster = selectedPollsters.length === 0 || selectedPollsters.includes(poll.pollster)
        return inDateRange && matchesPollster
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [polls, dateRange, selectedPollsters])

  // Transform polls to chart data
  const chartData = useMemo(() => {
    return filteredPolls.map(poll => {
      const dataPoint: any = {
        date: poll.date,
        timestamp: new Date(poll.date).getTime(),
        pollster: poll.pollster,
        sampleSize: poll.sampleSize,
        marginOfError: poll.marginOfError,
      }

      candidates.forEach(candidate => {
        dataPoint[candidate.name] = poll.results[candidate.name] || null
      })

      return dataPoint
    })
  }, [filteredPolls, candidates])

  // Calculate trendline data (moving average)
  const trendlineData = useMemo(() => {
    if (chartData.length < 3) return chartData

    const windowSize = Math.min(5, Math.ceil(chartData.length / 3))

    return chartData.map((point, index) => {
      const trendPoint: any = { ...point }

      candidates.forEach(candidate => {
        const start = Math.max(0, index - windowSize + 1)
        const end = index + 1
        const window = chartData.slice(start, end)
        const values = window
          .map(p => p[candidate.name])
          .filter((v): v is number => v !== null)

        if (values.length > 0) {
          trendPoint[`${candidate.name}_avg`] = values.reduce((a, b) => a + b, 0) / values.length
        }
      })

      return trendPoint
    })
  }, [chartData, candidates])

  // Calculate statistics
  const stats = useMemo(() => {
    const result: Record<string, {
      current: number
      change7d: number
      change30d: number
      high: number
      low: number
      avg: number
    }> = {}

    candidates.forEach(candidate => {
      const values = chartData
        .map(p => p[candidate.name])
        .filter((v): v is number => v !== null)

      if (values.length === 0) {
        result[candidate.name] = { current: 0, change7d: 0, change30d: 0, high: 0, low: 0, avg: 0 }
        return
      }

      const current = values[values.length - 1]
      const weekAgo = values[Math.max(0, values.length - 7)] || current
      const monthAgo = values[Math.max(0, values.length - 30)] || current

      result[candidate.name] = {
        current,
        change7d: current - weekAgo,
        change30d: current - monthAgo,
        high: Math.max(...values),
        low: Math.min(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
      }
    })

    return result
  }, [chartData, candidates])

  const togglePollster = (pollster: string) => {
    setSelectedPollsters(prev =>
      prev.includes(pollster)
        ? prev.filter(p => p !== pollster)
        : [...prev, pollster]
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Polling History
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {raceName} • {filteredPolls.length} polls shown
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {DATE_RANGES.map(range => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  dateRange === range.value
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('chart')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Chart View"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {candidates.map(candidate => {
          const stat = stats[candidate.name]
          if (!stat) return null

          return (
            <motion.div
              key={candidate.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: candidate.color }}
                />
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                  {candidate.name}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold" style={{ color: candidate.color }}>
                  {stat.current.toFixed(1)}%
                </span>
                <span className={`text-sm flex items-center gap-1 ${
                  stat.change7d > 0 ? 'text-green-500' : stat.change7d < 0 ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {stat.change7d > 0 ? <TrendingUp className="w-3 h-3" /> :
                   stat.change7d < 0 ? <TrendingDown className="w-3 h-3" /> :
                   <Minus className="w-3 h-3" />}
                  {stat.change7d > 0 ? '+' : ''}{stat.change7d.toFixed(1)}
                </span>
              </div>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Range:</span>
                  <span>{stat.low.toFixed(1)}% - {stat.high.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average:</span>
                  <span>{stat.avg.toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Chart/Table Toggle Options */}
      {viewMode === 'chart' && (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showTrendline}
              onChange={(e) => setShowTrendline(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Show Trendline</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showIndividualPolls}
              onChange={(e) => setShowIndividualPolls(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Show Individual Polls</span>
          </label>

          {/* Pollster Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4" />
              Filter Pollsters
              {selectedPollsters.length > 0 && (
                <span className="bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {selectedPollsters.length}
                </span>
              )}
            </button>

            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50 hidden group-hover:block">
              <div className="max-h-48 overflow-y-auto space-y-1">
                {pollsters.map(pollster => (
                  <label key={pollster} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPollsters.length === 0 || selectedPollsters.includes(pollster)}
                      onChange={() => togglePollster(pollster)}
                      className="w-3 h-3 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{pollster}</span>
                  </label>
                ))}
              </div>
              {selectedPollsters.length > 0 && (
                <button
                  onClick={() => setSelectedPollsters([])}
                  className="w-full mt-2 text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'chart' ? (
          <motion.div
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart data={trendlineData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <defs>
                  {candidates.map(candidate => (
                    <linearGradient key={candidate.name} id={`gradient-${candidate.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={candidate.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={candidate.color} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />

                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  dy={10}
                />

                <YAxis
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `${value}%`}
                  dx={-5}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                  wrapperStyle={{ paddingTop: 20 }}
                  iconType="circle"
                />

                {/* 50% reference line */}
                <ReferenceLine
                  y={50}
                  stroke="#9ca3af"
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />

                {/* Trendlines (moving average) */}
                {showTrendline && candidates.map(candidate => (
                  <Area
                    key={`area-${candidate.name}`}
                    type="monotone"
                    dataKey={`${candidate.name}_avg`}
                    fill={`url(#gradient-${candidate.name})`}
                    stroke={candidate.color}
                    strokeWidth={3}
                    name={`${candidate.name} (Trend)`}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }}
                    connectNulls
                  />
                ))}

                {/* Individual poll scatter points */}
                {showIndividualPolls && candidates.map(candidate => (
                  <Scatter
                    key={`scatter-${candidate.name}`}
                    dataKey={candidate.name}
                    fill={candidate.color}
                    name={candidate.name}
                    shape={(props: any) => <CustomScatterDot {...props} color={candidate.color} dataKey={candidate.name} />}
                  />
                ))}

                {/* Brush for zoom */}
                <Brush
                  dataKey="date"
                  height={30}
                  stroke="#6366f1"
                  tickFormatter={(value) => format(new Date(value), 'M/d')}
                  startIndex={Math.max(0, chartData.length - 30)}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pollster</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Sample</th>
                    {candidates.map(candidate => (
                      <th
                        key={candidate.name}
                        className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                        style={{ color: candidate.color }}
                      >
                        {candidate.name}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Spread</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[...filteredPolls].reverse().map((poll, index) => {
                    const values = candidates.map(c => poll.results[c.name] || 0)
                    const max = Math.max(...values)
                    const min = Math.min(...values)
                    const leader = candidates[values.indexOf(max)]

                    return (
                      <motion.tr
                        key={poll.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {format(new Date(poll.date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{poll.pollster}</div>
                          {poll.methodology && (
                            <div className="text-xs text-gray-500">{poll.methodology}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                          {poll.sampleSize?.toLocaleString()}
                          {poll.marginOfError && <span className="text-xs ml-1">±{poll.marginOfError}</span>}
                        </td>
                        {candidates.map(candidate => (
                          <td
                            key={candidate.name}
                            className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold"
                            style={{ color: candidate.color }}
                          >
                            {poll.results[candidate.name]?.toFixed(1) || '--'}%
                          </td>
                        ))}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          <span
                            className="font-semibold"
                            style={{ color: leader?.color }}
                          >
                            {leader?.name.split(' ').pop()} +{(max - min).toFixed(1)}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredPolls.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No polls found for the selected filters
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend / Footer */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Data from {pollsters.length} pollsters • Last updated {filteredPolls.length > 0 ? format(new Date(filteredPolls[filteredPolls.length - 1]?.date || new Date()), 'MMM d, yyyy') : 'N/A'}
      </div>
    </div>
  )
}
