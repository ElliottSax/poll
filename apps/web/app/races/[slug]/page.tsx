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

  // TODO: Fetch from API - using mock data for now
  const mockPolls = [
    {
      id: '1',
      pollster: { name: 'Monmouth University', methodologyGrade: 'A+' },
      pollDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sampleSize: 1247,
      marginOfError: 3.2,
      methodology: 'Phone (RDD)',
      results: { 'Candidate A': 48.5, 'Candidate B': 45.2, 'Other': 6.3 },
    },
    {
      id: '2',
      pollster: { name: 'Quinnipiac University', methodologyGrade: 'A-' },
      pollDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sampleSize: 1589,
      marginOfError: 3.5,
      methodology: 'Phone (Live Caller)',
      results: { 'Candidate A': 47.1, 'Candidate B': 46.8, 'Other': 6.1 },
    },
  ]

  const mockForecast = {
    candidates: [
      { name: 'Candidate A', party: 'D', winProbability: 55.7, expectedVoteShare: 48.9 },
      { name: 'Candidate B', party: 'R', winProbability: 44.3, expectedVoteShare: 47.2 },
    ],
    lastUpdated: new Date().toISOString(),
    simulations: 10000,
  }

  const mockTrends = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    'Candidate A': 47 + Math.random() * 4,
    'Candidate B': 45 + Math.random() * 4,
  }))

  const mockCandidates = [
    { name: 'Candidate A', party: 'D' },
    { name: 'Candidate B', party: 'R' },
  ]

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
              <RaceTrends trends={mockTrends} candidates={mockCandidates} />
            </Suspense>
          </section>

          {/* Polls */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Polls</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <RacePolls polls={mockPolls} />
            </Suspense>
          </section>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-8">
          {/* Forecast */}
          <section>
            <Suspense fallback={<LoadingSpinner />}>
              <RaceForecast forecast={mockForecast} />
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
