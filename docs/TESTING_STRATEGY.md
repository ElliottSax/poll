# Testing Strategy - Polling Dashboard

**Version**: 1.0.0
**Last Updated**: 2025-11-18

---

## Overview

Comprehensive testing strategy following the **70/20/10 testing pyramid**:
- **70% Unit Tests**: Fast, isolated tests of business logic
- **20% Integration Tests**: Component interactions, database, APIs
- **10% End-to-End Tests**: Critical user flows across full stack

### Testing Goals

1. **Coverage**: 70-80% overall, 95%+ on critical paths
2. **Speed**: Full test suite runs in <5 minutes
3. **Reliability**: <1% flaky tests, deterministic results
4. **Developer Experience**: Fast feedback loop, clear error messages
5. **Confidence**: Deploy to production without manual QA

---

## Test Pyramid

```
          /\
         /  \        E2E Tests (10%)
        /____\       - Critical user flows
       /      \      - Playwright tests
      /        \     - Runs: 5-10 minutes
     /__________\
    /            \   Integration Tests (20%)
   /              \  - API endpoints
  /                \ - Database queries
 /                  \- External services
/____________________\
                     Unit Tests (70%)
                     - Business logic
                     - Pure functions
                     - Runs: <2 minutes
```

---

## Unit Tests (70%)

### Backend Unit Tests (Python)

**Framework**: pytest + pytest-cov

**Example Test File:**

```python
# tests/unit/test_poll_aggregation.py
import pytest
from datetime import datetime, timedelta
from forecasting.aggregation import calculate_weighted_average, PollWeight

class TestPollAggregation:
    """Test suite for poll aggregation logic."""

    def test_recency_weight_decay(self):
        """Test that poll weight decays exponentially with age."""
        today = datetime.utcnow()
        week_ago = today - timedelta(days=7)

        weight_today = PollWeight.recency_weight(today, today)
        weight_week_ago = PollWeight.recency_weight(week_ago, today)

        assert weight_today == 1.0
        assert 0.69 < weight_week_ago < 0.71  # 0.95^7 ≈ 0.70

    def test_sample_size_weight(self):
        """Test sample size weighting formula."""
        assert PollWeight.sample_size_weight(300) == pytest.approx(0.71, rel=0.01)
        assert PollWeight.sample_size_weight(600) == 1.0
        assert PollWeight.sample_size_weight(1200) == pytest.approx(1.41, rel=0.01)

    def test_pollster_rating_weight(self):
        """Test pollster rating to weight mapping."""
        assert PollWeight.rating_weight('A+') == 1.5
        assert PollWeight.rating_weight('A') == 1.3
        assert PollWeight.rating_weight('B+') == 1.0
        assert PollWeight.rating_weight('C') == 0.5

    def test_weighted_average_calculation(self):
        """Test weighted average with multiple polls."""
        polls = [
            {'pct': 49, 'days_old': 0, 'sample': 1200, 'rating': 'A+'},
            {'pct': 48, 'days_old': 3, 'sample': 800, 'rating': 'A-'},
            {'pct': 47, 'days_old': 7, 'sample': 600, 'rating': 'B+'},
        ]

        result = calculate_weighted_average(polls)

        # Expected: ~48.5 (closer to recent, high-rated polls)
        assert 48.0 < result < 49.0

    def test_empty_polls_list(self):
        """Test that empty polls list returns None."""
        result = calculate_weighted_average([])
        assert result is None

    @pytest.mark.parametrize("pct,expected", [
        (0, 0),
        (50, 50),
        (100, 100),
    ])
    def test_edge_case_percentages(self, pct, expected):
        """Test edge cases for poll percentages."""
        polls = [{'pct': pct, 'days_old': 0, 'sample': 600, 'rating': 'A'}]
        result = calculate_weighted_average(polls)
        assert result == expected
```

**Test Fixtures:**

```python
# tests/conftest.py
import pytest
from datetime import datetime

@pytest.fixture
def sample_poll():
    """Fixture for a sample poll."""
    return {
        'id': 'poll-123',
        'pollster': 'Quinnipiac University',
        'rating': 'A-',
        'sample_size': 1204,
        'field_date_start': datetime(2024, 10, 24),
        'field_date_end': datetime(2024, 10, 28),
        'population': 'LV',
        'methodology': 'Phone',
        'pct_d': 49,
        'pct_r': 45,
    }

@pytest.fixture
def mock_polls_list():
    """Fixture for list of polls."""
    return [
        {'pct': 49, 'days_old': 1, 'sample': 1200, 'rating': 'A+'},
        {'pct': 48, 'days_old': 3, 'sample': 800, 'rating': 'A'},
        {'pct': 47, 'days_old': 7, 'sample': 600, 'rating': 'B+'},
    ]
```

