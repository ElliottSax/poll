'use client'

import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { TrendingUp, Activity, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ForecastData {
  candidate_id: string
  win_probability: number
  mean_vote_share: number
  median_vote_share: number
  percentile_5: number
  percentile_95: number
  std_dev: number
}

interface Forecast {
  race_slug: string
  forecast_date: string
  simulations: number
  results: ForecastData[]
  methodology: {
    type: string
    polling_error_std: number
    adjustments: string[]
  }
}

interface Candidate {
  id: string
  name: string
  party: string
}

interface ForecastVisualizationProps {
  raceSlug: string
}

async function fetchForecast(raceSlug: string): Promise<Forecast | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const res = await fetch(`${apiUrl}/api/forecasts/race/${raceSlug}/latest`)

  if (!res.ok) {
    return null
  }

  return await res.json()
}

async function fetchCandidates(candidateIds: string[]): Promise<Candidate[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  // Fetch candidates in parallel
  const responses = await Promise.all(
    candidateIds.map(id => fetch(`${apiUrl}/api/candidates/${id}`))
  )

  const candidates = await Promise.all(
    responses.map(async (res) => {
      if (!res.ok) return null
      return await res.json()
    })
  )

  return candidates.filter(Boolean) as Candidate[]
}

function getPartyColor(party: string): string {
  if (party === 'D') return '#2563eb' // Blue
  if (party === 'R') return '#dc2626' // Red
  if (party === 'I') return '#9333ea' // Purple
  return '#6b7280' // Gray
}

function getPartyLightColor(party: string): string {
  if (party === 'D') return '#93c5fd'
  if (party === 'R') return '#fca5a5'
  if (party === 'I') return '#d8b4fe'
  return '#d1d5db'
}

export function ForecastVisualization({ raceSlug }: ForecastVisualizationProps) {
  const { data: forecast, isLoading: forecastLoading } = useQuery({
    queryKey: ['forecast', raceSlug],
    queryFn: () => fetchForecast(raceSlug),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  const candidateIds = forecast?.results.map(r => r.candidate_id) || []

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates', candidateIds],
    queryFn: () => fetchCandidates(candidateIds),
    enabled: candidateIds.length > 0,
  })

  if (forecastLoading || candidatesLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!forecast || !candidates) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No forecast data available</p>
        <p className="text-sm text-muted-foreground mt-2">
          Forecasts are updated every 4 hours
        </p>
      </div>
    )
  }

  // Create candidate lookup
  const candidateMap = new Map(candidates.map(c => [c.id, c]))

  // Prepare data for win probability chart
  const winProbData = forecast.results
    .map(result => {
      const candidate = candidateMap.get(result.candidate_id)
      return {
        name: candidate?.name || 'Unknown',
        party: candidate?.party || 'I',
        probability: result.win_probability,
        id: result.candidate_id,
      }
    })
    .sort((a, b) => b.probability - a.probability)

  // Prepare data for vote share distribution
  const voteShareData = forecast.results.map(result => {
    const candidate = candidateMap.get(result.candidate_id)
    return {
      name: candidate?.name || 'Unknown',
      party: candidate?.party || 'I',
      mean: result.mean_vote_share,
      median: result.median_vote_share,
      low: result.percentile_5,
      high: result.percentile_95,
      id: result.candidate_id,
    }
  })

  // Prepare confidence interval data for area chart
  const confidenceData = voteShareData.map(data => ({
    name: data.name,
    party: data.party,
    lower: data.low,
    upper: data.high,
    mean: data.mean,
  }))

  return (
    <div className="space-y-8">
      {/* Forecast Metadata */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Forecast Details</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            Updated: {new Date(forecast.forecast_date).toLocaleString()}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Simulations</div>
            <div className="font-semibold">{forecast.simulations.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Model Type</div>
            <div className="font-semibold capitalize">{forecast.methodology.type}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Polling Error</div>
            <div className="font-semibold">±{forecast.methodology.polling_error_std}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Adjustments</div>
            <div className="font-semibold">{forecast.methodology.adjustments.length}</div>
          </div>
        </div>
      </div>

      {/* Win Probability Bars */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Win Probability
        </h3>
        <div className="space-y-4">
          {winProbData.map((data) => (
            <div key={data.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getPartyColor(data.party) }}
                  />
                  <span className="font-medium">{data.name}</span>
                  <span className="text-sm text-muted-foreground">({data.party})</span>
                </div>
                <span className="font-bold text-lg">{data.probability.toFixed(1)}%</span>
              </div>
              <div className="h-8 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full flex items-center justify-end px-4 text-white font-semibold text-sm transition-all duration-500"
                  style={{
                    width: `${data.probability}%`,
                    backgroundColor: getPartyColor(data.party),
                  }}
                >
                  {data.probability > 15 && `${data.probability.toFixed(1)}%`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vote Share Distribution */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-6">Vote Share Distribution (90% Confidence)</h3>
        <div className="space-y-6">
          {voteShareData.map((data) => {
            const range = data.high - data.low
            const party = data.party

            return (
              <div key={data.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getPartyColor(party) }}
                    />
                    <span className="font-medium">{data.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">{data.mean.toFixed(1)}%</span>
                    <span className="text-muted-foreground ml-2">
                      ({data.low.toFixed(1)}% - {data.high.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Visual range indicator */}
                <div className="relative h-6 bg-muted rounded-full">
                  {/* Confidence interval */}
                  <div
                    className="absolute h-full rounded-full opacity-30"
                    style={{
                      left: `${data.low}%`,
                      width: `${range}%`,
                      backgroundColor: getPartyColor(party),
                    }}
                  />
                  {/* Mean marker */}
                  <div
                    className="absolute h-full w-1 rounded-full"
                    style={{
                      left: `${data.mean}%`,
                      backgroundColor: getPartyColor(party),
                    }}
                  />
                  {/* 50% reference line */}
                  <div className="absolute h-full w-0.5 bg-gray-400 opacity-50" style={{ left: '50%' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Statistics Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Detailed Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Candidate</th>
                <th className="text-right py-3 px-4">Win %</th>
                <th className="text-right py-3 px-4">Mean Vote</th>
                <th className="text-right py-3 px-4">Median Vote</th>
                <th className="text-right py-3 px-4">5th %ile</th>
                <th className="text-right py-3 px-4">95th %ile</th>
                <th className="text-right py-3 px-4">Std Dev</th>
              </tr>
            </thead>
            <tbody>
              {forecast.results.map((result) => {
                const candidate = candidateMap.get(result.candidate_id)
                return (
                  <tr key={result.candidate_id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: getPartyColor(candidate?.party || 'I') }}
                        />
                        <span className="font-medium">{candidate?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      {result.win_probability.toFixed(2)}%
                    </td>
                    <td className="text-right py-3 px-4">{result.mean_vote_share.toFixed(2)}%</td>
                    <td className="text-right py-3 px-4">{result.median_vote_share.toFixed(2)}%</td>
                    <td className="text-right py-3 px-4">{result.percentile_5.toFixed(2)}%</td>
                    <td className="text-right py-3 px-4">{result.percentile_95.toFixed(2)}%</td>
                    <td className="text-right py-3 px-4">{result.std_dev.toFixed(2)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
