-- Enable Row Level Security and required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create status_checks table
CREATE TABLE IF NOT EXISTS status_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    endpoint_path TEXT NOT NULL,
    endpoint_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('operational', 'degraded', 'outage')),
    response_time_ms INTEGER NOT NULL,
    http_status_code INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_metrics table
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    endpoint_path TEXT NOT NULL,
    total_checks INTEGER NOT NULL DEFAULT 0,
    successful_checks INTEGER NOT NULL DEFAULT 0,
    failed_checks INTEGER NOT NULL DEFAULT 0,
    avg_response_time NUMERIC NOT NULL DEFAULT 0,
    uptime_percentage NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, endpoint_path)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_status_checks_endpoint_timestamp ON status_checks(endpoint_path, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_status_checks_timestamp ON status_checks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date_endpoint ON daily_metrics(date DESC, endpoint_path);

-- Enable Row Level Security (RLS)
ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on status_checks" ON status_checks FOR SELECT USING (true);
CREATE POLICY "Allow public read access on daily_metrics" ON daily_metrics FOR SELECT USING (true);

-- Create policies for insert access (public for monitoring)
CREATE POLICY "Allow public insert on status_checks" ON status_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on daily_metrics" ON daily_metrics FOR INSERT WITH CHECK (true);

-- Create a function to calculate daily metrics
CREATE OR REPLACE FUNCTION calculate_daily_metrics(target_date DATE, target_endpoint TEXT)
RETURNS void AS $$
DECLARE
    total_count INTEGER;
    success_count INTEGER;
    avg_time NUMERIC;
    uptime_pct NUMERIC;
BEGIN
    -- Calculate metrics for the given date and endpoint
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'operational'),
        AVG(response_time_ms),
        (COUNT(*) FILTER (WHERE status = 'operational') * 100.0 / NULLIF(COUNT(*), 0))
    INTO total_count, success_count, avg_time, uptime_pct
    FROM status_checks 
    WHERE DATE(timestamp) = target_date 
    AND endpoint_path = target_endpoint;

    -- Only proceed if we have data
    IF total_count > 0 THEN
        -- Insert or update daily metrics
        INSERT INTO daily_metrics (date, endpoint_path, total_checks, successful_checks, failed_checks, avg_response_time, uptime_percentage)
        VALUES (target_date, target_endpoint, total_count, success_count, total_count - success_count, COALESCE(avg_time, 0), COALESCE(uptime_pct, 0))
        ON CONFLICT (date, endpoint_path) 
        DO UPDATE SET 
            total_checks = EXCLUDED.total_checks,
            successful_checks = EXCLUDED.successful_checks,
            failed_checks = EXCLUDED.failed_checks,
            avg_response_time = EXCLUDED.avg_response_time,
            uptime_percentage = EXCLUDED.uptime_percentage;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data to test the setup
INSERT INTO status_checks (timestamp, endpoint_path, endpoint_name, status, response_time_ms, http_status_code, error_message)
VALUES 
    (NOW(), '/health', 'API Health Check', 'operational', 150, 200, NULL),
    (NOW() - INTERVAL '1 hour', '/health', 'API Health Check', 'operational', 180, 200, NULL),
    (NOW() - INTERVAL '2 hours', '/v1/swarm/completions', 'Swarm Completions', 'operational', 2500, 200, NULL);

-- Calculate initial daily metrics for today
SELECT calculate_daily_metrics(CURRENT_DATE, '/health');
SELECT calculate_daily_metrics(CURRENT_DATE, '/v1/swarm/completions');

COMMIT;
