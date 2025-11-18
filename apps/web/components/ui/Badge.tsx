'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        primary: 'bg-blue-100 text-blue-900 hover:bg-blue-200',
        success: 'bg-green-100 text-green-900 hover:bg-green-200',
        warning: 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200',
        danger: 'bg-red-100 text-red-900 hover:bg-red-200',
        democrat: 'bg-blue-600 text-white',
        republican: 'bg-red-600 text-white',
        independent: 'bg-purple-600 text-white',
        outline: 'border border-gray-300 text-gray-900',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={badgeVariants({ variant, size, className })}
        {...props}
      >
        {dot && (
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
