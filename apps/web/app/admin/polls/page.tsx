'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'

interface Poll {
  id: string
  pollDate: string
  sampleSize: number | null
  methodology: string | null
  isVerified: boolean
  isOutlier: boolean
  race: {
    slug: string
    raceName: string
    raceType: string
  }
  pollster: {
    name: string
    slug: string
  }
}

export default function AdminPollsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, today: 0, pending: 0, flagged: 0 })

  useEffect(() => {
    async function fetchPolls() {
      try {
        const res = await fetch('/api/polls?limit=100')
        if (res.ok) {
          const data = await res.json()
          const list = data.data || []
          setPolls(list)
          const today = new Date().toDateString()
          setStats({
            total: data.meta?.total || list.length,
            today: list.filter((p: Poll) => new Date(p.pollDate).toDateString() === today).length,
            pending: list.filter((p: Poll) => !p.isVerified).length,
            flagged: list.filter((p: Poll) => p.isOutlier).length,
          })
        }
      } catch (error) {
        console.error('Failed to fetch polls:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPolls()
  }, [])

  const filteredPolls = polls.filter(
    (poll) =>
      poll.race?.raceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.pollster?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Polls</h1>
          <p className="text-lg text-muted-foreground">
            Add, edit, or remove polls from the database
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          + Add Poll
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by race or pollster..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="default">Filter</Button>
            <Button variant="default">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{loading ? '...' : stats.total.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Polls</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{loading ? '...' : stats.today}</div>
            <div className="text-sm text-muted-foreground">Added Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{loading ? '...' : stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{loading ? '...' : stats.flagged}</div>
            <div className="text-sm text-muted-foreground">Flagged</div>
          </CardContent>
        </Card>
      </div>

      {/* Polls Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Polls ({filteredPolls.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Race</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Pollster</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Sample</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPolls.map((poll) => (
                  <tr key={poll.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{poll.race?.raceName || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{poll.race?.raceType}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{poll.pollster?.name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{poll.methodology || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(poll.pollDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{poll.sampleSize?.toLocaleString() || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          poll.isVerified
                            ? 'success'
                            : poll.isOutlier
                            ? 'error'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {poll.isVerified ? 'verified' : poll.isOutlier ? 'flagged' : 'pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/polls/${poll.id}`}>
                          <Button size="sm" variant="ghost">
                            Edit
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Poll Modal */}
      {showAddModal && (
        <AddPollModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}

function AddPollModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add New Poll</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Race" placeholder="Select race..." required />
          <Input label="Pollster" placeholder="Select pollster..." required />
          <Input label="Poll Date" type="date" required />
          <Input label="Sample Size" type="number" placeholder="1000" required />
          <Input label="Margin of Error" type="number" placeholder="3.5" step="0.1" />
          <Input label="Methodology" placeholder="Phone, Online, IVR, etc." />

          <div>
            <label className="block text-sm font-medium mb-2">Results (JSON)</label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md"
              rows={6}
              placeholder='{"Candidate A": 48.5, "Candidate B": 45.2, "Other": 6.3}'
            />
          </div>

          <Input label="Source URL" placeholder="https://..." />

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary">Add Poll</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
