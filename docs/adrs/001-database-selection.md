# ADR 001: Database Selection - PostgreSQL with TimescaleDB

**Status**: Accepted
**Date**: 2025-11-18
**Deciders**: Technical Team
**Context**: Need to select primary database for polling dashboard

---

## Context and Problem Statement

The polling dashboard requires a database that can handle:
- **Time-series data**: Polls with timestamps, requiring efficient querying by date ranges
- **Complex aggregations**: Poll-of-polls calculations, weighted averages, confidence intervals
- **Relational data**: Races, pollsters, candidates, results with complex relationships
- **Real-time queries**: Sub-500ms response times for API endpoints
- **Historical analysis**: Multi-year trend analysis across thousands of polls
- **Geographic queries**: State and county-level aggregations for electoral maps

We need to balance performance, developer experience, operational complexity, and cost.

---

## Decision Drivers

1. **Query Performance**: Must handle complex aggregations on time-series data efficiently
2. **Developer Experience**: Strong typing, good ORM support, familiar query language
3. **Scalability**: Can grow from hundreds to millions of polls
4. **Cost**: Manageable hosting costs for solo developer ($30-100/month range)
5. **Ecosystem**: Rich library support, good documentation, active community
6. **Time-series Optimization**: Built-in or extension support for time-series workloads
7. **ACID Compliance**: Strong consistency for election results and user data
8. **Analytical Capabilities**: Support for window functions, CTEs, complex JOINs

---

## Options Considered

### Option 1: PostgreSQL 16 + TimescaleDB Extension ✅

**Pros:**
- Full SQL support with ACID compliance
- TimescaleDB adds time-series optimizations (133K rows/sec ingestion)
- Continuous aggregates for automatic poll-of-polls calculations
- PostGIS extension for geographic queries
- Excellent Prisma ORM support with type safety
- Managed hosting available on DigitalOcean ($15-30/month)
- Mature ecosystem with decades of production use
- Window functions perfect for polling trends
- Native JSONB for flexible metadata storage
- Strong community and extensive documentation

**Cons:**
- Slower writes than specialized time-series DBs (133K vs 400K rows/sec)
- Requires more manual optimization than NoSQL
- TimescaleDB adds complexity compared to vanilla PostgreSQL

**Performance Benchmarks:**
- Writes: 133,000 rows/second
- "Latest poll" queries: 600ms (10K polls)
- Complex aggregations with CTEs: 100-300ms
- Time-series queries with compression: 3.5x faster than vanilla PostgreSQL
- Storage compression: 10:1 ratio on historical polls

**Cost:**
- Development: Free (Docker container)
- Production: $15/month (DigitalOcean Managed Database - 1GB RAM)
- Scale: $30/month (2GB RAM, connection pooling)
- Enterprise: $100/month (8GB RAM, read replicas)

---

### Option 2: ClickHouse

**Pros:**
- Extremely fast writes (400K rows/sec - 3x faster than TimescaleDB)
- Excellent for analytical queries on massive datasets
- Column-oriented storage for efficient aggregations
- Native HTTP interface
- Great compression ratios

**Cons:**
- ❌ No native UPDATE/DELETE operations (must use mutations)
- ❌ 7x slower on "latest poll" queries (4.2 seconds vs 600ms)
- ❌ Limited ORM support (no Prisma)
- ❌ Steeper learning curve (different SQL dialect)
- ❌ Not ACID compliant by default
- ❌ Fewer managed hosting options
- ❌ Overkill for our scale (optimized for billions of rows)

**Use Case Fit**: Better for analytics on 100M+ rows, not our primary need

---

### Option 3: InfluxDB

**Pros:**
- Purpose-built for time-series data
- Simple data model (measurements, tags, fields)
- Good visualization tool (Chronograf)
- Built-in downsampling and retention policies

