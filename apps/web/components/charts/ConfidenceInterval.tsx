'use client'

import { useState } from 'react'

interface ConfidenceIntervalProps {
  candidates: Array<{
    name: string
    party: 'D' | 'R' | 'I'
    percentage: number
    marginOfError: number
    color: string
  }>
  className?: string
}

export function ConfidenceInterval({ candidates, className = '' }: ConfidenceIntervalProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Calculate the range for the chart (find min and max including margins)
  const allValues = candidates.flatMap(c => [
    c.percentage - c.marginOfError,
    c.percentage + c.marginOfError
  ])
  const minValue = Math.max(0, Math.floor(Math.min(...allValues) - 2))
  const maxValue = Math.min(100, Math.ceil(Math.max(...allValues) + 2))
  const range = maxValue - minValue

  const getPositionPercent = (value: number) => {
    return ((value - minValue) / range) * 100
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Confidence Intervals</h3>
          <p className="text-sm text-muted-foreground mt-1">
            95% confidence range with margin of error
          </p>
        </div>
        <div className="glass px-4 py-2 rounded-lg border border-border/50">
          <span className="text-xs text-muted-foreground">±MOE</span>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-6">
        {candidates.map((candidate, index) => {
          const lowBound = candidate.percentage - candidate.marginOfError
          const highBound = candidate.percentage + candidate.marginOfError
          const isHovered = hoveredIndex === index

          return (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Candidate name and percentage */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-md transition-transform group-hover:scale-125"
                    style={{ backgroundColor: candidate.color }}
                  />
                  <span className={`font-semibold transition-colors ${isHovered ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {candidate.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    {lowBound.toFixed(1)}% - {highBound.toFixed(1)}%
                  </span>
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: candidate.color }}
                  >
                    {candidate.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Visualization */}
              <div className="relative h-12 bg-muted/30 rounded-xl overflow-visible">
                {/* Confidence interval bar (lighter) */}
                <div
                  className="absolute h-full rounded-xl transition-all duration-300"
                  style={{
                    left: `${getPositionPercent(lowBound)}%`,
                    width: `${getPositionPercent(highBound) - getPositionPercent(lowBound)}%`,
                    backgroundColor: candidate.color,
                    opacity: isHovered ? 0.3 : 0.15
                  }}
                />

                {/* Point estimate bar (darker) */}
                <div
                  className="absolute h-full rounded-xl transition-all duration-500 ease-out"
                  style={{
                    left: `${getPositionPercent(candidate.percentage - 0.5)}%`,
                    width: `${getPositionPercent(1)}%`,
                    backgroundColor: candidate.color,
                    opacity: isHovered ? 1 : 0.9,
                    boxShadow: isHovered ? `0 0 20px ${candidate.color}` : 'none'
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    <div
                      className="absolute inset-0 animate-shimmer"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        backgroundSize: '200% 100%'
                      }}
                    />
                  </div>
                </div>

                {/* Lower bound marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-current transition-opacity"
                  style={{
                    left: `${getPositionPercent(lowBound)}%`,
                    color: candidate.color,
                    opacity: isHovered ? 0.6 : 0.3
                  }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-current" />
                </div>

                {/* Upper bound marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-current transition-opacity"
                  style={{
                    left: `${getPositionPercent(highBound)}%`,
                    color: candidate.color,
                    opacity: isHovered ? 0.6 : 0.3
                  }}
                >
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-current" />
                </div>

                {/* Point estimate marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{
                    left: `${getPositionPercent(candidate.percentage)}%`
                  }}
                >
                  <div
                    className={`w-1 h-full rounded-full transition-all ${isHovered ? 'scale-110' : 'scale-100'}`}
                    style={{
                      backgroundColor: candidate.color,
                      boxShadow: isHovered ? `0 0 12px ${candidate.color}` : 'none'
                    }}
                  />
                </div>
              </div>

              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 animate-slide-up">
                  <div className="glass border border-border/50 rounded-lg px-4 py-2 shadow-premium-lg">
                    <div className="text-xs text-muted-foreground mb-1">Margin of Error</div>
                    <div className="text-sm font-bold" style={{ color: candidate.color }}>
                      ±{candidate.marginOfError.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Scale */}
      <div className="relative h-8 border-t border-border/30">
        <div className="absolute inset-x-0 top-0 flex justify-between">
          {Array.from({ length: 11 }, (_, i) => {
            const value = minValue + (range * i) / 10
            return (
              <div key={i} className="relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-px h-2 bg-border/50" />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                  {value.toFixed(0)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="glass p-4 rounded-xl border border-border/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-3 bg-primary/30 rounded" />
            <span className="text-muted-foreground">Confidence Range</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-3 bg-primary rounded" />
            <span className="text-muted-foreground">Point Estimate</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-primary rounded" />
              <div className="w-1 h-3 bg-primary rounded" />
            </div>
            <span className="text-muted-foreground">Bounds (±MOE)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
