import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dashboard - Polling Dashboard',
  description: 'Track your favorite races and get personalized election updates.',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin')
  }

  const trackedRaces = await getTrackedRaces(session.user.id)
  const recentAlerts = await getRecentAlerts(session.user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {session.user.name}!</h1>
        <p className="text-lg text-muted-foreground">
          Your personalized election tracking dashboard
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Tracked Races"
          value={trackedRaces.length}
          icon="📊"
          href="/dashboard/races"
        />
        <StatCard title="New Polls Today" value={12} icon="📈" href="/races" />
        <StatCard title="Active Alerts" value={3} icon="🔔" href="/dashboard/alerts" />
        <StatCard
          title="Days to Election"
          value={Math.ceil((new Date('2024-11-05').getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
          icon="📅"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tracked Races */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Your Tracked Races</h2>
              <Link
                href="/races"
                className="text-sm text-primary hover:underline font-medium"
              >
                Browse all races →
              </Link>
            </div>

            {trackedRaces.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  You're not tracking any races yet.
                </p>
                <Link
                  href="/races"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Browse Races
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {trackedRaces.map((race: any) => (
                  <TrackedRaceCard key={race.id} race={race} />
                ))}
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="bg-card border border-border rounded-lg divide-y">
              <ActivityItem
                type="poll"
                title="New Poll Published"
                description="Monmouth: Pennsylvania Senate Race"
                time="2 hours ago"
                icon="📊"
              />
              <ActivityItem
                type="forecast"
                title="Forecast Updated"
                description="Presidential race forecast updated with new polls"
                time="5 hours ago"
                icon="🎯"
              />
              <ActivityItem
                type="alert"
                title="Rating Changed"
                description="Arizona Senate moved to Toss-up"
                time="1 day ago"
                icon="🚨"
              />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Alerts */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Active Alerts</h3>
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              {recentAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active alerts</p>
              ) : (
                recentAlerts.map((alert: any, idx: number) => (
                  <AlertItem key={idx} alert={alert} />
                ))
              )}
              <Link
                href="/settings/notifications"
                className="block text-center text-sm text-primary hover:underline font-medium mt-3"
              >
                Manage Alerts
              </Link>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickActionButton href="/forecast" icon="🎯" text="View Forecast" />
              <QuickActionButton href="/methodology" icon="📚" text="Methodology" />
              <QuickActionButton href="/pollsters" icon="📊" text="Pollster Rankings" />
              <QuickActionButton href="/settings" icon="⚙️" text="Settings" />
            </div>
          </section>

          {/* Subscription CTA */}
          <section>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Upgrade to Premium</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get advanced features, real-time alerts, and ad-free experience
              </p>
              <button className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Learn More
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// Helper components
function StatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string
  value: number | string
  icon: string
  href?: string
}) {
  const content = (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

function TrackedRaceCard({ race }: { race: any }) {
  return (
    <Link
      href={`/races/${race.slug}`}
      className="block bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{race.raceName}</h3>
          <p className="text-sm text-muted-foreground">{race.state}</p>
        </div>
        <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
          {race.rating}
        </span>
      </div>

      <div className="space-y-2">
        {race.candidates?.map((candidate: any) => (
          <div key={candidate.name} className="flex items-center justify-between text-sm">
            <span className={candidate.party === 'D' ? 'text-democrat' : 'text-republican'}>
              {candidate.name} ({candidate.party})
            </span>
            <span className="font-semibold">{candidate.polling}%</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
        Last updated: {new Date(race.lastUpdated).toLocaleDateString()}
      </div>
    </Link>
  )
}

function ActivityItem({
  type,
  title,
  description,
  time,
  icon,
}: {
  type: string
  title: string
  description: string
  time: string
  icon: string
}) {
  return (
    <div className="p-4 hover:bg-muted transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h4 className="font-medium mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground mb-1">{description}</p>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </div>
    </div>
  )
}

function AlertItem({ alert }: { alert: any }) {
  return (
    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm">{alert.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </div>
    </div>
  )
}

function QuickActionButton({ href, icon, text }: { href: string; icon: string; text: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 bg-card border border-border rounded hover:border-primary transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{text}</span>
    </Link>
  )
}

// Data fetching functions
async function getTrackedRaces(userId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/tracked-races`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      // Fallback: fetch all active races if user endpoint not available
      const racesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/races?status=active&limit=5`, {
        next: { revalidate: 60 },
      })
      if (racesRes.ok) {
        const data = await racesRes.json()
        return data.data || []
      }
      return []
    }
    return res.json()
  } catch (error) {
    console.error('Failed to fetch tracked races:', error)
    return []
  }
}

async function getRecentAlerts(userId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/alerts`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
    return []
  }
}
