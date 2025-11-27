'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'
import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: number | string
  icon?: LucideIcon | ReactNode
  iconColor?: string
  href?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  variant?: 'default' | 'gradient' | 'glass'
  size?: 'sm' | 'md' | 'lg'
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  href,
  trend,
  subtitle,
  variant = 'glass',
  size = 'md',
}: StatCardProps) {
  const isNumeric = typeof value === 'number'

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const variantClasses = {
    default: 'bg-card border border-border',
    gradient: 'bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20',
    glass: 'glass border border-border/50',
  }

  const content = (
    <div
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-xl
        hover-lift
        group
        relative
        overflow-hidden
        transition-all
        duration-300
      `}
    >
      {/* Decorative background gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Icon and Title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`${iconColor} transition-transform group-hover:scale-110 duration-300`}>
                {typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : Icon}
              </div>
            )}
            <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              {title}
            </span>
          </div>
          {trend && (
            <div
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                trend.isPositive
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          {isNumeric ? (
            <div className="text-4xl font-bold text-gradient">
              <AnimatedCounter value={value} duration={2000} />
            </div>
          ) : (
            <div className="text-4xl font-bold text-foreground">{value}</div>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}

        {/* Link indicator */}
        {href && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  )
}
