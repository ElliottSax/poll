# 📥 Track 4: Data Scrapers - Starter Guide

**Status**: 🟡 Available
**Duration**: 3-4 weeks
**Priority**: P0 (Critical for data pipeline)
**Dependencies**: Track 6 (Database) recommended

---

## 🎯 Objectives

Build reliable data scrapers to collect polling data:
- RealClearPolitics scraper
- FiveThirtyEight data import
- The Economist data integration
- Robust error handling
- Duplicate detection
- Automated scheduling
- Data validation

---

## 📋 Task Breakdown

### Week 1: Foundation & RealClearPolitics
- [ ] Set up scraper infrastructure
- [ ] Create base scraper class
- [ ] Implement RealClearPolitics scraper
  - [ ] Parse poll listings
  - [ ] Extract poll details
  - [ ] Handle pagination
- [ ] Add data validation
- [ ] Add error handling & logging
- [ ] Write unit tests

### Week 2: FiveThirtyEight & The Economist
- [ ] Implement FiveThirtyEight scraper
  - [ ] Parse CSV data files
  - [ ] Handle data format changes
- [ ] Implement The Economist scraper
  - [ ] Parse JSON/HTML data
  - [ ] Extract forecast data
- [ ] Add duplicate detection
- [ ] Add data normalization
- [ ] Write tests

### Week 3: Automation & Scheduling
- [ ] Set up BullMQ job queue
- [ ] Create scheduled scraping jobs
- [ ] Add rate limiting
- [ ] Add retry logic with exponential backoff
- [ ] Implement scraper monitoring
- [ ] Add alerting for failures
- [ ] Write integration tests

### Week 4: Data Quality & Polish
- [ ] Add data quality checks
- [ ] Implement data cleaning
- [ ] Add scraper health checks
- [ ] Create scraper dashboard (optional)
- [ ] Performance optimization
- [ ] Final testing
- [ ] Documentation

---

## 🚀 Getting Started

### 1. Claim the Track

```bash
git add .claude/WORK_ASSIGNMENTS.md
git commit -m "claim: Track 4 - Data Scrapers"
git push
```

### 2. Create Your Branch

```bash
git checkout -b claude/poll-scrapers-[YOUR-SESSION-ID]
```

### 3. Set Up Scraper Directory

```bash
mkdir -p apps/api/src/scrapers
mkdir -p apps/api/src/scrapers/base
mkdir -p apps/api/src/scrapers/sources
mkdir -p apps/api/src/jobs
```

### 4. Install Dependencies

```bash
cd apps/api
npm install axios cheerio bullmq date-fns zod
```

---

## 💡 Implementation Guide

### Base Scraper Class

Use the template:

```bash
cp .claude/templates/scraper-template.ts apps/api/src/scrapers/base/BaseScraper.ts
```

### RealClearPolitics Scraper

**File**: `apps/api/src/scrapers/sources/RealClearPoliticsScraper.ts`

