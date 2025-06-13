-- Improved Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.request_logs CASCADE;
DROP TABLE IF EXISTS public.performance_metrics CASCADE;
DROP TABLE IF EXISTS public.status_checks CASCADE;
DROP TABLE IF EXISTS public.daily_metrics CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS calculate_daily_metrics(DATE, TEXT);
DROP FUNCTION IF EXISTS cleanup_old_data();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Request Logs Table
CREATE TABLE public.request_logs (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    timestamp timestamp with time zone NOT NULL DEFAULT now(),
    endpoint_path text NOT NULL,
    method text NOT NULL,
    request_headers jsonb,
    request_body jsonb,
    response_headers jsonb,
    response_body jsonb,
    response_time_ms integer NOT NULL,
    http_status_code integer,
    error_message text,
    client_ip text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT request_logs_pkey PRIMARY KEY (id)
);

-- Enhanced Performance Metrics Table
CREATE TABLE public.performance_metrics (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    timestamp timestamp with time zone NOT NULL,
    endpoint_path text NOT NULL,
    response_time_ms integer NOT NULL,
    token_usage integer,
    cost_usd numeric(10, 6),
    model_name text,
    batch_size integer,
    concurrent_requests integer,
    memory_usage_mb numeric(10, 2),
    cpu_usage_percent numeric(5, 2),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT performance_metrics_pkey PRIMARY KEY (id)
);

-- Enhanced Status Checks Table
CREATE TABLE public.status_checks (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    timestamp timestamp with time zone NOT NULL,
    endpoint_path text NOT NULL,
    endpoint_name text NOT NULL,
    status text NOT NULL CHECK (status = ANY (ARRAY['operational'::text, 'degraded'::text, 'outage'::text])),
    response_time_ms integer NOT NULL,
    http_status_code integer,
    error_message text,
    error_type text,
    error_code text,
    retry_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT status_checks_pkey PRIMARY KEY (id)
);

-- Enhanced Daily Metrics Table
CREATE TABLE public.daily_metrics (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    date date NOT NULL,
    endpoint_path text NOT NULL,
    total_checks integer NOT NULL DEFAULT 0,
    successful_checks integer NOT NULL DEFAULT 0,
    failed_checks integer NOT NULL DEFAULT 0,
    avg_response_time numeric NOT NULL DEFAULT 0,
    uptime_percentage numeric NOT NULL DEFAULT 0,
    p95_response_time numeric,
    p99_response_time numeric,
    max_response_time integer,
    min_response_time integer,
    total_token_usage bigint,
    total_cost_usd numeric(10, 6),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT daily_metrics_pkey PRIMARY KEY (id),
    CONSTRAINT daily_metrics_date_endpoint_path_key UNIQUE (date, endpoint_path)
);

-- Indexes
CREATE INDEX idx_request_logs_timestamp ON public.request_logs USING btree (timestamp DESC);
CREATE INDEX idx_request_logs_endpoint ON public.request_logs USING btree (endpoint_path, timestamp DESC);
CREATE INDEX idx_request_logs_status ON public.request_logs USING btree (http_status_code, timestamp DESC);
CREATE INDEX idx_performance_metrics_endpoint_timestamp ON public.performance_metrics USING btree (endpoint_path, timestamp DESC);
CREATE INDEX idx_performance_metrics_model ON public.performance_metrics USING btree (model_name, timestamp DESC);
CREATE INDEX idx_status_checks_endpoint_timestamp ON public.status_checks USING btree (endpoint_path, timestamp DESC);
CREATE INDEX idx_status_checks_status ON public.status_checks USING btree (status, timestamp DESC);
CREATE INDEX idx_daily_metrics_date_endpoint ON public.daily_metrics USING btree (date DESC, endpoint_path);

-- RLS Policies
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Request Logs Policies
CREATE POLICY "Allow public insert on request_logs" ON request_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on request_logs" ON request_logs FOR SELECT USING (true);

-- Performance Metrics Policies
CREATE POLICY "Allow public insert on performance_metrics" ON performance_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on performance_metrics" ON performance_metrics FOR SELECT USING (true);

