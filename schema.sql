-- Polling Dashboard Database Schema
-- PostgreSQL 16 with TimescaleDB and PostGIS extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Pollsters (Organizations conducting polls)
CREATE TABLE pollsters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  organization VARCHAR(255),
  website TEXT,

  -- Quality Metrics
  overall_accuracy DECIMAL(5,2), -- e.g., 94.25 (percent accurate)
  methodology_grade VARCHAR(2), -- A+, A, A-, B+, B, etc.
  transparency_score DECIMAL(3,2) CHECK (transparency_score >= 0 AND transparency_score <= 1),
  sample_size_avg INTEGER,

  -- Bias Analysis
  partisan_lean VARCHAR(50), -- 'D+2.5', 'R+1.0', 'neutral'
  house_effect JSONB, -- {"overall": 0.5, "by_race_type": {"senate": 0.3, "house": 0.7}}

  -- Statistics
  poll_count INTEGER DEFAULT 0,
  first_poll_date DATE,
  last_poll_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_accuracy CHECK (overall_accuracy >= 0 AND overall_accuracy <= 100)
);

CREATE INDEX idx_pollsters_slug ON pollsters(slug);
CREATE INDEX idx_pollsters_accuracy ON pollsters(overall_accuracy DESC NULLS LAST);
CREATE INDEX idx_pollsters_grade ON pollsters(methodology_grade);

-- =====================================================

-- Races (Elections being tracked)
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  race_type VARCHAR(50) NOT NULL, -- 'president', 'senate', 'house', 'governor', 'mayor', etc.
  race_name VARCHAR(255) NOT NULL, -- 'Pennsylvania Senate 2024', '2024 Presidential'
  slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly identifier

  -- Geography
  country VARCHAR(3) DEFAULT 'USA',
  state VARCHAR(2), -- NULL for national races, e.g., 'PA', 'GA'
  district VARCHAR(10), -- for House races, e.g., 'PA-07', 'TX-23'
  county VARCHAR(100), -- for local races

  -- Timing
  election_date DATE NOT NULL,
  is_special_election BOOLEAN DEFAULT FALSE,

  -- Candidates (flexible JSONB structure)
  candidates JSONB NOT NULL,
  -- Example: [
  --   {"id": "uuid", "name": "John Fetterman", "party": "D", "incumbent": true},
  --   {"id": "uuid", "name": "Mehmet Oz", "party": "R", "incumbent": false}
  -- ]

  -- Current Status
  status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'active', 'completed'
  current_leader VARCHAR(255), -- candidate name
  current_margin DECIMAL(5,2), -- points ahead

  -- Classification
  competitive_rating VARCHAR(50), -- 'Safe D', 'Likely D', 'Lean D', 'Toss-up', 'Lean R', 'Likely R', 'Safe R'
  importance_score INTEGER CHECK (importance_score >= 1 AND importance_score <= 10),

  -- Metadata
  description TEXT,

  -- Electoral College (for Presidential race)
  electoral_votes INTEGER, -- NULL for non-presidential

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_election_date CHECK (election_date >= '2020-01-01')
);

CREATE INDEX idx_races_type ON races(race_type);
CREATE INDEX idx_races_state ON races(state);
CREATE INDEX idx_races_slug ON races(slug);
CREATE INDEX idx_races_election_date ON races(election_date DESC);
CREATE INDEX idx_races_status ON races(status);
CREATE INDEX idx_races_competitive ON races(competitive_rating);
CREATE INDEX idx_races_importance ON races(importance_score DESC);
CREATE INDEX idx_races_type_state ON races(race_type, state);

-- =====================================================

