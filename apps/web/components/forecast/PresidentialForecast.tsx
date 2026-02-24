'use client'

import { ProbabilityBar } from '../charts/ProbabilityBar'
import { TrendChart } from '../charts/TrendChart'

interface PresidentialForecastProps {
  forecast?: {
    democrat: {
      name: string
      winProbability: number
      expectedEV: number
    }
    republican: {
      name: string
      winProbability: number
      expectedEV: number
    }
    lastUpdated: string
  }
  historicalData?: Array<{
    date: string
    dem_prob: number
    rep_prob: number
  }>
}

export function PresidentialForecast({
  forecast = getMockForecast(),
  historicalData = getMockHistoricalData(),
}: PresidentialForecastProps) {
  return (
    <div className="space-y-6">
      {/* Win Probability */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Win Probability</h3>
          <span className="text-sm text-muted-foreground">
            Updated {new Date(forecast.lastUpdated).toLocaleDateString()}
          </span>
        </div>

        <div className="space-y-4">
          <ProbabilityBar
            data={[
              {
                name: forecast.democrat.name,
                probability: forecast.democrat.winProbability,
                color: '#3b82f6',
              },
              {
                name: forecast.republican.name,
                probability: forecast.republican.winProbability,
                color: '#ef4444',
              },
            ]}
          />

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 bg-democrat/10 rounded-lg">
              <div className="text-4xl font-bold text-democrat">
                {forecast.democrat.winProbability.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {forecast.democrat.name} wins
              </div>
              <div className="text-2xl font-semibold mt-2">
                {forecast.democrat.expectedEV}
              </div>
              <div className="text-xs text-muted-foreground">Expected Electoral Votes</div>
            </div>

            <div className="text-center p-4 bg-republican/10 rounded-lg">
              <div className="text-4xl font-bold text-republican">
                {forecast.republican.winProbability.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {forecast.republican.name} wins
              </div>
              <div className="text-2xl font-semibold mt-2">
                {forecast.republican.expectedEV}
              </div>
              <div className="text-xs text-muted-foreground">Expected Electoral Votes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Over Time */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Forecast Trend</h3>
        <div className="h-80">
          <TrendChart
            data={historicalData}
            lines={[
              { dataKey: 'dem_prob', color: '#3b82f6', name: forecast.democrat.name },
              { dataKey: 'rep_prob', color: '#ef4444', name: forecast.republican.name },
            ]}
          />
        </div>
      </div>

      {/* Scenario Analysis */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Scenario Analysis</h3>
        <div className="space-y-3">
          <ScenarioRow
            scenario="Best Case"
            demEV={334}
            repEV={204}
            probability={5}
            winner="democrat"
          />
          <ScenarioRow
            scenario="Most Likely"
            demEV={272}
            repEV={266}
            probability={45}
            winner="democrat"
          />
          <ScenarioRow
            scenario="Close Win"
            demEV={270}
            repEV={268}
            probability={25}
            winner="democrat"
          />
          <ScenarioRow
            scenario="Republican Win"
            demEV={253}
            repEV={285}
            probability={20}
            winner="republican"
          />
          <ScenarioRow
            scenario="Republican Landslide"
            demEV={195}
            repEV={343}
            probability={5}
            winner="republican"
          />
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Key Insights</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              <strong>{forecast.democrat.name}</strong> has a{' '}
              <strong className="text-democrat">
                {forecast.democrat.winProbability.toFixed(1)}%
              </strong>{' '}
              chance of winning, based on 10,000 Monte Carlo simulations
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              The forecast predicts {forecast.democrat.name} will win approximately{' '}
              <strong>{forecast.democrat.expectedEV}</strong> electoral votes
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              There are <strong>7 key swing states</strong> that will likely decide the election:
              Pennsylvania (19), Michigan (15), Wisconsin (10), Arizona (11), Georgia (16), Nevada
              (6), and North Carolina (16)
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              The model accounts for polling error, which has averaged around 4 points in recent
              presidential elections
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              Uncertainty increases as we get further from Election Day. Current forecast has a
              margin of error of ±15 electoral votes
            </p>
          </li>
        </ul>
      </div>
    </div>
  )
}

function ScenarioRow({
  scenario,
  demEV,
  repEV,
  probability,
  winner,
}: {
  scenario: string
  demEV: number
  repEV: number
  probability: number
  winner: 'democrat' | 'republican'
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded hover:bg-muted transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-32">
          <div className="font-medium">{scenario}</div>
          <div className="text-xs text-muted-foreground">{probability}% chance</div>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <div
            className={`text-center px-3 py-1 rounded ${
              winner === 'democrat' ? 'bg-democrat/20 text-democrat font-bold' : ''
            }`}
          >
            {demEV}
          </div>
          <div className="text-xs text-muted-foreground">vs</div>
          <div
            className={`text-center px-3 py-1 rounded ${
              winner === 'republican' ? 'bg-republican/20 text-republican font-bold' : ''
            }`}
          >
            {repEV}
          </div>
        </div>
      </div>
      <div className="w-20 bg-gray-200 rounded-full h-2">
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
    democrat: {
      name: 'Kamala Harris',
      winProbability: 55.7,
      expectedEV: 287,
    },
    republican: {
      name: 'Donald Trump',
      winProbability: 44.3,
      expectedEV: 251,
    },
    lastUpdated: new Date().toISOString(),
  }
}

function getMockHistoricalData() {
  const today = new Date()
  const data = []

  for (let i = 90; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Simulate trending data with some noise
    const baseDem = 52 + Math.sin(i / 15) * 3
    const noise = (Math.random() - 0.5) * 4

    data.push({
      date: date.toISOString().split('T')[0],
      dem_prob: Math.max(40, Math.min(60, baseDem + noise)),
      rep_prob: Math.max(40, Math.min(60, 100 - (baseDem + noise))),
    })
  }

  return data
}
