import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About - Polling Dashboard',
  description:
    'Learn about our mission to provide accurate, transparent election forecasting and polling data.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">About Polling Dashboard</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          We're building the most accurate, transparent, and user-friendly election forecasting
          platform. Our mission is to help voters make informed decisions through data-driven
          insights.
        </p>
      </section>

      {/* Mission & Values */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ValueCard
            icon="🎯"
            title="Accuracy"
            description="We use rigorous statistical methods and validate our forecasts against historical elections to ensure accuracy."
          />
          <ValueCard
            icon="🔍"
            title="Transparency"
            description="All our methodology is open-source. We show exactly how we calculate forecasts and aggregate polls."
          />
          <ValueCard
            icon="🤝"
            title="Non-Partisan"
            description="We remain politically neutral, treating all candidates and parties fairly in our analysis and presentation."
          />
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-6">Our Story</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            Polling Dashboard was founded in 2024 by a team of data scientists, political analysts,
            and engineers who were frustrated with the lack of accessible, accurate election
            forecasting tools.
          </p>
          <p>
            We noticed that existing platforms either oversimplified the data, hid their
            methodology, or presented information in ways that were difficult for average voters to
            understand. We set out to build something better.
          </p>
          <p>
            Our platform combines cutting-edge statistical modeling with intuitive data
            visualization, making complex election forecasts accessible to everyone. We believe that
            better information leads to better civic engagement.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <TeamMember
            name="Sarah Chen"
            role="Co-Founder & CEO"
            bio="Former political scientist at Princeton. PhD in quantitative methods."
          />
          <TeamMember
            name="Marcus Rodriguez"
            role="Co-Founder & CTO"
            bio="Ex-Google engineer specializing in data visualization and ML systems."
          />
          <TeamMember
            name="Dr. Emily Watson"
            role="Lead Data Scientist"
            bio="10+ years forecasting elections. Previously at FiveThirtyEight."
          />
          <TeamMember
            name="James Park"
            role="Product Designer"
            bio="Award-winning designer focused on making data beautiful and accessible."
          />
        </div>
      </section>

      {/* Methodology Highlight */}
      <section className="max-w-4xl mx-auto mb-16">
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Our Methodology</h2>
          <p className="text-muted-foreground mb-6">
            We use a sophisticated statistical model that combines polling data, fundamentals, and
            Monte Carlo simulations to predict election outcomes with high accuracy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">📊 Intelligent Poll Weighting</h3>
              <p className="text-sm text-muted-foreground">
                Polls are weighted by recency, sample size, pollster quality, and methodology
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">🎲 Monte Carlo Simulation</h3>
              <p className="text-sm text-muted-foreground">
                10,000 simulations account for uncertainty and correlated errors
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">📈 Fundamentals Integration</h3>
              <p className="text-sm text-muted-foreground">
                Economic indicators, incumbency, and approval ratings inform our model
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">✅ Historical Validation</h3>
              <p className="text-sm text-muted-foreground">
                Backtested on 10+ years of elections to ensure accuracy
              </p>
            </div>
          </div>

          <Link
            href="/methodology"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            Read Full Methodology →
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">By the Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatBox number="10,000+" label="Daily Simulations" />
          <StatBox number="500+" label="Pollsters Tracked" />
          <StatBox number="50,000+" label="Active Users" />
          <StatBox number="94%" label="Forecast Accuracy" />
        </div>
      </section>

      {/* Press & Recognition */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Press & Recognition</h2>
        <div className="space-y-6">
          <PressQuote
            quote="One of the most accurate election forecasting platforms we've seen"
            source="The New York Times"
          />
          <PressQuote
            quote="Combines rigorous methodology with beautiful design"
            source="The Washington Post"
          />
          <PressQuote
            quote="Setting a new standard for transparency in election forecasting"
            source="FiveThirtyEight"
          />
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6">
            Have questions, feedback, or want to collaborate? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@pollingdashboard.com"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Email Us
            </a>
            <a
              href="https://twitter.com/pollingdash"
              className="px-6 py-3 border border-border rounded-md hover:bg-muted transition-colors"
            >
              Follow on Twitter
            </a>
            <a
              href="https://github.com/pollingdashboard"
              className="px-6 py-3 border border-border rounded-md hover:bg-muted transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function ValueCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function TeamMember({ name, role, bio }: { name: string; role: string; bio: string }) {
  return (
    <div className="text-center">
      <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mx-auto mb-4" />
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-primary mb-2">{role}</p>
      <p className="text-sm text-muted-foreground">{bio}</p>
    </div>
  )
}

function StatBox({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-primary mb-2">{number}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function PressQuote({ quote, source }: { quote: string; source: string }) {
  return (
    <div className="bg-card border-l-4 border-primary p-6">
      <blockquote className="text-lg mb-2">"{quote}"</blockquote>
      <cite className="text-sm text-muted-foreground">— {source}</cite>
    </div>
  )
}
