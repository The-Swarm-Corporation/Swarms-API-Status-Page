-- Current Schema (for reference)
-- WARNING: This schema is for context only and is not meant to be run.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Daily Metrics Table
CREATE TABLE public.daily_metrics (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    date date NOT NULL,
    endpoint_path text NOT NULL,
    total_checks integer NOT NULL DEFAULT 0,
    successful_checks integer NOT NULL DEFAULT 0,
    failed_checks integer NOT NULL DEFAULT 0,
    avg_response_time numeric NOT NULL DEFAULT 0,
    uptime_percentage numeric NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT daily_metrics_pkey PRIMARY KEY (id)
);

-- Performance Metrics Table
CREATE TABLE public.performance_metrics (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    timestamp timestamp with time zone NOT NULL,
    endpoint_path text NOT NULL,
    response_time_ms integer NOT NULL,
    token_usage integer,
    cost_usd numeric,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT performance_metrics_pkey PRIMARY KEY (id)
);

-- Status Checks Table
CREATE TABLE public.status_checks (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    timestamp timestamp with time zone NOT NULL,
    endpoint_path text NOT NULL,
    endpoint_name text NOT NULL,
    status text NOT NULL CHECK (status = ANY (ARRAY['operational'::text, 'degraded'::text, 'outage'::text])),
    response_time_ms integer NOT NULL,
    http_status_code integer,
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT status_checks_pkey PRIMARY KEY (id)
);

-- Indexes
CREATE UNIQUE INDEX daily_metrics_date_endpoint_path_key ON public.daily_metrics USING btree (date, endpoint_path);
CREATE UNIQUE INDEX daily_metrics_pkey ON public.daily_metrics USING btree (id);
CREATE INDEX idx_daily_metrics_date_endpoint ON public.daily_metrics USING btree (date DESC, endpoint_path);
CREATE INDEX idx_performance_metrics_endpoint_timestamp ON public.performance_metrics USING btree (endpoint_path, "timestamp" DESC);
CREATE INDEX idx_status_checks_endpoint_timestamp ON public.status_checks USING btree (endpoint_path, "timestamp" DESC);
CREATE INDEX idx_status_checks_timestamp ON public.status_checks USING btree ("timestamp" DESC);

-- RLS Policies
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;

-- Daily Metrics Policies
CREATE POLICY "Allow public insert on daily_metrics" ON daily_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on daily_metrics" ON daily_metrics FOR SELECT USING (true);

-- Performance Metrics Policies
CREATE POLICY "Allow public insert on performance_metrics" ON performance_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on performance_metrics" ON performance_metrics FOR SELECT USING (true);

-- Status Checks Policies
CREATE POLICY "Allow public insert on status_checks" ON status_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on status_checks" ON status_checks FOR SELECT USING (true); 