**Mocking External Dependencies:**

```python
# tests/unit/test_scraper.py
import pytest
from unittest.mock import Mock, patch
from scrapers.fivethirtyeight import scrape_polls

def test_scrape_polls_success():
    """Test successful poll scraping."""
    with patch('scrapers.fivethirtyeight.httpx.get') as mock_get:
        # Mock HTTP response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = 'pollster,date,sample_size,pct\nQuinnipiac,2024-10-28,1204,49'
        mock_get.return_value = mock_response

        # Call scraper
        polls = scrape_polls()

        # Assert
        assert len(polls) == 1
        assert polls[0]['pollster'] == 'Quinnipiac'
        assert polls[0]['sample_size'] == 1204
```

---

### Frontend Unit Tests (TypeScript)

**Framework**: Vitest + React Testing Library

**Example Test File:**

```typescript
// tests/unit/components/RaceCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RaceCard } from '@/components/RaceCard';

describe('RaceCard', () => {
  const mockRace = {
    id: 'race-123',
    name: 'Pennsylvania Senate 2024',
    state: 'PA',
    type: 'senate',
    candidates: [
      { name: 'Bob Casey', party: 'D', poll_average: 48.5 },
      { name: 'Dave McCormick', party: 'R', poll_average: 44.2 },
    ],
  };

  it('renders race name correctly', () => {
    render(<RaceCard race={mockRace} />);
    expect(screen.getByText('Pennsylvania Senate 2024')).toBeInTheDocument();
  });

  it('displays candidate poll averages', () => {
    render(<RaceCard race={mockRace} />);
    expect(screen.getByText('48.5%')).toBeInTheDocument();
    expect(screen.getByText('44.2%')).toBeInTheDocument();
  });

  it('shows margin correctly', () => {
    render(<RaceCard race={mockRace} />);
    expect(screen.getByText('D+4.3')).toBeInTheDocument();
  });

  it('applies correct party colors', () => {
    render(<RaceCard race={mockRace} />);
    const demCard = screen.getByText('Bob Casey').closest('div');
    expect(demCard).toHaveClass('bg-blue-100');
  });
});
```

**Testing Hooks:**

```typescript
// tests/unit/hooks/usePolls.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { usePolls } from '@/hooks/usePolls';
import { trpc } from '@/lib/trpc';
import { vi } from 'vitest';

vi.mock('@/lib/trpc');

describe('usePolls hook', () => {
  it('fetches polls on mount', async () => {
    const mockPolls = [
      { id: 'poll-1', pollster: 'Quinnipiac', pct: 49 },
      { id: 'poll-2', pollster: 'Marist', pct: 48 },
    ];

    (trpc.poll.list.useQuery as any).mockReturnValue({
      data: mockPolls,
      isLoading: false,
    });

    const { result } = renderHook(() => usePolls('race-123'));

    await waitFor(() => {
      expect(result.current.polls).toEqual(mockPolls);
    });
  });

  it('handles loading state', () => {
    (trpc.poll.list.useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() => usePolls('race-123'));
    expect(result.current.isLoading).toBe(true);
  });
});
```

---

## Integration Tests (20%)

### API Integration Tests

**Framework**: pytest + httpx

```python
# tests/integration/test_api.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_get_race_by_id():
    """Test GET /races/{id} endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/races/race-123")

        assert response.status_code == 200
        data = response.json()
        assert data['id'] == 'race-123'
        assert 'name' in data
        assert 'candidates' in data

@pytest.mark.asyncio
async def test_list_races_with_filters():
    """Test GET /races with query parameters."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/races?state=PA&type=senate")

        assert response.status_code == 200
        data = response.json()
        assert all(r['state_code'] == 'PA' for r in data['data'])
        assert all(r['race_type'] == 'senate' for r in data['data'])

@pytest.mark.asyncio
async def test_create_prediction_requires_auth():
    """Test that creating prediction requires authentication."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/v1/predictions", json={
            'race_id': 'race-123',
            'winner_id': 'candidate-456',
            'margin': 5.0,
        })

        assert response.status_code == 401  # Unauthorized
```

---

### Database Integration Tests

**Framework**: pytest + pytest-postgresql

