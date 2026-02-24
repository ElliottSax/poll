'use client'

import { ProbabilityBar } from '@/components/charts/ProbabilityBar'

interface Forecast {
  candidates: Array<{
    name: string
    party: string
    winProbability: number
    expectedVoteShare: number
  }>
  lastUpdated: string
  simulations: number
}

interface RaceForecastProps {
  forecast: Forecast | null
}

export function RaceForecast({ forecast }: RaceForecastProps) {
  if (!forecast) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Forecast not available for this race.</p>
        <p className="text-sm text-muted-foreground mt-2">
          We need at least 3 polls to generate a forecast.
        </p>
      </div>
    )
  }

  const sortedCandidates = [...forecast.candidates].sort((a, b) => b.winProbability - a.winProbability)
  const leader = sortedCandidates[0]

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Forecast</h3>
        <span className="text-sm text-muted-foreground">
          Updated {new Date(forecast.lastUpdated).toLocaleDateString()}
        </span>
      </div>

      {/* Win Probability */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Win Probability</h4>
        <ProbabilityBar
          data={sortedCandidates.map((c) => ({
            name: `${c.name} (${c.party})`,
            probability: c.winProbability,
            color: c.party === 'D' ? '#3b82f6' : c.party === 'R' ? '#ef4444' : '#9ca3af',
          }))}
        />
      </div>

      {/* Candidate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {sortedCandidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.name}
            candidate={candidate}
            isLeader={index === 0}
          />
        ))}
      </div>

      {/* Forecast Details */}
      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Model</div>
            <div className="font-medium">Monte Carlo</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Simulations</div>
            <div className="font-medium">{forecast.simulations.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Leader</div>
            <div className="font-medium">{leader.name}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Lead</div>
            <div className="font-medium">
              +{(leader.winProbability - sortedCandidates[1]?.winProbability || 0).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Forecasts are probabilistic and based on current polling data. A
          candidate with a {leader.winProbability.toFixed(0)}% chance of winning should win about{' '}
          {leader.winProbability.toFixed(0)}% of the time in similar scenarios, but can still lose.
        </p>
      </div>
    </div>
  )
}

function CandidateCard({
  candidate,
  isLeader,
}: {
  candidate: any
  isLeader: boolean
}) {
  const getPartyColor = (party: string) => {
    if (party === 'D') return 'text-democrat'
    if (party === 'R') return 'text-republican'
    return 'text-gray-600'
  }

  return (
    <div
      className={`p-4 rounded-lg ${
        isLeader
          ? 'bg-primary/10 border-2 border-primary'
          : 'bg-muted border border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className={`font-semibold ${getPartyColor(candidate.party)}`}>
            {candidate.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {candidate.party === 'D' ? 'Democrat' : candidate.party === 'R' ? 'Republican' : 'Other'}
          </div>
        </div>
        {isLeader && (
          <span className="text-2xl" title="Leader">
            👑
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Win Probability</div>
          <div className={`text-3xl font-bold ${isLeader ? 'text-primary' : ''}`}>
            {candidate.winProbability.toFixed(1)}%
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Expected Vote Share</div>
          <div className="text-lg font-semibold">{candidate.expectedVoteShare.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  )
}
