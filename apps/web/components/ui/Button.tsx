import * as React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

export function Button({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    default:
      'bg-background border border-border hover:bg-muted text-foreground',
    primary:
      'bg-primary text-primary-foreground hover:bg-primary/90 border-0',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-0',
    ghost:
      'hover:bg-muted text-foreground border-0',
    link:
      'underline-offset-4 hover:underline text-primary border-0 bg-transparent p-0',
    destructive:
      'bg-red-600 text-white hover:bg-red-700 border-0',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const disabledClass = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer'

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonGroup({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`} role="group">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0
          const isLast = index === React.Children.count(children) - 1

          return React.cloneElement(child as React.ReactElement<any>, {
            className: `${child.props.className || ''} ${
              isFirst ? 'rounded-r-none' : isLast ? 'rounded-l-none' : 'rounded-none'
            } ${!isFirst ? '-ml-px' : ''}`,
          })
        }
        return child
      })}
    </div>
  )
}

export function IconButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      className={`inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
