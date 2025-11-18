import { Metadata } from 'next'
import { Suspense } from 'react'
import { PollsterList } from '@/components/features/pollster/PollsterList'
import { PollsterFilters } from '@/components/features/pollster/PollsterFilters'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Pollster Rankings - Polling Dashboard',
  description:
    'Rankings and ratings of election pollsters by accuracy, methodology, and transparency.',
}

export default function PollstersPage({
  searchParams,
}: {
  searchParams: { orderBy?: string }
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Pollster Rankings</h1>
        <p className="text-lg text-muted-foreground">
          Compare pollsters by historical accuracy, methodology quality, and transparency.
          Based on performance across hundreds of elections.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <PollsterFilters />
      </div>

      {/* Pollster List */}
      <Suspense fallback={<LoadingSpinner />}>
        <PollsterList orderBy={searchParams.orderBy as any} />
      </Suspense>
    </div>
  )
}
