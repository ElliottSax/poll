'use client'

import { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const spinnerVariants = cva('animate-spin rounded-full border-2 border-current', {
  variants: {
    size: {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-2',
      lg: 'h-12 w-12 border-3',
      xl: 'h-16 w-16 border-4',
    },
    variant: {
      primary: 'border-blue-600 border-t-transparent',
      secondary: 'border-gray-600 border-t-transparent',
      white: 'border-white border-t-transparent',
      light: 'border-gray-300 border-t-transparent',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
})

export interface LoadingSpinnerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {
  label?: string
  fullScreen?: boolean
}

export function LoadingSpinner({
  className,
  size,
  variant,
  label = 'Loading...',
  fullScreen = false,
  ...props
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-label={label}
      className={`inline-block ${className || ''}`}
      {...props}
    >
      <div className={spinnerVariants({ size, variant })} />
      <span className="sr-only">{label}</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
        {label && <p className="ml-3 text-sm text-gray-600">{label}</p>}
      </div>
    )
  }

  return spinner
}

// Preset loading states for common use cases
export function PageLoader() {
  return <LoadingSpinner size="lg" fullScreen label="Loading page..." />
}

export function ButtonLoader() {
  return <LoadingSpinner size="sm" variant="white" label="Processing..." />
}

export function InlineLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-4">
      <LoadingSpinner size="sm" label={label} />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  )
}
