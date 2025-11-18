import { render, screen, fireEvent } from '@testing-library/react'
import { PollTable } from '@/components/features/PollTable'

const mockPolls = [
  {
    id: '1',
    pollster: 'Example Polling',
    pollsterGrade: 'A' as const,
    date: new Date('2024-01-15'),
    sampleSize: 1200,
    methodology: 'LV' as const,
    results: [
      { candidateId: 'c1', candidateName: 'Jane Smith', party: 'democrat' as const, percentage: 52.0 },
      { candidateId: 'c2', candidateName: 'John Doe', party: 'republican' as const, percentage: 46.0 },
    ],
  },
  {
    id: '2',
    pollster: 'Another Poll Co',
    pollsterGrade: 'B+' as const,
    date: new Date('2024-01-10'),
    sampleSize: 800,
    methodology: 'RV' as const,
    results: [
      { candidateId: 'c1', candidateName: 'Jane Smith', party: 'democrat' as const, percentage: 50.0 },
      { candidateId: 'c2', candidateName: 'John Doe', party: 'republican' as const, percentage: 48.0 },
    ],
    sponsor: 'Local News Network',
  },
]

describe('PollTable', () => {
  describe('Desktop view', () => {
    it('renders table with poll data', () => {
      render(<PollTable polls={mockPolls} />)

      expect(screen.getByText('Example Polling')).toBeInTheDocument()
      expect(screen.getByText('Another Poll Co')).toBeInTheDocument()
    })

    it('displays pollster grades', () => {
      render(<PollTable polls={mockPolls} showGrade />)

      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B+')).toBeInTheDocument()
    })

    it('shows sample sizes and methodology', () => {
      render(<PollTable polls={mockPolls} />)

      expect(screen.getByText('1,200')).toBeInTheDocument()
      expect(screen.getByText('800')).toBeInTheDocument()
      expect(screen.getByText('LV')).toBeInTheDocument()
      expect(screen.getByText('RV')).toBeInTheDocument()
    })

    it('displays poll results for all candidates', () => {
      render(<PollTable polls={mockPolls} />)

      expect(screen.getByText('52.0%')).toBeInTheDocument()
      expect(screen.getByText('46.0%')).toBeInTheDocument()
      expect(screen.getByText('50.0%')).toBeInTheDocument()
      expect(screen.getByText('48.0%')).toBeInTheDocument()
    })

    it('sorts by date by default (descending)', () => {
      const { container } = render(<PollTable polls={mockPolls} />)
      const rows = container.querySelectorAll('tbody tr')

      // First row should be the most recent poll (Jan 15)
      expect(rows[0]).toHaveTextContent('Example Polling')
    })

    it('allows sorting by pollster name', () => {
      render(<PollTable polls={mockPolls} />)

      const pollsterHeader = screen.getByRole('button', { name: /pollster/i })
      fireEvent.click(pollsterHeader)

      // After clicking, polls should be sorted by pollster name
      const rows = screen.getAllByRole('row')
      // "Another Poll Co" should come before "Example Polling" alphabetically
      expect(rows[1]).toHaveTextContent('Another Poll Co')
    })

    it('allows sorting by sample size', () => {
      render(<PollTable polls={mockPolls} />)

      const sampleHeader = screen.getByRole('button', { name: /sample/i })
      fireEvent.click(sampleHeader)

      // Should sort by sample size (descending after click)
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('1,200')
    })

    it('toggles sort direction when clicking same header', () => {
      render(<PollTable polls={mockPolls} />)

      const dateHeader = screen.getByRole('button', { name: /date/i })

      // First click: ascending
      fireEvent.click(dateHeader)
      let rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Another Poll Co') // Jan 10

      // Second click: back to descending
      fireEvent.click(dateHeader)
      rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Example Polling') // Jan 15
    })

    it('displays sponsor information when available', () => {
      render(<PollTable polls={mockPolls} />)

      expect(screen.getByText(/Local News Network/)).toBeInTheDocument()
    })

    it('shows external link for polls with URLs', () => {
      const pollsWithUrl = [
        { ...mockPolls[0], url: 'https://example.com/poll1' },
      ]

      render(<PollTable polls={pollsWithUrl} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'https://example.com/poll1')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  describe('Compact view', () => {
    it('renders card-based layout', () => {
      const { container } = render(<PollTable polls={mockPolls} compact />)

      // Check for card structure instead of table
      expect(container.querySelector('table')).not.toBeInTheDocument()
      expect(screen.getByText('Example Polling')).toBeInTheDocument()
    })

    it('displays all poll information in cards', () => {
      render(<PollTable polls={mockPolls} compact />)

      expect(screen.getByText('Example Polling')).toBeInTheDocument()
      expect(screen.getByText(/n=1,200/)).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('52.0%')).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('shows empty state when no polls provided', () => {
      render(<PollTable polls={[]} />)

      expect(screen.getByText('No polls found')).toBeInTheDocument()
    })
  })

  describe('Grade colors', () => {
    it('applies correct color variants based on grade', () => {
      render(<PollTable polls={mockPolls} showGrade />)

      // A grade should have success variant
      const aGrade = screen.getByText('A')
      expect(aGrade.className).toContain('success')

      // B+ grade should have info variant
      const bPlusGrade = screen.getByText('B+')
      expect(bPlusGrade.className).toContain('info')
    })
  })
})
