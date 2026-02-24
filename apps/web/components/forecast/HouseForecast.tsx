'use client'

import { ProbabilityBar } from '../charts/ProbabilityBar'
import { SeatDistribution } from '../charts/SeatDistribution'

interface HouseForecastProps {
  forecast?: {
    demControl: number
    repControl: number
    expectedDemSeats: number
    expectedRepSeats: number
    lastUpdated: string
  }
  competitiveRaces?: Array<{
    district: string
    state: string
    incumbent: string
    rating: string
    demProb: number
    repProb: number
  }>
}

export function HouseForecast({
  forecast = getMockForecast(),
  competitiveRaces = getMockCompetitiveRaces(),
}: HouseForecastProps) {
  return (
    <div className="space-y-6">
      {/* Control Probability */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">House Control</h3>
          <span className="text-sm text-muted-foreground">
            Updated {new Date(forecast.lastUpdated).toLocaleDateString()}
          </span>
        </div>

        <div className="space-y-4">
          <ProbabilityBar
            data={[
              {
                name: 'Democratic Control',
                probability: forecast.demControl,
                color: '#3b82f6',
              },
              {
                name: 'Republican Control',
                probability: forecast.repControl,
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
              <div className="text-xs text-muted-foreground">Expected Seats (out of 435)</div>
            </div>

            <div className="text-center p-4 bg-republican/10 rounded-lg">
              <div className="text-4xl font-bold text-republican">
                {forecast.repControl.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Republican Control</div>
              <div className="text-2xl font-semibold mt-2">{forecast.expectedRepSeats}</div>
              <div className="text-xs text-muted-foreground">Expected Seats (out of 435)</div>
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
          218 seats needed for majority
        </div>
      </div>

      {/* Competitive Races */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Most Competitive House Races</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Showing {competitiveRaces.length} most competitive races that will likely determine
          control
        </p>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground pb-2 border-b">
            <div className="col-span-3">District</div>
            <div className="col-span-2">Incumbent</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-5">Win Probability</div>
          </div>
          {competitiveRaces.map((race, idx) => (
            <RaceRow key={`${race.state}-${race.district}-${idx}`} race={race} />
          ))}
        </div>
      </div>

      {/* Scenario Distribution */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Scenario Distribution</h3>
        <div className="space-y-3">
          <ScenarioRow
            scenario="Narrow Democratic Majority"
            demSeats={220}
            repSeats={215}
            probability={35}
          />
          <ScenarioRow
            scenario="Slim Democratic Majority"
            demSeats={218}
            repSeats={217}
            probability={18}
          />
          <ScenarioRow
            scenario="Slim Republican Majority"
            demSeats={216}
            repSeats={219}
            probability={22}
          />
          <ScenarioRow
            scenario="Narrow Republican Majority"
            demSeats={210}
            repSeats={225}
            probability={25}
          />
        </div>
      </div>

      {/* Regional Breakdown */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Competitive Races by Region</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RegionCard
            region="Northeast"
            tossups={8}
            leanDem={5}
            leanRep={3}
            description="NY, PA, ME"
          />
          <RegionCard
            region="Midwest"
            tossups={12}
            leanDem={6}
            leanRep={8}
            description="MI, WI, OH, IA"
          />
          <RegionCard
            region="South"
            tossups={15}
            leanDem={4}
            leanRep={10}
            description="NC, GA, TX, FL"
          />
          <RegionCard
            region="West"
            tossups={10}
            leanDem={7}
            leanRep={5}
            description="CA, AZ, NV, CO"
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
              Republicans currently hold a narrow majority with 222 seats vs. Democrats' 213 seats
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              There are approximately <strong>45 truly competitive races</strong> (rated as Toss-up
              or Lean) that will determine control
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              Democrats need to flip a net of <strong>5 seats</strong> to regain control of the
              House
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              California and New York have the most competitive districts, with redistricting
              playing a major role
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              House races tend to be more localized than Senate races, with incumbency advantage
              averaging about 5-7 points
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <p className="text-sm text-muted-foreground">
              The generic congressional ballot (D vs R nationwide) is a strong predictor of overall
              results, currently showing Democrats +2.5 points
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
    <div className="grid grid-cols-12 gap-2 items-center py-2 border-b hover:bg-muted transition-colors text-sm">
      <div className="col-span-3">
        <div className="font-semibold">{race.state}-{race.district}</div>
      </div>
      <div className={`col-span-2 text-xs ${getPartyColor(race.incumbent)}`}>
        {race.incumbent}
      </div>
      <div className="col-span-2">
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
        <div className="w-48">
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

function RegionCard({
  region,
  tossups,
  leanDem,
  leanRep,
  description,
}: {
  region: string
  tossups: number
  leanDem: number
  leanRep: number
  description: string
}) {
  const total = tossups + leanDem + leanRep

  return (
    <div className="p-4 border rounded hover:bg-muted transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{region}</h4>
        <span className="text-xs text-muted-foreground">{total} competitive</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-democrat">Lean D</span>
          <span className="font-semibold">{leanDem}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Toss-up</span>
          <span className="font-semibold">{tossups}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-republican">Lean R</span>
          <span className="font-semibold">{leanRep}</span>
        </div>
      </div>
    </div>
  )
}

function getMockForecast() {
  return {
    demControl: 52.8,
    repControl: 47.2,
    expectedDemSeats: 219,
    expectedRepSeats: 216,
    lastUpdated: new Date().toISOString(),
  }
}

function getMockCompetitiveRaces() {
  return [
    { state: 'CA', district: '22', incumbent: 'Valadao (R)', rating: 'Toss-up', demProb: 51.2, repProb: 48.8 },
    { state: 'NY', district: '03', incumbent: 'Santos (R)', rating: 'Lean D', demProb: 62.5, repProb: 37.5 },
    { state: 'NY', district: '17', incumbent: 'Lawler (R)', rating: 'Toss-up', demProb: 49.8, repProb: 50.2 },
    { state: 'PA', district: '07', incumbent: 'Wild (D)', rating: 'Lean D', demProb: 58.3, repProb: 41.7 },
    { state: 'PA', district: '08', incumbent: 'Cartwright (D)', rating: 'Toss-up', demProb: 50.5, repProb: 49.5 },
    { state: 'MI', district: '07', incumbent: 'Slotkin (D)', rating: 'Lean D', demProb: 61.2, repProb: 38.8 },
    { state: 'MI', district: '08', incumbent: 'Scholten (D)', rating: 'Toss-up', demProb: 52.7, repProb: 47.3 },
    { state: 'AZ', district: '01', incumbent: 'Schweikert (R)', rating: 'Toss-up', demProb: 48.9, repProb: 51.1 },
    { state: 'AZ', district: '06', incumbent: 'Ciscomani (R)', rating: 'Toss-up', demProb: 52.1, repProb: 47.9 },
    { state: 'OH', district: '09', incumbent: 'Kaptur (D)', rating: 'Lean D', demProb: 57.6, repProb: 42.4 },
    { state: 'NC', district: '01', incumbent: 'Davis (D)', rating: 'Toss-up', demProb: 49.3, repProb: 50.7 },
    { state: 'TX', district: '34', incumbent: 'Gonzalez (D)', rating: 'Lean R', demProb: 42.8, repProb: 57.2 },
    { state: 'CA', district: '13', incumbent: 'Duarte (R)', rating: 'Toss-up', demProb: 51.8, repProb: 48.2 },
    { state: 'CA', district: '27', incumbent: 'Garcia (R)', rating: 'Lean D', demProb: 59.4, repProb: 40.6 },
    { state: 'VA', district: '02', incumbent: 'Kiggans (R)', rating: 'Lean R', demProb: 44.3, repProb: 55.7 },
  ]
}