```python
# tests/integration/test_database.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models import Poll, Race, Pollster

@pytest.fixture
def db_session(postgresql):
    """Create test database session."""
    engine = create_engine(postgresql.url())
    session = Session(engine)

    # Create tables
    Base.metadata.create_all(engine)

    yield session

    session.close()
    Base.metadata.drop_all(engine)

def test_insert_poll(db_session):
    """Test inserting poll into database."""
    poll = Poll(
        pollster='Quinnipiac',
        sample_size=1204,
        field_date_start='2024-10-24',
        field_date_end='2024-10-28',
        pct_d=49,
        pct_r=45,
    )

    db_session.add(poll)
    db_session.commit()

    # Query back
    retrieved = db_session.query(Poll).first()
    assert retrieved.pollster == 'Quinnipiac'
    assert retrieved.sample_size == 1204

def test_continuous_aggregate_update(db_session):
    """Test TimescaleDB continuous aggregate."""
    # Insert 10 polls
    for i in range(10):
        poll = Poll(
            race_id='race-123',
            field_date='2024-10-28',
            pct_d=48 + i * 0.1,
        )
        db_session.add(poll)

    db_session.commit()

    # Query continuous aggregate
    result = db_session.execute(
        "SELECT AVG(pct_d) FROM poll_aggregates_7d WHERE race_id = 'race-123'"
    ).scalar()

    assert 48 < result < 49
```

---

### tRPC Integration Tests

```typescript
// tests/integration/trpc.test.ts
import { describe, it, expect } from 'vitest';
import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/routers/root';

const createCaller = createCallerFactory(appRouter);

describe('tRPC Integration', () => {
  it('fetches races by state', async () => {
    const caller = createCaller({ db, user: null });

    const races = await caller.race.list({ state: 'PA', type: 'senate' });

    expect(races).toBeInstanceOf(Array);
    expect(races.length).toBeGreaterThan(0);
    expect(races[0]).toHaveProperty('name');
  });

  it('throws error for non-existent race', async () => {
    const caller = createCaller({ db, user: null });

    await expect(
      caller.race.byId('non-existent-id')
    ).rejects.toThrow('Race not found');
  });
});
```

---

## End-to-End Tests (10%)

### Playwright E2E Tests

**Framework**: Playwright (Chromium, Firefox, WebKit)

```typescript
// tests/e2e/race-page.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Race Page', () => {
  test('displays race details correctly', async ({ page }) => {
    // Navigate to race page
    await page.goto('/races/pa-senate-2024');

    // Wait for data to load
    await page.waitForSelector('[data-testid="race-title"]');

    // Assert race title
    const title = await page.textContent('[data-testid="race-title"]');
    expect(title).toContain('Pennsylvania Senate 2024');

    // Assert candidates shown
    const candidates = await page.$$('[data-testid="candidate-card"]');
    expect(candidates.length).toBeGreaterThanOrEqual(2);

    // Assert poll chart visible
    await expect(page.locator('[data-testid="poll-chart"]')).toBeVisible();
  });

  test('user can create what-if scenario', async ({ page }) => {
    await page.goto('/races/pa-senate-2024');

    // Click "Create Scenario" button
    await page.click('[data-testid="create-scenario-btn"]');

    // Adjust slider for candidate
    const slider = page.locator('[data-testid="scenario-slider-casey"]');
    await slider.fill('52');  // Adjust to 52%

    // Click "Run Simulation"
    await page.click('[data-testid="run-simulation-btn"]');

    // Wait for results
    await page.waitForSelector('[data-testid="scenario-results"]');

    // Assert updated probability
    const probability = await page.textContent('[data-testid="win-probability"]');
    expect(probability).toMatch(/\d+%/);
  });

  test('search functionality works', async ({ page }) => {
    await page.goto('/');

    // Type in search box
    await page.fill('[data-testid="search-input"]', 'Pennsylvania');

    // Wait for suggestions
    await page.waitForSelector('[data-testid="search-suggestion"]');

    // Click first suggestion
    await page.click('[data-testid="search-suggestion"]');

    // Should navigate to race page
    await expect(page).toHaveURL(/\/races\/pa-/);
  });
});
```

**Visual Regression Testing:**

```typescript
// tests/e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('race page chart renders correctly', async ({ page }) => {
    await page.goto('/races/pa-senate-2024');
    await page.waitForSelector('[data-testid="poll-chart"]');

    const chart = page.locator('[data-testid="poll-chart"]');
    await expect(chart).toHaveScreenshot('poll-chart.png');
  });
});
```

---

## Performance Testing

### Load Testing (k6)

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users for 5 minutes
    { duration: '1m', target: 500 },  // Spike to 500 users
    { duration: '2m', target: 500 },  // Stay at 500 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // Less than 1% error rate
  },
};

