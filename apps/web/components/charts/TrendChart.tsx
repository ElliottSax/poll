'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts'

interface TrendChartProps {
  data: Array<{
    date: string
    [key: string]: number | string
  }>
  lines: Array<{
    dataKey: string
    name: string
    color: string
    fillColor?: string
  }>
  height?: number
  showArea?: boolean
  showGrid?: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="glass border border-border/50 rounded-xl p-5 shadow-premium-lg backdrop-blur-premium animate-scale-in">
      <p className="text-sm font-bold mb-3 text-foreground flex items-center gap-2">
        <span className="w-1 h-4 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
        {new Date(label).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}
      </p>
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-6 group">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shadow-md relative"
                style={{
                  backgroundColor: entry.color,
                  boxShadow: `0 0 8px ${entry.color}60`
                }}
              >
                <div
                  className="absolute inset-0 rounded-full animate-pulse-glow"
                  style={{ backgroundColor: entry.color, opacity: 0.3 }}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {entry.name}
              </span>
            </div>
            <span className="text-lg font-bold tabular-nums" style={{ color: entry.color }}>
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%
            </span>
          </div>
        ))}
      </div>
      {/* Decorative gradient line */}
      <div className="mt-3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  )
}

const CustomDot = (props: any) => {
  const { cx, cy, stroke, payload } = props

  if (payload.isLatest) {
    return (
      <g>
        {/* Outer glow ring - animated */}
        <circle cx={cx} cy={cy} r={12} fill={stroke} opacity={0.1}>
          <animate attributeName="r" from="12" to="16" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.1" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Middle ring */}
        <circle cx={cx} cy={cy} r={8} fill={stroke} opacity={0.3} />
        {/* Inner dot with gradient */}
        <defs>
          <radialGradient id={`dotGradient-${cx}-${cy}`}>
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor={stroke} stopOpacity="1" />
          </radialGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill={`url(#dotGradient-${cx}-${cy})`}
          stroke="white"
          strokeWidth={2}
          filter={`drop-shadow(0 0 4px ${stroke})`}
        />
      </g>
    )
  }
  return null
}

const CustomActiveDot = (props: any) => {
  const { cx, cy, stroke } = props

  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={stroke} opacity={0.2} />
      <circle cx={cx} cy={cy} r={5} fill={stroke} stroke="white" strokeWidth={2}>
        <animate attributeName="r" from="5" to="6" dur="0.3s" repeatCount="1" />
      </circle>
    </g>
  )
}

export function TrendChart({
  data,
  lines,
  height = 400,
  showArea = true,
  showGrid = true
}: TrendChartProps) {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null)

  // Mark the last data point
  const enhancedData = data.map((d, i) => ({
    ...d,
    isLatest: i === data.length - 1
  }))

  const Chart = showArea ? ComposedChart : LineChart

  return (
    <div className="relative glass border border-border/50 rounded-xl p-6 shadow-premium-lg">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 rounded-xl pointer-events-none" />

      <ResponsiveContainer width="100%" height={height}>
        <Chart data={enhancedData} margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
          <defs>
            {lines.map((line, index) => (
              <React.Fragment key={line.dataKey}>
                {/* Enhanced gradient for area fills */}
                <linearGradient id={`areaGradient-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={line.color} stopOpacity={0.4} />
                  <stop offset="50%" stopColor={line.color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={line.color} stopOpacity={0.01} />
                </linearGradient>

                {/* Glow filter for lines */}
                <filter id={`glow-${line.dataKey}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </React.Fragment>
            ))}
          </defs>

          {showGrid && (
            <CartesianGrid
              strokeDasharray="4 4"
              className="stroke-border/20"
              vertical={false}
              stroke="hsl(var(--border))"
              strokeOpacity={0.3}
            />
          )}

          <XAxis
            dataKey="date"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }}
            dy={10}
          />

          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            dx={-5}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: 'hsl(var(--primary))',
              strokeWidth: 2,
              strokeDasharray: '5 5',
              strokeOpacity: 0.3
            }}
          />

          <Legend
            wrapperStyle={{ paddingTop: '30px' }}
            iconType="circle"
            formatter={(value, entry: any) => (
              <span
                className={`text-sm font-semibold transition-all ${
                  hoveredLine === entry.dataKey || !hoveredLine
                    ? 'opacity-100'
                    : 'opacity-40'
                }`}
                onMouseEnter={() => setHoveredLine(entry.dataKey)}
                onMouseLeave={() => setHoveredLine(null)}
              >
                {value}
              </span>
            )}
          />

          {lines.map((line, index) => (
            <React.Fragment key={line.dataKey}>
              {showArea && (
                <Area
                  type="monotone"
                  dataKey={line.dataKey}
                  fill={`url(#areaGradient-${line.dataKey})`}
                  stroke="none"
                  animationDuration={2000}
                  animationEasing="ease-out"
                  isAnimationActive={true}
                />
              )}
              <Line
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={hoveredLine === line.dataKey ? 4 : 3}
                dot={<CustomDot />}
                activeDot={<CustomActiveDot />}
                animationDuration={2000}
                animationEasing="ease-out"
                filter={hoveredLine === line.dataKey ? `url(#glow-${line.dataKey})` : undefined}
                opacity={hoveredLine && hoveredLine !== line.dataKey ? 0.3 : 1}
                style={{
                  transition: 'all 0.3s ease',
                  filter: hoveredLine === line.dataKey ? `drop-shadow(0 0 8px ${line.color})` : 'none'
                }}
              />
            </React.Fragment>
          ))}
        </Chart>
      </ResponsiveContainer>

      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-bl-xl pointer-events-none" />
    </div>
  )
}

// Add React import for Fragment
import React from 'react'