```typescript
import { BaseScraper, ScrapedPoll } from '../base/BaseScraper'
import * as cheerio from 'cheerio'
import { z } from 'zod'

export class RealClearPoliticsScraper extends BaseScraper {
  constructor() {
    super({
      baseUrl: 'https://www.realclearpolitics.com',
      rateLimit: 2000, // 2 seconds between requests
      retryAttempts: 3,
    })
  }

  /**
   * Scrape all current polls
   */
  public async scrape(): Promise<ScrapedPoll[]> {
    const polls: ScrapedPoll[] = []

    try {
      console.log('🔍 Scraping RealClearPolitics...')

      // Fetch poll index page
      const html = await this.fetchHtml(`${this.config.baseUrl}/epolls/latest_polls/`)
      const $ = this.parseHtml(html)

      // Find all poll listings
      const pollLinks: string[] = []
      $('.poll-table a').each((_, element) => {
        const href = $(element).attr('href')
        if (href && href.includes('/epolls/')) {
          pollLinks.push(href)
        }
      })

      console.log(`📊 Found ${pollLinks.length} polls`)

      // Scrape each poll (with rate limiting)
      for (const link of pollLinks.slice(0, 10)) { // Limit for testing
        try {
          const poll = await this.scrapePollPage(link)
          if (poll) {
            polls.push(poll)
            await this.savePoll(poll)
          }
        } catch (error) {
          console.error(`Failed to scrape ${link}:`, error)
        }

        // Rate limiting
        await this.sleep(this.config.rateLimit)
      }

      console.log(`✅ Successfully scraped ${polls.length} polls`)

    } catch (error) {
      console.error('❌ RealClearPolitics scraping failed:', error)
      throw error
    }

    return polls
  }

  /**
   * Scrape individual poll page
   */
  private async scrapePollPage(url: string): Promise<ScrapedPoll | null> {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`
    const html = await this.fetchHtml(fullUrl)
    const $ = this.parseHtml(html)

    try {
      // Extract poll metadata
      const pollster = $('.poll-table .pollster').first().text().trim()
      const dateStr = $('.poll-table .date').first().text().trim()
      const sampleSizeStr = $('.poll-table .sample').first().text().trim()
      const methodologyStr = $('.poll-table .method').first().text().trim()

      // Parse sample size (e.g., "1000 LV" -> 1000)
      const sampleMatch = sampleSizeStr.match(/(\d+)/)
      const sampleSize = sampleMatch ? parseInt(sampleMatch[1]) : 0

      // Parse population (LV, RV, A)
      const population = this.parsePopulation(sampleSizeStr)

      // Parse methodology
      const methodology = this.parseMethodology(methodologyStr)

      // Parse date
      const pollDate = this.parseDate(dateStr)

      // Extract candidates and results
      const candidates: ScrapedPoll['candidates'] = []
      $('.poll-table .candidate-row').each((_, row) => {
        const name = $(row).find('.candidate-name').text().trim()
        const party = $(row).find('.party').text().trim() as any
        const percentageStr = $(row).find('.percentage').text().trim()
        const percentage = parseFloat(percentageStr.replace('%', ''))

        if (name && !isNaN(percentage)) {
          candidates.push({ name, party, percentage })
        }
      })

      // Extract race information
      const raceName = $('h1').first().text().trim()
      const raceInfo = this.parseRaceInfo(raceName)

      const poll: ScrapedPoll = {
        pollster,
        date: pollDate,
        sampleSize,
        population,
        methodology,
        candidates,
        race: raceInfo,
        sourceUrl: fullUrl,
        scrapedAt: new Date(),
      }

      return this.validatePoll(poll) ? poll : null

    } catch (error) {
      console.error(`Failed to parse poll page ${url}:`, error)
      return null
    }
  }

  /**
   * Parse population type from sample size string
   */
  private parsePopulation(str: string): 'LV' | 'RV' | 'A' {
    const upper = str.toUpperCase()
    if (upper.includes('LV')) return 'LV'
    if (upper.includes('RV')) return 'RV'
    return 'A'
  }

  /**
   * Parse methodology from string
   */
  private parseMethodology(str: string): ScrapedPoll['methodology'] {
    const lower = str.toLowerCase()
    if (lower.includes('online')) return 'Online'
    if (lower.includes('phone')) return 'Live Phone'
    if (lower.includes('ivr') || lower.includes('automated')) return 'IVR'
    return 'Mixed'
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(str: string): Date {
    // Handle various date formats
    // Example: "1/15 - 1/18" -> use end date
    const parts = str.split('-')
    const dateStr = parts.length > 1 ? parts[1].trim() : parts[0].trim()

    // Parse MM/DD format (assumes current year)
    const [month, day] = dateStr.split('/')
    const year = new Date().getFullYear()

    return new Date(year, parseInt(month) - 1, parseInt(day))
  }

  /**
   * Parse race information from title
   */
  private parseRaceInfo(title: string): ScrapedPoll['race'] {
    const year = 2024 // Extract from title if possible

    // Determine race type
    let type: ScrapedPoll['race']['type'] = 'Other'
    if (title.includes('President')) type = 'Presidential'
    else if (title.includes('Senate')) type = 'Senate'
    else if (title.includes('House')) type = 'House'
    else if (title.includes('Governor')) type = 'Governor'

    // Extract state (e.g., "Pennsylvania Senate Race")
    const stateMatch = title.match(/([A-Z][a-z]+)\s+(Senate|House|Governor)/)
    const state = stateMatch ? stateMatch[1] : 'National'

    return { state, type, year }
  }
}
```

### FiveThirtyEight Scraper

**File**: `apps/api/src/scrapers/sources/FiveThirtyEightScraper.ts`

```typescript
import { BaseScraper, ScrapedPoll } from '../base/BaseScraper'
import axios from 'axios'
import { parse } from 'csv-parse/sync'

