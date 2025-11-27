'use client'

import * as React from 'react'

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'premium' | 'pills'
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  variant: 'default' | 'premium' | 'pills'
}>({
  value: '',
  onValueChange: () => {},
  variant: 'default',
})

export function Tabs({
  defaultValue = '',
  value: controlledValue,
  onValueChange,
  children,
  className = '',
  variant = 'premium',
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const value = controlledValue ?? internalValue
  const handleValueChange = onValueChange ?? setInternalValue

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange, variant }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className = '' }: TabsListProps) {
  const { variant } = React.useContext(TabsContext)

  const variantStyles = {
    default: 'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
    premium: 'inline-flex h-12 items-center justify-center glass rounded-xl p-1.5 gap-1',
    pills: 'inline-flex h-11 items-center justify-center gap-2 p-1',
  }

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className = '', icon }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange, variant } = React.useContext(TabsContext)
  const isSelected = value === selectedValue
  const [isHovered, setIsHovered] = React.useState(false)

  const getVariantStyles = () => {
    switch (variant) {
      case 'premium':
        return isSelected
          ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-premium hover:shadow-glow'
          : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
      case 'pills':
        return isSelected
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'bg-background/50 hover:bg-background text-muted-foreground hover:text-foreground'
      default:
        return isSelected
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-background/50'
    }
  }

  return (
    <button
      onClick={() => onValueChange(value)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative inline-flex items-center justify-center whitespace-nowrap rounded-lg
        px-4 py-2 text-sm font-semibold
        ring-offset-background transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${getVariantStyles()}
        ${className}
      `}
    >
      {/* Icon */}
      {icon && (
        <span className={`mr-2 transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          {icon}
        </span>
      )}

      {/* Text */}
      <span className="relative z-10">{children}</span>

      {/* Premium selected indicator */}
      {variant === 'premium' && isSelected && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      )}

      {/* Active indicator line */}
      {variant === 'default' && isSelected && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-3/4 bg-primary rounded-full" />
      )}
    </button>
  )
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { value: selectedValue } = React.useContext(TabsContext)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (value === selectedValue) {
      // Slight delay for smooth animation
      const timer = setTimeout(() => setIsVisible(true), 50)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [value, selectedValue])

  if (value !== selectedValue) {
    return null
  }

  return (
    <div
      className={`
        animate-slide-up
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-300
        ${className}
      `}
    >
      {children}
    </div>
  )
}
