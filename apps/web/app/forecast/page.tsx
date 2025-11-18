import { Metadata } from 'next'
import { Suspense } from 'react'
import { ElectoralMap } from '@/components/features/forecast/ElectoralMap'
import { PresidentialForecast } from '@/components/features/forecast/PresidentialForecast'
import { SenateForecast } from '@/components/features/forecast/SenateForecast'
import { HouseForecast } from '@/components/features/forecast/HouseForecast'
import { ForecastMethodology } from '@/components/features/forecast/ForecastMethodology'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export const metadata: Metadata = {
  title: 'Election Forecast - Polling Dashboard',
  description:
    'Real-time election forecasting with win probabilities, electoral college predictions, and Senate/House control forecasts.',
  keywords: [
    'election forecast',
    'electoral college prediction',
    'senate forecast',
    'house forecast',
    'win probability',
  ],
}

export default function ForecastPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Election Forecast</h1>
        <p className="text-lg text-muted-foreground">
          Statistical forecasting based on polling data, fundamentals, and Monte Carlo
          simulations. Updated daily with the latest polls.
        </p>
      </div>

      {/* Tabs for different forecasts */}
      <Tabs defaultValue="presidential" className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="presidential">Presidential</TabsTrigger>
          <TabsTrigger value="senate">Senate</TabsTrigger>
          <TabsTrigger value="house">House</TabsTrigger>
        </TabsList>

        {/* Presidential Forecast */}
        <TabsContent value="presidential" className="space-y-8">
          <Suspense fallback={<LoadingSpinner />}>
            <PresidentialForecast />
          </Suspense>

          <section>
            <h2 className="text-2xl font-bold mb-4">Electoral College Map</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <ElectoralMap />
            </Suspense>
          </section>
        </TabsContent>

        {/* Senate Forecast */}
        <TabsContent value="senate" className="space-y-8">
          <Suspense fallback={<LoadingSpinner />}>
            <SenateForecast />
          </Suspense>
        </TabsContent>

        {/* House Forecast */}
        <TabsContent value="house" className="space-y-8">
          <Suspense fallback={<LoadingSpinner />}>
            <HouseForecast />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Methodology */}
      <section className="mt-12">
        <ForecastMethodology />
      </section>
    </div>
  )
}
