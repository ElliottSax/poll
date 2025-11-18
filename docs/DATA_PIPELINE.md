# Data Pipeline Architecture - Polling Dashboard

**Version**: 1.0.0
**Last Updated**: 2025-11-18

---

## Overview

The data pipeline ingests polling data from multiple sources, validates, normalizes, and transforms it through a **Medallion Architecture** (Silver → Gold layers) for consumption by the API and frontend.

### Pipeline Goals

1. **Reliability**: 99.5% uptime for scraping and data ingestion
2. **Freshness**: New polls available within 15 minutes of publication
3. **Quality**: 99%+ accuracy in data extraction and normalization
4. **Scalability**: Handle 1,000+ polls/day during peak election season
5. **Transparency**: Full audit trail of data transformations

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │FiveThirtyEight│  │RealClearPol│  │ Pollsters │   + 15 more│
│  └────────────┘  └────────────┘  └────────────┘             │
└────────┬──────────────┬────────────────┬──────────────────────┘
         │              │                │
         ▼              ▼                ▼
┌──────────────────────────────────────────────────────────────┐
│                   SCRAPING LAYER                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   Scrapy   │  │ Playwright │  │   APIs     │             │
│  │  Workers   │  │  Workers   │  │  Clients   │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└────────┬──────────────┬────────────────┬──────────────────────┘
         │              │                │
         ▼              ▼                ▼
┌──────────────────────────────────────────────────────────────┐
│                  BRONZE LAYER (Raw Data)                      │
│                    PostgreSQL + S3                            │
│   ┌──────────────────────────────────────────────┐           │
│   │  Raw HTML/JSON stored with metadata          │           │
│   │  - Source URL, timestamp, scraper version    │           │
│   └──────────────────────────────────────────────┘           │
└────────┬──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│              VALIDATION & NORMALIZATION                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Pydantic  │  │ Great      │  │ Anomaly    │             │
│  │  Schemas   │  │Expectations│  │ Detection  │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└────────┬──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│            SILVER LAYER (Cleaned Data)                        │
│               TimescaleDB Hypertables                         │
│   ┌──────────────────────────────────────────────┐           │
│   │  Normalized polls with validation             │           │
│   │  - Standardized pollster names                │           │
│   │  - Date parsing, deduplication                │           │
│   │  - Candidate name matching                    │           │
│   └──────────────────────────────────────────────┘           │
└────────┬──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│               TRANSFORMATION LAYER                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Polars    │  │  PyMC      │  │ Aggregation│             │
│  │ (ETL Jobs) │  │ (Forecast) │  │   Engine   │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└────────┬──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│              GOLD LAYER (Analytics-Ready)                     │
│        TimescaleDB Continuous Aggregates + Redis              │
│   ┌──────────────────────────────────────────────┐           │
│   │  - Poll aggregates (weighted averages)        │           │
│   │  - Forecasts (Monte Carlo simulations)        │           │
│   │  - Trends (7-day, 30-day rolling)             │           │
│   │  - Cached API responses                       │           │
│   └──────────────────────────────────────────────┘           │
└────────┬──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                   API & FRONTEND                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Fastify   │  │   Next.js  │  │   Mobile   │             │
│  │    API     │  │  Frontend  │  │    App     │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Sources

### Primary Sources (Aggregators)

| Source | Type | Update Frequency | Polls/Month | Priority |
|--------|------|------------------|-------------|----------|
| **FiveThirtyEight** | Aggregator | Hourly | 500+ | P0 |
| **RealClearPolitics** | Aggregator | Hourly | 400+ | P0 |
| **The Economist** | Aggregator | Daily | 300+ | P1 |

### Secondary Sources (Direct Pollsters)

| Source | Type | Update Frequency | Methodology |
|--------|------|------------------|-------------|
| **NYT/Siena College** | Pollster | Per race | Phone (Live) |
| **Monmouth University** | Pollster | Weekly | Phone (Live) |
| **Quinnipiac** | Pollster | Weekly | Phone (Live) |
| **Emerson College** | Pollster | Bi-weekly | Online |
| **Marist College** | Pollster | Monthly | Phone (Live) |
| **Marquette** | Pollster | Monthly | Phone (Live) |
| **SurveyUSA** | Pollster | Weekly | IVR |

