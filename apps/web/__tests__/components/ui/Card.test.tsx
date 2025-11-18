import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

describe('Card', () => {
  it('renders basic card', () => {
    const { container } = render(
      <Card>
        <CardContent>Test content</CardContent>
      </Card>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('border')
  })

  it('renders with all sub-components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test content</CardContent>
        <CardFooter>Test footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.getByText('Test footer')).toBeInTheDocument()
  })

  it('applies variant styles correctly', () => {
    const { rerender, container } = render(<Card variant="default">Content</Card>)
    expect(container.firstChild).toHaveClass('bg-white')

    rerender(<Card variant="outline">Content</Card>)
    expect(container.firstChild).toHaveClass('bg-transparent')

    rerender(<Card variant="elevated">Content</Card>)
    expect(container.firstChild).toHaveClass('shadow-md')
  })

  it('applies padding variants correctly', () => {
    const { rerender, container } = render(<Card padding="none">Content</Card>)
    expect(container.firstChild).toHaveClass('p-0')

    rerender(<Card padding="sm">Content</Card>)
    expect(container.firstChild).toHaveClass('p-4')

    rerender(<Card padding="md">Content</Card>)
    expect(container.firstChild).toHaveClass('p-6')

    rerender(<Card padding="lg">Content</Card>)
    expect(container.firstChild).toHaveClass('p-8')
  })

  it('applies hoverable styles when enabled', () => {
    const { container } = render(<Card hoverable>Content</Card>)
    expect(container.firstChild).toHaveClass('hover:shadow-lg')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Card ref={ref}>Content</Card>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('CardHeader', () => {
  it('renders with correct spacing', () => {
    const { container } = render(<CardHeader>Header content</CardHeader>)
    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'space-y-1.5')
  })
})

describe('CardTitle', () => {
  it('renders as h3 by default', () => {
    render(<CardTitle>Title</CardTitle>)
    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H3')
  })

  it('applies correct text styles', () => {
    const { container } = render(<CardTitle>Title</CardTitle>)
    expect(container.firstChild).toHaveClass('text-lg', 'font-semibold')
  })
})

describe('CardDescription', () => {
  it('renders as paragraph', () => {
    render(<CardDescription>Description</CardDescription>)
    const description = screen.getByText('Description')
    expect(description.tagName).toBe('P')
  })

  it('applies muted text color', () => {
    const { container } = render(<CardDescription>Description</CardDescription>)
    expect(container.firstChild).toHaveClass('text-gray-600')
  })
})

describe('CardContent', () => {
  it('renders children correctly', () => {
    render(
      <CardContent>
        <p>Content paragraph</p>
      </CardContent>
    )
    expect(screen.getByText('Content paragraph')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('renders with flex layout', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>)
    expect(container.firstChild).toHaveClass('flex', 'items-center')
  })
})
