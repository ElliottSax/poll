'use client'

import { useState } from 'react'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

interface Candidate {
  name: string
  party: string
  percentage: number
  color: string
  trend?: number
}

interface HeadToHeadRadialProps {
  candidate1: Candidate
  candidate2: Candidate
  size?: number
  showTrend?: boolean
}

export function HeadToHeadRadial({
  candidate1,
  candidate2,
  size = 400,
  showTrend = true
}: HeadToHeadRadialProps) {
  const [hoveredCandidate, setHoveredCandidate] = useState<number | null>(null)

  const total = candidate1.percentage + candidate2.percentage
  const normalizedPercentage1 = (candidate1.percentage / total) * 100
  const normalizedPercentage2 = (candidate2.percentage / total) * 100

  const radius = size / 2 - 40
  const strokeWidth = 60
  const circumference = 2 * Math.PI * radius

  // Calculate arc lengths
  const arc1Length = (normalizedPercentage1 / 100) * circumference
  const arc2Length = (normalizedPercentage2 / 100) * circumference

  const center = size / 2

  return (
    <div className="relative glass border border-border/50 rounded-xl p-8 shadow-premium-lg">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 rounded-xl pointer-events-none" />

      <div className="relative" style={{ width: size, height: size, margin: '0 auto' }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            {/* Gradient for candidate 1 */}
            <linearGradient id="radial-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={candidate1.color} stopOpacity={0.8} />
              <stop offset="100%" stopColor={candidate1.color} stopOpacity={1} />
            </linearGradient>

            {/* Gradient for candidate 2 */}
            <linearGradient id="radial-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={candidate2.color} stopOpacity={0.8} />
              <stop offset="100%" stopColor={candidate2.color} stopOpacity={1} />
            </linearGradient>

            {/* Glow filters */}
            <filter id="glow-1" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="glow-2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Shimmer effect */}
            <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            opacity={0.2}
          />

          {/* Candidate 1 arc - animated */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#radial-gradient-1)"
            strokeWidth={hoveredCandidate === 1 ? strokeWidth + 8 : strokeWidth}
            strokeDasharray={`${arc1Length} ${circumference}`}
            strokeLinecap="round"
            filter={hoveredCandidate === 1 ? "url(#glow-1)" : undefined}
            className="transition-all duration-500 cursor-pointer"
            style={{
              opacity: hoveredCandidate === 2 ? 0.5 : 1,
            }}
            onMouseEnter={() => setHoveredCandidate(1)}
            onMouseLeave={() => setHoveredCandidate(null)}
          >
            <animate attributeName="stroke-dasharray" from="0 1000" to={`${arc1Length} ${circumference}`} dur="2s" fill="freeze" />
          </circle>

          {/* Candidate 2 arc - animated */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#radial-gradient-2)"
            strokeWidth={hoveredCandidate === 2 ? strokeWidth + 8 : strokeWidth}
            strokeDasharray={`${arc2Length} ${circumference}`}
            strokeDashoffset={-arc1Length}
            strokeLinecap="round"
            filter={hoveredCandidate === 2 ? "url(#glow-2)" : undefined}
            className="transition-all duration-500 cursor-pointer"
            style={{
              opacity: hoveredCandidate === 1 ? 0.5 : 1,
            }}
            onMouseEnter={() => setHoveredCandidate(2)}
            onMouseLeave={() => setHoveredCandidate(null)}
          >
            <animate
              attributeName="stroke-dasharray"
              from="0 1000"
              to={`${arc2Length} ${circumference}`}
              dur="2s"
              fill="freeze"
            />
          </circle>

          {/* Center divider line - animated */}
          <line
            x1={center}
            y1={center - radius - strokeWidth / 2}
            x2={center}
            y2={center - radius + strokeWidth / 2}
            stroke="hsl(var(--background))"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0}
          >
            <animate attributeName="opacity" from="0" to="0.8" dur="1s" begin="2s" fill="freeze" />
          </line>
        </svg>

        {/* Center statistics */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="mb-2">
            <div className="text-sm text-muted-foreground font-medium mb-1">Lead</div>
            <div className="text-5xl font-bold text-foreground">
              <AnimatedCounter
                value={Math.abs(candidate1.percentage - candidate2.percentage)}
                duration={2000}
                decimals={1}
                suffix="%"
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2 max-w-[120px]">
            {candidate1.percentage > candidate2.percentage ? candidate1.name : candidate2.name}
          </div>
        </div>
      </div>

      {/* Candidate cards */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        {/* Candidate 1 */}
        <div
          className={`glass p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
            hoveredCandidate === 1
              ? 'border-primary/50 shadow-premium-lg scale-105'
              : 'border-border/50'
          }`}
          onMouseEnter={() => setHoveredCandidate(1)}
          onMouseLeave={() => setHoveredCandidate(null)}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-bold text-lg mb-1">{candidate1.name}</div>
              <div className="text-sm text-muted-foreground">{candidate1.party}</div>
            </div>
            <div
              className="w-6 h-6 rounded-full shadow-md"
              style={{
                backgroundColor: candidate1.color,
                boxShadow: `0 0 16px ${candidate1.color}60`
              }}
            />
          </div>

          <div className="mb-2">
            <div className="text-4xl font-bold" style={{ color: candidate1.color }}>
              <AnimatedCounter value={candidate1.percentage} duration={2000} decimals={1} suffix="%" />
            </div>
          </div>

          {showTrend && candidate1.trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              candidate1.trend > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              <span>{candidate1.trend > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(candidate1.trend).toFixed(1)}%</span>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-2000 ease-out"
              style={{
                width: `${normalizedPercentage1}%`,
                backgroundColor: candidate1.color
              }}
            />
          </div>
        </div>

        {/* Candidate 2 */}
        <div
          className={`glass p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
            hoveredCandidate === 2
              ? 'border-primary/50 shadow-premium-lg scale-105'
              : 'border-border/50'
          }`}
          onMouseEnter={() => setHoveredCandidate(2)}
          onMouseLeave={() => setHoveredCandidate(null)}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-bold text-lg mb-1">{candidate2.name}</div>
              <div className="text-sm text-muted-foreground">{candidate2.party}</div>
            </div>
            <div
              className="w-6 h-6 rounded-full shadow-md"
              style={{
                backgroundColor: candidate2.color,
                boxShadow: `0 0 16px ${candidate2.color}60`
              }}
            />
          </div>

          <div className="mb-2">
            <div className="text-4xl font-bold" style={{ color: candidate2.color }}>
              <AnimatedCounter value={candidate2.percentage} duration={2000} decimals={1} suffix="%" />
            </div>
          </div>

          {showTrend && candidate2.trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              candidate2.trend > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              <span>{candidate2.trend > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(candidate2.trend).toFixed(1)}%</span>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-2000 ease-out"
              style={{
                width: `${normalizedPercentage2}%`,
                backgroundColor: candidate2.color
              }}
            />
          </div>
        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-tl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-br-xl pointer-events-none" />
    </div>
  )
}
