# API Documentation

> Comprehensive API documentation for the Polling Dashboard

## Base URL

```
Development: http://localhost:3001
Production: https://api.pollingdashboard.com
```

## Authentication

Most endpoints are publicly accessible. Premium endpoints require API key authentication.

### API Key Authentication

Include your API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your_api_key_here" \
  https://api.pollingdashboard.com/api/races
```

## Rate Limiting

| Tier | Requests per Day | Requests per Hour |
|------|-----------------|-------------------|
| Free | 100 | 50 |
| Developer | 10,000 | 1,000 |
| Professional | 100,000 | 10,000 |
| Enterprise | Unlimited | Unlimited |

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Endpoints

### Health

#### GET /health

Basic health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 3600
}
```

#### GET /health/detailed

Detailed health check with database and Redis status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 3600,
  "database": "ok",
  "redis": "ok",
  "memory": {
    "rss": "128MB",
    "heapTotal": "64MB",
    "heapUsed": "48MB",
    "external": "2MB"
  }
}
```

---

### Races

#### GET /api/races

Get all races with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by race type (president, senate, house, governor, mayor) |
| state | string | Filter by state (2-letter code) |
| status | string | Filter by status (upcoming, active, completed) |
| limit | number | Number of results (default: 20, max: 100) |
| offset | number | Pagination offset (default: 0) |

**Example Request:**
```bash
curl "https://api.pollingdashboard.com/api/races?type=senate&state=PA&limit=10"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "pa-senate-2024",
      "raceType": "senate",
      "raceName": "Pennsylvania Senate 2024",
      "state": "PA",
      "electionDate": "2024-11-05",
      "status": "upcoming",
      "candidates": [
        {
          "id": "uuid",
          "name": "Bob Casey",
          "party": "D",
          "incumbent": true
        },
        {
          "id": "uuid",
          "name": "Dave McCormick",
          "party": "R",
          "incumbent": false
        }
      ],
      "competitiveRating": "lean_d",
      "importanceScore": 9,
      "currentLeader": "Bob Casey",
      "currentMargin": 4.3,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 35,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /api/races/:slug

Get a single race by slug.

**Example Request:**
```bash
curl "https://api.pollingdashboard.com/api/races/pa-senate-2024"
```

**Response:**
```json
{
  "id": "uuid",
  "slug": "pa-senate-2024",
  "raceType": "senate",
  "raceName": "Pennsylvania Senate 2024",
  "state": "PA",
  "electionDate": "2024-11-05",
  "candidates": [...],
  "polls": [...],
  "forecasts": [...]
}
```

---

### Polls

#### GET /api/polls

Get all polls with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| raceId | string | Filter by race ID |
| pollsterId | string | Filter by pollster ID |
| startDate | string | Filter polls after this date (ISO 8601) |
| endDate | string | Filter polls before this date (ISO 8601) |
| limit | number | Number of results (default: 20, max: 100) |
| offset | number | Pagination offset (default: 0) |

**Example Request:**
```bash
curl "https://api.pollingdashboard.com/api/polls?raceId=uuid&limit=20"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "raceId": "uuid",
      "pollsterId": "uuid",
      "pollDate": "2024-01-14",
      "fieldDateStart": "2024-01-10",
      "fieldDateEnd": "2024-01-13",
      "sampleSize": 892,
      "methodology": "phone",
      "populationType": "lv",
      "results": {
        "Bob Casey": 49.5,
        "Dave McCormick": 45.2,
        "Other": 2.1,
        "Undecided": 3.2
      },
      "marginOfError": 3.4,
      "confidenceLevel": 95,
      "sourceUrl": "https://example.com/poll",
      "pollster": {
        "name": "Monmouth University",
        "slug": "monmouth",
        "methodologyGrade": "A+"
      },
      "createdAt": "2024-01-14T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 127,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Pollsters

#### GET /api/pollsters

Get all pollsters with rankings.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| orderBy | string | Sort by (accuracy, pollCount, grade) |
| limit | number | Number of results (default: 20) |
| offset | number | Pagination offset (default: 0) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Monmouth University",
      "slug": "monmouth",
      "organization": "Monmouth University Polling Institute",
      "website": "https://monmouth.edu/polling",
      "overallAccuracy": 94.2,
      "methodologyGrade": "A+",
      "transparencyScore": 0.95,
      "sampleSizeAvg": 825,
      "partisanLean": "neutral",
      "pollCount": 347,
      "firstPollDate": "2005-03-15",
      "lastPollDate": "2024-01-14"
    }
  ]
}
```

---

### Forecasts

#### GET /api/forecasts/presidential

Get the current presidential forecast.

**Response:**
```json
{
  "forecastDate": "2024-01-15",
  "modelVersion": "v2.1.3",
  "probabilities": {
    "Joe Biden": 0.523,
    "Donald Trump": 0.467,
    "other": 0.010
  },
  "predictedVoteShare": {
    "Joe Biden": 50.8,
    "Donald Trump": 47.6,
    "other": 1.6
  },
  "electoralVotesExpected": {
    "D": 276,
    "R": 262
  },
  "simulationsRun": 10000,
  "volatilityIndex": 12.5,
  "contributingPolls": 127,
  "pollQualityScore": 87.3
}
```

#### GET /api/forecasts/senate

Get the current Senate control forecast.

#### GET /api/forecasts/house

Get the current House control forecast.

#### GET /api/forecasts/race/:raceId

Get the forecast for a specific race.

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "statusCode": 400
}
```

**Common HTTP Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Webhooks

Subscribe to real-time updates via webhooks.

### Available Events

- `poll.created` - New poll published
- `forecast.updated` - Forecast changed
- `race.rating_changed` - Race rating changed
- `result.updated` - Election results updated (election night)

### Webhook Payload

```json
{
  "event": "poll.created",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "data": {
    "pollId": "uuid",
    "raceId": "uuid",
    "raceName": "Pennsylvania Senate 2024",
    "pollster": "Monmouth University",
    "results": {...}
  }
}
```

---

## Code Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.pollingdashboard.com',
  headers: {
    'X-API-Key': 'your_api_key_here',
  },
})

// Get all Senate races
const races = await api.get('/api/races', {
  params: {
    type: 'senate',
    limit: 50,
  },
})

console.log(races.data)
```

### Python

```python
import requests

API_KEY = 'your_api_key_here'
BASE_URL = 'https://api.pollingdashboard.com'

headers = {
    'X-API-Key': API_KEY
}

# Get all Senate races
response = requests.get(
    f'{BASE_URL}/api/races',
    headers=headers,
    params={'type': 'senate', 'limit': 50}
)

data = response.json()
print(data)
```

### R

```r
library(httr)
library(jsonlite)

API_KEY <- "your_api_key_here"
BASE_URL <- "https://api.pollingdashboard.com"

# Get all Senate races
response <- GET(
  paste0(BASE_URL, "/api/races"),
  add_headers(`X-API-Key` = API_KEY),
  query = list(type = "senate", limit = 50)
)

data <- fromJSON(content(response, "text"))
print(data)
```

---

## Support

- **Documentation**: https://docs.pollingdashboard.com
- **Email**: api@pollingdashboard.com
- **Discord**: https://discord.gg/polling
- **GitHub Issues**: https://github.com/ElliottSax/poll/issues

---

**Last Updated**: January 2024
**API Version**: 1.0.0
