-- Create status_page_config table
CREATE TABLE IF NOT EXISTS public.status_page_config (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    monitoring_enabled boolean NOT NULL DEFAULT true,
    emergency_mode boolean NOT NULL DEFAULT false,
    monitoring_interval_minutes integer NOT NULL DEFAULT 5,
    greeting text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_status_page_config_updated_at ON public.status_page_config(updated_at DESC);

-- Enable RLS
ALTER TABLE public.status_page_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on status_page_config" ON public.status_page_config FOR SELECT USING (true);
CREATE POLICY "Allow public insert on status_page_config" ON public.status_page_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on status_page_config" ON public.status_page_config FOR UPDATE USING (true) WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_status_page_config_updated_at
    BEFORE UPDATE ON public.status_page_config
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