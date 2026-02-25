import { Metadata } from 'next'
import Link from 'next/link'
import { HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'FAQ | Polling Dashboard',
  description: 'Frequently asked questions about Polling Dashboard polling aggregation, methodology, and election forecasting.',
  openGraph: {
    title: 'FAQ | Polling Dashboard',
    description: 'Frequently asked questions about Polling Dashboard polling aggregation, methodology, and election forecasting.',
  },
}

interface FAQItem {
  question: string
  answer: string | JSX.Element
  category: string
}

const faqs: FAQItem[] = [
  // Data & Sources
  {
    category: 'Data & Sources',
    question: 'Where does your polling data come from?',
    answer: 'We aggregate polling data from RealClearPolitics, FiveThirtyEight, and other public polling sources. All data is sourced from publicly available polling archives and pollster press releases.',
  },
  {
    category: 'Data & Sources',
    question: 'How often is the data updated?',
    answer: 'Our automated scrapers run every 6 hours to collect new polling data. You can expect to see new polls within 6 hours of their public release.',
  },
  {
    category: 'Data & Sources',
    question: 'Do you conduct your own polls?',
    answer: 'No, we do not conduct polls ourselves. We aggregate and analyze polling data from professional polling organizations.',
  },
  {
    category: 'Data & Sources',
    question: 'Which pollsters do you include?',
    answer: 'We include polls from recognized pollsters with transparent methodologies. See our Methodology page for detailed inclusion criteria. We exclude pollsters with poor track records or non-transparent methods.',
  },

  // Methodology
  {
    category: 'Methodology',
    question: 'How do you calculate polling averages?',
    answer: (
      <>
        We use a weighted average that considers pollster quality (50%), recency
        (30%), and sample size (20%). Higher-rated pollsters and more recent polls
        receive more weight. See our{' '}
        <Link href="/methodology" className="text-primary hover:underline">
          Methodology page
        </Link>{' '}
        for details.
      </>
    ),
  },
  {
    category: 'Methodology',
    question: 'How are pollsters rated?',
    answer: 'Pollsters are rated A+ to F based on historical accuracy, transparency, methodology quality, and potential bias (house effects). Higher-rated pollsters have consistently accurate results and use probability-based sampling.',
  },
  {
    category: 'Methodology',
    question: 'What does your forecast model include?',
    answer: 'Our forecasts combine polling averages with historical polling accuracy, time until election, economic indicators, and correlations between similar races. We run 10,000 Monte Carlo simulations to estimate outcome probabilities.',
  },
  {
    category: 'Methodology',
    question: 'Why do your averages differ from other sites?',
    answer: 'Different aggregators use different weighting systems and inclusion criteria. Our methodology emphasizes recent, high-quality polls while accounting for pollster bias. Small differences are normal and expected.',
  },

  // Understanding Results
  {
    category: 'Understanding Results',
    question: 'What does a 70% forecast probability mean?',
    answer: 'A 70% probability means the outcome would happen 7 out of 10 times in similar situations. It does NOT mean a 70-point victory or a guaranteed win. There is still a 30% chance of the other outcome.',
  },
  {
    category: 'Understanding Results',
    question: 'Should I trust a poll showing an outlier result?',
    answer: 'Single polls can be outliers due to sampling error or methodology differences. Look at the polling average and trend over time for a more reliable picture. Our aggregation reduces the impact of outliers.',
  },
  {
    category: 'Understanding Results',
    question: 'What is margin of error?',
    answer: 'Margin of error (e.g., ±3%) indicates the range of uncertainty in a poll due to random sampling. A candidate at 48% ±3% could realistically be between 45% and 51%. Larger sample sizes produce smaller margins of error.',
  },
  {
    category: 'Understanding Results',
    question: 'What is the difference between RV and LV polls?',
    answer: 'RV polls survey "registered voters" while LV polls survey "likely voters" - those most probable to actually vote. LV polls are generally more accurate closer to Election Day, while RV polls are useful further out.',
  },

  // Features
  {
    category: 'Features',
    question: 'Can I download the polling data?',
    answer: 'Currently, data download is not available. We may add this feature in the future. For now, you can view all data on our website. If you need bulk data access, contact us via GitHub.',
  },
  {
    category: 'Features',
    question: 'Do you have a mobile app?',
    answer: 'Not yet, but our website is fully mobile-responsive and works great on smartphones and tablets. You can add it to your home screen for app-like access.',
  },
  {
    category: 'Features',
    question: 'Can I get notifications for poll updates?',
    answer: 'Email notifications and alerts are planned for future releases. Follow our GitHub repository for updates on new features.',
  },
  {
    category: 'Features',
    question: 'Can I embed your charts on my website?',
    answer: 'Embedding is not currently available. You may share screenshots with attribution. We plan to add embeddable widgets in the future.',
  },

  // Technical
  {
    category: 'Technical',
    question: 'Is Polling Dashboard open source?',
    answer: (
      <>
        Yes! Our entire codebase is open source under the MIT License. View and
        contribute on{' '}
        <a
          href="https://github.com/ElliottSax/poll"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          GitHub
        </a>
        .
      </>
    ),
  },
  {
    category: 'Technical',
    question: 'Do you have an API?',
    answer: 'We have an internal API but it is not publicly documented yet. API documentation and public access are planned for future releases.',
  },
  {
    category: 'Technical',
    question: 'How can I report a bug or request a feature?',
    answer: (
      <>
        Open an issue on our{' '}
        <a
          href="https://github.com/ElliottSax/poll/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          GitHub repository
        </a>
        . We actively review and respond to all issues.
      </>
    ),
  },

  // General
  {
    category: 'General',
    question: 'Is Polling Dashboard free to use?',
    answer: 'Yes, Polling Dashboard is completely free to use. We do not charge for access to polling data, forecasts, or any features.',
  },
  {
    category: 'General',
    question: 'Are you affiliated with any political party?',
    answer: 'No. Polling Dashboard is non-partisan and not affiliated with any political party, campaign, candidate, or PAC. Our mission is objective polling aggregation.',
  },
  {
    category: 'General',
    question: 'How do you make money?',
    answer: 'Currently, Polling Dashboard is a free service with no revenue model. Future monetization may include optional premium features, but core polling data will always remain free.',
  },
  {
    category: 'General',
    question: 'Can I contribute or volunteer?',
    answer: (
      <>
        Absolutely! We welcome contributions. Check our{' '}
        <a
          href="https://github.com/ElliottSax/poll"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          GitHub repository
        </a>{' '}
        for ways to contribute code, report issues, or suggest improvements.
      </>
    ),
  },
]

