import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { RaceHeader } from '@/components/features/races/RaceHeader'
import { PollTable } from '@/components/features/polls/PollTable'
import { TrendChart } from '@/components/features/charts/TrendChart'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface PageProps {
  params: {
    slug: string
  }
}

async function getRace(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const res = await fetch(`${apiUrl}/api/races/${slug}`, {
    cache: 'no-store', // Real-time data
  })

  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Failed to fetch race')
  }

  return res.json()
}

export async function generateMetadata({ params }: PageProps) {
  const race = await getRace(params.slug)

  if (!race) {
    return {
      title: 'Race Not Found',
    }
  }

  return {
    title: `${race.title} - Polling Dashboard`,
    description: race.description || `Track polling data for ${race.title}`,
  }
}

export default async function RaceDetailPage({ params }: PageProps) {
  const race = await getRace(params.slug)

  if (!race) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Race Header */}
      <RaceHeader race={race} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend Chart */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Polling Trends
            </h2>
            <Suspense fallback={<LoadingSpinner />}>
              <TrendChart raceId={race.id} />
            </Suspense>
          </section>

          {/* Poll Table */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Polls
            </h2>
            <Suspense fallback={<LoadingSpinner />}>
              <PollTable raceSlug={params.slug} />
            </Suspense>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Race Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Race Information
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">State</dt>
                <dd className="text-base text-gray-900">{race.state}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Office</dt>
                <dd className="text-base text-gray-900">{race.office}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Election Date</dt>
                <dd className="text-base text-gray-900">
                  {new Date(race.electionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-base text-gray-900 capitalize">{race.status}</dd>
              </div>
            </dl>
          </div>

          {/* Quick Stats */}
          {race.polls && race.polls.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Polls</dt>
                  <dd className="text-2xl font-bold text-gray-900">{race.polls.length}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(race.polls[0].pollDate).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
