'use client'

interface PremiumSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'gradient' | 'dots' | 'pulse'
  className?: string
}

export function PremiumSpinner({
  size = 'md',
  variant = 'gradient',
  className = ''
}: PremiumSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const sizeClass = sizes[size]

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: '0s' }} />
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: '0.2s' }} />
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: '0.4s' }} />
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow" />
        <div className="absolute inset-2 rounded-full bg-primary/40 animate-pulse-glow" style={{ animationDelay: '0.2s' }} />
        <div className="absolute inset-4 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: '0.4s' }} />
      </div>
    )
  }

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {/* Outer ring with gradient */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-border animate-spin" style={{ animationDuration: '1.5s' }}>
        <div className="absolute inset-0 rounded-full bg-background" style={{ margin: '4px' }} />
      </div>

      {/* Inner glow */}
      <div className="absolute inset-0 rounded-full animate-pulse-glow">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 blur-md" />
      </div>

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 animate-pulse-glow" />
      </div>
    </div>
  )
}
