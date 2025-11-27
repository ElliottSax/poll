'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ProbabilityBarProps {
  data: Array<{
    name: string
    probability: number
    color: string
  }>
  height?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="glass border border-border/50 rounded-xl p-5 shadow-premium-lg backdrop-blur-premium animate-scale-in">
      <p className="text-sm font-bold mb-3 text-foreground flex items-center gap-2">
        <span className="w-1 h-4 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
        {data.name}
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full relative shadow-md"
          style={{
            backgroundColor: data.color,
            boxShadow: `0 0 12px ${data.color}60`
          }}
        >
          <div
            className="absolute inset-0 rounded-full animate-pulse-glow"
            style={{ backgroundColor: data.color, opacity: 0.4 }}
          />
        </div>
        <span className="text-2xl font-bold tabular-nums" style={{ color: data.color }}>
          {data.probability.toFixed(1)}%
        </span>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        Win Probability
      </div>
      {/* Decorative gradient line */}
      <div className="mt-3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  )
}

const CustomBar = (props: any) => {
  const { fill, x, y, width, height, index } = props

  return (
    <g>
      <defs>
        {/* 3D-style gradient */}
        <linearGradient id={`bar-3d-${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={fill} stopOpacity={0.7} />
          <stop offset="50%" stopColor={fill} stopOpacity={1} />
          <stop offset="100%" stopColor={fill} stopOpacity={0.8} />
        </linearGradient>

        {/* Top highlight gradient */}
        <linearGradient id={`bar-highlight-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity={0.4} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </linearGradient>

        {/* Glow filter */}
        <filter id={`bar-glow-${index}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shadow/depth layer */}
      <rect
        x={x}
        y={y + 2}
        width={width}
        height={height}
        fill={fill}
        opacity={0.2}
        rx={10}
      />

      {/* Main bar */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#bar-3d-${index})`}
        rx={10}
        filter={`url(#bar-glow-${index})`}
        className="transition-all duration-300"
      />

      {/* Top highlight */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height * 0.3}
        fill={`url(#bar-highlight-${index})`}
        rx={10}
        opacity={0.8}
      />

      {/* Shimmer effect */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="url(#shimmer-gradient)"
        rx={10}
        opacity={0.2}
      >
        <animate
          attributeName="opacity"
          values="0.2;0.5;0.2"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>
    </g>
  )
}

export function ProbabilityBar({ data, height = 200 }: ProbabilityBarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="relative glass border border-border/50 rounded-xl p-6 shadow-premium-lg">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 rounded-xl pointer-events-none" />

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 50, left: 130, bottom: 10 }}>
          <defs>
            <linearGradient id="shimmer-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity={0} />
              <stop offset="50%" stopColor="white" stopOpacity={0.3} />
              <stop offset="100%" stopColor="white" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            className="stroke-border/20"
            horizontal={false}
            stroke="hsl(var(--border))"
            strokeOpacity={0.3}
          />

          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
          />

          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 14, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={120}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              fill: 'hsl(var(--primary))',
              opacity: 0.1,
              radius: 8
            }}
          />

          <Bar
            dataKey="probability"
            radius={[0, 14, 14, 0]}
            animationDuration={1500}
            animationEasing="ease-out"
            shape={(props: any) => <CustomBar {...props} index={props.index} />}
            onMouseEnter={(data, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.5}
                className="transition-opacity duration-300"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-tl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-br-xl pointer-events-none" />
    </div>
  )
}
