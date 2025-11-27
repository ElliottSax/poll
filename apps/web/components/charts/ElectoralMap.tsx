'use client'

import { useState } from 'react'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

interface StateData {
  state: string
  abbr: string
  electoralVotes: number
  status: 'safe-d' | 'likely-d' | 'lean-d' | 'tossup' | 'lean-r' | 'likely-r' | 'safe-r'
  margin?: number
  candidate1: number
  candidate2: number
}

interface ElectoralMapProps {
  states: StateData[]
  candidate1Name: string
  candidate2Name: string
  candidate1Color: string
  candidate2Color: string
  showLegend?: boolean
}

const STATUS_COLORS = {
  'safe-d': '#1e40af',
  'likely-d': '#3b82f6',
  'lean-d': '#93c5fd',
  'tossup': '#a855f7',
  'lean-r': '#fca5a5',
  'likely-r': '#ef4444',
  'safe-r': '#991b1b'
}

const STATUS_LABELS = {
  'safe-d': 'Safe D',
  'likely-d': 'Likely D',
  'lean-d': 'Lean D',
  'tossup': 'Toss-up',
  'lean-r': 'Lean R',
  'likely-r': 'Likely R',
  'safe-r': 'Safe R'
}

export function ElectoralMap({
  states,
  candidate1Name,
  candidate2Name,
  candidate1Color,
  candidate2Color,
  showLegend = true
}: ElectoralMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  // Calculate electoral vote totals
  const candidate1EVs = states
    .filter(s => s.status.includes('-d'))
    .reduce((sum, s) => sum + s.electoralVotes, 0)

  const candidate2EVs = states
    .filter(s => s.status.includes('-r'))
    .reduce((sum, s) => sum + s.electoralVotes, 0)

  const tossupEVs = states
    .filter(s => s.status === 'tossup')
    .reduce((sum, s) => sum + s.electoralVotes, 0)

  const filteredStates = selectedStatus
    ? states.filter(s => s.status === selectedStatus)
    : states

  const hoveredStateData = hoveredState
    ? states.find(s => s.abbr === hoveredState)
    : null

  return (
    <div className="space-y-6">
      {/* Electoral vote totals */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass border-2 border-blue-500/30 rounded-xl p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-5 h-5 rounded-full shadow-md"
              style={{
                backgroundColor: candidate1Color,
                boxShadow: `0 0 16px ${candidate1Color}60`
              }}
            />
            <div className="font-semibold text-sm">{candidate1Name}</div>
          </div>
          <div className="text-5xl font-bold" style={{ color: candidate1Color }}>
            <AnimatedCounter value={candidate1EVs} duration={2000} />
          </div>
          <div className="text-xs text-muted-foreground mt-2">Electoral Votes</div>
          {candidate1EVs >= 270 && (
            <div className="mt-3 text-xs font-bold px-3 py-1 bg-green-500/20 text-green-500 rounded-full inline-block">
              ✓ 270 to Win
            </div>
          )}
        </div>

        <div className="glass border-2 border-purple-500/30 rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 rounded-full bg-purple-500 shadow-md" style={{ boxShadow: '0 0 16px rgba(168, 85, 247, 0.4)' }} />
            <div className="font-semibold text-sm">Toss-up</div>
          </div>
          <div className="text-5xl font-bold text-purple-500">
            <AnimatedCounter value={tossupEVs} duration={2000} />
          </div>
          <div className="text-xs text-muted-foreground mt-2">Electoral Votes</div>
          <div className="mt-3 text-xs text-muted-foreground">
            {states.filter(s => s.status === 'tossup').length} states
          </div>
        </div>

        <div className="glass border-2 border-red-500/30 rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-5 h-5 rounded-full shadow-md"
              style={{
                backgroundColor: candidate2Color,
                boxShadow: `0 0 16px ${candidate2Color}60`
              }}
            />
            <div className="font-semibold text-sm">{candidate2Name}</div>
          </div>
          <div className="text-5xl font-bold" style={{ color: candidate2Color }}>
            <AnimatedCounter value={candidate2EVs} duration={2000} />
          </div>
          <div className="text-xs text-muted-foreground mt-2">Electoral Votes</div>
          {candidate2EVs >= 270 && (
            <div className="mt-3 text-xs font-bold px-3 py-1 bg-green-500/20 text-green-500 rounded-full inline-block">
              ✓ 270 to Win
            </div>
          )}
        </div>
      </div>

      {/* Main map visualization */}
      <div className="relative glass border border-border/50 rounded-xl p-6 shadow-premium-lg">
        {/* Background gradient decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 rounded-xl pointer-events-none" />

        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground mb-1">State-by-State Breakdown</h3>
          <p className="text-sm text-muted-foreground">
            {hoveredStateData
              ? `${hoveredStateData.state} - ${hoveredStateData.electoralVotes} EV`
              : 'Hover over a state to see details'}
          </p>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === status
                    ? 'bg-primary text-primary-foreground shadow-premium'
                    : 'glass border border-border/50 hover-lift'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-sm shadow-md"
                  style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }}
                />
                {label}
                <span className="text-muted-foreground ml-1">
                  ({states.filter(s => s.status === status).reduce((sum, s) => sum + s.electoralVotes, 0)})
                </span>
              </button>
            ))}
          </div>
        )}

        {/* State grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredStates
            .sort((a, b) => b.electoralVotes - a.electoralVotes)
            .map((state, index) => (
              <div
                key={state.abbr}
                className={`glass border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 animate-scale-in ${
                  hoveredState === state.abbr
                    ? 'border-primary shadow-premium-lg scale-105 z-10'
                    : 'border-border/50'
                }`}
                style={{
                  borderColor: hoveredState === state.abbr ? STATUS_COLORS[state.status] : undefined,
                  animationDelay: `${index * 0.02}s`
                }}
                onMouseEnter={() => setHoveredState(state.abbr)}
                onMouseLeave={() => setHoveredState(null)}
              >
                {/* State header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-lg">{state.abbr}</div>
                    <div className="text-xs text-muted-foreground">{state.electoralVotes} EV</div>
                  </div>
                  <div
                    className="w-4 h-4 rounded-sm shadow-md"
                    style={{
                      backgroundColor: STATUS_COLORS[state.status],
                      boxShadow: `0 0 8px ${STATUS_COLORS[state.status]}60`
                    }}
                  />
                </div>

                {/* Polling data */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[80px]">
                      {candidate1Name.split(' ')[0]}
                    </span>
                    <span className="font-bold tabular-nums" style={{ color: candidate1Color }}>
                      {state.candidate1.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[80px]">
                      {candidate2Name.split(' ')[0]}
                    </span>
                    <span className="font-bold tabular-nums" style={{ color: candidate2Color }}>
                      {state.candidate2.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Margin indicator */}
                {state.margin !== undefined && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Margin</span>
                      <span
                        className="font-bold"
                        style={{
                          color: state.margin > 0 ? candidate1Color : candidate2Color
                        }}
                      >
                        {state.margin > 0 ? '+' : ''}
                        {state.margin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Visual bar */}
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(state.candidate1 / (state.candidate1 + state.candidate2)) * 100}%`,
                      backgroundColor: candidate1Color
                    }}
                  />
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(state.candidate2 / (state.candidate1 + state.candidate2)) * 100}%`,
                      backgroundColor: candidate2Color
                    }}
                  />
                </div>
              </div>
            ))}
        </div>

        {/* Selected state details */}
        {hoveredStateData && (
          <div className="mt-6 glass border-2 border-primary/50 rounded-xl p-6 animate-scale-in">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold mb-2">{hoveredStateData.state}</div>
                <div className="text-sm text-muted-foreground mb-4">
                  {hoveredStateData.electoralVotes} Electoral Votes • {STATUS_LABELS[hoveredStateData.status]}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{candidate1Name}</div>
                  <div className="text-2xl font-bold" style={{ color: candidate1Color }}>
                    {hoveredStateData.candidate1.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{candidate2Name}</div>
                  <div className="text-2xl font-bold" style={{ color: candidate2Color }}>
                    {hoveredStateData.candidate2.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {hoveredStateData.margin !== undefined && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Margin</span>
                  <span
                    className="text-xl font-bold"
                    style={{
                      color: hoveredStateData.margin > 0 ? candidate1Color : candidate2Color
                    }}
                  >
                    {hoveredStateData.margin > 0 ? '+' : ''}
                    {hoveredStateData.margin.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-tl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-br-xl pointer-events-none" />
      </div>
    </div>
  )
}
