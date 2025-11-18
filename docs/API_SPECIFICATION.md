# API Specification - Polling Dashboard

**Version**: 1.0.0
**Last Updated**: 2025-11-18
**Base URL**: `https://api.pollviz.com`

---

## Overview

The Polling Dashboard API provides access to election polling data, forecasts, and analytics through both **tRPC** (internal) and **REST** (public) interfaces.

### API Styles

1. **tRPC** (Internal): End-to-end type-safe API for Next.js frontend
2. **REST** (Public): Standard REST API for external developers
3. **GraphQL** (Future): Planned for Month 9-12 if demand exists

---

## Authentication

### API Key Authentication (Public REST API)

```http
GET /api/v1/races HTTP/1.1
Host: api.pollviz.com
X-API-Key: pk_live_1234567890abcdef
```

### JWT Authentication (User-specific endpoints)

```http
GET /api/v1/user/predictions HTTP/1.1
Host: api.pollviz.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Rate Limiting

| Tier | Rate Limit | Monthly Quota | Price |
|------|------------|---------------|-------|
| **Free** | 60 req/hour | 10,000 requests | $0 |
| **Developer** | 600 req/hour | 100,000 requests | $29/month |
| **Pro** | 6,000 req/hour | 1,000,000 requests | $149/month |
| **Enterprise** | Unlimited | Unlimited | Custom |

Rate limit headers:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699564800
```

---

## REST API Endpoints

### Races

#### List Races

```http
GET /api/v1/races
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `state` | string | Filter by state code (e.g., "PA", "GA") | All states |
| `type` | enum | Race type: `president`, `senate`, `house`, `governor` | All types |
| `status` | enum | Status: `active`, `completed`, `upcoming` | `active` |
| `year` | number | Election year (e.g., 2024) | Current year |
| `limit` | number | Results per page (1-100) | 50 |
| `offset` | number | Pagination offset | 0 |

**Example Request:**
```bash
curl -X GET "https://api.pollviz.com/api/v1/races?state=PA&type=senate&limit=10" \
  -H "X-API-Key: pk_live_abc123"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "slug": "pa-senate-2024",
      "name": "Pennsylvania Senate 2024",
      "state_code": "PA",
      "race_type": "senate",
      "election_date": "2024-11-05",
      "is_active": true,
      "candidates": [
        {
          "id": "660f9511-f3ac-52e5-b827-557766551111",
          "name": "Bob Casey",
          "party": "D",
          "is_incumbent": true,
          "poll_average": 48.5,
          "forecast_probability": 0.72
        },
        {
          "id": "770g0622-g4bd-63f6-c938-668877662222",
          "name": "Dave McCormick",
          "party": "R",
          "is_incumbent": false,
          "poll_average": 44.2,
          "forecast_probability": 0.28
        }
      ],
      "poll_count": 47,
      "latest_poll_date": "2024-10-28",
      "forecast": {
        "win_probability": {
          "D": 0.72,
          "R": 0.28
        },
        "margin": 4.3,
        "uncertainty": "Medium",
        "last_updated": "2024-10-29T06:00:00Z"
      }
    }
  ],
  "meta": {
    "total": 156,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
```

---

#### Get Race by ID

```http
GET /api/v1/races/{raceId}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `raceId` | UUID | Race identifier |

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `include_polls` | boolean | Include poll history | `false` |
| `poll_limit` | number | Number of polls to return | 50 |

**Example Request:**
```bash
curl -X GET "https://api.pollviz.com/api/v1/races/550e8400-e29b-41d4-a716-446655440000?include_polls=true&poll_limit=20" \
  -H "X-API-Key: pk_live_abc123"
```

**Example Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "pa-senate-2024",
    "name": "Pennsylvania Senate 2024",
    "state_code": "PA",
    "district": null,
    "race_type": "senate",
    "election_date": "2024-11-05",
    "is_active": true,
    "candidates": [...],
    "polls": [
      {
        "id": "poll-123",
        "pollster": "Quinnipiac University",
        "pollster_rating": "A-",
        "sample_size": 1204,
        "population": "LV",
        "methodology": "Phone",
        "field_date_start": "2024-10-24",
        "field_date_end": "2024-10-28",
        "margin_of_error": 2.8,
        "results": {
          "Bob Casey (D)": 49,
          "Dave McCormick (R)": 45,
          "Other": 2,
          "Undecided": 4
        },
        "url": "https://poll.qu.edu/...",
        "internal": false,
        "partisan": "Nonpartisan"
      }
    ],
    "forecast": {
      "win_probability": { "D": 0.72, "R": 0.28 },
      "projected_margin": 4.3,
      "confidence_interval_95": [0.5, 8.1],
      "tipping_point_probability": 0.14,
      "simulations_run": 50000,
      "last_updated": "2024-10-29T06:00:00Z",
      "methodology_version": "2.1.0",
      "trend": {
        "direction": "D_GAINING",
        "movement_7d": 1.2,
        "movement_30d": 2.8
      }
    },
    "historical_results": [
      {
        "year": 2018,
        "winner": "Bob Casey (D)",
        "margin": 13.1,
        "dem_percent": 55.6,
        "rep_percent": 42.5
      }
    ]
  }
}
```

---

### Polls

#### List Polls

```http
GET /api/v1/polls
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `race_id` | UUID | Filter by race ID | All races |
| `state` | string | Filter by state code | All states |
| `pollster` | string | Filter by pollster slug | All pollsters |
| `start_date` | date | Polls after date (ISO 8601) | 30 days ago |
| `end_date` | date | Polls before date | Today |
| `population` | enum | `LV`, `RV`, `A` (Likely, Registered, All voters) | All |
| `min_sample` | number | Minimum sample size | 0 |
| `limit` | number | Results per page (1-100) | 50 |
| `offset` | number | Pagination offset | 0 |

