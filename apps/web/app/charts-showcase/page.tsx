import { Metadata } from 'next'
import { TrendChart } from '@/components/charts/TrendChart'
import { ProbabilityBar } from '@/components/charts/ProbabilityBar'
import { SeatDistribution } from '@/components/charts/SeatDistribution'
import { HeadToHeadRadial } from '@/components/charts/HeadToHeadRadial'
import { MomentumFlow } from '@/components/charts/MomentumFlow'
import { ElectoralMap } from '@/components/charts/ElectoralMap'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { BarChart3, TrendingUp, PieChart, Target, Activity, Map } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Charts Showcase - Premium Visualizations',
  description: 'Explore our premium poll visualizations and data charts',
}

// Sample data
const trendData = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(2024, 10, 1 + i * 3)
  return {
    date: date.toISOString(),
    'Candidate A': 48 + Math.random() * 4,
    'Candidate B': 46 + Math.random() * 4,
    'Undecided': 6 - Math.random() * 2
  }
})

const probabilityData = [
  { name: 'Candidate A', probability: 55.4, color: '#3b82f6' },
  { name: 'Candidate B', probability: 42.1, color: '#ef4444' },
  { name: 'Third Party', probability: 2.5, color: '#a855f7' }
]

const seatData = [
  { name: 'Democrats', value: 218, color: '#3b82f6' },
  { name: 'Republicans', value: 217, color: '#ef4444' }
]

const momentumData = Array.from({ length: 15 }, (_, i) => {
  const date = new Date(2024, 9, 1 + i * 2)
  const trend = i < 7 ? i * 0.5 : 7 * 0.5 - (i - 7) * 0.3
  return {
    date: date.toISOString(),
    candidate1: 47 + trend,
    candidate2: 45 - trend,
    spread: (47 + trend) - (45 - trend)
  }
})

const stateData = [
  { state: 'Pennsylvania', abbr: 'PA', electoralVotes: 19, status: 'tossup' as const, margin: 0.5, candidate1: 48.5, candidate2: 48.0 },
  { state: 'Michigan', abbr: 'MI', electoralVotes: 15, status: 'lean-d' as const, margin: 2.1, candidate1: 49.1, candidate2: 47.0 },
  { state: 'Wisconsin', abbr: 'WI', electoralVotes: 10, status: 'tossup' as const, margin: -0.3, candidate1: 47.8, candidate2: 48.1 },
  { state: 'Arizona', abbr: 'AZ', electoralVotes: 11, status: 'lean-r' as const, margin: -1.5, candidate1: 47.2, candidate2: 48.7 },
  { state: 'Georgia', abbr: 'GA', electoralVotes: 16, status: 'tossup' as const, margin: 0.1, candidate1: 48.1, candidate2: 48.0 },
  { state: 'Nevada', abbr: 'NV', electoralVotes: 6, status: 'lean-d' as const, margin: 1.8, candidate1: 48.9, candidate2: 47.1 },
  { state: 'North Carolina', abbr: 'NC', electoralVotes: 16, status: 'lean-r' as const, margin: -1.2, candidate1: 47.4, candidate2: 48.6 },
  { state: 'California', abbr: 'CA', electoralVotes: 54, status: 'safe-d' as const, margin: 15.0, candidate1: 57.5, candidate2: 42.5 },
  { state: 'Texas', abbr: 'TX', electoralVotes: 40, status: 'likely-r' as const, margin: -5.5, candidate1: 45.2, candidate2: 50.7 },
  { state: 'Florida', abbr: 'FL', electoralVotes: 30, status: 'likely-r' as const, margin: -4.2, candidate1: 46.9, candidate2: 51.1 },
  { state: 'New York', abbr: 'NY', electoralVotes: 28, status: 'safe-d' as const, margin: 12.0, candidate1: 56.0, candidate2: 44.0 },
  { state: 'Ohio', abbr: 'OH', electoralVotes: 17, status: 'likely-r' as const, margin: -3.8, candidate1: 46.1, candidate2: 49.9 }
]

