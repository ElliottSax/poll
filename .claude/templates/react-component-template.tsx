// Template for creating new React components (Track 3: Frontend Components)
// Copy this file and modify for your specific component

'use client'

import { useState, useEffect } from 'react'
// import { useQuery } from '@tanstack/react-query'

// Define component props interface
interface ExampleComponentProps {
  title: string
  description?: string
  onAction?: () => void
  className?: string
  // Add your props here
}

/**
 * ExampleComponent
 *
 * Description of what this component does...
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export function ExampleComponent({
  title,
  description,
  onAction,
  className = '',
}: ExampleComponentProps) {
  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data fetching with React Query (example)
  // const { data, isLoading, error } = useQuery({
  //   queryKey: ['example', id],
  //   queryFn: () => fetch(`/api/example/${id}`).then(res => res.json()),
  // })

  // Effects
  useEffect(() => {
    // Component lifecycle logic here
  }, [])

  // Event handlers
  const handleClick = () => {
    if (onAction) {
      onAction()
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  // Main render
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>

      {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}

      <button
        onClick={handleClick}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Click Me
      </button>

      {/* Add your component content here */}
    </div>
  )
}

// Export default if needed
export default ExampleComponent

// Optional: Export sub-components or variants
export function ExampleComponentCompact(props: ExampleComponentProps) {
  return <ExampleComponent {...props} className="p-2" />
}

/**
 * Usage example:
 *
 * <ExampleComponent
 *   title="My Component"
 *   description="This is an example"
 *   onAction={() => console.log('Clicked!')}
 * />
 */