export class FiveThirtyEightScraper extends BaseScraper {
  private readonly dataUrl = 'https://projects.fivethirtyeight.com/polls/data/polls.csv'

  constructor() {
    super({
      baseUrl: 'https://projects.fivethirtyeight.com',
      rateLimit: 5000, // Be nice to FiveThirtyEight
    })
  }

  public async scrape(): Promise<ScrapedPoll[]> {
    const polls: ScrapedPoll[] = []

    try {
      console.log('🔍 Fetching FiveThirtyEight data...')

      // Fetch CSV data
      const response = await axios.get(this.dataUrl)
      const records = parse(response.data, {
        columns: true,
        skip_empty_lines: true,
      })

      console.log(`📊 Found ${records.length} poll records`)

      // Process each record
      for (const record of records) {
        const poll = this.transformRecord(record)
        if (poll && this.validatePoll(poll)) {
          polls.push(poll)
          await this.savePoll(poll)
        }
      }

      console.log(`✅ Processed ${polls.length} polls from FiveThirtyEight`)

    } catch (error) {
      console.error('❌ FiveThirtyEight scraping failed:', error)
      throw error
    }

    return polls
  }

  /**
   * Transform CSV record to ScrapedPoll format
   */
  private transformRecord(record: any): ScrapedPoll | null {
    try {
      return {
        pollster: record.pollster || record.pollster_name,
        sponsor: record.sponsor || undefined,
        date: new Date(record.end_date || record.date),
        sampleSize: parseInt(record.sample_size) || 0,
        marginOfError: parseFloat(record.margin_of_error) || undefined,
        population: this.mapPopulation(record.population),
        methodology: this.mapMethodology(record.methodology),
        candidates: this.extractCandidates(record),
        race: {
          state: record.state || 'National',
          type: this.mapRaceType(record.race),
          year: parseInt(record.cycle) || new Date().getFullYear(),
        },
        sourceUrl: this.dataUrl,
        scrapedAt: new Date(),
      }
    } catch (error) {
      console.error('Failed to transform record:', error)
      return null
    }
  }

  private mapPopulation(pop: string): 'LV' | 'RV' | 'A' {
    const normalized = pop?.toLowerCase() || ''
    if (normalized.includes('lv') || normalized.includes('likely')) return 'LV'
    if (normalized.includes('rv') || normalized.includes('registered')) return 'RV'
    return 'A'
  }

  private mapMethodology(method: string): ScrapedPoll['methodology'] {
    const normalized = method?.toLowerCase() || ''
    if (normalized.includes('online')) return 'Online'
    if (normalized.includes('phone') && !normalized.includes('ivr')) return 'Live Phone'
    if (normalized.includes('ivr')) return 'IVR'
    return 'Mixed'
  }

  private mapRaceType(race: string): ScrapedPoll['race']['type'] {
    const normalized = race?.toLowerCase() || ''
    if (normalized.includes('president')) return 'Presidential'
    if (normalized.includes('senate')) return 'Senate'
    if (normalized.includes('house')) return 'House'
    if (normalized.includes('governor')) return 'Governor'
    return 'Other'
  }

  private extractCandidates(record: any): ScrapedPoll['candidates'] {
    // FiveThirtyEight format has candidate-specific columns
    const candidates: ScrapedPoll['candidates'] = []

    // This depends on their CSV format - adjust as needed
    if (record.candidate_name && record.pct) {
      candidates.push({
        name: record.candidate_name,
        party: this.inferParty(record.candidate_name),
        percentage: parseFloat(record.pct),
      })
    }

    return candidates
  }

  private inferParty(name: string): 'D' | 'R' | 'I' | 'Other' {
    // Simple heuristic - improve this
    const lower = name.toLowerCase()
    if (lower.includes('biden') || lower.includes('harris')) return 'D'
    if (lower.includes('trump') || lower.includes('desantis')) return 'R'
    return 'Other'
  }
}
```

### Job Scheduling with BullMQ

**File**: `apps/api/src/jobs/scraper.jobs.ts`

```typescript
import { Queue, Worker } from 'bullmq'
import { RealClearPoliticsScraper } from '../scrapers/sources/RealClearPoliticsScraper'
import { FiveThirtyEightScraper } from '../scrapers/sources/FiveThirtyEightScraper'
import { redis } from '../utils/redis'

