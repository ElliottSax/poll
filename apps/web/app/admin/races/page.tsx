'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'

interface Race {
  id: string
  slug: string
  raceName: string
  raceType: string
  state: string | null
  status: string
  electionDate: string
  competitiveRating: string | null
  _count?: { polls: number; candidates: number }
}

export default function AdminRacesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, active: 0, upcoming: 0, completed: 0 })

  useEffect(() => {
    async function fetchRaces() {
      try {
        const res = await fetch('/api/races?limit=100')
        if (res.ok) {
          const data = await res.json()
          const raceList = data.data || []
          setRaces(raceList)
          // Calculate stats
          setStats({
            total: raceList.length,
            active: raceList.filter((r: Race) => r.status === 'active').length,
            upcoming: raceList.filter((r: Race) => r.status === 'upcoming').length,
            completed: raceList.filter((r: Race) => r.status === 'completed').length,
          })
        }
      } catch (error) {
        console.error('Failed to fetch races:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRaces()
  }, [])

  const filteredRaces = races.filter((race) =>
    race.raceName.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="text-2xl font-bold">{loading ? '...' : stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Races</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{loading ? '...' : stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.upcoming}</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{loading ? '...' : stats.completed}</div>
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

function RaceCard({ race }: { race: Race }) {
  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg">{race.raceName}</CardTitle>
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
          {race.raceType} • {race.state || 'National'}
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
            <span className="font-medium">{race._count?.polls || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Candidates:</span>
            <span className="font-medium">{race._count?.candidates || 0}</span>
          </div>
          {race.competitiveRating && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rating:</span>
              <Badge variant="warning" size="sm">
                {race.competitiveRating}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/races/${race.slug}`} className="flex-1">
            <Button size="sm" variant="primary" className="w-full">
              Edit
            </Button>
          </Link>
          <Link href={`/races/${race.slug}`} className="flex-1">
            <Button size="sm" variant="default" className="w-full">
              View
            </Button>
          </Link>
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
