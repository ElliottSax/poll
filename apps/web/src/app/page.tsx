import Link from 'next/link';
import { RaceList } from '@/components/RaceList';
import { TrendingRaces } from '@/components/TrendingRaces';
import { FeatureCard } from '@/components/FeatureCard';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            The Next-Generation
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-red-600">
              Polling Dashboard
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Advanced election forecasting with real-time polling data, Monte Carlo simulations,
            and interactive visualizations you won't find anywhere else.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/races"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore Races
            </Link>
            <Link
              href="/forecasts"
              className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-colors"
            >
              View Forecasts
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Races */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">🔥 Trending Races</h2>
        <TrendingRaces />
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Why We're Different
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FeatureCard
            icon="🎮"
            title="What-If Scenarios"
            description="Create custom scenarios and see how they impact win probabilities with our interactive simulator."
            href="/scenarios"
          />
          <FeatureCard
            icon="🔮"
            title="Advanced Forecasts"
            description="Monte Carlo simulations with 50,000 iterations provide honest uncertainty quantification."
            href="/methodology"
          />
          <FeatureCard
            icon="📊"
            title="Pollster Ratings"
            description="Transparent pollster quality scores based on historical accuracy and methodology."
            href="/pollsters"
          />
          <FeatureCard
            icon="🗺️"
            title="Interactive Maps"
            description="3D electoral maps with drill-down to county level and demographic breakdowns."
            href="/maps"
          />
          <FeatureCard
            icon="🚨"
            title="Real-time Alerts"
            description="Get notified when races shift categories or new high-quality polls are released."
            href="/alerts"
          />
          <FeatureCard
            icon="🔌"
            title="Developer API"
            description="REST and GraphQL APIs with generous rate limits for journalists and researchers."
            href="/api/docs"
          />
        </div>
      </section>

      {/* Latest Polls */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Latest Polls</h2>
          <Link
            href="/polls"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All →
          </Link>
        </div>
        <RaceList limit={6} />
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Polling Dashboard</h3>
              <p className="text-gray-400 text-sm">
                Open-source election polling aggregator with advanced forecasting.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/races" className="hover:text-white">Races</Link></li>
                <li><Link href="/forecasts" className="hover:text-white">Forecasts</Link></li>
                <li><Link href="/pollsters" className="hover:text-white">Pollsters</Link></li>
                <li><Link href="/maps" className="hover:text-white">Electoral Maps</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/methodology" className="hover:text-white">Methodology</Link></li>
                <li><Link href="/api/docs" className="hover:text-white">API Documentation</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="https://github.com/ElliottSax/poll" className="hover:text-white">GitHub</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Polling Dashboard. Open source under MIT License.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