-- Status Checks Policies
CREATE POLICY "Allow public insert on status_checks" ON status_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on status_checks" ON status_checks FOR SELECT USING (true);

-- Daily Metrics Policies
CREATE POLICY "Allow public insert on daily_metrics" ON daily_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on daily_metrics" ON daily_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public update on daily_metrics" ON daily_metrics FOR UPDATE USING (true) WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_daily_metrics_updated_at
    BEFORE UPDATE ON daily_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enhanced calculate_daily_metrics function
CREATE OR REPLACE FUNCTION calculate_daily_metrics(target_date DATE, target_endpoint TEXT)
RETURNS void AS $$
DECLARE
    total_count INTEGER;
    success_count INTEGER;
    avg_time NUMERIC;
    uptime_pct NUMERIC;
    p95_time NUMERIC;
    p99_time NUMERIC;
    max_time INTEGER;
    min_time INTEGER;
    total_tokens BIGINT;
    total_cost NUMERIC;
BEGIN
    -- Calculate metrics for the given date and endpoint
    WITH metrics AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'operational') as success,
            AVG(response_time_ms) as avg_rt,
            (COUNT(*) FILTER (WHERE status = 'operational') * 100.0 / NULLIF(COUNT(*), 0)) as uptime,
            percentile_cont(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95,
            percentile_cont(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99,
            MAX(response_time_ms) as max_rt,
            MIN(response_time_ms) as min_rt
        FROM status_checks 
        WHERE DATE(timestamp) = target_date 
        AND endpoint_path = target_endpoint
    ),
    perf_metrics AS (
        SELECT 
            COALESCE(SUM(token_usage), 0) as tokens,
            COALESCE(SUM(cost_usd), 0) as cost
        FROM performance_metrics
        WHERE DATE(timestamp) = target_date 
        AND endpoint_path = target_endpoint
    )
    SELECT 
        m.total, m.success, m.avg_rt, m.uptime, 
        m.p95, m.p99, m.max_rt, m.min_rt,
        p.tokens, p.cost
    INTO 
        total_count, success_count, avg_time, uptime_pct,
        p95_time, p99_time, max_time, min_time,
        total_tokens, total_cost
    FROM metrics m, perf_metrics p;

    -- Only proceed if we have data
    IF total_count > 0 THEN
        -- Insert or update daily metrics
        INSERT INTO daily_metrics (
            date, endpoint_path, total_checks, successful_checks, 
            failed_checks, avg_response_time, uptime_percentage,
            p95_response_time, p99_response_time, max_response_time,
            min_response_time, total_token_usage, total_cost_usd
        )
        VALUES (
            target_date, target_endpoint, total_count, success_count,
            total_count - success_count, COALESCE(avg_time, 0), COALESCE(uptime_pct, 0),
            p95_time, p99_time, max_time, min_time, total_tokens, total_cost
        )
        ON CONFLICT (date, endpoint_path) 
        DO UPDATE SET 
            total_checks = EXCLUDED.total_checks,
            successful_checks = EXCLUDED.successful_checks,
            failed_checks = EXCLUDED.failed_checks,
            avg_response_time = EXCLUDED.avg_response_time,
            uptime_percentage = EXCLUDED.uptime_percentage,
            p95_response_time = EXCLUDED.p95_response_time,
            p99_response_time = EXCLUDED.p99_response_time,
            max_response_time = EXCLUDED.max_response_time,
            min_response_time = EXCLUDED.min_response_time,
            total_token_usage = EXCLUDED.total_token_usage,
            total_cost_usd = EXCLUDED.total_cost_usd,
            updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Enhanced cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Keep only last 90 days of status checks
    DELETE FROM status_checks WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Keep only last 365 days of daily metrics
    DELETE FROM daily_metrics WHERE created_at < NOW() - INTERVAL '365 days';
    
    -- Keep only last 30 days of performance metrics
    DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Keep only last 7 days of request logs
    DELETE FROM request_logs WHERE created_at < NOW() - INTERVAL '7 days';
    
    RAISE NOTICE 'Cleanup completed successfully';
END;
$$ LANGUAGE plpgsql; 