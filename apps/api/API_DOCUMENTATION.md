# Polling Dashboard API Documentation

Version: 1.0.0
Base URL: `https://api.pollingdashboard.com` (Production)
Base URL: `http://localhost:3001` (Development)

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Endpoints](#endpoints)
  - [Health](#health)
  - [Polls](#polls)
  - [Races](#races)
  - [Pollsters](#pollsters)
  - [Forecasts](#forecasts)

## Authentication

### API Key Authentication

For server-to-server requests:

```bash
curl -H "X-API-Key: your_api_key" \
  https://api.pollingdashboard.com/api/polls
```

### JWT Authentication

For user-authenticated requests:

```bash
curl -H "Authorization: Bearer your_jwt_token" \
  https://api.pollingdashboard.com/api/polls
```

## Error Handling

All errors follow this format:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "statusCode": 400,
  "requestId": "req_abc123"
}
```

### Common Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 400 | ValidationError | Invalid request parameters |
| 401 | UnauthorizedError | Missing or invalid authentication |
| 403 | ForbiddenError | Insufficient permissions |
| 404 | NotFoundError | Resource not found |
| 429 | TooManyRequestsError | Rate limit exceeded |
| 500 | InternalServerError | Server error |

## Rate Limiting

- **Default**: 100 requests per minute per API key
- **Headers**: Check `X-RateLimit-Remaining` and `Retry-After`

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Pagination

List endpoints support pagination:

```bash
GET /api/polls?limit=20&offset=40
```

Response format:

```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "hasMore": true
  }
}
```

---

## Endpoints

### Health

#### GET /health

Basic health check.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z",
  "uptime": 3600
}
```

#### GET /health/detailed

Detailed health check with service status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z",
  "uptime": 3600,
  "database": "ok",
  "redis": "ok",
  "memory": {
    "rss": "120MB",
    "heapTotal": "80MB",
    "heapUsed": "60MB",
    "external": "5MB"
  }
}
```

---

### Polls

#### GET /api/polls

Get all polls with optional filtering.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| raceId | UUID | Filter by race ID |
| pollsterId | UUID | Filter by pollster ID |
| startDate | ISO 8601 | Polls from this date |
| endDate | ISO 8601 | Polls until this date |
| methodology | Enum | `phone`, `online`, `ivr`, `sms`, `mixed` |
| limit | Integer | Items per page (1-100, default: 20) |
| offset | Integer | Pagination offset (default: 0) |

**Example Request:**

```bash
GET /api/polls?raceId=550e8400-e29b-41d4-a716-446655440000&limit=10
```

**Example Response:**

```json
{
  "data": [
    {
      "id": "poll-123",
      "raceId": "race-456",
      "pollsterId": "pollster-789",
      "pollDate": "2024-01-15T00:00:00Z",
      "sampleSize": 1200,
      "methodology": "phone",
      "populationType": "lv",
      "results": {
        "John Smith": 48.5,
        "Jane Doe": 46.2,
        "Other": 5.3
      },
      "marginOfError": 3.1,
      "race": {
        "id": "race-456",
        "slug": "us-president-2024",
        "raceName": "US Presidential Election 2024"
      },
      "pollster": {
        "id": "pollster-789",
        "name": "Quality Polling Institute",
        "methodologyGrade": "A"
      }
    }
  ],
  "meta": {
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /api/polls/:id

Get a single poll by ID.

**Example Request:**

```bash
GET /api/polls/poll-123
```

**Example Response:**

```json
{
  "id": "poll-123",
  "raceId": "race-456",
  "pollsterId": "pollster-789",
  "pollDate": "2024-01-15T00:00:00Z",
  "fieldDateStart": "2024-01-12T00:00:00Z",
  "fieldDateEnd": "2024-01-14T00:00:00Z",
  "sampleSize": 1200,
  "methodology": "phone",
  "populationType": "lv",
  "results": {
    "John Smith": 48.5,
    "Jane Doe": 46.2
  },
  "marginOfError": 3.1,
  "confidenceLevel": 95,
  "sourceUrl": "https://example.com/poll",
  "isPartisan": false,
  "isOutlier": false,
  "isVerified": true,
  "race": {...},
  "pollster": {...}
}
```

#### GET /api/polls/race/:raceId

Get all polls for a specific race.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | Integer | Items to return (default: 50) |

**Example Request:**

```bash
GET /api/polls/race/race-456?limit=20
```

#### GET /api/polls/recent

Get most recent polls across all races.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | Integer | Items to return (default: 10) |

**Example Request:**

```bash
GET /api/polls/recent?limit=5
```

---

### Races

#### GET /api/races

Get all races with optional filtering.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| type | Enum | `president`, `senate`, `house`, `governor`, `mayor` |
| state | String | Two-letter state code (e.g., "PA") |
| status | Enum | `upcoming`, `active`, `completed` |
| limit | Integer | Items per page (default: 20) |
| offset | Integer | Pagination offset (default: 0) |

**Example Response:**

```json
{
  "data": [
    {
      "id": "race-456",
      "slug": "us-president-2024",
      "raceType": "president",
      "raceName": "US Presidential Election 2024",
      "country": "USA",
      "electionDate": "2024-11-05T00:00:00Z",
      "status": "active",
      "currentLeader": "John Smith",
      "currentMargin": 2.3,
      "competitiveRating": "tossup",
      "electoralVotes": 538
    }
  ],
  "meta": {...}
}
```

#### GET /api/races/:slug

Get a specific race by slug.

**Example Request:**

```bash
GET /api/races/us-president-2024
```

---

### Pollsters

#### GET /api/pollsters

Get all pollsters with optional sorting.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| orderBy | Enum | `accuracy`, `pollCount`, `grade`, `name` |
| limit | Integer | Items per page (default: 20) |
| offset | Integer | Pagination offset (default: 0) |

**Example Response:**

```json
{
  "data": [
    {
      "id": "pollster-789",
      "name": "Quality Polling Institute",
      "slug": "quality-polling",
      "overallAccuracy": 92.5,
      "methodologyGrade": "A",
      "transparencyScore": 95,
      "pollCount": 150,
      "website": "https://qualitypolling.com"
    }
  ],
  "meta": {...}
}
```

#### GET /api/pollsters/:slug

Get a specific pollster by slug.

#### GET /api/pollsters/:slug/accuracy

Get accuracy metrics for a pollster.

#### GET /api/pollsters/rankings/top

Get top-rated pollsters.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | Integer | Number of pollsters (default: 10) |

---

### Forecasts

#### GET /api/forecasts/presidential

Get current presidential forecast.

**Example Response:**

```json
{
  "id": "forecast-123",
  "raceId": "race-456",
  "forecastDate": "2024-01-15T12:00:00Z",
  "modelVersion": "v2.1",
  "probabilities": {
    "John Smith": 52.3,
    "Jane Doe": 47.7
  },
  "predictedMargins": {
    "John Smith": "+4.6"
  },
  "electoralVotesExpected": {
    "John Smith": 285,
    "Jane Doe": 253
  },
  "simulationsRun": 10000,
  "volatilityIndex": 8.5
}
```

#### GET /api/forecasts/senate

Get Senate forecast.

#### GET /api/forecasts/house

Get House forecast.

#### GET /api/forecasts/race/:raceId

Get forecast for a specific race.

#### GET /api/forecasts/race/:raceId/history

Get forecast history for a race.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | Integer | Number of historical forecasts (default: 30) |

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Using fetch
const response = await fetch('https://api.pollingdashboard.com/api/polls', {
  headers: {
    'X-API-Key': process.env.API_KEY,
    'Content-Type': 'application/json',
  },
})

const data = await response.json()
console.log(data.data) // Array of polls
```

### Python

```python
import requests

response = requests.get(
    'https://api.pollingdashboard.com/api/polls',
    headers={'X-API-Key': 'your_api_key'}
)

data = response.json()
print(data['data'])  # Array of polls
```

### cURL

```bash
curl -H "X-API-Key: your_api_key" \
  "https://api.pollingdashboard.com/api/polls?limit=5"
```

---

## WebSocket API

Connect to real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws')

ws.onopen = () => {
  // Subscribe to race updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    raceId: 'race-456'
  }))
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('New update:', data)
}
```

### WebSocket Events

- `poll:new` - New poll published
- `forecast:updated` - Forecast recalculated
- `race:status_changed` - Race status updated

---

## Support

- Documentation: https://docs.pollingdashboard.com
- API Status: https://status.pollingdashboard.com
- Issues: https://github.com/polling-dashboard/issues
