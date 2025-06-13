import { createClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  // Check if both environment variables are available and supabase client is initialized
  return Boolean(supabase && supabaseUrl && supabaseKey)
}

// Database types
export interface StatusCheck {
  id?: string
  timestamp: string
  endpoint_path: string
  endpoint_name: string
  status: "operational" | "degraded" | "outage"
  response_time_ms: number
  http_status_code: number | null
  error_message: string | null
  error_type?: string
  error_code?: string
  retry_count?: number
  created_at?: string
}

export interface DailyMetrics {
  id?: string
  date: string
  endpoint_path: string
  total_checks: number
  successful_checks: number
  failed_checks: number
  avg_response_time: number
  uptime_percentage: number
  p95_response_time?: number
  p99_response_time?: number
  max_response_time?: number
  min_response_time?: number
  total_token_usage?: number
  total_cost_usd?: number
  created_at?: string
  updated_at?: string
}

export interface PerformanceMetrics {
  id?: string
  timestamp: string
  endpoint_path: string
  response_time_ms: number
  token_usage?: number
  cost_usd?: number
  model_name?: string
  batch_size?: number
  concurrent_requests?: number
  memory_usage_mb?: number
  cpu_usage_percent?: number
  created_at?: string
}

export interface RequestLog {
  id?: string
  timestamp: string
  endpoint_path: string
  method: string
  request_headers?: Record<string, string>
  request_body?: any
  response_headers?: Record<string, string>
  response_body?: any
  response_time_ms: number
  http_status_code?: number
  error_message?: string
  client_ip?: string
  user_agent?: string
  created_at?: string
}