export default function FAQPage() {
  const categories = Array.from(new Set(faqs.map((faq) => faq.category)))

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-16">
        <HelpCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-muted-foreground">
          Everything you need to know about Polling Dashboard
        </p>
      </div>

      {/* Quick Links */}
      <nav className="glass p-6 rounded-lg border mb-12">
        <h2 className="font-semibold mb-3">Jump to category:</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <a
              key={category}
              href={`#${category.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/70 transition-colors"
            >
              {category}
            </a>
          ))}
        </div>
      </nav>

      {/* FAQ Sections */}
      {categories.map((category) => (
        <section
          key={category}
          id={category.toLowerCase().replace(/\s+/g, '-')}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6">{category}</h2>
          <div className="space-y-6">
            {faqs
              .filter((faq) => faq.category === category)
              .map((faq, index) => (
                <div key={index} className="glass p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3 flex items-start gap-2">
                    <span className="text-primary">Q:</span>
                    <span>{faq.question}</span>
                  </h3>
                  <div className="text-muted-foreground ml-6">
                    <span className="font-semibold text-foreground">A: </span>
                    {faq.answer}
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}

      {/* Contact CTA */}
      <section className="mt-16">
        <div className="glass p-8 rounded-lg border text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find the answer you're looking for? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Learn More About Us
            </Link>
            <a
              href="https://github.com/ElliottSax/poll/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 glass border rounded-md hover:bg-muted/50 transition-colors"
            >
              Ask on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
