import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Polling Dashboard',
  description: 'Real-time election polling data and forecasts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
