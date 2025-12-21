import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

interface Pollster {
  id: string
  name: string
  slug: string
  overallAccuracy: number
  methodologyGrade: string
  pollCount: number
  lastPollDate: string
}

interface PollsterListProps {
  orderBy?: 'accuracy' | 'pollCount' | 'grade' | 'name'
}

async function fetchPollsters(orderBy: string): Promise<Pollster[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pollsters?orderBy=${orderBy}&limit=50`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch pollsters:', error)
    return []
  }
}

export async function PollsterList({ orderBy = 'accuracy' }: PollsterListProps) {
  // API already sorts by orderBy parameter
  const pollsters = await fetchPollsters(orderBy)

  if (pollsters.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
        No pollsters available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b text-sm font-semibold text-muted-foreground">
        <div className="col-span-1">Rank</div>
        <div className="col-span-4">Pollster</div>
        <div className="col-span-2">Grade</div>
        <div className="col-span-2">Accuracy</div>
        <div className="col-span-2">Polls</div>
        <div className="col-span-1">Last Poll</div>
      </div>

      {/* Pollster Rows */}
      {pollsters.map((pollster, index) => (
        <PollsterRow key={pollster.id} pollster={pollster} rank={index + 1} />
      ))}
    </div>
  )
}

function PollsterRow({ pollster, rank }: { pollster: Pollster; rank: number }) {
  const getGradeColor = (grade: string) => {
    const letter = grade.charAt(0)
    if (letter === 'A') return 'success'
    if (letter === 'B') return 'info'
    if (letter === 'C') return 'warning'
    return 'error'
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  return (
    <Link
      href={`/pollsters/${pollster.slug}`}
      className="grid grid-cols-12 gap-4 px-4 py-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
    >
      <div className="col-span-1 flex items-center font-semibold">
        {getRankBadge(rank)}
      </div>

      <div className="col-span-4 flex items-center">
        <div>
          <div className="font-semibold">{pollster.name}</div>
          <div className="text-sm text-muted-foreground">
            {pollster.pollCount} polls conducted
          </div>
        </div>
      </div>

      <div className="col-span-2 flex items-center">
        <Badge variant={getGradeColor(pollster.methodologyGrade) as any} size="lg">
          {pollster.methodologyGrade}
        </Badge>
      </div>

      <div className="col-span-2 flex items-center">
        <div>
          <div className="text-2xl font-bold">{pollster.overallAccuracy.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Historical</div>
        </div>
      </div>

      <div className="col-span-2 flex items-center text-center">
        <div>
          <div className="text-xl font-semibold">{pollster.pollCount}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>

      <div className="col-span-1 flex items-center text-xs text-muted-foreground">
        {new Date(pollster.lastPollDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </div>
    </Link>
  )
}