export default function ChartsShowcasePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background border-b border-border/50 mb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-float">
            <BarChart3 className="w-24 h-24 text-primary" />
          </div>
          <div className="absolute bottom-10 right-20 animate-float" style={{ animationDelay: '1s' }}>
            <TrendingUp className="w-20 h-20 text-purple-500" />
          </div>
          <div className="absolute top-1/2 right-10 animate-float" style={{ animationDelay: '0.5s' }}>
            <PieChart className="w-16 h-16 text-primary" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 glass border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-slide-up">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-gradient-subtle">Premium Data Visualizations</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="text-gradient">Charts Showcase</span>
            </h1>

            <p className="text-xl text-muted-foreground animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Explore our collection of premium, interactive poll visualizations with advanced animations and effects.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <Tabs defaultValue="trend" variant="premium">
          <TabsList>
            <TabsTrigger value="trend" icon={<Activity className="w-4 h-4" />}>
              Trend Charts
            </TabsTrigger>
            <TabsTrigger value="comparison" icon={<Target className="w-4 h-4" />}>
              Comparisons
            </TabsTrigger>
            <TabsTrigger value="distribution" icon={<PieChart className="w-4 h-4" />}>
              Distributions
            </TabsTrigger>
            <TabsTrigger value="maps" icon={<Map className="w-4 h-4" />}>
              Electoral Maps
            </TabsTrigger>
          </TabsList>

          {/* Trend Charts Tab */}
          <TabsContent value="trend" className="space-y-12">
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Polling Trend Chart</h2>
                <p className="text-muted-foreground">
                  Interactive line chart showing polling trends over time with animated dots and glow effects
                </p>
              </div>
              <TrendChart
                data={trendData}
                lines={[
                  { dataKey: 'Candidate A', name: 'Candidate A', color: '#3b82f6' },
                  { dataKey: 'Candidate B', name: 'Candidate B', color: '#ef4444' },
                  { dataKey: 'Undecided', name: 'Undecided', color: '#a855f7' }
                ]}
                height={450}
                showArea={true}
              />
            </div>

            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Momentum Flow</h2>
                <p className="text-muted-foreground">
                  Advanced momentum visualization showing polling movement and trend indicators
                </p>
              </div>
              <MomentumFlow
                data={momentumData}
                candidate1Name="Candidate A"
                candidate2Name="Candidate B"
                candidate1Color="#3b82f6"
                candidate2Color="#ef4444"
                height={400}
              />
            </div>
          </TabsContent>

          {/* Comparisons Tab */}
          <TabsContent value="comparison" className="space-y-12">
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Head-to-Head Radial</h2>
                <p className="text-muted-foreground">
                  Circular comparison chart with animated arcs and interactive candidate cards
                </p>
              </div>
              <HeadToHeadRadial
                candidate1={{
                  name: 'Candidate A',
                  party: 'Democratic Party',
                  percentage: 51.3,
                  color: '#3b82f6',
                  trend: 2.1
                }}
                candidate2={{
                  name: 'Candidate B',
                  party: 'Republican Party',
                  percentage: 47.4,
                  color: '#ef4444',
                  trend: -1.5
                }}
                size={500}
              />
            </div>

            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Win Probability Bar</h2>
                <p className="text-muted-foreground">
                  3D-style horizontal bar chart with depth effects, shimmer animations, and glow
                </p>
              </div>
              <ProbabilityBar data={probabilityData} height={250} />
            </div>
          </TabsContent>

          {/* Distributions Tab */}
          <TabsContent value="distribution" className="space-y-12">
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">3D Seat Distribution</h2>
                <p className="text-muted-foreground">
                  Donut chart with custom 3D rendering, depth shadows, and radial gradients
                </p>
              </div>
              <SeatDistribution
                data={seatData}
                height={350}
                total={435}
                showRings={false}
              />
            </div>

            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Ring Visualization</h2>
                <p className="text-muted-foreground">
                  Alternative ring-style visualization with progress indicators and majority badges
                </p>
              </div>
              <SeatDistribution
                data={seatData}
                height={300}
                total={435}
                showRings={true}
              />
            </div>
          </TabsContent>

          {/* Electoral Maps Tab */}
          <TabsContent value="maps" className="space-y-12">
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Electoral College Map</h2>
                <p className="text-muted-foreground">
                  Interactive state-by-state breakdown with electoral vote totals and status indicators
                </p>
              </div>
              <ElectoralMap
                states={stateData}
                candidate1Name="Candidate A"
                candidate2Name="Candidate B"
                candidate1Color="#3b82f6"
                candidate2Color="#ef4444"
                showLegend={true}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Features grid */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-gradient">Premium Features</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Every chart includes advanced animations and interactions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: '3D Effects',
                description: 'Depth shadows, radial gradients, and layered rendering for realistic visuals',
                icon: '🎨'
              },
              {
                title: 'Smooth Animations',
                description: 'GPU-accelerated transitions with easing functions for buttery smooth motion',
                icon: '⚡'
              },
              {
                title: 'Interactive Tooltips',
                description: 'Glassmorphic tooltips with gradient accents and animated indicators',
                icon: '💬'
              },
              {
                title: 'Glow & Blur Effects',
                description: 'SVG filters with Gaussian blur for premium glow effects',
                icon: '✨'
              },
              {
                title: 'Responsive Design',
                description: 'Fully responsive charts that adapt to any screen size',
                icon: '📱'
              },
              {
                title: 'Custom Rendering',
                description: 'Custom SVG components for complete control over visual styling',
                icon: '🎯'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glass border border-border/50 rounded-xl p-6 hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
