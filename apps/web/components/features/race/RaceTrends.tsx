'use client'

import { TrendChart } from '@/components/charts/TrendChart'

interface TrendData {
  date: string
  [candidate: string]: number | string
}

interface RaceTrendsProps {
  trends: TrendData[]
  candidates: Array<{
    name: string
    party: string
  }>
}

export function RaceTrends({ trends, candidates }: RaceTrendsProps) {
  if (!trends || trends.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No trend data available yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          We need multiple polls over time to show trends.
        </p>
      </div>
    )
  }

  const getPartyColor = (party: string) => {
    if (party === 'D') return '#3b82f6'
    if (party === 'R') return '#ef4444'
    return '#9ca3af'
  }

  const lines = candidates.map((candidate) => ({
    dataKey: candidate.name,
    color: getPartyColor(candidate.party),
    name: `${candidate.name} (${candidate.party})`,
  }))

  // Calculate current standings
  const latestData = trends[trends.length - 1]
  const sortedCandidates = candidates
    .map((c) => ({
      ...c,
      value: (latestData[c.name] as number) || 0,
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Polling Trends</h3>
        <div className="text-sm text-muted-foreground">
          {trends.length} polls over {Math.ceil((new Date(trends[trends.length - 1].date).getTime() - new Date(trends[0].date).getTime()) / (1000 * 60 * 60 * 24))} days
        </div>
      </div>

      {/* Current Standings */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="text-sm font-medium text-muted-foreground mb-3">Current Poll Average</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedCandidates.map((candidate, index) => (
            <div
              key={candidate.name}
              className={`p-3 rounded ${index === 0 ? 'bg-primary/10 border border-primary' : 'bg-card'}`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-medium ${index === 0 ? 'text-primary' : ''}`}>
                  {candidate.name}
                </span>
                {index === 0 && <span className="text-lg">🥇</span>}
              </div>
              <div className={`text-2xl font-bold mt-1 ${index === 0 ? 'text-primary' : ''}`}>
                {candidate.value.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">{candidate.party === 'D' ? 'Democrat' : candidate.party === 'R' ? 'Republican' : 'Other'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="h-96">
        <TrendChart
          data={trends}
          lines={lines}
          xAxisKey="date"
          yAxisDomain={[0, 100]}
        />
      </div>

      {/* Key Insights */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded">
        <h4 className="font-semibold mb-2">📊 Key Insights</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>
            • <strong>{sortedCandidates[0].name}</strong> leads with{' '}
            <strong>{sortedCandidates[0].value.toFixed(1)}%</strong> of the vote
          </li>
          {sortedCandidates[1] && (
            <li>
              • Margin over {sortedCandidates[1].name}:{' '}
              <strong>+{(sortedCandidates[0].value - sortedCandidates[1].value).toFixed(1)}%</strong>
            </li>
          )}
          <li>
            • Trend based on poll-weighted moving average
          </li>
        </ul>
      </div>
    </div>
  )
}
