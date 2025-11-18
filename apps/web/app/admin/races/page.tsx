'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'

export default function AdminRacesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // TODO: Fetch races from API
  const races = getMockRaces()

  const filteredRaces = races.filter((race) =>
    race.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Races</h1>
          <p className="text-lg text-muted-foreground">
            Create and configure election races
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin">
            <Button variant="default">← Back to Admin</Button>
          </Link>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add Race
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search races..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select className="px-3 py-2 border border-border rounded-md">
              <option>All Types</option>
              <option>Presidential</option>
              <option>Senate</option>
              <option>House</option>
              <option>Governor</option>
            </select>
            <select className="px-3 py-2 border border-border rounded-md">
              <option>All Status</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Upcoming</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">87</div>
            <div className="text-sm text-muted-foreground">Total Races</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">72</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">3</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Races Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRaces.map((race) => (
          <RaceCard key={race.id} race={race} />
        ))}
      </div>

      {/* Add Race Modal */}
      {showAddModal && <AddRaceModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}

function RaceCard({ race }: { race: any }) {
  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg">{race.name}</CardTitle>
          <Badge
            variant={
              race.status === 'active'
                ? 'success'
                : race.status === 'upcoming'
                ? 'info'
                : 'secondary'
            }
            size="sm"
          >
            {race.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {race.type} • {race.state || 'National'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Election Date:</span>
            <span className="font-medium">
              {new Date(race.electionDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Polls:</span>
            <span className="font-medium">{race.pollCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Candidates:</span>
            <span className="font-medium">{race.candidateCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rating:</span>
            <Badge variant="warning" size="sm">
              {race.rating}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="primary" className="flex-1">
            Edit
          </Button>
          <Button size="sm" variant="default" className="flex-1">
            View
          </Button>
          <Button size="sm" variant="destructive">
            🗑️
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AddRaceModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add New Race</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Race Name" placeholder="2024 Pennsylvania Senate" required />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Race Type</label>
              <select className="w-full px-3 py-2 border border-border rounded-md">
                <option>Presidential</option>
                <option>Senate</option>
                <option>House</option>
                <option>Governor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <select className="w-full px-3 py-2 border border-border rounded-md">
                <option value="">Select state...</option>
                <option>Pennsylvania</option>
                <option>Georgia</option>
                <option>Arizona</option>
                <option>Nevada</option>
              </select>
            </div>
          </div>

          <Input label="Election Date" type="date" required />

          <Input label="Slug" placeholder="pa-senate-2024" helperText="URL-friendly identifier" />

          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <select className="w-full px-3 py-2 border border-border rounded-md">
              <option>Solid D</option>
              <option>Likely D</option>
              <option>Lean D</option>
              <option>Toss-up</option>
              <option>Lean R</option>
              <option>Likely R</option>
              <option>Solid R</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Candidates (JSON)</label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md"
              rows={6}
              placeholder='[{"name": "John Doe", "party": "D"}, {"name": "Jane Smith", "party": "R"}]'
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary">Add Race</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getMockRaces() {
  return [
    {
      id: '1',
      name: '2024 Presidential Election',
      type: 'Presidential',
      state: null,
      status: 'active',
      electionDate: '2024-11-05',
      pollCount: 347,
      candidateCount: 2,
      rating: 'Toss-up',
    },
    {
      id: '2',
      name: '2024 Pennsylvania Senate',
      type: 'Senate',
      state: 'PA',
      status: 'active',
      electionDate: '2024-11-05',
      pollCount: 45,
      candidateCount: 2,
      rating: 'Lean D',
    },
    {
      id: '3',
      name: '2024 Georgia Senate',
      type: 'Senate',
      state: 'GA',
      status: 'active',
      electionDate: '2024-11-05',
      pollCount: 38,
      candidateCount: 2,
      rating: 'Toss-up',
    },
    {
      id: '4',
      name: '2024 Arizona Senate',
      type: 'Senate',
      state: 'AZ',
      status: 'active',
      electionDate: '2024-11-05',
      pollCount: 32,
      candidateCount: 3,
      rating: 'Toss-up',
    },
    {
      id: '5',
      name: '2024 Nevada Senate',
      type: 'Senate',
      state: 'NV',
      status: 'active',
      electionDate: '2024-11-05',
      pollCount: 28,
      candidateCount: 2,
      rating: 'Lean D',
    },
    {
      id: '6',
      name: '2024 Florida Senate',
      type: 'Senate',
      state: 'FL',
      status: 'active',
      electionDate: '2024-11-05',
      pollCount: 25,
      candidateCount: 2,
      rating: 'Lean R',
    },
  ]
}
