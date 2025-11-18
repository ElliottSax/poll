import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export const metadata: Metadata = {
  title: 'Settings - Polling Dashboard',
  description: 'Manage your account settings, notifications, and preferences.',
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-lg text-muted-foreground">
          Manage your account preferences and notification settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue={session.user.name || ''}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={session.user.email || ''}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This email is used for account notifications
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  placeholder="City, State"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Email Notifications</h2>

              <div className="space-y-4">
                <NotificationToggle
                  label="New Poll Alerts"
                  description="Get notified when new polls are published for races you track"
                  defaultChecked={true}
                />
                <NotificationToggle
                  label="Race Rating Changes"
                  description="Alert me when race ratings change (e.g., Toss-up → Lean D)"
                  defaultChecked={true}
                />
                <NotificationToggle
                  label="Forecast Updates"
                  description="Daily updates on win probabilities for tracked races"
                  defaultChecked={false}
                />
                <NotificationToggle
                  label="Weekly Digest"
                  description="Summary of key race updates sent every Sunday"
                  defaultChecked={true}
                />
                <NotificationToggle
                  label="Breaking News"
                  description="Major election news and developments"
                  defaultChecked={true}
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Push Notifications</h2>

              <div className="space-y-4">
                <NotificationToggle
                  label="Real-time Updates"
                  description="Get push notifications for live race calls on election night"
                  defaultChecked={false}
                />
                <NotificationToggle
                  label="Mobile Alerts"
                  description="Enable push notifications on mobile devices"
                  defaultChecked={false}
                />
              </div>

              <div className="mt-6 p-4 bg-muted rounded">
                <p className="text-sm">
                  <strong>Note:</strong> Push notifications require browser permission. Click below
                  to enable.
                </p>
                <button className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
                  Enable Push Notifications
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Display Preferences</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>System</option>
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Default View</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Dashboard</option>
                    <option>Forecast</option>
                    <option>Races</option>
                    <option>Polls</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    The page you see when you first log in
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Race Display</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked={true} />
                      <span className="text-sm">Show poll averages by default</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked={true} />
                      <span className="text-sm">Show forecast probabilities</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked={false} />
                      <span className="text-sm">Show individual pollster grades</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Data Preferences</h2>

              <div className="space-y-4">
                <NotificationToggle
                  label="Show Partisan Polls"
                  description="Include polls from partisan pollsters in aggregates"
                  defaultChecked={false}
                />
                <NotificationToggle
                  label="Show Historical Data"
                  description="Display historical trend lines on race pages"
                  defaultChecked={true}
                />
                <NotificationToggle
                  label="Advanced Statistics"
                  description="Show confidence intervals, margin of error, and other technical details"
                  defaultChecked={false}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Account Security</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Connected Accounts</h3>
                  <div className="space-y-2">
                    <AccountConnection provider="Google" connected={true} />
                    <AccountConnection provider="GitHub" connected={false} />
                    <AccountConnection provider="Twitter" connected={false} />
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Password</h3>
                  <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                    Change Password
                  </button>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add an extra layer of security to your account
                  </p>
                  <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Privacy</h2>

              <div className="space-y-4">
                <NotificationToggle
                  label="Public Profile"
                  description="Make your profile visible to other users"
                  defaultChecked={false}
                />
                <NotificationToggle
                  label="Show Activity"
                  description="Display your tracked races and predictions publicly"
                  defaultChecked={false}
                />
                <NotificationToggle
                  label="Analytics"
                  description="Help us improve by sharing anonymous usage data"
                  defaultChecked={true}
                />
              </div>

              <div className="mt-6">
                <button className="text-sm text-primary hover:underline">
                  Download my data
                </button>
              </div>
            </div>

            <div className="bg-card border border-red-500 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2 text-red-600">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Irreversible actions that affect your account
              </p>

              <div className="space-y-3">
                <button className="px-4 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                  Delete All Data
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationToggle({
  label,
  description,
  defaultChecked,
}: {
  label: string
  description: string
  defaultChecked: boolean
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b">
      <div className="flex-1">
        <h4 className="font-medium mb-1">{label}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  )
}

function AccountConnection({ provider, connected }: { provider: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center gap-3">
        <span className="font-medium">{provider}</span>
        {connected && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Connected</span>
        )}
      </div>
      <button
        className={`px-3 py-1 text-sm rounded ${
          connected
            ? 'border border-border hover:bg-muted'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        } transition-colors`}
      >
        {connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  )
}