-- Polls (Individual polling results)
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  pollster_id UUID NOT NULL REFERENCES pollsters(id) ON DELETE RESTRICT,

  -- Timing
  poll_date DATE NOT NULL,
  field_date_start DATE, -- when polling started
  field_date_end DATE, -- when polling ended

  -- Sample Information
  sample_size INTEGER,
  methodology VARCHAR(50), -- 'phone', 'online', 'ivr', 'sms', 'mixed'
  population_type VARCHAR(50), -- 'rv' (registered voters), 'lv' (likely voters), 'a' (all adults)

  -- Quality Indicators
  partisan_affiliation VARCHAR(50), -- sponsor affiliation
  transparency_score DECIMAL(3,2) CHECK (transparency_score >= 0 AND transparency_score <= 1),
  historical_accuracy DECIMAL(5,2), -- pollster's accuracy for this race type

  -- Results (flexible JSONB structure)
  results JSONB NOT NULL,
  -- Example: {
  --   "Fetterman": 48.5,
  --   "Oz": 47.2,
  --   "Other": 2.1,
  --   "Undecided": 2.2
  -- }

  -- Crosstabs (demographic breakdowns)
  crosstabs JSONB,
  -- Example: {
  --   "age": {"18-29": {"Fetterman": 62, "Oz": 35}, "30-44": {...}},
  --   "race": {"white": {...}, "black": {...}, "hispanic": {...}},
  --   "education": {"college": {...}, "no_college": {...}}
  -- }

  -- Statistical Info
  margin_of_error DECIMAL(4,2),
  confidence_level INTEGER DEFAULT 95, -- typically 95%

  -- Weighting
  calculated_weight DECIMAL(10,6), -- calculated weight in aggregation

  -- Source
  source_url TEXT,
  pdf_url TEXT, -- link to full crosstabs
  raw_data JSONB, -- original scraped data for debugging

  -- Flags
  is_partisan BOOLEAN DEFAULT FALSE, -- flagged as partisan poll
  is_outlier BOOLEAN DEFAULT FALSE, -- flagged as statistical outlier
  is_verified BOOLEAN DEFAULT TRUE, -- manually verified

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_poll_date CHECK (poll_date <= CURRENT_DATE),
  CONSTRAINT valid_field_dates CHECK (field_date_end IS NULL OR field_date_start <= field_date_end),
  CONSTRAINT valid_sample_size CHECK (sample_size IS NULL OR sample_size > 0),
  CONSTRAINT valid_moe CHECK (margin_of_error IS NULL OR (margin_of_error >= 0 AND margin_of_error <= 20))
);

CREATE INDEX idx_polls_race ON polls(race_id);
CREATE INDEX idx_polls_pollster ON polls(pollster_id);
CREATE INDEX idx_polls_date ON polls(poll_date DESC);
CREATE INDEX idx_polls_race_date ON polls(race_id, poll_date DESC);
CREATE INDEX idx_polls_is_outlier ON polls(is_outlier) WHERE is_outlier = TRUE;
CREATE INDEX idx_polls_methodology ON polls(methodology);

-- Convert to TimescaleDB hypertable for efficient time-series queries
SELECT create_hypertable('polls', 'poll_date', if_not_exists => TRUE);

-- =====================================================

-- Forecasts (Model predictions)
CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,

  -- Timing
  forecast_date DATE NOT NULL,

  -- Model Information
  model_version VARCHAR(50) NOT NULL, -- track model iterations, e.g., 'v2.1.3'

  -- Predictions
  probabilities JSONB NOT NULL,
  -- Example: {"Fetterman": 0.723, "Oz": 0.267, "other": 0.010}

  predicted_margins JSONB NOT NULL,
  -- Example: {"Fetterman": "+5.2", "Oz": "-5.2"}

  predicted_vote_share JSONB NOT NULL,
  -- Example: {"Fetterman": 50.8, "Oz": 45.6, "other": 3.6}

  -- Confidence Intervals (80%, 95%)
  confidence_intervals JSONB,
  -- Example: {
  --   "Fetterman": {"80": {"low": 48.1, "high": 53.5}, "95": {"low": 46.2, "high": 55.4}},
  --   "Oz": {"80": {"low": 42.8, "high": 48.4}, "95": {"low": 40.9, "high": 50.3}}
  -- }

  -- Simulation Statistics
  simulations_run INTEGER DEFAULT 10000,
  volatility_index DECIMAL(5,2), -- how stable is this race? (0-100)
  win_probability_change DECIMAL(5,2), -- change from previous forecast

  -- Input Data Quality
  contributing_polls INTEGER, -- number of polls used
  poll_quality_score DECIMAL(5,2), -- average quality of polls (0-100)
  oldest_poll_days INTEGER, -- days since oldest poll used
  newest_poll_days INTEGER, -- days since newest poll

  -- Electoral College (for Presidential)
  electoral_votes_expected JSONB,
  -- Example: {"D": 276, "R": 262}

  -- Notes
  notes TEXT, -- explanation of major changes

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_forecast_date CHECK (forecast_date <= CURRENT_DATE),
  CONSTRAINT valid_simulations CHECK (simulations_run >= 1000),
  CONSTRAINT valid_volatility CHECK (volatility_index >= 0 AND volatility_index <= 100)
);

