import Link from 'next/link'
import { Github, Twitter, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Column */}
          <div>
            <h3 className="font-semibold mb-4">Polling Dashboard</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Transparent, accurate polling aggregation for U.S. elections.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/ElliottSax/poll"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@pollingdashboard.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Races Column */}
          <div>
            <h3 className="font-semibold mb-4">Races</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/races/presidential"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Presidential
                </Link>
              </li>
              <li>
                <Link
                  href="/races/senate"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Senate
                </Link>
              </li>
              <li>
                <Link
                  href="/races/governor"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Governor
                </Link>
              </li>
              <li>
                <Link
                  href="/races/house"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  House
                </Link>
              </li>
            </ul>
          </div>

          {/* Data Column */}
          <div>
            <h3 className="font-semibold mb-4">Data</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/polls"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  All Polls
                </Link>
              </li>
              <li>
                <Link
                  href="/pollsters"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pollster Ratings
                </Link>
              </li>
              <li>
                <Link
                  href="/forecasts"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forecasts
                </Link>
              </li>
              <li>
                <Link
                  href="/methodology"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/ElliottSax/poll"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Open Source
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ElliottSax/poll/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Report Issue
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Polling Dashboard. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with transparency and accuracy in mind.
          </p>
        </div>
      </div>
    </footer>
  )
}
