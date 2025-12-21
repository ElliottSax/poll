import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { RaceHeader } from '@/components/features/race/RaceHeader'
import { RacePolls } from '@/components/features/race/RacePolls'
import { RaceForecast } from '@/components/features/race/RaceForecast'
import { RaceTrends } from '@/components/features/race/RaceTrends'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type Props = {
  params: { slug: string }
}

// This would fetch from your API
async function getRace(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/races/${slug}`, {
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  })

  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Failed to fetch race')
  }

  return res.json()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const race = await getRace(params.slug)

  if (!race) {
    return {
      title: 'Race Not Found',
    }
  }

  return {
    title: `${race.raceName} - Polling Dashboard`,
    description: `Live polling data and forecasts for the ${race.raceName}. Track poll averages, trends, and win probabilities.`,
    openGraph: {
      title: `${race.raceName} Polling`,
      description: `Latest polls and forecasts for ${race.raceName}`,
    },
  }
}

export default async function RacePage({ params }: Props) {
  const race = await getRace(params.slug)

  if (!race) {
    notFound()
  }

  // Use polls from API response (race includes polls via Prisma include)
  const polls = race.polls || []

  // Use forecast from API response
  const latestForecast = race.forecasts?.[0]
  const forecast = latestForecast ? {
    candidates: latestForecast.predictions || [],
    lastUpdated: latestForecast.forecastDate,
    simulations: latestForecast.simulationCount || 10000,
  } : null

  // Generate trends from poll data
  const trends = polls.length > 0
    ? polls.slice().reverse().map((poll: any) => ({
        date: new Date(poll.pollDate).toISOString().split('T')[0],
        ...poll.results,
      }))
    : []

  // Extract candidates from race or polls
  const candidates = race.candidates || Object.keys(polls[0]?.results || {}).map((name: string) => ({
    name,
    party: name.includes('(D)') ? 'D' : name.includes('(R)') ? 'R' : 'I',
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Race Header */}
      <RaceHeader race={race} />

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trends Chart */}
          <section>
            <Suspense fallback={<LoadingSpinner />}>
              {trends.length > 0 ? (
                <RaceTrends trends={trends} candidates={candidates} />
              ) : (
                <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                  No polling trends available yet
                </div>
              )}
            </Suspense>
          </section>

          {/* Polls */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Polls</h2>
            <Suspense fallback={<LoadingSpinner />}>
              {polls.length > 0 ? (
                <RacePolls polls={polls} />
              ) : (
                <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                  No polls available for this race yet
                </div>
              )}
            </Suspense>
          </section>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-8">
          {/* Forecast */}
          <section>
            <Suspense fallback={<LoadingSpinner />}>
              {forecast ? (
                <RaceForecast forecast={forecast} />
              ) : (
                <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                  No forecast available yet
                </div>
              )}
            </Suspense>
          </section>

          {/* Race Info */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Race Information</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium capitalize">{race.raceType}</dd>
              </div>
              {race.state && (
                <div>
                  <dt className="text-muted-foreground">State</dt>
                  <dd className="font-medium">{race.state}</dd>
                </div>
              )}
              {race.district && (
                <div>
                  <dt className="text-muted-foreground">District</dt>
                  <dd className="font-medium">{race.district}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Election Date</dt>
                <dd className="font-medium">
                  {new Date(race.electionDate).toLocaleDateString()}
                </dd>
              </div>
              {race.competitiveRating && (
                <div>
                  <dt className="text-muted-foreground">Rating</dt>
                  <dd className="font-medium">{race.competitiveRating}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}