CREATE INDEX idx_forecasts_race ON forecasts(race_id);
CREATE INDEX idx_forecasts_date ON forecasts(forecast_date DESC);
CREATE INDEX idx_forecasts_race_date ON forecasts(race_id, forecast_date DESC);
CREATE INDEX idx_forecasts_model_version ON forecasts(model_version);

-- Convert to hypertable
SELECT create_hypertable('forecasts', 'forecast_date', if_not_exists => TRUE);

-- =====================================================

-- Election Results (Real-time on election night)
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,

  -- Timing
  reported_at TIMESTAMPTZ NOT NULL,

  -- Geographic Granularity
  level VARCHAR(50) NOT NULL, -- 'state', 'county', 'precinct', 'district'
  state VARCHAR(2),
  county VARCHAR(100),
  precinct_id VARCHAR(100),

  -- Vote Counts
  votes JSONB NOT NULL,
  -- Example: {"Fetterman": 125432, "Oz": 118923, "other": 3421}

  -- Reporting Status
  precincts_reporting INTEGER,
  total_precincts INTEGER,
  percent_reporting DECIMAL(5,2),

  -- Estimates
  estimated_votes_remaining INTEGER,
  expected_vote_total INTEGER,

  -- Vote Type Breakdown
  votes_by_type JSONB,
  -- Example: {
  --   "election_day": {"Fetterman": 45231, "Oz": 52341},
  --   "early": {"Fetterman": 65321, "Oz": 54231},
  --   "mail": {"Fetterman": 14880, "Oz": 12351}
  -- }

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_percent_reporting CHECK (percent_reporting >= 0 AND percent_reporting <= 100)
);

CREATE INDEX idx_results_race ON results(race_id);
CREATE INDEX idx_results_reported_at ON results(reported_at DESC);
CREATE INDEX idx_results_race_time ON results(race_id, reported_at DESC);
CREATE INDEX idx_results_level ON results(level);
CREATE INDEX idx_results_state_county ON results(state, county);

-- Convert to hypertable
SELECT create_hypertable('results', 'reported_at', if_not_exists => TRUE);

-- =====================================================
-- USER & SOCIAL TABLES
-- =====================================================

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash TEXT, -- NULL if OAuth only

  -- OAuth Providers
  google_id VARCHAR(255) UNIQUE,
  twitter_id VARCHAR(255) UNIQUE,
  github_id VARCHAR(255) UNIQUE,

  -- Profile
  username VARCHAR(100) UNIQUE,
  display_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,

  -- Preferences
  tracked_races UUID[], -- array of race IDs
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "types": ["rating_change", "forecast_shift"]}'::jsonb,
  theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'auto'

  -- Gamification
  prediction_score INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  accuracy_rating DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN total_predictions > 0 THEN (correct_predictions::DECIMAL / total_predictions * 100)
      ELSE NULL
    END
  ) STORED,

  -- Leaderboard
  rank INTEGER,
  league VARCHAR(50) DEFAULT 'Bronze', -- Bronze, Silver, Gold, Platinum, Diamond, Masters

  -- Subscription
  subscription_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'premium', 'pro'
  subscription_status VARCHAR(50), -- 'active', 'canceled', 'past_due'
  stripe_customer_id VARCHAR(255),

  -- Permissions
  role VARCHAR(50) DEFAULT 'user', -- 'user', 'analyst', 'admin'
  is_verified BOOLEAN DEFAULT FALSE, -- verified expert/journalist
  is_banned BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_rank ON users(rank);