### Tertiary Sources (RSS Feeds, APIs)

| Source | Type | Access Method |
|--------|------|---------------|
| **Google News** | News API | RSS Feed |
| **Twitter/X** | Social | API |
| **Pollster Websites** | Direct | Web Scraping |

---

## Scraping Layer

### Scraper Architecture

#### 1. Scrapy Framework (Structured Sites)

**Use Case**: Websites with consistent HTML structure (FiveThirtyEight, RealClearPolitics)

**Features:**
- Asynchronous requests (100+ concurrent)
- Built-in retry logic with exponential backoff
- Middleware for headers, cookies, robots.txt compliance
- Item pipelines for data validation
- Job scheduling with Scrapyd

**Example Scraper:**

```python
# scrapers/spiders/fivethirtyeight.py
import scrapy
from datetime import datetime
from scrapers.items import PollItem

class FiveThirtyEightSpider(scrapy.Spider):
    name = 'fivethirtyeight'
    allowed_domains = ['projects.fivethirtyeight.com']
    start_urls = [
        'https://projects.fivethirtyeight.com/polls/data/president_polls.csv',
        'https://projects.fivethirtyeight.com/polls/data/senate_polls.csv',
    ]

    custom_settings = {
        'DOWNLOAD_DELAY': 2,  # Polite scraping (2 seconds between requests)
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'USER_AGENT': 'PollViz Data Collector (contact@pollviz.com)',
    }

    def parse(self, response):
        # FiveThirtyEight provides CSV download
        import pandas as pd
        from io import StringIO

        df = pd.read_csv(StringIO(response.text))

        for _, row in df.iterrows():
            yield PollItem(
                source='fivethirtyeight',
                pollster=row['pollster'],
                sponsor=row['sponsors'],
                field_date_start=row['start_date'],
                field_date_end=row['end_date'],
                sample_size=row['sample_size'],
                population=row['population'],
                methodology=row['methodology'],
                state=row['state'],
                race_type=row['race_type'],
                candidate=row['candidate_name'],
                party=row['party'],
                pct=row['pct'],
                url=row['url'],
                scraped_at=datetime.utcnow(),
            )
```

#### 2. Playwright (JavaScript-Heavy Sites)

**Use Case**: Sites requiring JavaScript execution (dynamic charts, infinite scroll)

**Features:**
- Real browser automation (Chromium, Firefox, WebKit)
- Handles JavaScript rendering, AJAX requests
- Network interception for API calls
- Screenshot capture for debugging

**Example Scraper:**

```python
# scrapers/playwright_scrapers/realclearpolitics.py
from playwright.async_api import async_playwright
import asyncio

async def scrape_realclearpolitics():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate to RCP polls page
        await page.goto('https://www.realclearpolitics.com/epolls/latest_polls/')
        await page.wait_for_selector('.race-name')

        # Extract poll data
        polls = await page.evaluate('''
            () => {
                return Array.from(document.querySelectorAll('.poll-row')).map(row => ({
                    pollster: row.querySelector('.pollster').textContent.trim(),
                    date: row.querySelector('.date').textContent.trim(),
                    sample: row.querySelector('.sample').textContent.trim(),
                    margin: row.querySelector('.margin').textContent.trim(),
                }));
            }
        ''')

        await browser.close()
        return polls

if __name__ == '__main__':
    polls = asyncio.run(scrape_realclearpolitics())
    print(f"Scraped {len(polls)} polls")
```

#### 3. API Clients (Official APIs)

**Use Case**: Pollsters/aggregators providing official APIs

**Example**:

```python
# scrapers/api_clients/google_civic.py
import httpx
from typing import List, Dict

class GoogleCivicAPIClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = 'https://www.googleapis.com/civicinfo/v2'

    async def get_elections(self) -> List[Dict]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f'{self.base_url}/elections',
                params={'key': self.api_key}
            )
            response.raise_for_status()
            return response.json()['elections']

    async def get_voter_info(self, address: str) -> Dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f'{self.base_url}/voterinfo',
                params={
                    'key': self.api_key,
                    'address': address,
                }
            )
            response.raise_for_status()
            return response.json()
```

