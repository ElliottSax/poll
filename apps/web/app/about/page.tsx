import { Metadata } from 'next'
import { Container, Section, Grid } from '@/components/layout/Container'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Target, TrendingUp, Users, Database, Shield, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About - Poll Tracker',
  description: 'Learn about Poll Tracker - our mission, methodology, and commitment to accurate, unbiased election polling data and analysis.',
  keywords: ['about poll tracker', 'polling methodology', 'election data', 'poll aggregation'],
  openGraph: {
    title: 'About - Poll Tracker',
    description: 'Learn about our mission and methodology for tracking election polls',
    type: 'website',
  },
}

export default function AboutPage() {
  const features = [
    {
      icon: Target,
      title: 'Accurate Aggregation',
      description:
        'We aggregate polls from hundreds of sources, weighting them by pollster quality and recency to provide the most accurate picture of each race.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Updates',
      description:
        'Our system updates continuously as new polls are published, ensuring you always have access to the latest data and trends.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Shield,
      title: 'Non-Partisan Analysis',
      description:
        'We maintain strict independence and objectivity, presenting data without bias or political preference.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Database,
      title: 'Comprehensive Database',
      description:
        'Access historical polling data going back decades, allowing for trend analysis and historical comparisons.',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Users,
      title: 'Pollster Ratings',
      description:
        'We rate pollsters based on historical accuracy and methodology, helping you identify the most reliable sources.',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      icon: Zap,
      title: 'Advanced Forecasting',
      description:
        'Our proprietary forecasting models combine polling data with fundamentals to predict election outcomes.',
      color: 'bg-cyan-100 text-cyan-600',
    },
  ]

  const stats = [
    { value: '200+', label: 'Pollsters Tracked' },
    { value: '500+', label: 'Active Races' },
    { value: '10K+', label: 'Polls Analyzed' },
    { value: '2.1%', label: 'Avg. Error Rate' },
  ]

  return (
    <>
      {/* Hero Section */}
      <Section variant="accent">
        <Container size="md" className="text-center">
          <Badge variant="outline" className="mb-4">About Us</Badge>
          <h1 className="text-5xl font-bold mb-6">
            Tracking Election Polls with Precision
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Poll Tracker is the leading source for comprehensive, accurate, and unbiased
            election polling data. We aggregate and analyze thousands of polls to give you
            the clearest picture of every race.
          </p>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section variant="default">
        <Container>
          <Grid cols={4} gap="md">
            {stats.map((stat, index) => (
              <Card key={index} variant="outline">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* Features Section */}
      <Section variant="muted">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Poll Tracker?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge data science with journalistic integrity to deliver
              the most comprehensive polling analysis available.
            </p>
          </div>

          <Grid cols={3} gap="lg">
            {features.map((feature, index) => (
              <Card key={index} hoverable>
                <CardContent className="pt-6">
                  <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* Mission Section */}
      <Section variant="default">
        <Container size="md">
          <Card variant="elevated" padding="lg">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Poll Tracker was founded with a simple mission: to provide voters, journalists,
                and political enthusiasts with the most accurate and comprehensive polling data
                available.
              </p>
              <p>
                In an era of information overload, we believe that quality data and objective
                analysis are more important than ever. We aggregate polls from hundreds of
                sources, apply rigorous quality controls, and present the data in clear,
                accessible formats.
              </p>
              <p>
                We maintain strict editorial independence and are committed to non-partisan
                analysis. Our goal is not to influence elections, but to help people understand
                them through data-driven insights.
              </p>
            </div>
          </Card>
        </Container>
      </Section>

      {/* Team Section */}
      <Section variant="muted">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built by Data Scientists & Journalists</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our team combines expertise in statistics, political science, and journalism
              to deliver the most accurate polling analysis.
            </p>
          </div>

          <Grid cols={3} gap="lg">
            <Card variant="outline">
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  DS
                </div>
                <h3 className="font-semibold text-lg mb-1">Data Science</h3>
                <p className="text-gray-600 text-sm">
                  Ph.D.s in statistics and machine learning
                </p>
              </CardContent>
            </Card>

            <Card variant="outline">
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  PS
                </div>
                <h3 className="font-semibold text-lg mb-1">Political Science</h3>
                <p className="text-gray-600 text-sm">
                  Experts in electoral systems and voting behavior
                </p>
              </CardContent>
            </Card>

            <Card variant="outline">
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  J
                </div>
                <h3 className="font-semibold text-lg mb-1">Journalism</h3>
                <p className="text-gray-600 text-sm">
                  Award-winning political journalists
                </p>
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </Section>

      {/* Contact CTA */}
      <Section variant="accent">
        <Container size="md">
          <Card variant="elevated" padding="lg" className="text-center">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600 mb-6">
              Questions about our methodology? Interested in using our data? We'd love to
              hear from you.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="mailto:contact@polltracker.com"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Contact Us
              </a>
              <a
                href="/methodology"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                View Methodology
              </a>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  )
}
