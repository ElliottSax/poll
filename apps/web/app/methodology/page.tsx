import { Metadata } from 'next'
import { Container, Section, Grid } from '@/components/layout/Container'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle2, TrendingUp, Scale, BarChart3, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Methodology - Poll Tracker',
  description: 'Learn about our polling methodology, aggregation techniques, pollster ratings, and forecasting models. Transparent, data-driven election analysis.',
  keywords: ['polling methodology', 'poll aggregation', 'pollster ratings', 'election forecasting', 'polling average'],
  openGraph: {
    title: 'Methodology - Poll Tracker',
    description: 'Our transparent methodology for aggregating and analyzing election polls',
    type: 'website',
  },
}

export default function MethodologyPage() {
  const principles = [
    {
      icon: Scale,
      title: 'Weighted Averaging',
      description:
        'Polls are weighted based on sample size, recency, and pollster quality. Higher-rated pollsters and more recent polls receive greater weight.',
      formula: 'Weight = (Quality Score × Sample Size) ÷ Days Since Publication',
    },
    {
      icon: BarChart3,
      title: 'Pollster Ratings',
      description:
        'We rate pollsters (A+ through F) based on historical accuracy, methodology transparency, and sample representativeness.',
      criteria: ['Historical accuracy', 'Methodology quality', 'Sample size', 'Transparency'],
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description:
        'Our models identify polling trends while filtering out statistical noise and outliers to show true momentum shifts.',
      methods: ['LOWESS smoothing', 'Outlier detection', 'Momentum indicators'],
    },
    {
      icon: CheckCircle2,
      title: 'Quality Control',
      description:
        'We exclude polls that don\'t meet minimum standards for sample size, methodology disclosure, or field dates.',
      minimums: ['n ≥ 200', 'Disclosed methodology', 'Recent (< 30 days)'],
    },
  ]

  const ratingCriteria = [
    {
      grade: 'A+',
      color: 'success' as const,
      avgError: '< 2.0%',
      description: 'Exceptional accuracy and gold-standard methodology',
    },
    {
      grade: 'A',
      color: 'success' as const,
      avgError: '2.0-2.5%',
      description: 'Excellent accuracy with rigorous methodology',
    },
    {
      grade: 'A-',
      color: 'success' as const,
      avgError: '2.5-3.0%',
      description: 'Very good accuracy and solid methodology',
    },
    {
      grade: 'B+',
      color: 'info' as const,
      avgError: '3.0-3.5%',
      description: 'Good accuracy with transparent methodology',
    },
    {
      grade: 'B',
      color: 'info' as const,
      avgError: '3.5-4.0%',
      description: 'Above average accuracy',
    },
    {
      grade: 'C+',
      color: 'warning' as const,
      avgError: '4.0-5.0%',
      description: 'Average accuracy, some methodology concerns',
    },
    {
      grade: 'C or lower',
      color: 'warning' as const,
      avgError: '> 5.0%',
      description: 'Below average accuracy or significant methodology issues',
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <Section variant="accent">
        <Container size="md" className="text-center">
          <Badge variant="outline" className="mb-4">Methodology</Badge>
          <h1 className="text-5xl font-bold mb-6">How We Track Polls</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparency is at the heart of everything we do. Here's exactly how we
            aggregate polls, rate pollsters, and create forecasts.
          </p>
        </Container>
      </Section>

      {/* Core Principles */}
      <Section variant="default">
        <Container>
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Core Principles</h2>
            <p className="text-lg text-gray-600">
              Our methodology is built on these foundational principles
            </p>
          </div>

          <Grid cols={2} gap="lg">
            {principles.map((principle, index) => (
              <Card key={index} hoverable>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <principle.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle>{principle.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{principle.description}</p>
                  {'formula' in principle && (
                    <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                      {principle.formula}
                    </div>
                  )}
                  {'criteria' in principle && (
                    <ul className="space-y-1">
                      {principle.criteria.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {'methods' in principle && (
                    <ul className="space-y-1">
                      {principle.methods.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {'minimums' in principle && (
                    <ul className="space-y-1">
                      {principle.minimums.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm font-mono">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* Pollster Ratings */}
      <Section variant="muted">
        <Container>
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Pollster Rating System</h2>
            <p className="text-lg text-gray-600">
              We evaluate pollsters based on historical accuracy and methodology quality
            </p>
          </div>

          <div className="space-y-3">
            {ratingCriteria.map((rating, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Badge variant={rating.color} size="lg" className="w-16 justify-center">
                        {rating.grade}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-semibold">{rating.description}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Average historical error: {rating.avgError}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card variant="outline" className="mt-8">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <strong>Note:</strong> Historical accuracy is calculated as the average
                  absolute error between final poll results and actual election outcomes
                  across all races conducted by that pollster in the past 10 years.
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>

      {/* Poll Aggregation */}
      <Section variant="default">
        <Container size="md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Poll Aggregation Process</h2>
            <p className="text-lg text-gray-600">
              Our step-by-step process for creating polling averages
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: 1,
                title: 'Data Collection',
                description:
                  'We collect polls from hundreds of sources, including direct feeds from polling organizations and media outlets.',
              },
              {
                step: 2,
                title: 'Quality Screening',
                description:
                  'Polls must meet minimum standards for sample size (n ≥ 200), disclosed methodology, and recency.',
              },
              {
                step: 3,
                title: 'Weight Assignment',
                description:
                  'Each poll receives a weight based on pollster rating, sample size, and recency. Recent polls from A+ pollsters receive the highest weight.',
              },
              {
                step: 4,
                title: 'Weighted Average Calculation',
                description:
                  'We calculate the weighted average of all qualifying polls, with weights normalized to sum to 1.0.',
              },
              {
                step: 5,
                title: 'Trend Analysis',
                description:
                  'We apply LOWESS smoothing to identify genuine trends while filtering out statistical noise.',
              },
              {
                step: 6,
                title: 'Uncertainty Estimation',
                description:
                  'We calculate margins of error that account for both sampling error and historical pollster accuracy.',
              },
            ].map((item) => (
              <Card key={item.step}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Limitations */}
      <Section variant="muted">
        <Container size="md">
          <Card variant="elevated" padding="lg">
            <div className="flex gap-3">
              <AlertCircle className="h-6 w-6 text-orange-600 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-3">Limitations & Considerations</h3>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Polling is not a perfect science.</strong> Even the best polls
                    have margins of error, and unexpected events can shift races quickly.
                  </p>
                  <p>
                    <strong>Systematic errors</strong> can occur when polls consistently
                    miss certain groups of voters or fail to account for late-deciding voters.
                  </p>
                  <p>
                    <strong>Low-information races</strong> with limited polling may show high
                    volatility and lower forecast confidence.
                  </p>
                  <p>
                    <strong>Our averages reflect the state of the race at the time polls were
                    conducted</strong> - they are not predictions of future outcomes.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </Section>

      {/* Questions */}
      <Section variant="accent">
        <Container size="md">
          <Card variant="elevated" padding="lg" className="text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About Our Methodology?</h2>
            <p className="text-lg text-gray-600 mb-6">
              We're committed to transparency and welcome questions about our approach.
            </p>
            <a
              href="mailto:methodology@polltracker.com"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Contact Our Team
            </a>
          </Card>
        </Container>
      </Section>
    </>
  )
}