---

### Scraper Scheduling

**Celery Beat Schedule:**

```python
# celeryconfig.py
from celery.schedules import crontab

beat_schedule = {
    # High-priority aggregators (every 15 minutes)
    'scrape-fivethirtyeight': {
        'task': 'scrapers.tasks.scrape_fivethirtyeight',
        'schedule': crontab(minute='*/15'),
    },
    'scrape-realclearpolitics': {
        'task': 'scrapers.tasks.scrape_realclearpolitics',
        'schedule': crontab(minute='*/15'),
    },

    # Direct pollsters (every hour)
    'scrape-nyt-siena': {
        'task': 'scrapers.tasks.scrape_nyt_siena',
        'schedule': crontab(minute='0'),
    },
    'scrape-monmouth': {
        'task': 'scrapers.tasks.scrape_monmouth',
        'schedule': crontab(minute='10'),
    },

    # RSS feeds (every 30 minutes)
    'scrape-google-news': {
        'task': 'scrapers.tasks.scrape_google_news',
        'schedule': crontab(minute='*/30'),
    },

    # Weekly maintenance
    'scrape-historical-data': {
        'task': 'scrapers.tasks.scrape_historical',
        'schedule': crontab(day_of_week='sunday', hour='2', minute='0'),
    },
}
```

---

### Anti-Bot Evasion

**Techniques (Ethical & Legal):**

1. **Rotate User Agents:**
   ```python
   USER_AGENTS = [
       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
       'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
       # ... 20+ user agents
   ]
   ```

2. **Polite Rate Limiting:**
   ```python
   DOWNLOAD_DELAY = 2  # 2 seconds between requests
   CONCURRENT_REQUESTS_PER_DOMAIN = 1  # One request at a time per domain
   ```

3. **Respect robots.txt:**
   ```python
   ROBOTSTXT_OBEY = True
   ```

4. **Proxy Rotation (if blocked):**
   - Use residential proxy services (Bright Data, Smartproxy)
   - Rotate IP addresses every 100 requests
   - Only if experiencing blocking (most polling sites are open)

5. **Browser Fingerprinting:**
   ```python
   # Playwright with realistic fingerprint
   context = await browser.new_context(
       viewport={'width': 1920, 'height': 1080},
       user_agent='Mozilla/5.0...',
       locale='en-US',
       timezone_id='America/New_York',
   )
   ```

---

## Bronze Layer (Raw Data Storage)

### Purpose

Store **raw, unprocessed data** exactly as scraped for:
- Debugging extraction logic
- Re-parsing if normalization changes
- Legal compliance (audit trail)

### Storage Strategy

**PostgreSQL for Metadata + S3 for Blobs:**

```sql
-- Bronze layer table
CREATE TABLE raw_scrapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(100) NOT NULL,           -- 'fivethirtyeight', 'rcp', etc.
  url TEXT NOT NULL,
  scrape_type VARCHAR(50),                -- 'html', 'json', 'csv', 'api'
  raw_content TEXT,                        -- Actual HTML/JSON
  s3_key TEXT,                             -- S3 path if large file
  scraper_version VARCHAR(20),
  http_status INTEGER,
  response_time_ms INTEGER,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_raw_scrapes_source_date (source, scraped_at DESC)
);
```

**S3 Storage for Large Files:**

```python
import boto3
from datetime import datetime

s3_client = boto3.client('s3', region_name='us-east-1')

def store_raw_scrape(source: str, url: str, content: str):
    # Generate S3 key
    timestamp = datetime.utcnow().strftime('%Y/%m/%d/%H')
    s3_key = f'raw-scrapes/{source}/{timestamp}/{uuid.uuid4()}.html'

    # Upload to S3
    s3_client.put_object(
        Bucket='pollviz-raw-data',
        Key=s3_key,
        Body=content.encode('utf-8'),
        ContentType='text/html',
        Metadata={
            'source': source,
            'url': url,
            'scraped_at': datetime.utcnow().isoformat(),
        }
    )

    # Store metadata in PostgreSQL
    db.execute(
        '''
        INSERT INTO raw_scrapes (source, url, s3_key, scraper_version, scraped_at)
        VALUES ($1, $2, $3, $4, $5)
        ''',
        source, url, s3_key, '1.0.0', datetime.utcnow()
    )
```

