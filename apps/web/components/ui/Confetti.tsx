'use client'

import { useEffect, useState } from 'react'

interface ConfettiProps {
  trigger?: boolean
  colors?: string[]
  particleCount?: number
  duration?: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: string
  size: number
}

export function Confetti({
  trigger = false,
  colors = ['#3b82f6', '#a855f7', '#ec4899', '#f59e0b', '#10b981'],
  particleCount = 50,
  duration = 3000
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true)

      // Generate particles
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4
      }))

      setParticles(newParticles)

      // Clear after duration
      setTimeout(() => {
        setParticles([])
        setIsActive(false)
      }, duration)
    }
  }, [trigger, isActive, particleCount, colors, duration])

  if (!isActive || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confetti-fall ${duration}ms ease-in forwards`,
            '--vx': `${particle.vx}vw`,
            '--vy': `${particle.vy}vh`,
            '--rotation': `${particle.rotationSpeed * 360}deg`
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// Shimmer effect for highlighting important elements
interface ShimmerProps {
  children: React.ReactNode
  trigger?: boolean
  color?: string
}

export function Shimmer({ children, trigger = true, color = '#3b82f6' }: ShimmerProps) {
  return (
    <div className="relative inline-block">
      {children}
      {trigger && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
            animation: 'shimmer-sweep 2s infinite'
          }}
        />
      )}
    </div>
  )
}

// Pulse glow effect
interface PulseGlowProps {
  children: React.ReactNode
  color?: string
  size?: 'sm' | 'md' | 'lg'
  speed?: 'slow' | 'medium' | 'fast'
}

export function PulseGlow({
  children,
  color = '#3b82f6',
  size = 'md',
  speed = 'medium'
}: PulseGlowProps) {
  const sizeMap = {
    sm: 8,
    md: 16,
    lg: 24
  }

  const speedMap = {
    slow: 3,
    medium: 2,
    fast: 1
  }

  return (
    <div className="relative inline-block">
      <div
        className="absolute inset-0 rounded-full blur-lg animate-pulse-glow pointer-events-none"
        style={{
          backgroundColor: color,
          opacity: 0.4,
          transform: `scale(1.2)`,
          animation: `pulse-glow ${speedMap[speed]}s ease-in-out infinite`
        }}
      />
      {children}
    </div>
  )
}

// Celebration badge that appears with animation
interface CelebrationBadgeProps {
  show: boolean
  message: string
  icon?: React.ReactNode
  color?: string
}

export function CelebrationBadge({
  show,
  message,
  icon,
  color = '#10b981'
}: CelebrationBadgeProps) {
  if (!show) return null

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-premium-lg animate-bounce-in"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `2px solid ${color}40`,
        boxShadow: `0 0 20px ${color}40`
      }}
    >
      {icon && <span className="animate-spin-slow">{icon}</span>}
      <span>{message}</span>
    </div>
  )
}

// Number ticker animation
interface NumberTickerProps {
  value: number
  prefix?: string
  suffix?: string
  color?: string
}

export function NumberTicker({
  value,
  prefix = '',
  suffix = '',
  color = 'currentColor'
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true)
      const timeout = setTimeout(() => {
        setDisplayValue(value)
        setIsAnimating(false)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [value, displayValue])

  return (
    <span
      className={`inline-block tabular-nums transition-all duration-300 ${
        isAnimating ? 'scale-110 opacity-70' : 'scale-100 opacity-100'
      }`}
      style={{ color }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  )
}

// Ripple effect for clicks
export function useRipple() {
  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget
    const ripple = document.createElement('span')

    const diameter = Math.max(button.clientWidth, button.clientHeight)
    const radius = diameter / 2

    const rect = button.getBoundingClientRect()
    ripple.style.width = ripple.style.height = `${diameter}px`
    ripple.style.left = `${event.clientX - rect.left - radius}px`
    ripple.style.top = `${event.clientY - rect.top - radius}px`
    ripple.className = 'ripple'

    const existingRipple = button.getElementsByClassName('ripple')[0]
    if (existingRipple) {
      existingRipple.remove()
    }

    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  return createRipple
}
