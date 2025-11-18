-- Initialize Poll Dashboard Database
-- This script runs automatically when the PostgreSQL container starts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "timescaledb"; -- For time-series data (optional)

-- Create additional schemas if needed
CREATE SCHEMA IF NOT EXISTS public;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE poll_db TO poll_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO poll_user;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'Poll Dashboard database initialized successfully';
  RAISE NOTICE 'Extensions enabled: uuid-ossp, pg_trgm, timescaledb';
END $$;