---

## Validation & Normalization

### Schema Validation (Pydantic)

```python
# validation/schemas.py
from pydantic import BaseModel, Field, validator
from datetime import date
from typing import Optional, Literal

class PollSchema(BaseModel):
    # Required fields
    pollster: str = Field(..., min_length=2, max_length=200)
    field_date_start: date
    field_date_end: date
    sample_size: int = Field(..., ge=50, le=50000)
    race_type: Literal['president', 'senate', 'house', 'governor']
    state_code: str = Field(..., regex=r'^[A-Z]{2}$')  # e.g., 'PA', 'GA'
    candidate_name: str
    party: Literal['D', 'R', 'L', 'G', 'I', 'O']  # Democrat, Republican, etc.
    pct: float = Field(..., ge=0, le=100)

    # Optional fields
    population: Optional[Literal['LV', 'RV', 'A']] = None  # Likely, Registered, All
    methodology: Optional[Literal['Phone', 'Online', 'IVR', 'Mixed']] = None
    sponsor: Optional[str] = None
    margin_of_error: Optional[float] = Field(None, ge=0, le=20)
    url: Optional[str] = None

    @validator('field_date_end')
    def end_after_start(cls, v, values):
        if 'field_date_start' in values and v < values['field_date_start']:
            raise ValueError('field_date_end must be >= field_date_start')
        return v

    @validator('pct')
    def valid_percentage(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Percentage must be between 0 and 100')
        return v

    class Config:
        orm_mode = True
```

**Usage:**

```python
from validation.schemas import PollSchema

def validate_and_insert(raw_poll: dict):
    try:
        # Validate with Pydantic
        validated_poll = PollSchema(**raw_poll)

        # Insert into Silver layer
        db.execute(
            '''
            INSERT INTO polls (pollster, field_date_start, ...)
            VALUES ($1, $2, ...)
            ''',
            validated_poll.pollster,
            validated_poll.field_date_start,
            # ...
        )
    except ValidationError as e:
        # Log validation failure
        logger.error(f"Validation failed: {e.json()}")

        # Store in quarantine table for manual review
        db.execute(
            '''
            INSERT INTO quarantine (raw_data, validation_errors, created_at)
            VALUES ($1, $2, $3)
            ''',
            raw_poll, e.json(), datetime.utcnow()
        )
```

---

### Data Quality Checks (Great Expectations)

```python
# validation/expectations.py
import great_expectations as gx

def validate_polls_batch(df):
    context = gx.get_context()

    # Define expectations
    expectations = [
        # Sample size checks
        gx.expectations.ExpectColumnValuesToBeBetween(
            column='sample_size',
            min_value=400,
            max_value=2000,
            mostly=0.95,  # 95% of polls should meet this
        ),

        # Date range checks
        gx.expectations.ExpectColumnValuesToBeBetween(
            column='field_date_start',
            min_value='2024-01-01',
            max_value='2024-11-05',
        ),

        # Percentage sum checks
        gx.expectations.ExpectColumnSumToBeBetween(
            column='pct',
            min_value=98,
            max_value=102,  # Allow for rounding errors
            row_condition='race_id == race_id',  # Group by race
        ),

        # Outlier detection
        gx.expectations.ExpectColumnStdevToBeLessThan(
            column='pct',
            max_value=15,  # Flag if standard deviation > 15 points
        ),
    ]

    # Run validation
    results = context.run_checkpoint(
        checkpoint_name='polls_validation',
        batch_request=df,
        expectation_suite_name='polls_suite',
    )

    if not results.success:
        # Send alert
        send_alert(f"Data quality check failed: {results}")

    return results
```

---

## Silver Layer (Cleaned Data)

### TimescaleDB Hypertables

