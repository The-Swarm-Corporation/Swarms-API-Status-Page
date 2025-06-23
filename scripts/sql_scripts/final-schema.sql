-- Final Schema for Swarms API Status Page
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS public.request_logs CASCADE;
DROP TABLE IF EXISTS public.performance_metrics CASCADE;
DROP TABLE IF EXISTS public.status_checks CASCADE;
DROP TABLE IF EXISTS public.daily_metrics CASCADE;
DROP TABLE IF EXISTS public.status_page_config CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS calculate_daily_metrics(DATE, TEXT);
DROP FUNCTION IF EXISTS cleanup_old_data();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create status_page_config table
CREATE TABLE public.status_page_config (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    monitoring_enabled boolean NOT NULL DEFAULT true,
    emergency_mode boolean NOT NULL DEFAULT false,
    monitoring_interval_minutes integer NOT NULL DEFAULT 5,
    greeting text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create request_logs table
CREATE TABLE public.request_logs (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    created_at timestamp with time zone DEFAULT now()
);

-- Create performance_metrics table
CREATE TABLE public.performance_metrics (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    created_at timestamp with time zone DEFAULT now()
);

-- Create status_checks table
CREATE TABLE public.status_checks (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    created_at timestamp with time zone DEFAULT now()
);

-- Create daily_metrics table
CREATE TABLE public.daily_metrics (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    CONSTRAINT daily_metrics_date_endpoint_path_key UNIQUE (date, endpoint_path)
);

-- Create indexes for better performance
CREATE INDEX idx_status_page_config_updated_at ON public.status_page_config(updated_at DESC);
CREATE INDEX idx_request_logs_timestamp ON public.request_logs USING btree (timestamp DESC);
CREATE INDEX idx_request_logs_endpoint ON public.request_logs USING btree (endpoint_path, timestamp DESC);
CREATE INDEX idx_request_logs_status ON public.request_logs USING btree (http_status_code, timestamp DESC);
CREATE INDEX idx_performance_metrics_endpoint_timestamp ON public.performance_metrics USING btree (endpoint_path, timestamp DESC);
CREATE INDEX idx_performance_metrics_model ON public.performance_metrics USING btree (model_name, timestamp DESC);
CREATE INDEX idx_status_checks_endpoint_timestamp ON public.status_checks USING btree (endpoint_path, timestamp DESC);
CREATE INDEX idx_status_checks_status ON public.status_checks USING btree (status, timestamp DESC);
CREATE INDEX idx_daily_metrics_date_endpoint ON public.daily_metrics USING btree (date DESC, endpoint_path);

-- Enable Row Level Security
ALTER TABLE public.status_page_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Status Page Config Policies
CREATE POLICY "Allow public read access on status_page_config" ON public.status_page_config FOR SELECT USING (true);
CREATE POLICY "Allow public insert on status_page_config" ON public.status_page_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on status_page_config" ON public.status_page_config FOR UPDATE USING (true) WITH CHECK (true);

-- Request Logs Policies
CREATE POLICY "Allow public read access on request_logs" ON public.request_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on request_logs" ON public.request_logs FOR INSERT WITH CHECK (true);

-- Performance Metrics Policies
CREATE POLICY "Allow public read access on performance_metrics" ON public.performance_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert on performance_metrics" ON public.performance_metrics FOR INSERT WITH CHECK (true);

-- Status Checks Policies
CREATE POLICY "Allow public read access on status_checks" ON public.status_checks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on status_checks" ON public.status_checks FOR INSERT WITH CHECK (true);

-- Daily Metrics Policies
CREATE POLICY "Allow public read access on daily_metrics" ON public.daily_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert on daily_metrics" ON public.daily_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on daily_metrics" ON public.daily_metrics FOR UPDATE USING (true) WITH CHECK (true);

-- Create Functions
-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate daily metrics
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

-- Function to cleanup old data
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

-- Create Triggers
CREATE TRIGGER update_status_page_config_updated_at
    BEFORE UPDATE ON public.status_page_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_metrics_updated_at
    BEFORE UPDATE ON public.daily_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default configuration
INSERT INTO public.status_page_config (
    monitoring_enabled,
    emergency_mode,
    monitoring_interval_minutes,
    greeting
) VALUES (
    true,
    false,
    5,
    'Hello from Swarms API Status Page!'
) ON CONFLICT DO NOTHING;

-- Insert sample data for testing
INSERT INTO public.status_checks (
    timestamp,
    endpoint_path,
    endpoint_name,
    status,
    response_time_ms,
    http_status_code
) VALUES 
    (NOW(), '/health', 'API Health Check', 'operational', 150, 200),
    (NOW() - INTERVAL '1 hour', '/health', 'API Health Check', 'operational', 180, 200),
    (NOW() - INTERVAL '2 hours', '/v1/swarm/completions', 'Swarm Completions', 'operational', 2500, 200),
    (NOW() - INTERVAL '2 hours', '/v1/swarm/batch/completions', 'Swarm Batch Completions', 'operational', 5247, 200),
    (NOW() - INTERVAL '2 hours', '/v1/agent/completions', 'Agent Completions', 'operational', 2439, 200),
    (NOW() - INTERVAL '2 hours', '/v1/agent/batch/completions', 'Agent Batch Completions', 'operational', 5004, 200),
    (NOW() - INTERVAL '2 hours', '/v1/models/available', 'Available Models', 'operational', 755, 200),
    (NOW() - INTERVAL '2 hours', '/v1/swarms/available', 'Available Swarms', 'operational', 3538, 200),
    (NOW() - INTERVAL '2 hours', '/v1/swarm/logs', 'Swarm Logs', 'operational', 980, 200)
ON CONFLICT DO NOTHING;

-- Calculate initial daily metrics
SELECT calculate_daily_metrics(CURRENT_DATE, '/health');
SELECT calculate_daily_metrics(CURRENT_DATE, '/v1/swarm/completions');
SELECT calculate_daily_metrics(CURRENT_DATE, '/v1/swarm/batch/completions');
SELECT calculate_daily_metrics(CURRENT_DATE, '/v1/agent/completions');
SELECT calculate_daily_metrics(CURRENT_DATE, '/v1/agent/batch/completions');
SELECT calculate_daily_metrics(CURRENT_DATE, '/v1/models/available');
SELECT calculate_daily_metrics(CURRENT_DATE, '/v1/swarms/available');
SELECT calculate_daily_metrics(CURRENT_DATE, '/v1/swarm/logs'); 