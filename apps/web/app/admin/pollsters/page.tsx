'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import Link from 'next/link'

interface Pollster {
  id: string
  name: string
  slug: string
  methodologyGrade: string
  overallAccuracy: number | null
  pollCount: number
  sampleSizeAvg: number | null
  lastPollDate: string | null
}

export default function AdminPollstersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [pollsters, setPollsters] = useState<Pollster[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, aGrade: 0, bGrade: 0, cGrade: 0 })

  useEffect(() => {
    async function fetchPollsters() {
      try {
        const res = await fetch('/api/pollsters?limit=100')
        if (res.ok) {
          const data = await res.json()
          const list = data.data || []
          setPollsters(list)
          setStats({
            total: list.length,
            aGrade: list.filter((p: Pollster) => p.methodologyGrade?.startsWith('A')).length,
            bGrade: list.filter((p: Pollster) => p.methodologyGrade?.startsWith('B')).length,
            cGrade: list.filter((p: Pollster) => !p.methodologyGrade?.startsWith('A') && !p.methodologyGrade?.startsWith('B')).length,
          })
        }
      } catch (error) {
        console.error('Failed to fetch pollsters:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPollsters()
  }, [])

  const filteredPollsters = pollsters.filter((pollster) =>
    pollster.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Pollsters</h1>
          <p className="text-lg text-muted-foreground">
            Update pollster ratings, methodology, and information
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin">
            <Button variant="default">← Back to Admin</Button>
          </Link>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add Pollster
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search pollsters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select className="px-3 py-2 border border-border rounded-md">
              <option>All Grades</option>
              <option>A+</option>
              <option>A</option>
              <option>A-</option>
              <option>B+</option>
              <option>B</option>
              <option>C+</option>
            </select>
            <Button variant="default">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{loading ? '...' : stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Pollsters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{loading ? '...' : stats.aGrade}</div>
            <div className="text-sm text-muted-foreground">A-Grade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.bGrade}</div>
            <div className="text-sm text-muted-foreground">B-Grade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{loading ? '...' : stats.cGrade}</div>
            <div className="text-sm text-muted-foreground">C-Grade or Lower</div>
          </CardContent>
        </Card>
      </div>

      {/* Pollsters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPollsters.map((pollster) => (
          <PollsterCard key={pollster.id} pollster={pollster} />
        ))}
      </div>

      {/* Add Pollster Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Pollster"
          description="Enter pollster information and methodology details"
          size="lg"
        >
          <form className="space-y-4">
            <Input label="Pollster Name" placeholder="e.g., Monmouth University" required />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Slug" placeholder="e.g., monmouth" required />
              <div>
                <label className="block text-sm font-medium mb-2">Methodology Grade</label>
                <select className="w-full px-3 py-2 border border-border rounded-md">
                  <option>A+</option>
                  <option>A</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B</option>
                  <option>B-</option>
                  <option>C+</option>
                  <option>C</option>
                  <option>C-</option>
                  <option>D</option>
                  <option>F</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Historical Accuracy (%)"
                type="number"
                placeholder="94.2"
                step="0.1"
              />
              <Input label="Average Sample Size" type="number" placeholder="1247" />
            </div>

            <Input label="Website URL" type="url" placeholder="https://..." />

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md"
                rows={4}
                placeholder="Brief description of the pollster..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Methodology Types</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm">Phone (Live Caller)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm">Phone (IVR)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm">Online Panel</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm">Mixed Mode</span>
                </label>
              </div>
            </div>

            <ModalFooter>
              <Button variant="default" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary">Add Pollster</Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </div>
  )
}

function PollsterCard({ pollster }: { pollster: Pollster }) {
  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'secondary'
    const letter = grade.charAt(0)
    if (letter === 'A') return 'success'
    if (letter === 'B') return 'info'
    if (letter === 'C') return 'warning'
    return 'error'
  }

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg">{pollster.name}</CardTitle>
          <Badge variant={getGradeColor(pollster.methodologyGrade) as any} size="lg">
            {pollster.methodologyGrade || 'N/A'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Accuracy:</span>
            <span className="font-semibold">{pollster.overallAccuracy?.toFixed(1) || 'N/A'}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Polls:</span>
            <span className="font-semibold">{pollster.pollCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg Sample:</span>
            <span className="font-semibold">{pollster.sampleSizeAvg?.toLocaleString() || 'N/A'}</span>
          </div>
          {pollster.lastPollDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Poll:</span>
              <span className="text-xs">{new Date(pollster.lastPollDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/pollsters/${pollster.slug}`} className="flex-1">
            <Button size="sm" variant="primary" className="w-full">
              Edit
            </Button>
          </Link>
          <Link href={`/pollsters/${pollster.slug}`} className="flex-1">
            <Button size="sm" variant="default" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
