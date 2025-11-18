import { Suspense } from 'react'
import { Metadata } from 'next'
import { TrendingUp, Map, BarChart3 } from 'lucide-react'
import { ForecastVisualization } from '@/components/features/forecasts/ForecastVisualization'
import { ElectoralMap } from '@/components/features/forecasts/ElectoralMap'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Election Forecast | Polling Dashboard',
  description:
    'Data-driven election forecasts using Monte Carlo simulation. View win probabilities, vote share distributions, and electoral college projections.',
}

interface Race {
  id: string
  slug: string
  title: string
  type: string
}

async function getFeaturedRaces(): Promise<Race[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  try {
    const res = await fetch(`${apiUrl}/api/races?type=Presidential&limit=5`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    return data.races || []
  } catch (error) {
    console.error('Failed to fetch races:', error)
    return []
  }
}

export default async function ForecastPage() {
  const races = await getFeaturedRaces()
  const presidentialRace = races.find(r => r.type === 'Presidential')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
          <TrendingUp className="h-4 w-4" />
          <span>Updated every 4 hours</span>
        </div>

        <h1 className="text-4xl font-bold mb-4">Election Forecast</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Our forecast uses Monte Carlo simulation with 10,000 runs to project
          election outcomes. We incorporate polling averages, historical polling
          error, and sample uncertainty to generate probabilistic forecasts.
        </p>
      </div>

      {/* Methodology */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          How Our Forecast Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">1. Poll Aggregation</h3>
            <p className="text-sm text-muted-foreground">
              We aggregate polls using weighted averages that account for recency,
              sample size, and pollster quality ratings.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Uncertainty Modeling</h3>
            <p className="text-sm text-muted-foreground">
              Our model incorporates both poll-specific uncertainty and systematic
              polling error based on historical accuracy (±3.5%).
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">3. Monte Carlo Simulation</h3>
            <p className="text-sm text-muted-foreground">
              We run 10,000 simulations to generate probabilistic forecasts,
              confidence intervals, and win probabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Presidential Forecast */}
      {presidentialRace && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Presidential Race Forecast</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <ForecastVisualization raceSlug={presidentialRace.slug} />
          </Suspense>
        </section>
      )}

      {/* Electoral Map */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Map className="h-6 w-6" />
          Electoral College Projection
        </h2>
        <Suspense fallback={<LoadingSpinner />}>
          <ElectoralMap />
        </Suspense>
      </section>

      {/* Other Key Races */}
      {races.filter(r => r.type !== 'Presidential').length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Key Senate & House Races</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {races
              .filter(r => r.type !== 'Presidential')
              .slice(0, 4)
              .map(race => (
                <div key={race.id} className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">{race.title}</h3>
                  <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
                    <ForecastVisualization raceSlug={race.slug} />
                  </Suspense>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">About Our Forecasts</h3>
        <p className="text-sm text-muted-foreground">
          Our forecasts are probabilistic projections based on available polling data
          and historical trends. They represent the likelihood of different outcomes,
          not predictions of what will definitely happen. Forecasts are updated every
          4 hours as new polls are added to our database. Win probabilities below 5%
          or above 95% should be interpreted with caution, as they approach the limits
          of polling accuracy.
        </p>
      </div>
    </div>
  )
}