// Create job queue
export const scraperQueue = new Queue('poll-scrapers', {
  connection: redis,
})

// Define job types
interface ScraperJob {
  source: 'rcp' | 'fivethirtyeight' | 'economist'
}

// Add jobs to queue
export async function scheduleScraperJobs() {
  // RealClearPolitics - every 6 hours
  await scraperQueue.add(
    'scrape-rcp',
    { source: 'rcp' },
    {
      repeat: {
        pattern: '0 */6 * * *', // Every 6 hours
      },
    }
  )

  // FiveThirtyEight - daily at 2 AM
  await scraperQueue.add(
    'scrape-538',
    { source: 'fivethirtyeight' },
    {
      repeat: {
        pattern: '0 2 * * *', // Daily at 2 AM
      },
    }
  )

  console.log('✅ Scraper jobs scheduled')
}

// Worker to process jobs
export const scraperWorker = new Worker<ScraperJob>(
  'poll-scrapers',
  async (job) => {
    console.log(`🔄 Processing job: ${job.name}`)

    try {
      let scraper

      switch (job.data.source) {
        case 'rcp':
          scraper = new RealClearPoliticsScraper()
          break
        case 'fivethirtyeight':
          scraper = new FiveThirtyEightScraper()
          break
        default:
          throw new Error(`Unknown scraper: ${job.data.source}`)
      }

      const polls = await scraper.scrape()

      return {
        success: true,
        pollsScraped: polls.length,
        source: job.data.source,
      }
    } catch (error) {
      console.error(`❌ Job ${job.name} failed:`, error)
      throw error
    }
  },
  {
    connection: redis,
    concurrency: 1, // Run one scraper at a time
  }
)

// Handle worker events
scraperWorker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.name} completed:`, result)
})

scraperWorker.on('failed', (job, error) => {
  console.error(`❌ Job ${job?.name} failed:`, error)
})
```

---

## 🧪 Testing Scrapers

**File**: `apps/api/tests/scrapers/rcp.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals'
import { RealClearPoliticsScraper } from '../../src/scrapers/sources/RealClearPoliticsScraper'
import fs from 'fs/promises'

describe('RealClearPoliticsScraper', () => {
  it('should parse poll data correctly', async () => {
    const scraper = new RealClearPoliticsScraper()

    // Load sample HTML
    const sampleHtml = await fs.readFile('./tests/fixtures/rcp-sample.html', 'utf-8')

    // Test parsing
    const $ = scraper['parseHtml'](sampleHtml)
    expect($).toBeDefined()
  })

  it('should validate poll data', () => {
    const scraper = new RealClearPoliticsScraper()

    const validPoll = {
      pollster: 'Test Pollster',
      date: new Date(),
      sampleSize: 1000,
      population: 'LV' as const,
      methodology: 'Online' as const,
      candidates: [
        { name: 'Candidate A', party: 'D' as const, percentage: 48 },
        { name: 'Candidate B', party: 'R' as const, percentage: 46 },
      ],
      race: { state: 'National', type: 'Presidential' as const, year: 2024 },
      sourceUrl: 'https://example.com',
      scrapedAt: new Date(),
    }

    expect(scraper['validatePoll'](validPoll)).toBe(true)
  })
})
```

---

## ✅ Definition of Done

Track 4 is complete when:

- [ ] Base scraper class implemented
- [ ] RealClearPolitics scraper working
- [ ] FiveThirtyEight scraper working
- [ ] The Economist scraper working (or 3rd source)
- [ ] Data validation implemented
- [ ] Duplicate detection working
- [ ] Error handling and retry logic
- [ ] BullMQ job scheduling configured
- [ ] Rate limiting implemented
- [ ] Unit tests for all scrapers (>80% coverage)
- [ ] Integration tests with database
- [ ] Scraper monitoring/logging
- [ ] Documentation complete
- [ ] `.claude/WORK_ASSIGNMENTS.md` updated to ✅ COMPLETE

---

## 📚 Resources

- Cheerio: https://cheerio.js.org/
- BullMQ: https://docs.bullmq.io/
- CSV Parse: https://csv.js.org/parse/

---

**Happy scraping! 📥**
