import { Metadata } from 'next'
import { Suspense } from 'react'
import { FeaturedRaces } from '@/components/features/home/FeaturedRaces'
import { TrendingRaces } from '@/components/features/home/TrendingRaces'
import { RecentPolls } from '@/components/features/home/RecentPolls'
import { Hero } from '@/components/features/home/Hero'
import { Stats } from '@/components/features/home/Stats'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Container, Section } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

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
          <Suspense fallback={<PageLoader message="Loading statistics..." />}>
            <Stats />
          </Suspense>
        </Container>
      </Section>

      {/* Featured Races */}
      <Section variant="default">
        <Container>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Featured Races</h2>
            <p className="text-gray-600">Key races to watch in the upcoming election</p>
          </div>
          <Suspense fallback={<PageLoader message="Loading featured races..." />}>
            <FeaturedRaces />
          </Suspense>
        </Container>
      </Section>

      {/* Trending Races */}
      <Section variant="muted">
        <Container>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Trending Races</h2>
            <p className="text-gray-600">Races with the most recent polling activity</p>
          </div>
          <Suspense fallback={<PageLoader message="Loading trending races..." />}>
            <TrendingRaces />
          </Suspense>
        </Container>
      </Section>

      {/* Recent Polls */}
      <Section>
        <Container>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Recent Polls</h2>
            <p className="text-gray-600">Latest polling data from top-rated pollsters</p>
          </div>
          <Suspense fallback={<PageLoader message="Loading recent polls..." />}>
            <RecentPolls />
          </Suspense>
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
