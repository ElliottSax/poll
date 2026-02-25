import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Polling Dashboard',
  description: 'Learn how Polling Dashboard collects, uses, and protects your data.',
  openGraph: {
    title: 'Privacy Policy | Polling Dashboard',
    description: 'Learn how Polling Dashboard collects, uses, and protects your data.',
  },
}

export default function PrivacyPage() {
  const lastUpdated = 'February 25, 2026'

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* Introduction */}
      <section className="mb-12">
        <p className="text-lg text-muted-foreground mb-4">
          Polling Dashboard ("we", "our", or "us") is committed to protecting your
          privacy. This Privacy Policy explains how we collect, use, and safeguard
          your information when you visit our website.
        </p>
        <p className="text-lg text-muted-foreground">
          By using our website, you agree to the collection and use of information
          in accordance with this policy.
        </p>
      </section>

      {/* Information We Collect */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Information We Collect</h2>

        <div className="space-y-6">
          <div className="glass p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Automatically Collected Information</h3>
            <p className="text-muted-foreground mb-3">
              When you visit our website, we automatically collect certain information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>IP address and general location</li>
              <li>Browser type and version</li>
              <li>Device information (desktop, mobile, tablet)</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website or source</li>
              <li>Date and time of access</li>
            </ul>
          </div>

          <div className="glass p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Cookies and Tracking</h3>
            <p className="text-muted-foreground mb-3">
              We use cookies and similar tracking technologies to improve your experience:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site (Google Analytics)</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences (theme, etc.)</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              You can disable cookies in your browser settings, but this may limit certain features.
            </p>
          </div>

          <div className="glass p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Information You Provide</h3>
            <p className="text-muted-foreground">
              Currently, we do not require user accounts or collect personal information
              directly. If we add features requiring personal information in the future,
              we will update this policy accordingly.
            </p>
          </div>
        </div>
      </section>

      {/* How We Use Information */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">How We Use Your Information</h2>
        <p className="text-lg text-muted-foreground mb-4">
          We use the collected information for:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>Providing and improving our polling aggregation service</li>
          <li>Understanding how visitors use our website</li>
          <li>Analyzing trends and user behavior to improve features</li>
          <li>Detecting and preventing technical issues or abuse</li>
          <li>Optimizing website performance and user experience</li>
        </ul>
      </section>

      {/* Third-Party Services */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Third-Party Services</h2>
        <p className="text-lg text-muted-foreground mb-4">
          We use the following third-party services that may collect information:
        </p>

        <div className="space-y-4">
          <div className="glass p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Google Analytics</h3>
            <p className="text-muted-foreground text-sm">
              We use Google Analytics to understand website usage. Google Analytics
              collects anonymous data about page views, session duration, and user
              interactions. Learn more at{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google's Privacy Policy
              </a>
              .
            </p>
          </div>

          <div className="glass p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Vercel (Hosting)</h3>
            <p className="text-muted-foreground text-sm">
              Our website is hosted on Vercel, which may collect server logs and
              access information. See{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Vercel's Privacy Policy
              </a>
              .
            </p>
          </div>

          <div className="glass p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Sentry (Error Monitoring)</h3>
            <p className="text-muted-foreground text-sm">
              We use Sentry to monitor and fix errors. Sentry may collect error
              reports and stack traces. See{' '}
              <a
                href="https://sentry.io/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Sentry's Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Data Sharing */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Data Sharing and Disclosure</h2>
        <p className="text-lg text-muted-foreground mb-4">
          We do not sell, trade, or rent your personal information to third parties.
        </p>
        <p className="text-lg text-muted-foreground mb-4">
          We may share aggregated, anonymized data (e.g., total visitors, popular pages)
          publicly or with partners.
        </p>
        <p className="text-lg text-muted-foreground">
          We may disclose information if required by law or to protect our rights,
          property, or safety.
        </p>
      </section>

      {/* Data Security */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Data Security</h2>
        <p className="text-lg text-muted-foreground mb-4">
          We implement reasonable security measures to protect your information:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>HTTPS encryption for all data transmission</li>
          <li>Secure hosting infrastructure</li>
          <li>Regular security updates and monitoring</li>
          <li>Limited access to data by authorized personnel only</li>
        </ul>
        <p className="text-lg text-muted-foreground mt-4">
          However, no internet transmission is 100% secure. We cannot guarantee
          absolute security.
        </p>
      </section>

      {/* Your Rights */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Your Rights</h2>
        <p className="text-lg text-muted-foreground mb-4">
          You have the right to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>Access information we collect about you</li>
          <li>Request correction or deletion of your data</li>
          <li>Opt out of analytics tracking (via browser settings)</li>
          <li>Disable cookies in your browser</li>
          <li>Request a copy of our data retention policies</li>
        </ul>
        <p className="text-lg text-muted-foreground mt-4">
          To exercise these rights, contact us via our{' '}
          <a
            href="https://github.com/ElliottSax/poll/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub repository
          </a>
          .
        </p>
      </section>

      {/* Children's Privacy */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Children's Privacy</h2>
        <p className="text-lg text-muted-foreground">
          Our service is not intended for children under 13. We do not knowingly
          collect personal information from children. If you believe we have
          collected information from a child, please contact us immediately.
        </p>
      </section>

      {/* Changes to Policy */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Changes to This Policy</h2>
        <p className="text-lg text-muted-foreground mb-4">
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page with an updated "Last Updated" date.
        </p>
        <p className="text-lg text-muted-foreground">
          Continued use of our website after changes indicates acceptance of the
          updated policy.
        </p>
      </section>

      {/* Contact */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
        <p className="text-lg text-muted-foreground mb-4">
          If you have questions about this Privacy Policy, please:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>
            Open an issue on{' '}
            <a
              href="https://github.com/ElliottSax/poll/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub
            </a>
          </li>
          <li>Email us at privacy@pollingdashboard.com</li>
        </ul>
      </section>

      {/* Back Link */}
      <div className="text-center pt-8 border-t">
        <Link href="/about" className="text-primary hover:underline text-lg">
          ← Back to About
        </Link>
      </div>
    </div>
  )
}
