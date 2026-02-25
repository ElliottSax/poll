import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Polling Dashboard',
  description: 'Terms and conditions for using Polling Dashboard polling aggregation service.',
  openGraph: {
    title: 'Terms of Service | Polling Dashboard',
    description: 'Terms and conditions for using Polling Dashboard polling aggregation service.',
  },
}

export default function TermsPage() {
  const lastUpdated = 'February 25, 2026'

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* Introduction */}
      <section className="mb-12">
        <p className="text-lg text-muted-foreground mb-4">
          Welcome to Polling Dashboard. By accessing or using our website, you agree
          to be bound by these Terms of Service ("Terms"). Please read them carefully.
        </p>
        <p className="text-lg text-muted-foreground">
          If you do not agree to these Terms, do not use our service.
        </p>
      </section>

      {/* Use of Service */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">1. Use of Service</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Acceptable Use</h3>
            <p className="text-muted-foreground mb-3">You may use Polling Dashboard to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>View polling data and analysis</li>
              <li>Access election forecasts and trends</li>
              <li>Share content via social media (with attribution)</li>
              <li>Use data for personal, educational, or journalistic purposes</li>
            </ul>
          </div>

          <div className="glass p-4 rounded-lg border-destructive/30">
            <h3 className="text-xl font-semibold mb-2">Prohibited Use</h3>
            <p className="text-muted-foreground mb-3">You may NOT:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Scrape or automatically collect data without permission</li>
              <li>Reverse engineer or attempt to access source code</li>
              <li>Use the service for illegal or harmful purposes</li>
              <li>Impersonate Polling Dashboard or misrepresent affiliation</li>
              <li>Attempt to disrupt or compromise service security</li>
              <li>Republish our data without proper attribution</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Content and Accuracy */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">2. Content and Accuracy</h2>

        <div className="glass p-6 rounded-lg border bg-muted/30 mb-4">
          <p className="text-lg font-semibold mb-2">⚠️ Important Disclaimer</p>
          <p className="text-muted-foreground">
            Polling Dashboard aggregates data from third-party sources. We strive for
            accuracy but make no guarantees about completeness, accuracy, or timeliness
            of the information provided.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Data Sources</h3>
            <p className="text-muted-foreground">
              Our data comes from RealClearPolitics, FiveThirtyEight, and other public
              polling sources. We are not affiliated with these organizations and do
              not control their data quality.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Forecasts and Predictions</h3>
            <p className="text-muted-foreground">
              Election forecasts are statistical models, not guarantees. Actual
              election results may differ significantly from our forecasts. Use
              forecasts for informational purposes only.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Updates and Changes</h3>
            <p className="text-muted-foreground">
              We update polling data multiple times per day. However, delays or errors
              may occur. We reserve the right to correct errors at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Intellectual Property */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">3. Intellectual Property</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Our Content</h3>
            <p className="text-muted-foreground mb-2">
              The design, layout, code, and original content of Polling Dashboard are
              protected by copyright and other intellectual property laws.
            </p>
            <p className="text-muted-foreground">
              Our source code is open source under the MIT License. See our{' '}
              <a
                href="https://github.com/ElliottSax/poll"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub repository
              </a>{' '}
              for details.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Third-Party Data</h3>
            <p className="text-muted-foreground">
              Polling data is sourced from third parties and remains their property.
              We aggregate and display this data under fair use principles for
              informational purposes.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Attribution</h3>
            <p className="text-muted-foreground">
              If you share or republish our content, please provide attribution:
              "Source: Polling Dashboard (pollingdashboard.com)"
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimers and Limitations */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">4. Disclaimers and Limitations of Liability</h2>

        <div className="glass p-6 rounded-lg border-destructive/30 mb-4">
          <p className="text-sm uppercase font-semibold mb-3">
            Service Provided "AS IS"
          </p>
          <p className="text-muted-foreground">
            Polling Dashboard is provided "as is" without warranties of any kind,
            express or implied. We do not warrant that the service will be
            uninterrupted, secure, or error-free.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">No Liability for Damages</h3>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, Polling Dashboard shall not
              be liable for any indirect, incidental, special, or consequential
              damages arising from use of our service.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">No Financial Advice</h3>
            <p className="text-muted-foreground">
              Our forecasts and analysis are for informational purposes only and
              should not be used as the basis for financial decisions, betting,
              or wagering.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">No Political Affiliation</h3>
            <p className="text-muted-foreground">
              Polling Dashboard is not affiliated with any political party,
              campaign, or candidate. We strive for non-partisan polling
              aggregation.
            </p>
          </div>
        </div>
      </section>

      {/* User Responsibilities */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">5. User Responsibilities</h2>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>Comply with all applicable laws and regulations</li>
          <li>Respect intellectual property rights</li>
          <li>Use the service responsibly and ethically</li>
          <li>Report bugs or security issues promptly</li>
          <li>Verify information before making important decisions</li>
        </ul>
      </section>

      {/* Privacy */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">6. Privacy</h2>
        <p className="text-lg text-muted-foreground">
          Your use of Polling Dashboard is also governed by our{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          . Please review it to understand how we collect and use information.
        </p>
      </section>

      {/* Changes to Terms */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">7. Changes to Terms</h2>
        <p className="text-lg text-muted-foreground mb-4">
          We reserve the right to modify these Terms at any time. Changes will be
          posted on this page with an updated "Last Updated" date.
        </p>
        <p className="text-lg text-muted-foreground">
          Continued use of the service after changes constitutes acceptance of
          the modified Terms.
        </p>
      </section>

      {/* Termination */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">8. Termination</h2>
        <p className="text-lg text-muted-foreground mb-4">
          We reserve the right to terminate or restrict access to our service for
          any user who violates these Terms, at our sole discretion and without
          notice.
        </p>
        <p className="text-lg text-muted-foreground">
          You may stop using our service at any time.
        </p>
      </section>

      {/* Governing Law */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">9. Governing Law</h2>
        <p className="text-lg text-muted-foreground">
          These Terms are governed by the laws of the United States. Any disputes
          will be resolved in courts located in the United States.
        </p>
      </section>

      {/* Contact */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">10. Contact Us</h2>
        <p className="text-lg text-muted-foreground mb-4">
          Questions about these Terms? Contact us:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>
            GitHub:{' '}
            <a
              href="https://github.com/ElliottSax/poll/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Open an issue
            </a>
          </li>
          <li>Email: legal@pollingdashboard.com</li>
        </ul>
      </section>

      {/* Acceptance */}
      <section className="mb-12">
        <div className="glass p-6 rounded-lg border">
          <p className="text-lg font-semibold mb-2">By using Polling Dashboard, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
        </div>
      </section>

      {/* Back Link */}
      <div className="text-center pt-8 border-t">
        <Link href="/privacy" className="text-primary hover:underline text-lg mr-4">
          ← Privacy Policy
        </Link>
        <Link href="/about" className="text-primary hover:underline text-lg">
          About Us →
        </Link>
      </div>
    </div>
  )
}
