'use client'

import { ProbabilityBar } from '../charts/ProbabilityBar'
import { SeatDistribution } from '../charts/SeatDistribution'

interface SenateForecastProps {
  forecast?: {
    demControl: number
    repControl: number
    expectedDemSeats: number
    expectedRepSeats: number
    lastUpdated: string
  }
  raceForecasts?: Array<{
    state: string
    incumbent: string
    rating: string
    demProb: number
    repProb: number
  }>
}

export function SenateForecast({
  forecast = getMockForecast(),
  raceForecasts = getMockRaceForecasts(),
}: SenateForecastProps) {
  return (
    <div className="space-y-6">
      {/* Control Probability */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Senate Control</h3>
          <span className="text-sm text-muted-foreground">
            Updated {new Date(forecast.lastUpdated).toLocaleDateString()}
          </span>
        </div>

        <div className="space-y-4">
          <ProbabilityBar
            data={[
              {
                label: 'Democratic Control',
                value: forecast.demControl,
                color: '#3b82f6',
              },
              {
                label: 'Republican Control',
                value: forecast.repControl,
                color: '#ef4444',
              },
            ]}
          />

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 bg-democrat/10 rounded-lg">
              <div className="text-4xl font-bold text-democrat">
                {forecast.demControl.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Democratic Control</div>
              <div className="text-2xl font-semibold mt-2">{forecast.expectedDemSeats}</div>
              <div className="text-xs text-muted-foreground">Expected Seats (out of 100)</div>
            </div>

            <div className="text-center p-4 bg-republican/10 rounded-lg">
              <div className="text-4xl font-bold text-republican">
                {forecast.repControl.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Republican Control</div>
              <div className="text-2xl font-semibold mt-2">{forecast.expectedRepSeats}</div>
              <div className="text-xs text-muted-foreground">Expected Seats (out of 100)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Distribution */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Expected Seat Distribution</h3>
        <div className="h-80">
          <SeatDistribution
            data={[
              { name: 'Democrat', value: forecast.expectedDemSeats, color: '#3b82f6' },
              { name: 'Republican', value: forecast.expectedRepSeats, color: '#ef4444' },
            ]}
          />
        </div>
        <div className="text-center mt-4 text-sm text-muted-foreground">
          51 seats needed for control (with VP tiebreaker)
        </div>
      </div>

      {/* Individual Races */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Key Senate Races</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground pb-2 border-b">
            <div className="col-span-2">State</div>
            <div className="col-span-2">Incumbent</div>
            <div className="col-span-3">Rating</div>
            <div className="col-span-5">Win Probability</div>
          </div>
          {raceForecasts.map((race) => (
            <RaceRow key={race.state} race={race} />
          ))}
        </div>
      </div>

      {/* Scenario Distribution */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Scenario Distribution</h3>
        <div className="space-y-3">
          <ScenarioRow
            scenario="Democratic Majority"
            demSeats={51}
            repSeats={49}
            probability={42}
          />
          <ScenarioRow scenario="Tie (50-50)" demSeats={50} repSeats={50} probability={15} />
          <ScenarioRow
            scenario="Republican Majority"
            demSeats={49}
            repSeats={51}
            probability={43}
          />
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded">
          <p className="text-sm">
            <strong>Note:</strong> In case of a 50-50 tie, the Vice President casts the
            tie-breaking vote, giving control to their party.
          </p>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Key Insights</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              Democrats currently hold a narrow majority with 51 seats (including independents who
              caucus with Democrats)
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              <strong>34 seats</strong> are up for election in 2024, with Democrats defending{' '}
              <strong>23</strong> seats vs. Republicans defending <strong>11</strong>
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              The most competitive races are in <strong>Montana, Ohio, Pennsylvania</strong>, and{' '}
              <strong>Arizona</strong>, which will likely determine control
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              Democrats are defending seats in several states that Trump won in 2020, making this a
              challenging map
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              Senate races often track closely with presidential results in the same state, with a
              correlation of about 0.85
            </p>
          </li>
        </ul>
      </div>
    </div>
  )
}

function RaceRow({ race }: { race: any }) {
  const getPartyColor = (incumbent: string) => {
    if (incumbent.includes('(D)')) return 'text-democrat'
    if (incumbent.includes('(R)')) return 'text-republican'
    return ''
  }

  const getRatingColor = (rating: string) => {
    if (rating.includes('Solid D') || rating.includes('Safe D')) return 'bg-democrat/20 text-democrat'
    if (rating.includes('Likely D')) return 'bg-democrat/10 text-democrat'
    if (rating.includes('Lean D')) return 'bg-democrat/5 text-democrat'
    if (rating.includes('Toss')) return 'bg-gray-200 text-gray-700'
    if (rating.includes('Lean R')) return 'bg-republican/5 text-republican'
    if (rating.includes('Likely R')) return 'bg-republican/10 text-republican'
    if (rating.includes('Solid R') || rating.includes('Safe R')) return 'bg-republican/20 text-republican'
    return ''
  }

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 border-b hover:bg-muted transition-colors">
      <div className="col-span-2 font-semibold">{race.state}</div>
      <div className={`col-span-2 text-sm ${getPartyColor(race.incumbent)}`}>
        {race.incumbent}
      </div>
      <div className="col-span-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(race.rating)}`}>
          {race.rating}
        </span>
      </div>
      <div className="col-span-5">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-democrat h-2 float-left"
              style={{ width: `${race.demProb}%` }}
            />
            <div
              className="bg-republican h-2 float-left"
              style={{ width: `${race.repProb}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground w-20 text-right">
            D {race.demProb.toFixed(0)}% - R {race.repProb.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  )
}

function ScenarioRow({
  scenario,
  demSeats,
  repSeats,
  probability,
}: {
  scenario: string
  demSeats: number
  repSeats: number
  probability: number
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded hover:bg-muted transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-40">
          <div className="font-medium">{scenario}</div>
          <div className="text-xs text-muted-foreground">{probability}% chance</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-center px-3 py-1 rounded bg-democrat/20 text-democrat font-semibold">
            {demSeats}
          </div>
          <div className="text-xs text-muted-foreground">-</div>
          <div className="text-center px-3 py-1 rounded bg-republican/20 text-republican font-semibold">
            {repSeats}
          </div>
        </div>
      </div>
      <div className="w-24 bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary rounded-full h-2 transition-all"
          style={{ width: `${probability}%` }}
        />
      </div>
    </div>
  )
}

function getMockForecast() {
  return {
    demControl: 48.3,
    repControl: 51.7,
    expectedDemSeats: 49,
    expectedRepSeats: 51,
    lastUpdated: new Date().toISOString(),
  }
}

function getMockRaceForecasts() {
  return [
    { state: 'Montana', incumbent: 'Tester (D)', rating: 'Toss-up', demProb: 48.5, repProb: 51.5 },
    { state: 'Ohio', incumbent: 'Brown (D)', rating: 'Toss-up', demProb: 52.3, repProb: 47.7 },
    { state: 'Pennsylvania', incumbent: 'Casey (D)', rating: 'Lean D', demProb: 62.1, repProb: 37.9 },
    { state: 'Arizona', incumbent: 'Sinema (I)', rating: 'Toss-up', demProb: 49.7, repProb: 50.3 },
    { state: 'Nevada', incumbent: 'Rosen (D)', rating: 'Lean D', demProb: 58.4, repProb: 41.6 },
    { state: 'Michigan', incumbent: 'Stabenow (D) Ret.', rating: 'Lean D', demProb: 61.2, repProb: 38.8 },
    { state: 'Wisconsin', incumbent: 'Baldwin (D)', rating: 'Lean D', demProb: 59.8, repProb: 40.2 },
    { state: 'Texas', incumbent: 'Cruz (R)', rating: 'Lean R', demProb: 38.5, repProb: 61.5 },
    { state: 'Florida', incumbent: 'Scott (R)', rating: 'Likely R', demProb: 28.3, repProb: 71.7 },
    { state: 'West Virginia', incumbent: 'Manchin (D) Ret.', rating: 'Solid R', demProb: 12.4, repProb: 87.6 },
  ]
}
