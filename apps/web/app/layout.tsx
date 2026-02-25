import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Analytics } from '@/components/Analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Polling Dashboard - Real-time Election Polling & Forecasts',
    template: '%s | Polling Dashboard',
  },
  description:
    'Track real-time election polling, forecasts, and predictions. Interactive maps, advanced analytics, and comprehensive coverage of national and local races.',
  keywords: [
    'election polling',
    'poll aggregation',
    'election forecast',
    'political polls',
    'senate polls',
    'presidential polls',
    'polling average',
  ],
  authors: [{ name: 'Polling Dashboard Team' }],
  creator: 'Polling Dashboard',
  publisher: 'Polling Dashboard',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pollingdashboard.com',
    title: 'Polling Dashboard - Real-time Election Polling & Forecasts',
    description:
      'Track real-time election polling, forecasts, and predictions with interactive visualizations.',
    siteName: 'Polling Dashboard',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Polling Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Polling Dashboard - Real-time Election Polling & Forecasts',
    description:
      'Track real-time election polling, forecasts, and predictions with interactive visualizations.',
    creator: '@pollingdash',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Analytics />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