**Example Request:**
```bash
curl -X GET "https://api.pollviz.com/api/v1/polls?state=PA&start_date=2024-10-01&min_sample=500" \
  -H "X-API-Key: pk_live_abc123"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "poll-456",
      "race_id": "550e8400-e29b-41d4-a716-446655440000",
      "race_name": "Pennsylvania Senate 2024",
      "pollster": {
        "id": "pollster-qu",
        "name": "Quinnipiac University",
        "rating": "A-",
        "methodology_score": 85,
        "historical_accuracy": 92
      },
      "sample_size": 1204,
      "population": "LV",
      "methodology": "Phone",
      "sponsor": null,
      "field_date_start": "2024-10-24",
      "field_date_end": "2024-10-28",
      "publish_date": "2024-10-29",
      "margin_of_error": 2.8,
      "results": {
        "Bob Casey (D)": 49,
        "Dave McCormick (R)": 45,
        "Other": 2,
        "Undecided": 4
      },
      "crosstabs_available": true,
      "demographics": {
        "age": {
          "18-34": { "Casey": 56, "McCormick": 38 },
          "35-54": { "Casey": 48, "McCormick": 46 },
          "55+": { "Casey": 47, "McCormick": 48 }
        },
        "gender": {
          "Male": { "Casey": 44, "McCormick": 50 },
          "Female": { "Casey": 53, "McCormick": 41 }
        }
      },
      "url": "https://poll.qu.edu/...",
      "internal": false,
      "partisan": "Nonpartisan"
    }
  ],
  "meta": {
    "total": 234,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

---

### Forecasts

#### Get Forecast by Race

```http
GET /api/v1/forecasts/{raceId}
```

**Example Response:**
```json
{
  "data": {
    "race_id": "550e8400-e29b-41d4-a716-446655440000",
    "forecast_type": "monte_carlo",
    "simulations": 50000,
    "last_updated": "2024-10-29T06:00:00Z",
    "win_probability": {
      "Bob Casey (D)": 0.72,
      "Dave McCormick (R)": 0.28
    },
    "projected_vote_share": {
      "Bob Casey (D)": 49.2,
      "Dave McCormick (R)": 45.1,
      "Other": 5.7
    },
    "confidence_intervals": {
      "Bob Casey (D)": {
        "90%": [45.8, 52.6],
        "95%": [44.5, 53.9],
        "99%": [42.1, 56.3]
      },
      "Dave McCormick (R)": {
        "90%": [41.7, 48.5],
        "95%": [40.4, 49.8],
        "99%": [38.0, 52.2]
      }
    },
    "probability_of_margin": {
      "D+10_or_more": 0.18,
      "D+5_to_10": 0.31,
      "D+0_to_5": 0.23,
      "R+0_to_5": 0.18,
      "R+5_to_10": 0.08,
      "R+10_or_more": 0.02
    },
    "tipping_point_probability": 0.14,
    "elasticity_score": 6.8,
    "uncertainty_level": "Medium",
    "historical_comparison": {
      "days_to_election": 7,
      "similar_races": [
        {
          "race": "PA Senate 2022",
          "days_out": 7,
          "forecast_margin": 2.1,
          "actual_margin": 4.9,
          "error": 2.8
        }
      ]
    },
    "scenario_analysis": {
      "if_undecideds_break_50_50": {
        "win_probability": { "D": 0.69, "R": 0.31 }
      },
      "if_undecideds_break_2_to_1_GOP": {
        "win_probability": { "D": 0.61, "R": 0.39 }
      },
      "if_turnout_up_5_percent": {
        "win_probability": { "D": 0.75, "R": 0.25 }
      }
    }
  }
}
```

---

### Pollsters

#### List Pollsters

```http
GET /api/v1/pollsters
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `min_rating` | string | Minimum rating (e.g., "B", "A-") | None |
| `methodology` | enum | `Phone`, `Online`, `IVR`, `Mixed` | All |
| `partisan` | enum | `Nonpartisan`, `Democratic`, `Republican` | All |
| `active_only` | boolean | Only pollsters active in last year | `true` |

