import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-primary mb-4">404</div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
        </p>

        <div className="flex gap-3 justify-center mb-8">
          <Link href="/">
            <Button variant="primary">Go Home</Button>
          </Link>
          <Link href="/races">
            <Button variant="default">Browse Races</Button>
          </Link>
        </div>

        <div className="bg-muted rounded-lg p-6">
          <h3 className="font-semibold mb-3">Looking for something specific?</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link href="/forecast" className="hover:text-primary transition-colors">
              → Election Forecast
            </Link>
            <Link href="/pollsters" className="hover:text-primary transition-colors">
              → Pollster Rankings
            </Link>
            <Link href="/methodology" className="hover:text-primary transition-colors">
              → Methodology
            </Link>
            <Link href="/about" className="hover:text-primary transition-colors">
              → About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
