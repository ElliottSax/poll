import Link from 'next/link'

interface Poll {
  id: string
  race: {
    raceName: string
    slug: string
  }
  pollDate: string
  sampleSize: number
  results: Record<string, number>
  marginOfError?: number
}

interface PollsterRecentPollsProps {
  polls: Poll[]
}

export function PollsterRecentPolls({ polls }: PollsterRecentPollsProps) {
  if (polls.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No recent polls found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  )
}

function PollCard({ poll }: { poll: Poll }) {
  return (
    <Link
      href={`/races/${poll.race.slug}`}
      className="block bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold">{poll.race.raceName}</h4>
          <div className="text-sm text-muted-foreground mt-1">
            {new Date(poll.pollDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>n = {poll.sampleSize.toLocaleString()}</div>
          {poll.marginOfError && <div>MOE ±{poll.marginOfError}%</div>}
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(poll.results)
          .sort(([, a], [, b]) => b - a)
          .map(([candidate, percentage]) => (
            <div key={candidate} className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm font-medium min-w-[120px]">{candidate}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold w-12 text-right">{percentage}%</span>
            </div>
          ))}
      </div>
    </Link>
  )
}