**Example Response:**
```json
{
  "data": [
    {
      "id": "pollster-qu",
      "name": "Quinnipiac University",
      "slug": "quinnipiac",
      "rating": "A-",
      "methodology_score": 85,
      "historical_accuracy": 92,
      "bias_score": -0.2,
      "sample_size_avg": 1142,
      "polls_conducted": 1247,
      "primary_methodology": "Phone",
      "aapor_member": true,
      "transparency_score": 95,
      "house_effects": {
        "presidential": -0.4,
        "senate": -0.2,
        "governor": 0.1
      },
      "recent_polls": 34,
      "website": "https://poll.qu.edu",
      "partisan": "Nonpartisan"
    }
  ]
}
```

---

### Aggregations

#### Get Poll-of-Polls Aggregate

```http
GET /api/v1/aggregations/{raceId}
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `method` | enum | `weighted_average`, `bayesian`, `loess` | `weighted_average` |
| `days` | number | Days to include (7, 14, 30) | 14 |
| `min_pollster_rating` | string | Filter polls by rating | None |

**Example Response:**
```json
{
  "data": {
    "race_id": "550e8400-e29b-41d4-a716-446655440000",
    "method": "weighted_average",
    "timeframe_days": 14,
    "polls_included": 12,
    "aggregate": {
      "Bob Casey (D)": {
        "average": 48.5,
        "weighted_average": 49.1,
        "median": 48.0,
        "trend_7d": 0.8,
        "trend_30d": 2.3
      },
      "Dave McCormick (R)": {
        "average": 44.2,
        "weighted_average": 43.9,
        "median": 44.0,
        "trend_7d": -0.3,
        "trend_30d": -1.1
      }
    },
    "margin": {
      "average": 4.3,
      "direction": "D",
      "trend": "Widening"
    },
    "volatility": 1.8,
    "undecided_average": 6.7,
    "methodology_breakdown": {
      "Phone": 7,
      "Online": 4,
      "IVR": 1
    },
    "last_updated": "2024-10-29T06:00:00Z"
  }
}
```

---

### Trending

#### Get Trending Races

```http
GET /api/v1/trending
```

Returns races with biggest recent movement in polls.

**Example Response:**
```json
{
  "data": [
    {
      "race_id": "race-123",
      "race_name": "Arizona Senate 2024",
      "movement_7d": 3.2,
      "movement_direction": "D_GAINING",
      "current_margin": 1.1,
      "previous_margin": -2.1,
      "category_change": "Toss-up → Lean D",
      "polls_last_7d": 4
    }
  ]
}
```

---

## tRPC API (Internal)

### Type-Safe Router Definition

```typescript
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from './trpc';