```sql
-- Create hypertable for time-series polls
SELECT create_hypertable('polls', 'field_date',
  chunk_time_interval => INTERVAL '1 month');

-- Create indexes for common queries
CREATE INDEX idx_polls_race_date ON polls (race_id, field_date DESC);
CREATE INDEX idx_polls_pollster ON polls (pollster_id);
CREATE INDEX idx_polls_state ON polls (state_code, field_date DESC);

-- Enable compression for chunks older than 7 days
ALTER TABLE polls SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'race_id, pollster_id'
);

SELECT add_compression_policy('polls', INTERVAL '7 days');
```

### Deduplication Logic

**Problem**: Same poll may be scraped from multiple sources.

**Solution**: Generate content hash and check for duplicates.

```python
import hashlib
import json

def generate_poll_hash(poll: dict) -> str:
    """
    Generate unique hash for poll based on:
    - Pollster
    - Field dates
    - Sample size
    - Candidate results
    """
    content = {
        'pollster': poll['pollster'].lower().strip(),
        'field_date_start': poll['field_date_start'].isoformat(),
        'field_date_end': poll['field_date_end'].isoformat(),
        'sample_size': poll['sample_size'],
        'results': sorted([
            (poll['candidate_name'], poll['pct'])
            for candidate in poll['candidates']
        ]),
    }

    hash_string = json.dumps(content, sort_keys=True)
    return hashlib.sha256(hash_string.encode()).hexdigest()

def insert_poll_with_dedup(poll: dict):
    poll_hash = generate_poll_hash(poll)

    # Check if poll already exists
    existing = db.fetchone(
        'SELECT id FROM polls WHERE content_hash = $1',
        poll_hash
    )

    if existing:
        logger.info(f"Duplicate poll detected: {poll_hash}")
        return existing['id']

    # Insert new poll
    poll_id = db.execute(
        '''
        INSERT INTO polls (content_hash, pollster, ...)
        VALUES ($1, $2, ...)
        RETURNING id
        ''',
        poll_hash, poll['pollster'], ...
    )

    return poll_id
```

---

## Transformation Layer

### Poll Aggregation (Polars)

**Why Polars?** 5-10x faster than Pandas, uses 2-4x less memory.

```python
# transformations/aggregate_polls.py
import polars as pl
from datetime import datetime, timedelta

def calculate_weighted_average(race_id: str, days: int = 14):
    # Fetch polls from last N days
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Load data with Polars (lazy evaluation)
    df = pl.scan_parquet(f's3://pollviz/polls/{race_id}/*.parquet')

    # Filter by date range
    df = df.filter(
        (pl.col('field_date') >= start_date) &
        (pl.col('field_date') <= end_date)
    )

    # Calculate weights
    df = df.with_columns([
        # Recency weight: 0.95 ^ days_old
        (0.95 ** ((end_date - pl.col('field_date')).dt.days())).alias('weight_recency'),

        # Sample size weight: sqrt(sample_size / 600)
        (pl.col('sample_size') / 600).sqrt().alias('weight_sample'),

        # Pollster rating weight (lookup from pollsters table)
        pl.col('pollster_rating').map_dict({
            'A+': 1.5, 'A': 1.3, 'A-': 1.2,
            'B+': 1.0, 'B': 0.9, 'B-': 0.8,
            'C+': 0.7, 'C': 0.5,
        }).alias('weight_rating'),
    ])

    # Combine weights
    df = df.with_columns(
        (pl.col('weight_recency') * pl.col('weight_sample') * pl.col('weight_rating')).alias('weight_final')
    )

    # Group by candidate and calculate weighted average
    result = df.groupby('candidate_id').agg([
        (pl.col('pct') * pl.col('weight_final')).sum().alias('weighted_sum'),
        pl.col('weight_final').sum().alias('total_weight'),
    ]).with_columns(
        (pl.col('weighted_sum') / pl.col('total_weight')).alias('weighted_avg')
    ).collect()  # Execute lazy query

    return result
```

---

## Gold Layer (Analytics-Ready)

### Continuous Aggregates (TimescaleDB)

```sql
-- 7-day rolling average (auto-updated)
CREATE MATERIALIZED VIEW poll_aggregates_7d
WITH (timescaledb.continuous) AS
SELECT
  race_id,
  candidate_id,
  time_bucket('1 day', field_date) AS bucket,
  AVG(pct) AS avg_pct,
  COUNT(*) AS poll_count,
  STDDEV(pct) AS stddev_pct
FROM polls
WHERE field_date >= NOW() - INTERVAL '90 days'
GROUP BY race_id, candidate_id, bucket;

-- Refresh policy (every hour)
SELECT add_continuous_aggregate_policy('poll_aggregates_7d',
  start_offset => INTERVAL '30 days',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');
```

