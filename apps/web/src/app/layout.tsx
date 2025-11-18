import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import { TRPCProvider } from '@/lib/trpc-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Polling Dashboard | Election Polling & Forecasts',
  description: 'Real-time election polling aggregation, advanced forecasts, and interactive visualizations for US elections.',
  keywords: ['polling', 'elections', 'forecasts', 'politics', 'senate', 'house', 'president'],
  authors: [{ name: 'Polling Dashboard Team' }],
  openGraph: {
    title: 'Polling Dashboard',
    description: 'Election polling aggregation and forecasts',
    url: 'https://pollviz.com',
    siteName: 'Polling Dashboard',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Polling Dashboard',
    description: 'Election polling aggregation and forecasts',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="font-sans antialiased">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
