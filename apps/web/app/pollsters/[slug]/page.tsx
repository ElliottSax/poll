import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ExternalLink, Award, TrendingUp, BarChart } from 'lucide-react'
import { PollsterPolls } from '@/components/features/pollsters/PollsterPolls'
import { PollsterStats } from '@/components/features/pollsters/PollsterStats'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SafeLink } from '@/components/common/SafeHtml'

interface Pollster {
  id: string
  slug: string
  name: string
  grade: string | null
  website: string | null
  methodology: string | null
  partisanLean: string | null
  accuracy: number | null
  bias: number | null
  pollCount: number
}

async function getPollster(slug: string): Promise<Pollster | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  try {
    const res = await fetch(`${apiUrl}/api/pollsters/${slug}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    if (!res.ok) {
      return null
    }

    return await res.json()
  } catch (error) {
    console.error('Failed to fetch pollster:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const pollster = await getPollster(params.slug)

  if (!pollster) {
    return {
      title: 'Pollster Not Found',
    }
  }

  return {
    title: `${pollster.name} - Pollster Profile | Polling Dashboard`,
    description: `View ${pollster.name}'s polling history, accuracy ratings, methodology, and recent polls. Grade: ${pollster.grade || 'N/A'}`,
  }
}

export default async function PollsterDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const pollster = await getPollster(params.slug)

  if (!pollster) {
    notFound()
  }

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'bg-gray-100 text-gray-800 border-gray-300'
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800 border-green-300'
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700 border-blue-200'
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  const getPartisanColor = (lean: string | null) => {
    if (!lean) return 'bg-gray-100 text-gray-700'
    if (lean === 'D') return 'bg-blue-100 text-blue-700'
    if (lean === 'R') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{pollster.name}</h1>
            {pollster.website && (
              <SafeLink
                href={pollster.website}
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Visit website
                <ExternalLink className="h-4 w-4" />
              </SafeLink>
            )}
          </div>

          {/* Grade Badge */}
          {pollster.grade && (
            <div className="text-center">
              <div
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 ${getGradeColor(
                  pollster.grade
                )}`}
              >
                <Award className="h-6 w-6" />
                <div>
                  <div className="text-xs font-medium">Grade</div>
                  <div className="text-2xl font-bold">{pollster.grade}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Methodology */}
          {pollster.methodology && (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Methodology</div>
              </div>
              <div className="font-semibold capitalize">{pollster.methodology}</div>
            </div>
          )}

          {/* Partisan Lean */}
          {pollster.partisanLean && (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2">
                Partisan Lean
              </div>
              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full font-semibold ${getPartisanColor(
                    pollster.partisanLean
                  )}`}
                >
                  {pollster.partisanLean === 'D'
                    ? 'Democrat'
                    : pollster.partisanLean === 'R'
                    ? 'Republican'
                    : 'Independent'}
                </span>
              </div>
            </div>
          )}

          {/* Accuracy */}
          {pollster.accuracy !== null && (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-2xl font-bold">
                {pollster.accuracy.toFixed(1)}%
              </div>
            </div>
          )}

          {/* Poll Count */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-2">Total Polls</div>
            <div className="text-2xl font-bold">
              {pollster.pollCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Performance Statistics</h2>
        <Suspense fallback={<LoadingSpinner />}>
          <PollsterStats pollsterSlug={params.slug} />
        </Suspense>
      </section>

      {/* Recent Polls */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Recent Polls</h2>
        <Suspense fallback={<LoadingSpinner />}>
          <PollsterPolls pollsterSlug={params.slug} />
        </Suspense>
      </section>
    </div>
  )
}
