import { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Container, Section, Grid } from '@/components/layout/Container'
import { Skeleton, ChartSkeleton, PollTableSkeleton } from '@/components/ui/Skeleton'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { RaceHeader } from '@/components/features/race/RaceHeader'
import { RacePolls } from '@/components/features/race/RacePolls'
import { RaceTrends } from '@/components/features/race/RaceTrends'
import { RaceForecast } from '@/components/features/race/RaceForecast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'

// This will be replaced with actual data fetching
async function getRaceData(slug: string) {
  // Mock data - replace with actual API call
  const mockRace = {
    id: '1',
    slug,
    name: slug === '2024-presidential' ? '2024 Presidential Election' : 'Pennsylvania Senate 2024',
    state: slug === '2024-presidential' ? 'National' : 'Pennsylvania',
    office: slug === '2024-presidential' ? 'President' : 'U.S. Senate',
    year: 2024,
    type: slug === '2024-presidential' ? 'Presidential' : 'Senate',
    description: 'Detailed race information and polling data',
  }

  return mockRace
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const race = await getRaceData(params.slug)

  return {
    title: `${race.name} - Poll Tracker`,
    description: `Real-time polling data, trends, and forecasts for the ${race.name}. Track candidate performance and election predictions.`,
    keywords: [race.name, `${race.year} election`, race.type, 'polls', 'forecast'],
    openGraph: {
      title: `${race.name} - Poll Tracker`,
      description: `Real-time polling data and forecasts for ${race.name}`,
      type: 'website',
    },
  }
}

export default async function RaceDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const race = await getRaceData(params.slug)

  if (!race) {
    notFound()
  }

  return (
    <>
      {/* Race Header */}
      <Section variant="default">
        <Container>
          <ErrorBoundary fallback={<div className="text-center py-8 text-red-600">Failed to load race details</div>}>
            <Suspense fallback={<div className="space-y-2"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-6 w-1/2" /></div>}>
              <RaceHeader slug={params.slug} />
            </Suspense>
          </ErrorBoundary>
        </Container>
      </Section>

      {/* Main Content */}
      <Section variant="muted">
        <Container>
          <Grid cols={4} gap="lg">
            {/* Main Column - 3/4 width */}
            <div className="col-span-4 lg:col-span-3 space-y-8">
              {/* Polling Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Polling Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ErrorBoundary fallback={<div className="text-center py-8 text-red-600">Failed to load trends</div>}>
                    <Suspense fallback={<ChartSkeleton />}>
                      <RaceTrends slug={params.slug} />
                    </Suspense>
                  </ErrorBoundary>
                </CardContent>
              </Card>

              {/* Polls Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Polls</CardTitle>
                    <Badge variant="outline">{race.year}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ErrorBoundary fallback={<div className="text-center py-8 text-red-600">Failed to load polls</div>}>
                    <Suspense fallback={<PollTableSkeleton rows={5} />}>
                      <RacePolls slug={params.slug} />
                    </Suspense>
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1/4 width */}
            <div className="col-span-4 lg:col-span-1 space-y-6">
              {/* Forecast Card */}
              <ErrorBoundary fallback={<Card><CardContent className="pt-6 text-center text-red-600">Failed to load forecast</CardContent></Card>}>
                <Suspense fallback={<Card><CardContent className="pt-6"><Skeleton className="h-32 w-full" /></CardContent></Card>}>
                  <RaceForecast slug={params.slug} />
                </Suspense>
              </ErrorBoundary>

              {/* Race Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Race Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium text-gray-500">State</div>
                    <div className="font-semibold">{race.state}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-500">Office</div>
                    <div className="font-semibold">{race.office}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-500">Type</div>
                    <Badge variant="outline">{race.type}</Badge>
                  </div>
                  <div>
                    <div className="font-medium text-gray-500">Election Year</div>
                    <div className="font-semibold">{race.year}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Polls</span>
                    <span className="font-semibold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-semibold">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Margin</span>
                    <span className="font-semibold">--</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Grid>
        </Container>
      </Section>
    </>
  )
}
