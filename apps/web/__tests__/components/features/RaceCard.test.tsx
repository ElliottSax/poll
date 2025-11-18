import { render, screen } from '@testing-library/react'
import { RaceCard } from '@/components/features/RaceCard'

const mockCandidates = [
  {
    id: '1',
    name: 'Jane Smith',
    party: 'democrat' as const,
    percentage: 52.3,
    trend: 'up' as const,
    trendValue: 2.1,
  },
  {
    id: '2',
    name: 'John Doe',
    party: 'republican' as const,
    percentage: 45.7,
    trend: 'down' as const,
    trendValue: -1.5,
  },
]

describe('RaceCard', () => {
  it('renders race information correctly', () => {
    render(
      <RaceCard
        id="race-1"
        title="2024 Senate Race"
        state="Pennsylvania"
        office="U.S. Senate"
        year={2024}
        candidates={mockCandidates}
      />
    )

    expect(screen.getByText('2024 Senate Race')).toBeInTheDocument()
    expect(screen.getByText(/Pennsylvania/)).toBeInTheDocument()
    expect(screen.getByText(/U.S. Senate/)).toBeInTheDocument()
  })

  it('displays candidates sorted by percentage', () => {
    render(
      <RaceCard
        id="race-1"
        title="Test Race"
        state="Test State"
        office="Test Office"
        year={2024}
        candidates={mockCandidates}
      />
    )

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('52.3%')).toBeInTheDocument()
    expect(screen.getByText('45.7%')).toBeInTheDocument()
  })

  it('shows margin between leading candidates', () => {
    render(
      <RaceCard
        id="race-1"
        title="Test Race"
        state="Test State"
        office="Test Office"
        year={2024}
        candidates={mockCandidates}
      />
    )

    // Margin should be 52.3 - 45.7 = 6.6
    expect(screen.getByText('+6.6')).toBeInTheDocument()
  })

  it('displays trend indicators', () => {
    const { container } = render(
      <RaceCard
        id="race-1"
        title="Test Race"
        state="Test State"
        office="Test Office"
        year={2024}
        candidates={mockCandidates}
      />
    )

    // Check for trend values
    expect(screen.getByText('2.1')).toBeInTheDocument()
    expect(screen.getByText('1.5')).toBeInTheDocument()
  })

  it('displays last updated and poll count', () => {
    const lastUpdated = new Date('2024-01-15')
    render(
      <RaceCard
        id="race-1"
        title="Test Race"
        state="Test State"
        office="Test Office"
        year={2024}
        candidates={mockCandidates}
        lastUpdated={lastUpdated}
        pollCount={15}
      />
    )

    expect(screen.getByText(/Updated/)).toBeInTheDocument()
    expect(screen.getByText('15 polls')).toBeInTheDocument()
  })

  it('renders as clickable link when href is provided', () => {
    render(
      <RaceCard
        id="race-1"
        title="Test Race"
        state="Test State"
        office="Test Office"
        year={2024}
        candidates={mockCandidates}
        href="/races/test-race"
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/races/test-race')
  })

  it('renders in compact mode without progress bars', () => {
    const { container } = render(
      <RaceCard
        id="race-1"
        title="Test Race"
        state="Test State"
        office="Test Office"
        year={2024}
        candidates={mockCandidates}
        compact
      />
    )

    // Check that progress bars are not rendered
    const progressBars = container.querySelectorAll('.bg-gray-200')
    expect(progressBars.length).toBe(0)
  })

  it('displays party badges correctly', () => {
    render(
      <RaceCard
        id="race-1"
        title="Test Race"
        state="Test State"
        office="Test Office"
        year={2024}
        candidates={mockCandidates}
      />
    )

    // Check for party badge initials (D and R)
    const badges = screen.getAllByText(/^[DRI]$/)
    expect(badges.length).toBeGreaterThanOrEqual(2)
  })
})
