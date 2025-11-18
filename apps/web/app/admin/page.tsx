import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Polling Dashboard',
  description: 'Manage polls, races, and pollsters.',
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin')
  }

  // TODO: Check if user has admin role
  // if (session.user.role !== 'admin') {
  //   redirect('/')
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">Manage polls, races, and pollsters</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Polls" value="1,247" change="+23 today" />
        <StatCard title="Active Races" value="87" change="3 new" />
        <StatCard title="Pollsters" value="156" change="2 pending" />
        <StatCard title="Active Users" value="12,543" change="+234 this week" />
      </div>

      {/* Admin Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminCard
          title="Manage Polls"
          description="Add, edit, or remove polls from the database"
          icon="📊"
          href="/admin/polls"
          stats="1,247 polls"
        />

        <AdminCard
          title="Manage Races"
          description="Create and configure election races"
          icon="🏛️"
          href="/admin/races"
          stats="87 active races"
        />

        <AdminCard
          title="Manage Pollsters"
          description="Update pollster information and ratings"
          icon="🏢"
          href="/admin/pollsters"
          stats="156 pollsters"
        />

        <AdminCard
          title="Run Forecasts"
          description="Trigger forecast calculations manually"
          icon="🎯"
          href="/admin/forecasts"
          stats="Updated 2h ago"
        />

        <AdminCard
          title="User Management"
          description="Manage user accounts and permissions"
          icon="👥"
          href="/admin/users"
          stats="12,543 users"
        />

        <AdminCard
          title="System Settings"
          description="Configure application settings"
          icon="⚙️"
          href="/admin/settings"
          stats="Last updated 1d ago"
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="bg-card border border-border rounded-lg divide-y">
          <ActivityItem
            action="Poll Added"
            description="Monmouth: Pennsylvania Senate"
            user="admin@example.com"
            time="5 minutes ago"
          />
          <ActivityItem
            action="Race Updated"
            description="Georgia Senate race settings changed"
            user="admin@example.com"
            time="1 hour ago"
          />
          <ActivityItem
            action="Forecast Run"
            description="Presidential forecast recalculated"
            user="System"
            time="2 hours ago"
          />
          <ActivityItem
            action="Pollster Updated"
            description="Quinnipiac rating changed to A-"
            user="admin@example.com"
            time="3 hours ago"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
}: {
  title: string
  value: string
  change: string
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <p className="text-xs text-muted-foreground">{change}</p>
    </div>
  )
}

function AdminCard({
  title,
  description,
  icon,
  href,
  stats,
}: {
  title: string
  description: string
  icon: string
  href: string
  stats: string
}) {
  return (
    <Link
      href={href}
      className="block bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="text-xs text-primary font-medium">{stats}</div>
    </Link>
  )
}

function ActivityItem({
  action,
  description,
  user,
  time,
}: {
  action: string
  description: string
  user: string
  time: string
}) {
  return (
    <div className="p-4 hover:bg-muted transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium mb-1">{action}</h4>
          <p className="text-sm text-muted-foreground mb-1">{description}</p>
          <div className="text-xs text-muted-foreground">
            by {user} · {time}
          </div>
        </div>
      </div>
    </div>
  )
}
