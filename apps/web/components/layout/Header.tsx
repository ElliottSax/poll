'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useSession, signIn, signOut } from 'next-auth/react'

interface NavigationItem {
  name: string
  href: string
  featured?: boolean
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()

  const navigation: NavigationItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Races', href: '/races' },
    { name: 'Forecast', href: '/forecast' },
    { name: 'Charts', href: '/charts-showcase', featured: true },
    { name: 'Pollsters', href: '/pollsters' },
    { name: 'Scenarios', href: '/scenarios' },
    { name: 'API', href: '/api-docs' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass shadow-premium">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-premium group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
              <span className="text-primary-foreground font-bold text-xl">
                P
              </span>
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Polling Dashboard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                } ${
                  item.featured
                    ? 'bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary border border-primary/30 hover:shadow-premium'
                    : ''
                }`}
              >
                {item.name}
                {item.featured && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
                )}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </button>

            {/* User menu */}
            {session ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center space-x-2 px-3 py-2 text-sm font-medium hover:text-primary rounded-lg hover:bg-muted/50 transition-all"
                >
                  <User className="h-5 w-5" />
                  <span>{session.user?.name}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted/50 transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="hidden md:block bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:shadow-premium transition-all duration-300 hover:scale-105"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-3 text-base font-semibold rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  } ${
                    item.featured
                      ? 'bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary border border-primary/30'
                      : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                  {item.featured && (
                    <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
                  )}
                </Link>
              ))}
              {!session && (
                <button
                  onClick={() => {
                    signIn()
                    setMobileMenuOpen(false)
                  }}
                  className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-4 py-3 rounded-lg text-base font-semibold hover:shadow-premium transition-all text-left mt-2"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
