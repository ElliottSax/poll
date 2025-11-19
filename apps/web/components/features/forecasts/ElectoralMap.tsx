'use client'

import { useQuery } from '@tanstack/react-query'
import { MapPin, Trophy } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface StateResult {
  state: string
  stateCode: string
  electoralVotes: number
  leader: {
    name: string
    party: string
    winProbability: number
  }
  margin: number
  category: 'safe-d' | 'likely-d' | 'lean-d' | 'toss-up' | 'lean-r' | 'likely-r' | 'safe-r'
}

// Mock data - in production, this would come from the API
const mockStateResults: StateResult[] = [
  { state: 'Pennsylvania', stateCode: 'PA', electoralVotes: 19, leader: { name: 'Biden', party: 'D', winProbability: 52.3 }, margin: 2.1, category: 'toss-up' },
  { state: 'Michigan', stateCode: 'MI', electoralVotes: 15, leader: { name: 'Biden', party: 'D', winProbability: 54.7 }, margin: 3.4, category: 'lean-d' },
  { state: 'Wisconsin', stateCode: 'WI', electoralVotes: 10, leader: { name: 'Biden', party: 'D', winProbability: 51.8 }, margin: 1.9, category: 'toss-up' },
  { state: 'Arizona', stateCode: 'AZ', electoralVotes: 11, leader: { name: 'Trump', party: 'R', winProbability: 51.2 }, margin: 1.5, category: 'toss-up' },
  { state: 'Georgia', stateCode: 'GA', electoralVotes: 16, leader: { name: 'Trump', party: 'R', winProbability: 53.1 }, margin: 2.8, category: 'lean-r' },
  { state: 'Nevada', stateCode: 'NV', electoralVotes: 6, leader: { name: 'Biden', party: 'D', winProbability: 50.9 }, margin: 0.8, category: 'toss-up' },
  { state: 'North Carolina', stateCode: 'NC', electoralVotes: 16, leader: { name: 'Trump', party: 'R', winProbability: 55.4 }, margin: 4.1, category: 'lean-r' },
]

function getCategoryColor(category: string): string {
  const colors = {
    'safe-d': 'bg-blue-700 text-white',
    'likely-d': 'bg-blue-500 text-white',
    'lean-d': 'bg-blue-300 text-blue-900',
    'toss-up': 'bg-purple-200 text-purple-900',
    'lean-r': 'bg-red-300 text-red-900',
    'likely-r': 'bg-red-500 text-white',
    'safe-r': 'bg-red-700 text-white',
  }
  return colors[category as keyof typeof colors] || 'bg-gray-200'
}

function getCategoryLabel(category: string): string {
  const labels = {
    'safe-d': 'Safe D',
    'likely-d': 'Likely D',
    'lean-d': 'Lean D',
    'toss-up': 'Toss-up',
    'lean-r': 'Lean R',
    'likely-r': 'Likely R',
    'safe-r': 'Safe R',
  }
  return labels[category as keyof typeof labels] || 'Unknown'
}

export function ElectoralMap() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  // Fetch real electoral map data
  const { data, isLoading, error } = useQuery<{
    states: StateResult[]
    democraticTotal: number
    republicanTotal: number
    lastUpdated: string
  }>({
    queryKey: ['/api/electoral-map/battleground'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/api/electoral-map/battleground`)
      if (!res.ok) {
        throw new Error('Failed to fetch electoral map data')
      }
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  // Use mock data as fallback during loading or error
  const battlegroundStates = data?.states || mockStateResults
  const democraticTotal = data?.democraticTotal || 0
  const republicanTotal = data?.republicanTotal || 0
  const tossupStates = battlegroundStates.filter(s => s.category === 'toss-up')

  if (error) {
    console.error('Error fetching electoral map:', error)
  }

  return (
    <div className="space-y-6">
      {/* Electoral Vote Counter */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600">{democraticTotal}</div>
            <div className="text-sm text-muted-foreground mt-1">Democrat</div>
          </div>

          <div className="text-center">
            <div className="h-12 w-px bg-border" />
            <div className="text-xs text-muted-foreground mt-2">270 to win</div>
          </div>

          <div className="text-center">
            <div className="text-5xl font-bold text-red-600">{republicanTotal}</div>
            <div className="text-sm text-muted-foreground mt-1">Republican</div>
          </div>
        </div>

        {/* Visual bar */}
        <div className="h-12 rounded-full overflow-hidden flex">
          <div
            className="bg-blue-600 flex items-center justify-center text-white font-semibold"
            style={{ width: `${(democraticTotal / 538) * 100}%` }}
          >
            {democraticTotal >= 50 && democraticTotal}
          </div>
          <div
            className="bg-red-600 flex items-center justify-center text-white font-semibold"
            style={{ width: `${(republicanTotal / 538) * 100}%` }}
          >
            {republicanTotal >= 50 && republicanTotal}
          </div>
          {538 - democraticTotal - republicanTotal > 0 && (
            <div
              className="bg-gray-300 flex items-center justify-center text-gray-700 text-sm"
              style={{
                width: `${((538 - democraticTotal - republicanTotal) / 538) * 100}%`,
              }}
            >
              {538 - democraticTotal - republicanTotal}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <div className="text-sm text-muted-foreground">
            {democraticTotal} - {republicanTotal} - {538 - democraticTotal - republicanTotal} (D - R - Toss-up)
          </div>
        </div>
      </div>

      {/* Battleground States */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Battleground States
        </h3>
        <div className="space-y-3">
          {battlegroundStates
            .sort((a, b) => Math.abs(b.margin) - Math.abs(a.margin))
            .map(state => (
              <div
                key={state.stateCode}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center min-w-[60px]">
                    <div className="font-bold text-lg">{state.stateCode}</div>
                    <div className="text-xs text-muted-foreground">
                      {state.electoralVotes} EV
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{state.state}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                          state.category
                        )}`}
                      >
                        {getCategoryLabel(state.category)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            state.leader.party === 'D' ? 'bg-blue-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${state.leader.winProbability}%` }}
                        />
                      </div>
                      <div className="text-sm font-semibold min-w-[60px] text-right">
                        {state.leader.winProbability.toFixed(1)}%
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      {state.leader.name} +{state.margin.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Tipping Point States */}
      {tossupStates.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Tipping Point States
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            These toss-up states are most likely to determine the election outcome:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {tossupStates.map(state => (
              <div
                key={state.stateCode}
                className="p-4 rounded-lg bg-purple-50 border-2 border-purple-200"
              >
                <div className="font-bold text-lg mb-1">
                  {state.state} ({state.electoralVotes})
                </div>
                <div className="text-sm">
                  {state.leader.name}: {state.leader.winProbability.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Margin: {state.margin.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Note */}
      <div className="text-sm text-muted-foreground text-center">
        <p>
          Electoral college projections based on current polling averages and
          historical state trends. Interactive map visualization coming soon.
        </p>
      </div>
    </div>
  )
}
