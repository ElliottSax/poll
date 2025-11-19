import { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Container, Section, Grid } from '@/components/layout/Container'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { PollTable } from '@/components/features/PollTable'
import { TrendingUp, BarChart3, Calendar, Phone, Globe } from 'lucide-react'

// Mock data - replace with actual API call
async function getPollsterData(slug: string) {
  const mockPollster = {
    id: '1',
    slug,
    name: slug === 'marist-college' ? 'Marist College' : 'Quinnipiac University',
    grade: 'A+' as const,
    founded: 1986,
    headquarters: 'Poughkeepsie, NY',
    methodology: 'Live Phone, Online',
    pollCount: 847,
    avgError: 2.1,
    predictivePlusMinusScore: '+0.3',
    description:
      'The Marist College Institute for Public Opinion is one of the most respected polling organizations in the United States, known for its rigorous methodology and accurate results.',
    website: 'https://maristpoll.marist.edu/',
  }

  return mockPollster
}

// Mock polls data
const mockRecentPolls = [
  {
    id: '1',
    pollster: 'Marist College',
    pollsterGrade: 'A+' as const,
    date: new Date('2024-01-15'),
    sampleSize: 1247,
    methodology: 'LV' as const,
    results: [
      { candidateId: 'biden', candidateName: 'Joe Biden', party: 'democrat' as const, percentage: 49.0 },
      { candidateId: 'trump', candidateName: 'Donald Trump', party: 'republican' as const, percentage: 47.0 },
    ],
    url: 'https://example.com/poll1',
  },
  {
    id: '2',
    pollster: 'Marist College',
    pollsterGrade: 'A+' as const,
    date: new Date('2024-01-10'),
    sampleSize: 1108,
    methodology: 'RV' as const,
    results: [
      { candidateId: 'biden', candidateName: 'Joe Biden', party: 'democrat' as const, percentage: 48.0 },
      { candidateId: 'trump', candidateName: 'Donald Trump', party: 'republican' as const, percentage: 48.0 },
    ],
  },
]

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const pollster = await getPollsterData(params.slug)

  return {
    title: `${pollster.name} - Pollster Profile | Poll Tracker`,
    description: `${pollster.name} polling data, ratings, methodology, and historical accuracy. Grade: ${pollster.grade}. View all polls and track record.`,
    keywords: [pollster.name, 'pollster', 'polling organization', `${pollster.grade} rated`, 'poll accuracy'],
    openGraph: {
      title: `${pollster.name} - Pollster Profile`,
      description: `${pollster.name} - ${pollster.grade} rated pollster`,
      type: 'website',
    },
  }
}

export default async function PollsterDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const pollster = await getPollsterData(params.slug)

  if (!pollster) {
    notFound()
  }

  function getGradeColor(grade: string): 'success' | 'info' | 'warning' | 'danger' {
    if (grade.startsWith('A')) return 'success'
    if (grade.startsWith('B')) return 'info'
    if (grade.startsWith('C')) return 'warning'
    return 'danger'
  }

  return (
    <>
      {/* Pollster Header */}
      <Section variant="default">
        <Container>
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{pollster.name}</h1>
                <Badge variant={getGradeColor(pollster.grade)} size="lg">
                  {pollster.grade}
                </Badge>
              </div>
              <p className="text-lg text-gray-600">{pollster.description}</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <Grid cols={4} gap="md">
            <Card variant="outline">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{pollster.pollCount}</div>
                    <div className="text-sm text-gray-600">Total Polls</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="outline">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">±{pollster.avgError}%</div>
                    <div className="text-sm text-gray-600">Avg. Error</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="outline">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{pollster.founded}</div>
                    <div className="text-sm text-gray-600">Founded</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="outline">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Phone className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{pollster.methodology}</div>
                    <div className="text-sm text-gray-600">Methodology</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </Section>

      {/* Main Content */}
      <Section variant="muted">
        <Container>
          <Grid cols={4} gap="lg">
            {/* Main Column - 3/4 width */}
            <div className="col-span-4 lg:col-span-3 space-y-8">
              {/* Recent Polls */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Polls</CardTitle>
                  <CardDescription>
                    Latest polling results from {pollster.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<PageLoader message="Loading polls..." />}>
                    <PollTable polls={mockRecentPolls} showGrade={false} />
                  </Suspense>
                </CardContent>
              </Card>

              {/* Historical Accuracy */}
              <Card>
                <CardHeader>
                  <CardTitle>Historical Accuracy</CardTitle>
                  <CardDescription>
                    Performance analysis across election cycles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <p>Historical accuracy data will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1/4 width */}
            <div className="col-span-4 lg:col-span-1 space-y-6">
              {/* About Card */}
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium text-gray-500 mb-1">Headquarters</div>
                    <div className="font-semibold">{pollster.headquarters}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-500 mb-1">Founded</div>
                    <div className="font-semibold">{pollster.founded}</div>
                  </div>
                  {pollster.website && (
                    <div>
                      <div className="font-medium text-gray-500 mb-1">Website</div>
                      <a
                        href={pollster.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Visit website</span>
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rating Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overall Grade</span>
                    <Badge variant={getGradeColor(pollster.grade)}>
                      {pollster.grade}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Error</span>
                    <span className="font-semibold">±{pollster.avgError}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Predictive +/-</span>
                    <span className="font-semibold">{pollster.predictivePlusMinusScore}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Methodology Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Methodology</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Primary Method:</span>
                      <p className="text-gray-600 mt-1">{pollster.methodology}</p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-gray-600">
                        This pollster uses rigorous scientific methods to ensure
                        accurate and representative results.
                      </p>
                    </div>
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
