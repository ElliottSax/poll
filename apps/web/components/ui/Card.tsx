'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'rounded-lg border bg-white text-gray-900 shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-gray-200',
        outline: 'border-gray-300',
        elevated: 'border-gray-200 shadow-md',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hoverable?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => {
    const hoverClass = hoverable ? 'transition-shadow hover:shadow-lg cursor-pointer' : ''

    return (
      <div
        ref={ref}
        className={cardVariants({
          variant,
          padding,
          className: `${hoverClass} ${className || ''}`,
        })}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

// Card sub-components for better composition
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col space-y-1.5 ${className || ''}`}
        {...props}
      />
    )
  }
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`text-xl font-semibold leading-none tracking-tight ${className || ''}`}
        {...props}
      />
    )
  }
)

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-sm text-gray-500 ${className || ''}`}
        {...props}
      />
    )
  }
)

CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={className} {...props} />
  }
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center border-t border-gray-200 pt-4 ${className || ''}`}
        {...props}
      />
    )
  }
)

CardFooter.displayName = 'CardFooter'
