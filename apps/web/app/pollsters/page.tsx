import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Container, Section, Grid } from '@/components/layout/Container'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CardGridSkeleton } from '@/components/ui/Skeleton'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { TrendingUp, Award, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pollsters - Poll Tracker',
  description: 'Browse polling organizations, their ratings, methodologies, and track records. Compare pollster accuracy and historical performance.',
  keywords: ['pollsters', 'polling organizations', 'pollster ratings', 'poll accuracy', 'FiveThirtyEight ratings'],
  openGraph: {
    title: 'Pollsters - Poll Tracker',
    description: 'Browse polling organizations and their ratings',
    type: 'website',
  },
}

// Mock data - replace with actual API call
const mockPollsters = [
  {
    id: '1',
    slug: 'marist-college',
    name: 'Marist College',
    grade: 'A+' as const,
    pollCount: 847,
    lastPoll: '2 days ago',
    methodology: 'Live Phone, Online',
    avgError: 2.1,
  },
  {
    id: '2',
    slug: 'monmouth-university',
    name: 'Monmouth University',
    grade: 'A+' as const,
    pollCount: 523,
    lastPoll: '1 week ago',
    methodology: 'Live Phone',
    avgError: 2.3,
  },
  {
    id: '3',
    slug: 'abc-news-washington-post',
    name: 'ABC News/Washington Post',
    grade: 'A+' as const,
    pollCount: 312,
    lastPoll: '3 days ago',
    methodology: 'Live Phone',
    avgError: 2.2,
  },
  {
    id: '4',
    slug: 'quinnipiac-university',
    name: 'Quinnipiac University',
    grade: 'A-' as const,
    pollCount: 1240,
    lastPoll: '1 day ago',
    methodology: 'Live Phone',
    avgError: 2.8,
  },
  {
    id: '5',
    slug: 'emerson-college',
    name: 'Emerson College',
    grade: 'A-' as const,
    pollCount: 892,
    lastPoll: '4 hours ago',
    methodology: 'Online, IVR',
    avgError: 2.9,
  },
  {
    id: '6',
    slug: 'siena-college',
    name: 'Siena College',
    grade: 'A' as const,
    pollCount: 456,
    lastPoll: '1 week ago',
    methodology: 'Live Phone',
    avgError: 2.5,
  },
]

function getGradeColor(grade: string): 'success' | 'info' | 'warning' | 'danger' {
  if (grade.startsWith('A')) return 'success'
  if (grade.startsWith('B')) return 'info'
  if (grade.startsWith('C')) return 'warning'
  return 'danger'
}

function PollsterGrid() {
  return (
    <Grid cols={3} gap="lg">
      {mockPollsters.map((pollster) => (
        <Link key={pollster.id} href={`/pollsters/${pollster.slug}`}>
          <Card hoverable className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{pollster.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {pollster.methodology}
                  </CardDescription>
                </div>
                <Badge variant={getGradeColor(pollster.grade)} size="lg">
                  {pollster.grade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BarChart3 className="h-4 w-4" />
                    <span>Total Polls</span>
                  </div>
                  <span className="font-semibold">{pollster.pollCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Avg. Error</span>
                  </div>
                  <span className="font-semibold">±{pollster.avgError}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="h-4 w-4" />
                    <span>Last Poll</span>
                  </div>
                  <span className="font-semibold text-gray-500">{pollster.lastPoll}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </Grid>
  )
}

export default function PollstersPage() {
  return (
    <>
      {/* Page Header */}
      <Section variant="default">
        <Container>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Pollsters</h1>
            <p className="text-lg text-gray-600">
              Browse polling organizations, their ratings, methodologies, and track records.
              Grades are based on historical accuracy and methodology quality.
            </p>
          </div>

          {/* Stats Overview */}
          <Grid cols={3} gap="md" className="mb-8">
            <Card variant="outline">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">200+</div>
                  <div className="text-sm text-gray-600 mt-1">Active Pollsters</div>
                </div>
              </CardContent>
            </Card>
            <Card variant="outline">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">42</div>
                  <div className="text-sm text-gray-600 mt-1">A-Rated or Higher</div>
                </div>
              </CardContent>
            </Card>
            <Card variant="outline">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">12K+</div>
                  <div className="text-sm text-gray-600 mt-1">Total Polls Tracked</div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </Section>

      {/* Pollster Grid */}
      <Section variant="muted">
        <Container>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Top-Rated Pollsters</h2>
            <p className="text-gray-600">
              Pollsters with the highest ratings and proven track records
            </p>
          </div>

          <ErrorBoundary fallback={<div className="text-center py-8 text-red-600">Failed to load pollsters</div>}>
            <Suspense fallback={<CardGridSkeleton count={6} cols={3} />}>
              <PollsterGrid />
            </Suspense>
          </ErrorBoundary>
        </Container>
      </Section>
    </>
  )
}