CREATE INDEX idx_users_accuracy ON users(accuracy_rating DESC NULLS LAST);
CREATE INDEX idx_users_subscription ON users(subscription_tier);

-- =====================================================

-- Scenarios (User-created "What-If" scenarios)
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Poll Adjustments
  poll_adjustments JSONB NOT NULL,
  -- Example: {
  --   "PA-SEN-2024": {"Fetterman": "+3.0", "Oz": "-3.0"},
  --   "GA-SEN-2024": {"Warnock": "+2.0", "Walker": "-2.0"}
  -- }

  -- Calculated Results
  electoral_college_result JSONB,
  -- Example: {"D": 289, "R": 249}

  senate_result JSONB,
  -- Example: {"D": 51, "R": 49}

  house_result JSONB,
  -- Example: {"D": 218, "R": 217}

  -- Social Metrics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scenarios_user ON scenarios(user_id);
CREATE INDEX idx_scenarios_public ON scenarios(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_scenarios_featured ON scenarios(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_scenarios_views ON scenarios(views DESC);
CREATE INDEX idx_scenarios_likes ON scenarios(likes DESC);

-- =====================================================

-- Predictions (User predictions for races)
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,

  -- Prediction
  predicted_winner VARCHAR(255) NOT NULL,
  predicted_margin DECIMAL(5,2), -- points ahead
  predicted_vote_share JSONB,
  -- Example: {"Fetterman": 51.2, "Oz": 46.8, "other": 2.0}

  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5), -- 1-5 scale

  -- Wager (virtual currency)
  points_wagered INTEGER DEFAULT 0,

  -- Result
  is_correct BOOLEAN, -- NULL until race completes
  points_won INTEGER, -- calculated after race

  -- Timestamps
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  locked_at TIMESTAMPTZ, -- when prediction can no longer be changed
  resolved_at TIMESTAMPTZ, -- when actual results known

  -- Constraints
  CONSTRAINT unique_user_race_prediction UNIQUE(user_id, race_id),
  CONSTRAINT valid_margin CHECK (predicted_margin IS NULL OR predicted_margin >= 0)
);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_race ON predictions(race_id);
CREATE INDEX idx_predictions_correct ON predictions(is_correct) WHERE is_correct IS NOT NULL;
CREATE INDEX idx_predictions_locked ON predictions(locked_at);

-- =====================================================

-- Alerts (Notifications for race changes)
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID REFERENCES races(id) ON DELETE CASCADE,

  -- Alert Type
  alert_type VARCHAR(50) NOT NULL, -- 'rating_change', 'new_poll', 'forecast_shift', 'major_movement'
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Change Details
  old_value VARCHAR(100),
  new_value VARCHAR(100),
  magnitude DECIMAL(5,2), -- size of change (points)

  -- Metadata
  metadata JSONB, -- additional context

  -- Distribution
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,

  -- Targeting (who should receive this)
  min_importance INTEGER, -- only send if race importance >= this
  target_user_ids UUID[], -- specific users (NULL = all subscribed)

  -- Constraints
  CONSTRAINT valid_sent_date CHECK (sent_at IS NULL OR sent_at >= created_at)
);

CREATE INDEX idx_alerts_race ON alerts(race_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX idx_alerts_sent ON alerts(sent_at DESC);
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- =====================================================

-- User Alert Subscriptions
CREATE TABLE alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  race_id UUID REFERENCES races(id) ON DELETE CASCADE,

  -- Subscription Settings
  alert_types VARCHAR(50)[], -- which types of alerts to receive
  min_magnitude DECIMAL(5,2) DEFAULT 2.0, -- only alert if change >= this

  -- Delivery Methods
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT FALSE,
  sms_enabled BOOLEAN DEFAULT FALSE,

  -- Timestamps
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_race_subscription UNIQUE(user_id, race_id)
);

