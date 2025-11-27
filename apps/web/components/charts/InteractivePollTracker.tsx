'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Candidate {
  name: string
  party: 'D' | 'R' | 'I'
  percentage: number
  trend: 'up' | 'down' | 'stable'
  marginOfError: number
}

interface InteractivePollTrackerProps {
  candidates: Candidate[]
  pollDate: string
  sampleSize?: number
  className?: string
}

export function InteractivePollTracker({
  candidates,
  pollDate,
  sampleSize,
  className = ''
}: InteractivePollTrackerProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
  const [showMOE, setShowMOE] = useState(false)

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'D':
        return { bg: 'bg-democrat', border: 'border-democrat', text: 'text-democrat' }
      case 'R':
        return { bg: 'bg-republican', border: 'border-republican', text: 'text-republican' }
      default:
        return { bg: 'bg-tossup', border: 'border-tossup', text: 'text-tossup' }
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  const maxPercentage = Math.max(...candidates.map(c => c.percentage))

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Latest Poll</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {pollDate} {sampleSize && `• ${sampleSize.toLocaleString()} likely voters`}
          </p>
        </div>
        <button
          onClick={() => setShowMOE(!showMOE)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
            showMOE
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:border-primary'
          }`}
        >
          {showMOE ? 'Hide' : 'Show'} Margin of Error
        </button>
      </div>

      {/* Poll Bars */}
      <div className="space-y-4">
        {candidates.map((candidate, index) => {
          const colors = getPartyColor(candidate.party)
          const isSelected = selectedCandidate === index
          const isLeading = candidate.percentage === maxPercentage

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
              onMouseEnter={() => setSelectedCandidate(index)}
              onMouseLeave={() => setSelectedCandidate(null)}
            >
              {/* Candidate Info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                  <span className={`font-semibold ${isSelected ? colors.text : 'text-foreground'} transition-colors`}>
                    {candidate.name}
                  </span>
                  {isLeading && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      Leading
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${isSelected ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                    {getTrendIcon(candidate.trend)} {candidate.trend}
                  </span>
                  <span className={`text-2xl font-bold ${colors.text}`}>
                    {candidate.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="relative h-12 bg-muted rounded-xl overflow-hidden">
                {/* Main Progress Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${candidate.percentage}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: index * 0.1 }}
                  className={`h-full ${colors.bg} relative overflow-hidden`}
                  style={{
                    boxShadow: isSelected ? `0 0 20px ${colors.bg}` : 'none'
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-30">
                    <div
                      className="absolute inset-0 animate-shimmer"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                        backgroundSize: '200% 100%'
                      }}
                    />
                  </div>
                </motion.div>

                {/* Margin of Error Indicator */}
                <AnimatePresence>
                  {showMOE && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                      className={`absolute top-0 h-full ${colors.bg}`}
                      style={{
                        left: `${Math.max(0, candidate.percentage - candidate.marginOfError)}%`,
                        width: `${candidate.marginOfError * 2}%`,
                        borderLeft: `2px dashed currentColor`,
                        borderRight: `2px dashed currentColor`
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Percentage Label Inside Bar */}
                {candidate.percentage > 15 && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold text-sm">
                    {candidate.percentage.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Hover Details */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 px-4 py-2 bg-accent/50 rounded-lg text-xs text-muted-foreground">
                      Margin of Error: ±{candidate.marginOfError.toFixed(1)}% •
                      Range: {(candidate.percentage - candidate.marginOfError).toFixed(1)}% - {(candidate.percentage + candidate.marginOfError).toFixed(1)}%
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Stats Footer */}
      <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Spread: {(maxPercentage - Math.min(...candidates.map(c => c.percentage))).toFixed(1)}%
        </span>
        <span>
          {candidates.filter(c => c.trend === 'up').length} trending up
        </span>
      </div>
    </div>
  )
}
