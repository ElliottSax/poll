import * as React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  variant?: 'default' | 'glass' | 'premium' | 'gradient'
}

export function Card({ children, className = '', hover = false, onClick, variant = 'default' }: CardProps) {
  const baseClass = 'rounded-xl transition-all duration-300'

  const variantClasses = {
    default: 'bg-card border border-border',
    glass: 'glass border-gradient',
    premium: 'bg-card border border-border shadow-premium',
    gradient: 'bg-gradient-to-br from-card via-card to-accent/5 border border-border/50 shadow-premium'
  }

  const hoverClass = hover
    ? 'hover-lift cursor-pointer hover:border-primary/50 hover:shadow-glow'
    : ''

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`p-6 pb-4 ${className}`}>{children}</div>
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
}

export function CardDescription({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`p-6 pt-0 flex items-center ${className}`}>{children}</div>
}
