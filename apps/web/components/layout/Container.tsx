import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const containerVariants = cva('mx-auto w-full', {
  variants: {
    size: {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-[1400px]',
      full: 'max-w-full',
    },
    padding: {
      none: '',
      sm: 'px-4',
      md: 'px-4 sm:px-6',
      lg: 'px-4 sm:px-6 lg:px-8',
    },
  },
  defaultVariants: {
    size: 'lg',
    padding: 'lg',
  },
})

export interface ContainerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={containerVariants({ size, padding, className })}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'

// Grid system component
const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
      12: 'grid-cols-4 md:grid-cols-6 lg:grid-cols-12',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 'md',
  },
})

export interface GridProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={gridVariants({ cols, gap, className })}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Grid.displayName = 'Grid'

// Section component for consistent page sections
export interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'muted' | 'accent'
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: '',
      muted: 'bg-gray-50',
      accent: 'bg-blue-50',
    }

    return (
      <section
        ref={ref}
        className={`py-12 md:py-16 lg:py-20 ${variantClasses[variant]} ${className || ''}`}
        {...props}
      >
        {children}
      </section>
    )
  }
)

Section.displayName = 'Section'

// Page layout wrapper
export interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className || ''}`}>
      {children}
    </div>
  )
}

// Main content area
export interface MainProps extends HTMLAttributes<HTMLElement> {}

export const Main = forwardRef<HTMLElement, MainProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={`flex-1 ${className || ''}`}
        {...props}
      >
        {children}
      </main>
    )
  }
)

Main.displayName = 'Main'
