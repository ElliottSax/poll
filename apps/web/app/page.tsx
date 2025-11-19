import { Metadata } from 'next'
import { Suspense } from 'react'
import { FeaturedRaces } from '@/components/features/home/FeaturedRaces'
import { TrendingRaces } from '@/components/features/home/TrendingRaces'
import { RecentPolls } from '@/components/features/home/RecentPolls'
import { Hero } from '@/components/features/home/Hero'
import { Stats } from '@/components/features/home/Stats'
import { RaceCardSkeleton, StatsCardSkeleton, PollTableSkeleton } from '@/components/ui/Skeleton'
import { Container, Section } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Poll Tracker - Real-Time Election Polling Data & Analysis',
  description: 'Track election polls, forecasts, and race ratings across presidential, senate, house, and gubernatorial races. Real-time polling averages and trend analysis.',
  keywords: ['polling', 'elections', '2024 elections', 'poll aggregator', 'election forecasts'],
  openGraph: {
    title: 'Poll Tracker - Real-Time Election Polling Data',
    description: 'Track election polls and forecasts with real-time data analysis',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Section variant="accent">
        <Container>
          <Hero />
        </Container>
      </Section>

      {/* Stats Overview */}
      <Section>
        <Container>
          <ErrorBoundary fallback={<div className="text-center py-8 text-red-600">Failed to load statistics</div>}>
            <Suspense fallback={<StatsCardSkeleton count={4} />}>
              <Stats />
            </Suspense>
          </ErrorBoundary>
        </Container>
      </Section>

      {/* Featured Races */}
      <Section variant="default">
        <Container>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Featured Races</h2>
            <p className="text-gray-600">Key races to watch in the upcoming election</p>
          </div>
          <ErrorBoundary fallback={<div className="text-center py-8 text-red-600">Failed to load featured races</div>}>
            <Suspense fallback={<RaceCardSkeleton count={3} />}>
              <FeaturedRaces />
            </Suspense>
          </ErrorBoundary>
        </Container>
      </Section>

      {/* Trending Races */}
      <Section variant="muted">
        <Container>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Trending Races</h2>
            <p className="text-gray-600">Races with the most recent polling activity</p>
          </div>
          <ErrorBoundary fallback={<div className="text-center py-8 text-red-600">Failed to load trending races</div>}>
            <Suspense fallback={<RaceCardSkeleton count={3} />}>
              <TrendingRaces />
            </Suspense>
          </ErrorBoundary>
        </Container>
      </Section>

      {/* Recent Polls */}
      <Section>
        <Container>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Recent Polls</h2>
            <p className="text-gray-600">Latest polling data from top-rated pollsters</p>
          </div>
          <ErrorBoundary fallback={<div className="text-center py-8 text-red-600">Failed to load recent polls</div>}>
            <Suspense fallback={<PollTableSkeleton rows={5} />}>
              <RecentPolls />
            </Suspense>
          </ErrorBoundary>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section variant="accent">
        <Container size="md">
          <Card variant="elevated" padding="lg" className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Stay Updated on Election Polling
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Get real-time alerts when races shift, new polls are published, and
              forecasts change. Never miss an important update.
            </p>
            <Button variant="primary" size="lg">
              Sign Up for Alerts
            </Button>
          </Card>
        </Container>
      </Section>
    </>
  )
}
