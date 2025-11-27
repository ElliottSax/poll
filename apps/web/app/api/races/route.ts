import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:3001'
const API_SECRET = process.env.API_SECRET

/**
 * Server-side API route for races
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()

    const url = `${API_URL}/api/races${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      headers: {
        'X-API-Key': API_SECRET || '',
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 300, // 5 minutes cache
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch races' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching races:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
