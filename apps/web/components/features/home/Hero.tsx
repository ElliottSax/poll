'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp, BarChart3, Activity, Shield } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

export function Hero() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="gradient-premium-radial absolute inset-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>
          <BarChart3 className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute top-40 right-20 opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>
          <Activity className="w-16 h-16 text-purple-500" />
        </div>
        <div className="absolute bottom-40 left-1/4 opacity-20 animate-float" style={{ animationDelay: '2s' }}>
          <TrendingUp className="w-14 h-14 text-primary" />
        </div>
      </div>

      <div className="text-center max-w-4xl mx-auto relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full text-sm font-semibold mb-8 animate-slide-up border border-primary/20">
          <div className="relative">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
          </div>
          <span className="text-gradient-subtle">Real-time polling data updated daily</span>
        </div>

        {/* Main heading with gradient text */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight animate-slide-up">
          <span className="block mb-2">Track Election Polls</span>
          <span className="text-gradient inline-block">With Precision</span>
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Advanced forecasting, interactive visualizations, and comprehensive
          coverage of national and local races. Data-driven insights you can
          trust.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/races"
            className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 inline-flex items-center justify-center gap-2"
          >
            <span className="relative z-10">Explore Races</span>
            <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/forecast"
            className="group glass border-2 border-border hover:border-primary/50 px-8 py-4 rounded-xl font-semibold hover:shadow-premium transition-all duration-300 inline-flex items-center justify-center gap-2"
          >
            <Shield className="h-5 w-5 group-hover:text-primary transition-colors" />
            <span>View Forecast</span>
          </Link>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="glass p-6 rounded-2xl hover-lift group">
            <div className="text-4xl md:text-5xl font-bold mb-2">
              <AnimatedCounter value={500} suffix="+" className="text-gradient" />
            </div>
            <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Races Tracked
            </div>
            <div className="mt-3 h-1 w-16 mx-auto bg-gradient-to-r from-primary to-purple-500 rounded-full" />
          </div>

          <div className="glass p-6 rounded-2xl hover-lift group">
            <div className="text-4xl md:text-5xl font-bold mb-2">
              <AnimatedCounter value={10} suffix="K+" className="text-gradient" />
            </div>
            <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Polls Analyzed
            </div>
            <div className="mt-3 h-1 w-16 mx-auto bg-gradient-to-r from-purple-500 to-primary rounded-full" />
          </div>

          <div className="glass p-6 rounded-2xl hover-lift group">
            <div className="text-4xl md:text-5xl font-bold mb-2">
              <AnimatedCounter value={94} suffix="%" className="text-gradient" />
            </div>
            <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Forecast Accuracy
            </div>
            <div className="mt-3 h-1 w-16 mx-auto bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
