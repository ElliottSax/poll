import { NextRequest, NextResponse } from 'next/server'

/**
 * Vercel Cron endpoint for automated polling scrapes
 * Runs every 6 hours via vercel.json cron configuration
 */
export async function GET(request: NextRequest) {
  // Verify this is a cron request
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow Vercel's cron service even without secret in development
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron')
    if (!isVercelCron && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // Trigger scraper via internal API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/api/scraper/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Scraper failed: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data,
    })
  } catch (error) {
    console.error('Cron scrape failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Allow POST as well for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
