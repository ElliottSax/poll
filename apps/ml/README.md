# Poll Dashboard - ML Service

Python FastAPI service for data scraping, processing, and statistical forecasting.

## 🎯 Workstream 3: Data & ML

This is the workspace for **Instance 3** in parallel development.

## 📁 Structure

```
apps/ml/
├── main.py              # FastAPI application entry point
├── scrapers/            # Poll data scrapers
│   ├── base_scraper.py  # Abstract base class
│   └── rcp_scraper.py   # RealClearPolitics scraper (TODO)
├── models/              # Statistical models (Phase 2)
├── api/                 # FastAPI route handlers
├── utils/               # Helper functions
└── tests/               # Unit tests
```

## 🚀 Quick Start

### 1. Set up Python environment

```bash
cd apps/ml

# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run development server

```bash
# Start FastAPI server with auto-reload
uvicorn main:app --reload --port 8000

# Or use Python directly
python main.py
```

### 4. Test the API

```bash
# Health check
curl http://localhost:8000/health

# Or open in browser
open http://localhost:8000/docs  # Swagger UI
```

## 📋 Current Tasks (Week 1-2)

See `TASK_ASSIGNMENTS.md` for full task list.

**Priority tasks**:
- [ ] Complete RCP scraper implementation
- [ ] Add error handling and retry logic
- [ ] Implement data validation
- [ ] Create FiveThirtyEight scraper
- [ ] Set up scheduled scraping jobs

## 🔨 Development Workflow

### Creating a new scraper

1. Create new file in `scrapers/` directory
2. Inherit from `BaseScraper`
3. Implement required methods:
   - `scrape_polls()`
   - `validate_poll()`
4. Add to `scrapers/__init__.py`

Example:
```python
from scrapers.base_scraper import BaseScraper

class NewSourceScraper(BaseScraper):
    def __init__(self):
        super().__init__("NewSource")

    async def scrape_polls(self, race_id=None):
        # Implementation
        pass

    async def validate_poll(self, poll_data):
        # Validation logic
        pass
```

### Running scrapers

```python
import asyncio
from scrapers import RCPScraper

async def main():
    scraper = RCPScraper()
    result = await scraper.run()
    print(result)

asyncio.run(main())
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=scrapers --cov-report=html

# Run specific test file
pytest tests/test_scrapers.py
```

## 📊 Data Format

### Standard Poll Format

All scrapers should output polls in this format:

```python
{
    "pollster": "Emerson College",
    "date": "2024-11-15",
    "sample_size": 1000,
    "margin_of_error": 3.0,
    "methodology": "Online",  # Online, Phone, IVR, Mixed
    "population": "LV",       # LV, RV, A (Likely Voters, Registered, Adults)
    "race_id": "2024-president",
    "results": [
        {"candidate": "Candidate A", "percentage": 48.0},
        {"candidate": "Candidate B", "percentage": 45.0},
        {"candidate": "Undecided", "percentage": 7.0}
    ],
    "url": "https://source.com/poll-link",
    "partisan": None          # D, R, or None
}
```

## 🔗 Integration Points

### With Backend API (Instance 2)

- Scrapers write to PostgreSQL database
- Use shared types from `packages/types/`
- Coordinate database schema changes

### With Frontend (Instance 1)

- ML service provides forecast API endpoints
- Frontend consumes forecast data
- Real-time updates via webhooks

## 🐛 Debugging

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Run with verbose output
uvicorn main:app --reload --log-level debug
```

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [BeautifulSoup4 Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [pandas Documentation](https://pandas.pydata.org/docs/)
- [scikit-learn Documentation](https://scikit-learn.org/)

## 🎯 Phase Roadmap

### Phase 1 (Current)
- ✅ FastAPI service setup
- ✅ Base scraper framework
- [ ] RealClearPolitics scraper
- [ ] FiveThirtyEight importer
- [ ] Data validation pipeline
- [ ] Scheduled scraping jobs

### Phase 2 (Future)
- [ ] Advanced forecasting models
- [ ] Monte Carlo simulations
- [ ] Demographic analysis
- [ ] Sentiment analysis

---

**Instance 3 starts here! 🚀**

See `PARALLEL_DEV_GUIDE.md` for coordination with other workstreams.
