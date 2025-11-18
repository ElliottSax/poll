'use client'

import * as React from 'react'
import { useState } from 'react'

interface StateData {
  id: string
  name: string
  abbr: string
  electoral_votes: number
  dem_prob: number
  rep_prob: number
  rating: string // Solid D, Lean D, Toss-up, Lean R, Solid R
}

interface ElectoralMapProps {
  states?: StateData[]
  demElectoralVotes: number
  repElectoralVotes: number
}

export function ElectoralMap({
  states = getMockStates(),
  demElectoralVotes = 272,
  repElectoralVotes = 266,
}: ElectoralMapProps) {
  const [hoveredState, setHoveredState] = useState<StateData | null>(null)
  const [selectedState, setSelectedState] = useState<StateData | null>(null)

  const getStateColor = (state: StateData) => {
    if (state.rating === 'Solid D') return '#1e3a8a' // Deep blue
    if (state.rating === 'Likely D') return '#3b82f6' // Blue
    if (state.rating === 'Lean D') return '#93c5fd' // Light blue
    if (state.rating === 'Toss-up') return '#9ca3af' // Gray
    if (state.rating === 'Lean R') return '#fca5a5' // Light red
    if (state.rating === 'Likely R') return '#ef4444' // Red
    if (state.rating === 'Solid R') return '#991b1b' // Deep red
    return '#9ca3af'
  }

  return (
    <div className="space-y-4">
      {/* Electoral Vote Counter */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <div className="text-5xl font-bold text-democrat">{demElectoralVotes}</div>
            <div className="text-sm text-muted-foreground mt-1">Democrat</div>
          </div>

          <div className="text-center px-6">
            <div className="text-2xl font-semibold text-muted-foreground">270 to win</div>
          </div>

          <div className="text-center flex-1">
            <div className="text-5xl font-bold text-republican">{repElectoralVotes}</div>
            <div className="text-sm text-muted-foreground mt-1">Republican</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
          <div
            className="bg-democrat transition-all"
            style={{ width: `${(demElectoralVotes / 538) * 100}%` }}
          />
          <div
            className="bg-republican transition-all"
            style={{ width: `${(repElectoralVotes / 538) * 100}%` }}
          />
        </div>

        <div className="flex justify-center mt-2">
          <div className="text-xs text-muted-foreground">
            {538 - demElectoralVotes - repElectoralVotes} toss-up votes
          </div>
        </div>
      </div>

      {/* Simplified US Map Grid */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Electoral College Map</h3>

        <div className="grid grid-cols-10 gap-1 mb-4">
          {states.map((state) => (
            <div
              key={state.id}
              className="aspect-square rounded cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              style={{ backgroundColor: getStateColor(state) }}
              onMouseEnter={() => setHoveredState(state)}
              onMouseLeave={() => setHoveredState(null)}
              onClick={() => setSelectedState(state)}
              title={`${state.name}: ${state.electoral_votes} EV`}
            >
              <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-semibold">
                {state.abbr}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#1e3a8a' }} />
            <span>Solid D</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }} />
            <span>Likely D</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#93c5fd' }} />
            <span>Lean D</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-400" />
            <span>Toss-up</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fca5a5' }} />
            <span>Lean R</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
            <span>Likely R</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#991b1b' }} />
            <span>Solid R</span>
          </div>
        </div>
      </div>

      {/* State Details on Hover/Click */}
      {(hoveredState || selectedState) && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-lg">
                {(hoveredState || selectedState)!.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {(hoveredState || selectedState)!.electoral_votes} Electoral Votes
              </p>
            </div>
            <div
              className="px-3 py-1 rounded text-sm font-medium text-white"
              style={{
                backgroundColor: getStateColor((hoveredState || selectedState)!),
              }}
            >
              {(hoveredState || selectedState)!.rating}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-democrat">
                {(hoveredState || selectedState)!.dem_prob.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Democrat Win Probability</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-republican">
                {(hoveredState || selectedState)!.rep_prob.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Republican Win Probability</div>
            </div>
          </div>
        </div>
      )}

      {/* Swing States Highlight */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-semibold mb-3">Key Swing States</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {states
            .filter((s) => s.rating === 'Toss-up' || s.rating.includes('Lean'))
            .map((state) => (
              <div
                key={state.id}
                className="p-3 border rounded cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setSelectedState(state)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{state.abbr}</span>
                  <span className="text-xs text-muted-foreground">{state.electoral_votes} EV</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{state.rating}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// Mock data for demonstration
function getMockStates(): StateData[] {
  return [
    // Solid Democrat
    { id: 'CA', name: 'California', abbr: 'CA', electoral_votes: 54, dem_prob: 95.5, rep_prob: 4.5, rating: 'Solid D' },
    { id: 'NY', name: 'New York', abbr: 'NY', electoral_votes: 28, dem_prob: 92.3, rep_prob: 7.7, rating: 'Solid D' },
    { id: 'IL', name: 'Illinois', abbr: 'IL', electoral_votes: 19, dem_prob: 89.2, rep_prob: 10.8, rating: 'Solid D' },
    { id: 'WA', name: 'Washington', abbr: 'WA', electoral_votes: 12, dem_prob: 88.5, rep_prob: 11.5, rating: 'Solid D' },
    { id: 'MA', name: 'Massachusetts', abbr: 'MA', electoral_votes: 11, dem_prob: 94.1, rep_prob: 5.9, rating: 'Solid D' },
    { id: 'MD', name: 'Maryland', abbr: 'MD', electoral_votes: 10, dem_prob: 91.3, rep_prob: 8.7, rating: 'Solid D' },
    { id: 'OR', name: 'Oregon', abbr: 'OR', electoral_votes: 8, dem_prob: 86.7, rep_prob: 13.3, rating: 'Solid D' },
    { id: 'CT', name: 'Connecticut', abbr: 'CT', electoral_votes: 7, dem_prob: 87.9, rep_prob: 12.1, rating: 'Solid D' },
    { id: 'NJ', name: 'New Jersey', abbr: 'NJ', electoral_votes: 14, dem_prob: 85.6, rep_prob: 14.4, rating: 'Solid D' },
    { id: 'CO', name: 'Colorado', abbr: 'CO', electoral_votes: 10, dem_prob: 82.4, rep_prob: 17.6, rating: 'Likely D' },

    // Lean Democrat
    { id: 'VA', name: 'Virginia', abbr: 'VA', electoral_votes: 13, dem_prob: 68.2, rep_prob: 31.8, rating: 'Lean D' },
    { id: 'NH', name: 'New Hampshire', abbr: 'NH', electoral_votes: 4, dem_prob: 65.7, rep_prob: 34.3, rating: 'Lean D' },
    { id: 'MN', name: 'Minnesota', abbr: 'MN', electoral_votes: 10, dem_prob: 71.5, rep_prob: 28.5, rating: 'Lean D' },
    { id: 'NM', name: 'New Mexico', abbr: 'NM', electoral_votes: 5, dem_prob: 69.8, rep_prob: 30.2, rating: 'Lean D' },

    // Toss-up
    { id: 'PA', name: 'Pennsylvania', abbr: 'PA', electoral_votes: 19, dem_prob: 52.3, rep_prob: 47.7, rating: 'Toss-up' },
    { id: 'MI', name: 'Michigan', abbr: 'MI', electoral_votes: 15, dem_prob: 54.1, rep_prob: 45.9, rating: 'Toss-up' },
    { id: 'WI', name: 'Wisconsin', abbr: 'WI', electoral_votes: 10, dem_prob: 51.8, rep_prob: 48.2, rating: 'Toss-up' },
    { id: 'AZ', name: 'Arizona', abbr: 'AZ', electoral_votes: 11, dem_prob: 48.6, rep_prob: 51.4, rating: 'Toss-up' },
    { id: 'GA', name: 'Georgia', abbr: 'GA', electoral_votes: 16, dem_prob: 49.2, rep_prob: 50.8, rating: 'Toss-up' },
    { id: 'NV', name: 'Nevada', abbr: 'NV', electoral_votes: 6, dem_prob: 50.4, rep_prob: 49.6, rating: 'Toss-up' },
    { id: 'NC', name: 'North Carolina', abbr: 'NC', electoral_votes: 16, dem_prob: 47.1, rep_prob: 52.9, rating: 'Toss-up' },

    // Lean Republican
    { id: 'FL', name: 'Florida', abbr: 'FL', electoral_votes: 30, dem_prob: 35.2, rep_prob: 64.8, rating: 'Lean R' },
    { id: 'TX', name: 'Texas', abbr: 'TX', electoral_votes: 40, dem_prob: 38.7, rep_prob: 61.3, rating: 'Lean R' },
    { id: 'OH', name: 'Ohio', abbr: 'OH', electoral_votes: 17, dem_prob: 42.5, rep_prob: 57.5, rating: 'Lean R' },
    { id: 'IA', name: 'Iowa', abbr: 'IA', electoral_votes: 6, dem_prob: 39.8, rep_prob: 60.2, rating: 'Lean R' },

    // Solid Republican
    { id: 'TN', name: 'Tennessee', abbr: 'TN', electoral_votes: 11, dem_prob: 15.3, rep_prob: 84.7, rating: 'Solid R' },
    { id: 'IN', name: 'Indiana', abbr: 'IN', electoral_votes: 11, dem_prob: 18.2, rep_prob: 81.8, rating: 'Solid R' },
    { id: 'MO', name: 'Missouri', abbr: 'MO', electoral_votes: 10, dem_prob: 22.1, rep_prob: 77.9, rating: 'Solid R' },
    { id: 'SC', name: 'South Carolina', abbr: 'SC', electoral_votes: 9, dem_prob: 25.6, rep_prob: 74.4, rating: 'Solid R' },
    { id: 'AL', name: 'Alabama', abbr: 'AL', electoral_votes: 9, dem_prob: 8.7, rep_prob: 91.3, rating: 'Solid R' },
    { id: 'KY', name: 'Kentucky', abbr: 'KY', electoral_votes: 8, dem_prob: 12.4, rep_prob: 87.6, rating: 'Solid R' },
    { id: 'LA', name: 'Louisiana', abbr: 'LA', electoral_votes: 8, dem_prob: 14.9, rep_prob: 85.1, rating: 'Solid R' },
    { id: 'OK', name: 'Oklahoma', abbr: 'OK', electoral_votes: 7, dem_prob: 6.2, rep_prob: 93.8, rating: 'Solid R' },
    { id: 'AR', name: 'Arkansas', abbr: 'AR', electoral_votes: 6, dem_prob: 11.3, rep_prob: 88.7, rating: 'Solid R' },
    { id: 'UT', name: 'Utah', abbr: 'UT', electoral_votes: 6, dem_prob: 19.7, rep_prob: 80.3, rating: 'Solid R' },
    { id: 'KS', name: 'Kansas', abbr: 'KS', electoral_votes: 6, dem_prob: 23.5, rep_prob: 76.5, rating: 'Solid R' },
    { id: 'MS', name: 'Mississippi', abbr: 'MS', electoral_votes: 6, dem_prob: 9.8, rep_prob: 90.2, rating: 'Solid R' },
    { id: 'NE', name: 'Nebraska', abbr: 'NE', electoral_votes: 5, dem_prob: 21.4, rep_prob: 78.6, rating: 'Solid R' },
    { id: 'ID', name: 'Idaho', abbr: 'ID', electoral_votes: 4, dem_prob: 7.1, rep_prob: 92.9, rating: 'Solid R' },
    { id: 'WV', name: 'West Virginia', abbr: 'WV', electoral_votes: 4, dem_prob: 10.5, rep_prob: 89.5, rating: 'Solid R' },
    { id: 'MT', name: 'Montana', abbr: 'MT', electoral_votes: 4, dem_prob: 28.9, rep_prob: 71.1, rating: 'Lean R' },
    { id: 'SD', name: 'South Dakota', abbr: 'SD', electoral_votes: 3, dem_prob: 16.7, rep_prob: 83.3, rating: 'Solid R' },
    { id: 'ND', name: 'North Dakota', abbr: 'ND', electoral_votes: 3, dem_prob: 14.2, rep_prob: 85.8, rating: 'Solid R' },
    { id: 'AK', name: 'Alaska', abbr: 'AK', electoral_votes: 3, dem_prob: 24.6, rep_prob: 75.4, rating: 'Lean R' },
    { id: 'WY', name: 'Wyoming', abbr: 'WY', electoral_votes: 3, dem_prob: 5.3, rep_prob: 94.7, rating: 'Solid R' },

    // Remaining states
    { id: 'VT', name: 'Vermont', abbr: 'VT', electoral_votes: 3, dem_prob: 93.2, rep_prob: 6.8, rating: 'Solid D' },
    { id: 'DE', name: 'Delaware', abbr: 'DE', electoral_votes: 3, dem_prob: 88.4, rep_prob: 11.6, rating: 'Solid D' },
    { id: 'RI', name: 'Rhode Island', abbr: 'RI', electoral_votes: 4, dem_prob: 90.1, rep_prob: 9.9, rating: 'Solid D' },
    { id: 'HI', name: 'Hawaii', abbr: 'HI', electoral_votes: 4, dem_prob: 92.7, rep_prob: 7.3, rating: 'Solid D' },
    { id: 'ME', name: 'Maine', abbr: 'ME', electoral_votes: 4, dem_prob: 75.3, rep_prob: 24.7, rating: 'Likely D' },
  ]
}