export const appRouter = router({
  race: {
    list: publicProcedure
      .input(z.object({
        state: z.string().optional(),
        type: z.enum(['president', 'senate', 'house', 'governor']).optional(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ input, ctx }) => {
        // Implementation
      }),

    byId: publicProcedure
      .input(z.string().uuid())
      .query(async ({ input, ctx }) => {
        // Implementation
      }),

    createScenario: protectedProcedure
      .input(z.object({
        raceId: z.string().uuid(),
        adjustments: z.array(z.object({
          candidateId: z.string().uuid(),
          adjustment: z.number().min(-20).max(20),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        // Implementation
      }),
  },

  forecast: {
    byRace: publicProcedure
      .input(z.string().uuid())
      .query(async ({ input, ctx }) => {
        // Implementation
      }),

    simulate: publicProcedure
      .input(z.object({
        raceId: z.string().uuid(),
        simulations: z.number().min(1000).max(100000).default(10000),
      }))
      .query(async ({ input, ctx }) => {
        // Implementation
      }),
  },

  user: {
    predictions: protectedProcedure
      .query(async ({ ctx }) => {
        // Get user's predictions
      }),

    createPrediction: protectedProcedure
      .input(z.object({
        raceId: z.string().uuid(),
        winnerId: z.string().uuid(),
        margin: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Create prediction
      }),
  },
});

export type AppRouter = typeof appRouter;
```

---

## WebSocket API (Real-time Updates)

### Election Night Live Updates

```typescript
// Connect to WebSocket
const ws = new WebSocket('wss://api.pollviz.com/ws');

// Subscribe to race updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'race:550e8400-e29b-41d4-a716-446655440000',
}));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  /*
  {
    "type": "poll_update",
    "race_id": "550e8400-e29b-41d4-a716-446655440000",
    "poll": { ... },
    "aggregate_updated": true,
    "new_forecast": { ... }
  }
  */
};
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit of 60 requests per hour exceeded",
    "details": {
      "limit": 60,
      "reset_at": "2024-10-29T15:00:00Z"
    },
    "docs_url": "https://docs.pollviz.com/errors/rate-limit"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `INTERNAL_ERROR` | 500 | Server error |

---

## SDKs

### JavaScript/TypeScript

```bash
npm install @pollviz/sdk
```

```typescript
import { PollViz } from '@pollviz/sdk';

const client = new PollViz({ apiKey: 'pk_live_abc123' });

const races = await client.races.list({ state: 'PA', type: 'senate' });
const forecast = await client.forecasts.byRace('race-id');
```

### Python

```bash
pip install pollviz
```

```python
from pollviz import PollViz

client = PollViz(api_key='pk_live_abc123')

races = client.races.list(state='PA', type='senate')
forecast = client.forecasts.by_race('race-id')
```

---

## Webhooks

### Event Types

- `poll.created` - New poll added
- `race.updated` - Race data updated
- `forecast.updated` - Forecast recalculated
- `race.called` - Race called on election night

### Webhook Payload

```json
{
  "id": "evt_1234567890",
  "type": "poll.created",
  "created_at": "2024-10-29T14:30:00Z",
  "data": {
    "poll": { ... }
  }
}
```

---

## Changelog

- **v1.0.0** (2025-11-18): Initial API release
- **v0.9.0** (2025-10-01): Beta API release
- **v0.5.0** (2025-08-01): Alpha API release

---

## Support

- **Documentation**: https://docs.pollviz.com
- **API Status**: https://status.pollviz.com
- **Email**: api@pollviz.com
- **Discord**: https://discord.gg/pollviz
