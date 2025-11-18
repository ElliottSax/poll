'use client'

import { RaceCard } from '@/components/features/RaceCard'
import { Grid } from '@/components/layout/Container'

// This will be replaced with actual data from API
const mockRaces = [
  {
    id: '1',
    slug: '2024-presidential',
    name: '2024 Presidential Election',
    state: 'National',
    office: 'President',
    year: 2024,
    candidates: [
      {
        id: 'biden',
        name: 'Joe Biden',
        party: 'democrat' as const,
        percentage: 48.2,
        trend: 'stable' as const
      },
      {
        id: 'trump',
        name: 'Donald Trump',
        party: 'republican' as const,
        percentage: 47.8,
        trend: 'stable' as const
      },
    ],
    pollCount: 127,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '2',
    slug: 'pa-senate-2024',
    name: 'Pennsylvania Senate Race',
    state: 'Pennsylvania',
    office: 'U.S. Senate',
    year: 2024,
    candidates: [
      {
        id: 'casey',
        name: 'Bob Casey',
        party: 'democrat' as const,
        percentage: 49.5,
        trend: 'up' as const,
        trendValue: 1.2
      },
      {
        id: 'mccormick',
        name: 'Dave McCormick',
        party: 'republican' as const,
        percentage: 45.2,
        trend: 'down' as const,
        trendValue: -0.8
      },
    ],
    pollCount: 23,
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: '3',
    slug: 'ga-senate-2024',
    name: 'Georgia Senate Race',
    state: 'Georgia',
    office: 'U.S. Senate',
    year: 2024,
    candidates: [
      {
        id: 'warnock',
        name: 'Raphael Warnock',
        party: 'democrat' as const,
        percentage: 48.7,
        trend: 'up' as const,
        trendValue: 0.5
      },
      {
        id: 'walker',
        name: 'Herschel Walker',
        party: 'republican' as const,
        percentage: 48.1,
        trend: 'stable' as const
      },
    ],
    pollCount: 31,
    lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
]

export function FeaturedRaces() {
  return (
    <Grid cols={3} gap="lg">
      {mockRaces.map((race) => (
        <RaceCard
          key={race.id}
          id={race.id}
          title={race.name}
          state={race.state}
          office={race.office}
          year={race.year}
          candidates={race.candidates}
          lastUpdated={race.lastUpdated}
          pollCount={race.pollCount}
          href={`/races/${race.slug}`}
        />
      ))}
    </Grid>
  )
}