CREATE INDEX idx_alert_subs_user ON alert_subscriptions(user_id);
CREATE INDEX idx_alert_subs_race ON alert_subscriptions(race_id);

-- =====================================================
-- API & DEVELOPER TABLES
-- =====================================================

-- API Keys (for developers)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Key Details
  key_hash TEXT NOT NULL UNIQUE, -- hashed version of API key
  key_prefix VARCHAR(10) NOT NULL, -- first 8 chars for display
  name VARCHAR(255), -- user-provided name

  -- Permissions
  tier VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free', 'developer', 'professional', 'enterprise'
  scopes VARCHAR(50)[], -- e.g., ['read:polls', 'read:forecasts']

  -- Rate Limits
  rate_limit_per_day INTEGER,
  rate_limit_per_hour INTEGER,

  -- Usage Tracking
  requests_today INTEGER DEFAULT 0,
  requests_this_hour INTEGER DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = TRUE;

-- =====================================================

-- API Usage Logs
CREATE TABLE api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,

  -- Request Details
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL, -- GET, POST, etc.

  -- Response
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,

  -- Client Info
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_logs_key ON api_usage_logs(api_key_id);
CREATE INDEX idx_api_logs_time ON api_usage_logs(requested_at DESC);
CREATE INDEX idx_api_logs_endpoint ON api_usage_logs(endpoint);

-- Convert to hypertable for efficient time-series
SELECT create_hypertable('api_usage_logs', 'requested_at', if_not_exists => TRUE);

-- Auto-delete logs older than 90 days
SELECT add_retention_policy('api_usage_logs', INTERVAL '90 days');

-- =====================================================
-- ANALYTICS TABLES
-- =====================================================

-- Pageviews (for analytics)
CREATE TABLE pageviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page Details
  path VARCHAR(500) NOT NULL,
  race_id UUID REFERENCES races(id) ON DELETE SET NULL,

  -- User Info
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous
  session_id UUID NOT NULL,

  -- Client Info
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  -- Geo (from IP)
  country VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),

  -- Timestamp
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pageviews_path ON pageviews(path);
CREATE INDEX idx_pageviews_race ON pageviews(race_id);
CREATE INDEX idx_pageviews_time ON pageviews(viewed_at DESC);
CREATE INDEX idx_pageviews_session ON pageviews(session_id);

-- Convert to hypertable
SELECT create_hypertable('pageviews', 'viewed_at', if_not_exists => TRUE);

-- Auto-delete after 1 year
SELECT add_retention_policy('pageviews', INTERVAL '1 year');

-- =====================================================
-- CONTINUOUS AGGREGATES (TimescaleDB)
-- =====================================================

-- 7-day rolling poll average
CREATE MATERIALIZED VIEW poll_averages_7day
WITH (timescaledb.continuous) AS
SELECT
  race_id,
  time_bucket('1 day', poll_date) AS bucket,
  COUNT(*) as poll_count,
  jsonb_object_agg(
    candidate,
    ROUND(AVG(value::DECIMAL), 2)
  ) as averages
FROM polls,
  LATERAL jsonb_each_text(results) AS result(candidate, value)
WHERE poll_date >= NOW() - INTERVAL '7 days'
  AND is_outlier = FALSE
GROUP BY race_id, bucket;

-- Refresh every hour
SELECT add_continuous_aggregate_policy('poll_averages_7day',
  start_offset => INTERVAL '1 month',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');

-- =====================================================

-- Daily API usage summary
CREATE MATERIALIZED VIEW api_usage_daily
WITH (timescaledb.continuous) AS
SELECT
  api_key_id,
  time_bucket('1 day', requested_at) AS day,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE status_code >= 400) as error_count
