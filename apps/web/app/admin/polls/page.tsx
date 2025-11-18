'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function AdminPollsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // TODO: Fetch polls from API
  const polls = getMockPolls()

  const filteredPolls = polls.filter(
    (poll) =>
      poll.raceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.pollster.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-sm text-muted-foreground">Total Polls</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">23</div>
            <div className="text-sm text-muted-foreground">Added Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">5</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">2</div>
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
                      <div className="font-medium">{poll.raceName}</div>
                      <div className="text-sm text-muted-foreground">{poll.raceType}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{poll.pollster}</div>
                      <div className="text-sm text-muted-foreground">{poll.methodology}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(poll.pollDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{poll.sampleSize.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          poll.status === 'published'
                            ? 'success'
                            : poll.status === 'pending'
                            ? 'warning'
                            : 'error'
                        }
                        size="sm"
                      >
                        {poll.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
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

function getMockPolls() {
  return [
    {
      id: '1',
      raceName: '2024 Pennsylvania Senate',
      raceType: 'Senate',
      pollster: 'Monmouth University',
      methodology: 'Phone',
      pollDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sampleSize: 1247,
      status: 'published',
    },
    {
      id: '2',
      raceName: '2024 Presidential',
      raceType: 'Presidential',
      pollster: 'Quinnipiac University',
      methodology: 'Phone',
      pollDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sampleSize: 1589,
      status: 'published',
    },
    {
      id: '3',
      raceName: '2024 Georgia Senate',
      raceType: 'Senate',
      pollster: 'Emerson College',
      methodology: 'Online',
      pollDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sampleSize: 983,
      status: 'pending',
    },
    {
      id: '4',
      raceName: '2024 Arizona Senate',
      raceType: 'Senate',
      pollster: 'Marist College',
      methodology: 'Phone',
      pollDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sampleSize: 1124,
      status: 'published',
    },
    {
      id: '5',
      raceName: '2024 Nevada Senate',
      raceType: 'Senate',
      pollster: 'Rasmussen Reports',
      methodology: 'IVR',
      pollDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      sampleSize: 750,
      status: 'flagged',
    },
  ]
}
