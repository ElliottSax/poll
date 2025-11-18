import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PollsterHeader } from '@/components/features/pollster/PollsterHeader'
import { PollsterStats } from '@/components/features/pollster/PollsterStats'
import { PollsterRecentPolls } from '@/components/features/pollster/PollsterRecentPolls'
import { PollsterAccuracyChart } from '@/components/features/pollster/PollsterAccuracyChart'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type Props = {
  params: { slug: string }
}

async function getPollster(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/pollsters/${slug}`,
    {
      next: { revalidate: 3600 }, // Revalidate every hour
    }
  )

  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Failed to fetch pollster')
  }

  return res.json()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pollster = await getPollster(params.slug)

  if (!pollster) {
    return { title: 'Pollster Not Found' }
  }

  return {
    title: `${pollster.name} - Pollster Profile`,
    description: `View ${pollster.name}'s polling history, accuracy ratings, and methodology. Grade: ${pollster.methodologyGrade || 'N/A'}`,
  }
}

export default async function PollsterPage({ params }: Props) {
  const pollster = await getPollster(params.slug)

  if (!pollster) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PollsterHeader pollster={pollster} />

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Accuracy Chart */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Accuracy History</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <PollsterAccuracyChart pollsterId={pollster.id} />
            </Suspense>
          </section>

          {/* Recent Polls */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Polls</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <PollsterRecentPolls polls={pollster.polls || []} />
            </Suspense>
          </section>
        </div>

        {/* Sidebar */}
        <div>
          <PollsterStats pollster={pollster} />
        </div>
      </div>
    </div>
  )
}