**Cons:**
- ❌ No relational capabilities (can't JOIN races, pollsters, results)
- ❌ Limited querying with Flux language (not SQL)
- ❌ No Prisma support
- ❌ Requires separate database for relational data
- ❌ Slower aggregation queries than TimescaleDB (3.5x slower)
- ❌ Higher operational complexity with dual databases

**Use Case Fit**: Better for IoT sensors, not complex relational + time-series needs

---

### Option 4: MongoDB

**Pros:**
- Flexible schema for varied poll formats
- Good for rapid prototyping
- Horizontal scaling
- Rich query language

**Cons:**
- ❌ No native time-series optimizations
- ❌ Aggregation pipeline is verbose compared to SQL
- ❌ No built-in continuous aggregates
- ❌ Weaker consistency guarantees than PostgreSQL
- ❌ No geographic query optimization like PostGIS
- ❌ Prisma MongoDB support is less mature

**Use Case Fit**: Better for document-heavy apps, not analytical time-series

---

### Option 5: SQLite

**Pros:**
- Zero operational overhead
- Extremely simple deployment
- Great for development
- Fast for small datasets

**Cons:**
- ❌ No built-in time-series optimizations
- ❌ Limited concurrent write performance
- ❌ Not suitable for production web apps at scale
- ❌ No managed hosting options
- ❌ No replication or high availability

**Use Case Fit**: Great for local development, not for production

---

## Decision Outcome

**Chosen Option**: PostgreSQL 16 + TimescaleDB Extension

### Rationale

PostgreSQL with TimescaleDB provides the optimal balance of:

1. **Best of Both Worlds**: Full SQL + relational capabilities + time-series optimizations
2. **Single Database**: No need to manage separate databases for relational vs time-series data
3. **Developer Experience**: Excellent Prisma support, familiar SQL, strong typing
4. **Performance**: Fast enough for our scale (133K writes/sec, sub-second queries)
5. **Cost-Effective**: Managed hosting at $15-30/month on DigitalOcean
6. **Future-Proof**: Can scale to millions of polls without architecture changes
7. **Continuous Aggregates**: Automatic poll-of-polls calculations that update incrementally
8. **Geographic Queries**: PostGIS for state/county-level electoral map queries
9. **Ecosystem**: Rich extension ecosystem (PostGIS, pg_trgm, uuid-ossp, etc.)

### Implementation Strategy

**Database Setup:**
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Convert polls table to hypertable
SELECT create_hypertable('polls', 'field_date',
  chunk_time_interval => INTERVAL '1 month');

-- Create continuous aggregate for 7-day rolling average
CREATE MATERIALIZED VIEW poll_aggregates_7d
WITH (timescaledb.continuous) AS
SELECT
  race_id,
  time_bucket('1 day', field_date) AS bucket,
  AVG(support_percentage) AS avg_support,
  COUNT(*) AS poll_count,
  STDDEV(support_percentage) AS stddev
FROM polls
GROUP BY race_id, bucket;
```

**Connection Pooling:**
- Use PgBouncer to reduce connections from 1000 clients → 25 database connections
- 40x reduction in connection overhead
- Transaction-mode pooling for optimal performance

**Indexing Strategy:**
```sql
-- Time-series queries
CREATE INDEX idx_polls_race_date ON polls (race_id, field_date DESC);

-- Pollster quality lookups
CREATE INDEX idx_polls_pollster ON polls (pollster_id);

-- Geographic aggregations
CREATE INDEX idx_races_state ON races (state_code);

-- Full-text search on pollster names
CREATE INDEX idx_pollster_name_gin ON pollsters USING gin(to_tsvector('english', name));
```

**Compression:**
- Enable TimescaleDB compression on chunks older than 7 days
- Achieves 10:1 compression ratio on historical polls
- Transparent to application queries

**Monitoring:**
- Track query performance with `pg_stat_statements`
- Monitor hypertable health with TimescaleDB diagnostic views
- Alert on slow queries (>500ms) and high connection counts

---

## Consequences

### Positive

✅ **Single Database**: No need to manage multiple database technologies
✅ **Type Safety**: Prisma generates TypeScript types from schema
✅ **SQL Familiarity**: Team can use existing SQL knowledge
✅ **Continuous Aggregates**: Automatic poll-of-polls calculations
✅ **Cost-Effective**: Managed hosting at $15-30/month
✅ **Future-Proof**: Can scale to millions of polls
✅ **Rich Ecosystem**: Extensions for geospatial, full-text search, etc.
✅ **ACID Compliance**: Strong consistency for critical election data

### Negative

⚠️ **Learning Curve**: Team needs to learn TimescaleDB-specific features
⚠️ **Extension Dependency**: Adds complexity compared to vanilla PostgreSQL
⚠️ **Write Performance**: 3x slower writes than ClickHouse (acceptable tradeoff)
⚠️ **Manual Optimization**: Requires careful index design and query optimization

### Mitigation Strategies

1. **Write Performance**: Batch insert polls in groups of 100-500 for better throughput
2. **Query Optimization**: Use continuous aggregates for expensive calculations
3. **Connection Pooling**: Deploy PgBouncer to handle 1000+ concurrent connections
4. **Read Replicas**: Add read replicas during election night traffic spikes
5. **Caching**: Use Redis to cache API responses (70%+ cache hit rate)
6. **Monitoring**: Track slow queries and optimize indexes proactively

---

## Related Decisions

- **ADR 003**: Backend API framework selection (Fastify with Prisma)
- **ADR 007**: Forecasting methodology (requires complex SQL window functions)
- **ADR 010**: Caching strategy (Redis for API responses, TimescaleDB aggregates for calculations)

---

## References

- [TimescaleDB Benchmark Results](https://docs.timescale.com/timescaledb/latest/overview/release-notes/benchmarks/)
- [PostgreSQL vs ClickHouse for Time-Series](https://medium.com/altinity/clickhouse-vs-timescaledb-performance-comparison-2021-update-5a9f9e7e4f34)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [DigitalOcean Managed PostgreSQL Pricing](https://www.digitalocean.com/pricing/managed-databases)
- [TimescaleDB Continuous Aggregates](https://docs.timescale.com/timescaledb/latest/how-to-guides/continuous-aggregates/)

---

## Notes

This decision was made with a 48-month timeline in mind. For the first 12 months, vanilla PostgreSQL would suffice. TimescaleDB becomes valuable as we accumulate 100K+ polls and need to optimize historical queries. We can defer enabling TimescaleDB until Month 6-9 if needed to reduce initial complexity.

**Review Date**: Month 6 (reassess if TimescaleDB optimizations are necessary)