### Redis Caching

```python
# caching/redis_cache.py
import redis
import json
from typing import Optional

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    decode_responses=True,
)

def cache_api_response(key: str, data: dict, ttl: int = 300):
    """
    Cache API response with TTL.

    Args:
        key: Cache key (e.g., 'race:PA-SEN-2024')
        data: JSON-serializable data
        ttl: Time to live in seconds (default: 5 minutes)
    """
    redis_client.setex(
        key,
        ttl,
        json.dumps(data),
    )

def get_cached_response(key: str) -> Optional[dict]:
    """Retrieve cached response."""
    cached = redis_client.get(key)
    return json.loads(cached) if cached else None

def invalidate_cache(pattern: str):
    """Invalidate cache by pattern."""
    keys = redis_client.keys(pattern)
    if keys:
        redis_client.delete(*keys)

# Usage in API
def get_race_data(race_id: str):
    cache_key = f'race:{race_id}'

    # Try cache first
    cached = get_cached_response(cache_key)
    if cached:
        return cached

    # Query database
    race_data = db.fetch_race(race_id)

    # Cache for 5 minutes
    cache_api_response(cache_key, race_data, ttl=300)

    return race_data
```

---

## Monitoring & Alerting

### Scraper Health Metrics

```python
# monitoring/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Metrics
scrapes_total = Counter('scrapes_total', 'Total scrapes', ['source', 'status'])
scrape_duration = Histogram('scrape_duration_seconds', 'Scrape duration', ['source'])
polls_scraped = Gauge('polls_scraped_total', 'Total polls in database')
scraper_errors = Counter('scraper_errors_total', 'Scraper errors', ['source', 'error_type'])

def record_scrape(source: str, status: str, duration: float):
    scrapes_total.labels(source=source, status=status).inc()
    scrape_duration.labels(source=source).observe(duration)

    if status == 'error':
        scraper_errors.labels(source=source, error_type='http_error').inc()
```

### Alerts (Prometheus + Alertmanager)

```yaml
# prometheus/alerts.yml
groups:
  - name: scraper_alerts
    rules:
      # Alert if scraper fails 3 times in a row
      - alert: ScraperConsecutiveFailures
        expr: scraper_errors_total > 3
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Scraper {{ $labels.source }} has failed {{ $value }} times"

      # Alert if no polls scraped in 1 hour
      - alert: NoRecentPolls
        expr: rate(scrapes_total[1h]) == 0
        for: 1h
        labels:
          severity: critical
        annotations:
          summary: "No polls scraped from {{ $labels.source }} in last hour"

      # Alert if database lag > 30 minutes
      - alert: DatabaseLag
        expr: time() - max(polls.created_at) > 1800
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Database has not received new polls in 30 minutes"
```

---

## Performance Optimizations

1. **Batch Inserts**: Insert 500 polls at once (100x faster than individual)
2. **Connection Pooling**: PgBouncer reduces connections from 1000 → 25
3. **Lazy Loading**: Polars lazy evaluation defers computation
4. **Compression**: TimescaleDB 10:1 compression on historical data
5. **Caching**: Redis caches 70%+ of API requests
6. **Continuous Aggregates**: Pre-compute expensive rolling averages

---

## Disaster Recovery

1. **Daily Backups**: PostgreSQL to S3 (DigitalOcean Spaces)
2. **Point-in-Time Recovery**: 15-minute RPO
3. **Bronze Layer Retention**: Keep raw scrapes for 90 days
4. **Replay Capability**: Re-parse from Bronze if needed

---

## References

- [Scrapy Best Practices](https://docs.scrapy.org/en/latest/topics/practices.html)
- [TimescaleDB Continuous Aggregates](https://docs.timescale.com/timescaledb/latest/how-to-guides/continuous-aggregates/)
- [Polars User Guide](https://pola-rs.github.io/polars-book/)