FROM api_usage_logs
GROUP BY api_key_id, day;

SELECT add_continuous_aggregate_policy('api_usage_daily',
  start_offset => INTERVAL '3 months',
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day');

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_pollsters_updated_at BEFORE UPDATE ON pollsters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_races_updated_at BEFORE UPDATE ON races
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON polls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================

-- Update pollster statistics when new poll added
CREATE OR REPLACE FUNCTION update_pollster_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pollsters
  SET
    poll_count = poll_count + 1,
    last_poll_date = GREATEST(last_poll_date, NEW.poll_date),
    first_poll_date = CASE
      WHEN first_poll_date IS NULL THEN NEW.poll_date
      ELSE LEAST(first_poll_date, NEW.poll_date)
    END
  WHERE id = NEW.pollster_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pollster_stats_on_poll_insert
  AFTER INSERT ON polls
  FOR EACH ROW
  EXECUTE FUNCTION update_pollster_stats();

-- =====================================================

-- Calculate poll weight (can be called from application)
CREATE OR REPLACE FUNCTION calculate_poll_weight(
  poll_date_param DATE,
  sample_size_param INTEGER,
  pollster_accuracy_param DECIMAL,
  methodology_param VARCHAR
)
RETURNS DECIMAL AS $$
DECLARE
  recency_weight DECIMAL;
  sample_weight DECIMAL;
  quality_weight DECIMAL;
  method_weight DECIMAL;
  days_old INTEGER;
BEGIN
  -- Recency (exponential decay, half-life 30 days)
  days_old := CURRENT_DATE - poll_date_param;
  recency_weight := POWER(0.5, days_old::DECIMAL / 30);

  -- Sample size (diminishing returns)
  sample_weight := SQRT(COALESCE(sample_size_param, 1000)::DECIMAL) / SQRT(1000);

  -- Pollster quality (0.5 to 1.5 multiplier)
  quality_weight := 0.5 + (COALESCE(pollster_accuracy_param, 50) / 100);

  -- Methodology bonus
  method_weight := CASE methodology_param
    WHEN 'phone' THEN 1.2
    WHEN 'online' THEN 1.0
    WHEN 'ivr' THEN 0.8
    WHEN 'mixed' THEN 1.1
    ELSE 1.0
  END;

  RETURN recency_weight * sample_weight * quality_weight * method_weight;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- VIEWS (for common queries)
-- =====================================================

-- Active races with latest forecast
CREATE VIEW active_races_with_forecast AS
SELECT
  r.*,
  f.probabilities as latest_probabilities,
  f.predicted_margins as latest_margins,
  f.forecast_date as latest_forecast_date,
  (
    SELECT COUNT(*)
    FROM polls p
    WHERE p.race_id = r.id
      AND p.poll_date >= CURRENT_DATE - INTERVAL '30 days'
  ) as recent_poll_count
FROM races r
LEFT JOIN LATERAL (
  SELECT *
  FROM forecasts
  WHERE race_id = r.id
  ORDER BY forecast_date DESC
  LIMIT 1
) f ON TRUE
WHERE r.status IN ('upcoming', 'active')
ORDER BY r.election_date, r.importance_score DESC;

-- =====================================================

-- Pollster leaderboard
CREATE VIEW pollster_leaderboard AS
SELECT
  p.*,
  COUNT(pl.id) FILTER (WHERE pl.poll_date >= CURRENT_DATE - INTERVAL '1 year') as polls_last_year,
  AVG(pl.sample_size) as avg_sample_size
FROM pollsters p
LEFT JOIN polls pl ON p.id = pl.pollster_id
GROUP BY p.id
ORDER BY p.overall_accuracy DESC NULLS LAST, p.poll_count DESC;

-- =====================================================

-- User leaderboard
CREATE VIEW user_leaderboard AS
SELECT
  u.id,
  u.username,
  u.display_name,
  u.avatar_url,
  u.prediction_score,
  u.correct_predictions,
  u.total_predictions,
  u.accuracy_rating,
  u.league,
  u.rank,
  u.created_at
FROM users u
WHERE u.total_predictions >= 5 -- minimum predictions to qualify
  AND u.is_banned = FALSE
ORDER BY u.prediction_score DESC, u.accuracy_rating DESC
LIMIT 100;

-- =====================================================
-- SAMPLE DATA (optional, for development)
-- =====================================================

-- Insert sample pollster
INSERT INTO pollsters (name, slug, organization, methodology_grade, overall_accuracy, partisan_lean)
VALUES
  ('Monmouth University', 'monmouth', 'Monmouth University Polling Institute', 'A+', 94.2, 'neutral'),
  ('Quinnipiac University', 'quinnipiac', 'Quinnipiac University Poll', 'A-', 91.5, 'neutral'),
  ('Rasmussen Reports', 'rasmussen', 'Rasmussen Reports', 'C+', 82.1, 'R+2.0'),
  ('Emerson College', 'emerson', 'Emerson College Polling', 'A-', 90.8, 'neutral');

-- Insert sample races
INSERT INTO races (race_type, race_name, slug, state, election_date, candidates, competitive_rating, importance_score, electoral_votes)
VALUES
  (
    'president',
    '2024 Presidential Election',
    '2024-presidential',
    NULL,
    '2024-11-05',
    '[{"name": "Joe Biden", "party": "D", "incumbent": true}, {"name": "Donald Trump", "party": "R", "incumbent": false}]'::jsonb,
    'Toss-up',
    10,
    538
  ),
  (
    'senate',
    'Pennsylvania Senate 2024',
    'pa-senate-2024',
    'PA',
    '2024-11-05',
    '[{"name": "Bob Casey", "party": "D", "incumbent": true}, {"name": "Dave McCormick", "party": "R", "incumbent": false}]'::jsonb,
    'Lean D',
    9,
    NULL
  );

-- =====================================================
-- PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- Analyze tables for query optimization
ANALYZE pollsters;
ANALYZE races;
ANALYZE polls;
ANALYZE forecasts;
ANALYZE results;
ANALYZE users;
ANALYZE predictions;
ANALYZE scenarios;

-- =====================================================
-- SECURITY
-- =====================================================

-- Create read-only role for API
CREATE ROLE api_readonly;
GRANT CONNECT ON DATABASE postgres TO api_readonly;
GRANT USAGE ON SCHEMA public TO api_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO api_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO api_readonly;

-- Create read-write role for backend
CREATE ROLE api_readwrite;
GRANT CONNECT ON DATABASE postgres TO api_readwrite;
GRANT USAGE ON SCHEMA public TO api_readwrite;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO api_readwrite;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO api_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO api_readwrite;

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE pollsters IS 'Organizations that conduct polls';
COMMENT ON TABLE races IS 'Elections being tracked (Presidential, Senate, House, etc.)';
COMMENT ON TABLE polls IS 'Individual polling results from pollsters';
COMMENT ON TABLE forecasts IS 'Statistical model predictions for race outcomes';
COMMENT ON TABLE results IS 'Real-time election results on election night';
COMMENT ON TABLE users IS 'User accounts for predictions and personalization';
COMMENT ON TABLE scenarios IS 'User-created "What-If" electoral scenarios';
COMMENT ON TABLE predictions IS 'User predictions for race outcomes';
COMMENT ON TABLE alerts IS 'Notifications for race changes and updates';
COMMENT ON TABLE api_keys IS 'API keys for developer access';

COMMENT ON COLUMN polls.results IS 'JSONB object with candidate names as keys and vote percentages as values';
COMMENT ON COLUMN polls.crosstabs IS 'Demographic breakdown of poll results';
COMMENT ON COLUMN polls.calculated_weight IS 'Weight calculated using recency, sample size, and pollster quality';
COMMENT ON COLUMN forecasts.probabilities IS 'Win probability for each candidate (0-1)';
COMMENT ON COLUMN forecasts.confidence_intervals IS 'Statistical confidence intervals at 80% and 95% levels';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