export default function () {
  // Test API endpoints
  let res = http.get('https://api.pollviz.com/api/v1/races?state=PA');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Run Load Test:**
```bash
k6 run tests/performance/load-test.js
```

---

## Test Coverage

### Backend Coverage (pytest-cov)

```bash
# Run tests with coverage
pytest --cov=app --cov-report=html --cov-report=term

# Coverage report
=============================== Coverage Summary ===============================
Name                        Stmts   Miss  Cover
-----------------------------------------------
app/aggregation.py             145      8    94%
app/forecasting.py             203     12    94%
app/api/routes.py              187     15    92%
app/models.py                   98      3    97%
app/utils.py                    76      5    93%
-----------------------------------------------
TOTAL                         1,247     78    94%
```

**Enforce Coverage Threshold:**

```toml
# pyproject.toml
[tool.pytest.ini_options]
minversion = "7.0"
addopts = "--cov=app --cov-fail-under=70"
testpaths = ["tests"]
```

---

### Frontend Coverage (Vitest)

```bash
# Run tests with coverage
vitest run --coverage

# Coverage report
=============================== Coverage Summary ===============================
File                    % Stmts   % Branch   % Funcs   % Lines
-----------------------------------------------------------------------------
components/RaceCard.tsx   95.23     88.88     100.00     95.00
hooks/usePolls.ts         87.50     75.00      80.00     87.50
lib/aggregation.ts        92.30     85.71      90.00     92.00
-----------------------------------------------------------------------------
All files                 89.45     82.15      87.50     89.12
```

---

## CI/CD Testing Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: timescale/timescaledb:latest-pg16
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install poetry
          poetry install

      - name: Run unit tests
        run: poetry run pytest tests/unit --cov=app

      - name: Run integration tests
        run: poetry run pytest tests/integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Build application
        run: npm run build

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results
          path: test-results/
```

---

## Test Data Management

### Factory Pattern for Test Data

```python
# tests/factories.py
import factory
from datetime import datetime, timedelta
from app.models import Poll, Race, Pollster

class PollsterFactory(factory.Factory):
    class Meta:
        model = Pollster

    name = factory.Faker('company')
    rating = factory.Iterator(['A+', 'A', 'A-', 'B+', 'B'])
    methodology_score = factory.Faker('random_int', min=60, max=100)

class RaceFactory(factory.Factory):
    class Meta:
        model = Race

    name = factory.Faker('sentence', nb_words=4)
    state_code = factory.Faker('state_abbr')
    race_type = factory.Iterator(['president', 'senate', 'house'])
    election_date = datetime(2024, 11, 5)

class PollFactory(factory.Factory):
    class Meta:
        model = Poll

    pollster = factory.SubFactory(PollsterFactory)
    race = factory.SubFactory(RaceFactory)
    sample_size = factory.Faker('random_int', min=400, max=2000)
    field_date_start = factory.LazyFunction(lambda: datetime.utcnow() - timedelta(days=7))
    field_date_end = factory.LazyFunction(lambda: datetime.utcnow() - timedelta(days=3))
    pct_d = factory.Faker('random_int', min=40, max=55)
    pct_r = factory.Faker('random_int', min=40, max=55)

# Usage in tests
def test_poll_aggregation():
    polls = PollFactory.create_batch(10)
    result = calculate_weighted_average(polls)
    assert result is not None
```

---

## Test Environment Setup

### Docker Compose for Tests

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  postgres-test:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass
      POSTGRES_DB: testdb
    ports:
      - '5433:5432'

  redis-test:
    image: redis:7-alpine
    ports:
      - '6380:6379'
```

**Run tests with Docker:**
```bash
docker-compose -f docker-compose.test.yml up -d
pytest
docker-compose -f docker-compose.test.yml down
```

---

## Continuous Monitoring

### Test Metrics Dashboard

Track over time:
- Test count (trending up over time)
- Code coverage (maintain >70%)
- Test execution time (keep <5 minutes)
- Flaky test rate (keep <1%)
- PR test pass rate (target 95%+)

---

## Best Practices

1. **Write Tests First** (TDD): For critical features, write tests before code
2. **Test Behavior, Not Implementation**: Focus on what code does, not how
3. **One Assert Per Test**: Makes failures easier to diagnose
4. **Arrange-Act-Assert**: Structure tests clearly
5. **Descriptive Names**: `test_weighted_average_with_multiple_polls()` not `test_1()`
6. **Avoid Test Interdependence**: Each test should run independently
7. **Mock External Services**: Don't hit real APIs in tests
8. **Fast Feedback**: Unit tests should run in seconds, not minutes

---

## References

- [Testing Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Pytest Documentation](https://docs.pytest.org/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [k6 Load Testing Guide](https://k6.io/docs/)
