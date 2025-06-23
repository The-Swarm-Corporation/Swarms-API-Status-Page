import { supabase, isSupabaseAvailable, type StatusCheck, type DailyMetrics, type PerformanceMetrics, type RequestLog } from "./supabase"

interface SystemResourceUsage {
  timestamp: string
  memory_usage_mb: number
  cpu_usage_percent: number
}

export class SupabaseService {
  // Get latest status for all endpoints
  static async getLatestStatus(): Promise<StatusCheck[]> {
    if (!isSupabaseAvailable()) {
      console.log("Supabase not available - returning empty array")
      return []
    }

    try {
      const { data, error } = await supabase!
        .from("status_checks")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching latest status:", error)
      return []
    }
  }

  // Get status history for a specific endpoint
  static async getStatusHistory(endpointPath: string, limit = 100): Promise<StatusCheck[]> {
    if (!isSupabaseAvailable()) {
      return []
    }

    try {
      const { data, error } = await supabase!
        .from("status_checks")
        .select("*")
        .eq("endpoint_path", endpointPath)
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching status history:", error)
      return []
    }
  }

  // Get daily metrics for uptime calculations
  static async getDailyMetrics(endpointPath: string, days = 30): Promise<DailyMetrics[]> {
    if (!isSupabaseAvailable()) {
      return []
    }

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase!
        .from("daily_metrics")
        .select("*")
        .eq("endpoint_path", endpointPath)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching daily metrics:", error)
      return []
    }
  }

  // Get daily metrics for multiple endpoints efficiently
  static async getDailyMetricsForEndpoints(endpointPaths: string[], days = 1): Promise<DailyMetrics[]> {
    if (!isSupabaseAvailable() || endpointPaths.length === 0) {
      return []
    }

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase!
        .from("daily_metrics")
        .select("*")
        .in("endpoint_path", endpointPaths)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching daily metrics for multiple endpoints:", error)
      return []
    }
  }

  // Calculate uptime for a specific period
  static async calculateUptime(endpointPath: string, days = 7): Promise<number> {
    if (!isSupabaseAvailable()) {
      return 100 // Default to 100% when no data available
    }

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase!
        .from("status_checks")
        .select("status")
        .eq("endpoint_path", endpointPath)
        .gte("timestamp", startDate.toISOString())

      if (error) throw error

      if (!data || data.length === 0) return 100

      const operationalCount = data.filter((check) => check.status === "operational").length
      return (operationalCount / data.length) * 100
    } catch (error) {
      console.error("Error calculating uptime:", error)
      return 100
    }
  }

  // Get average response time
  static async getAverageResponseTime(endpointPath: string, hours = 24): Promise<number> {
    if (!isSupabaseAvailable()) {
      return 0
    }

    try {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() - hours)

      const { data, error } = await supabase!
        .from("status_checks")
        .select("response_time_ms")
        .eq("endpoint_path", endpointPath)
        .gte("timestamp", startTime.toISOString())
        .eq("status", "operational")

      if (error) throw error

      if (!data || data.length === 0) return 0

      const totalTime = data.reduce((sum, check) => sum + check.response_time_ms, 0)
      return Math.round(totalTime / data.length)
    } catch (error) {
      console.error("Error calculating average response time:", error)
      return 0
    }
  }

  // Get performance metrics for a specific endpoint
  static async getPerformanceMetrics(endpointPath: string, hours = 24): Promise<any[]> {
    if (!isSupabaseAvailable()) {
      return []
    }

    try {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() - hours)

      // Check if performance_metrics table exists
      const { data, error } = await supabase!
        .from("performance_metrics")
        .select("*")
        .eq("endpoint_path", endpointPath)
        .gte("timestamp", startTime.toISOString())
        .order("timestamp", { ascending: false })

      if (error) {
        // If table doesn't exist or other error, return empty array
        console.error("Error fetching performance metrics:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching performance metrics:", error)
      return []
    }
  }

  // Get total cost for a specific period
  static async getTotalCost(days = 7): Promise<number> {
    if (!isSupabaseAvailable()) {
      return 0
    }

    try {
      const startTime = new Date()
      startTime.setDate(startTime.getDate() - days)

      // Check if performance_metrics table exists
      const { data, error } = await supabase!
        .from("performance_metrics")
        .select("cost_usd")
        .gte("timestamp", startTime.toISOString())

      if (error) {
        // If table doesn't exist or other error, return 0
        console.error("Error calculating total cost:", error)
        return 0
      }

      // Sum up all costs
      return (data || []).reduce((total, item) => total + (item.cost_usd || 0), 0)
    } catch (error) {
      console.error("Error calculating total cost:", error)
      return 0
    }
  }

  // Store status check with enhanced error handling
  static async storeStatusCheck(statusCheck: StatusCheck): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      console.log("Supabase not available - status check not stored")
      return false
    }

    try {
      // Validate required fields
      const requiredFields = ["timestamp", "endpoint_path", "endpoint_name", "status", "response_time_ms"]
      const missingFields = requiredFields.filter((field) => {
        const value = statusCheck[field as keyof StatusCheck]
        return value === undefined || value === null || value === ""
      })

      if (missingFields.length > 0) {
        console.error("Missing required fields in status check:", missingFields)
        console.error("Status check data:", statusCheck)
        return false
      }

      // Validate data types
      if (typeof statusCheck.response_time_ms !== "number" || statusCheck.response_time_ms < 0) {
        console.error("Invalid response_time_ms:", statusCheck.response_time_ms)
        return false
      }

      if (!["operational", "degraded", "outage"].includes(statusCheck.status)) {
        console.error("Invalid status:", statusCheck.status)
        return false
      }

      // Clean the data before sending
      const cleanStatusCheck = {
        timestamp: statusCheck.timestamp,
        endpoint_path: statusCheck.endpoint_path,
        endpoint_name: statusCheck.endpoint_name,
        status: statusCheck.status,
        response_time_ms: Math.round(statusCheck.response_time_ms),
        http_status_code: statusCheck.http_status_code,
        error_message: statusCheck.error_message ? String(statusCheck.error_message).substring(0, 500) : null,
      }

      console.log(`Attempting to store status check for ${cleanStatusCheck.endpoint_path}:`, cleanStatusCheck)

      const { error } = await supabase!.from("status_checks").insert([cleanStatusCheck]).select()

      if (error) {
        // Enhanced error logging
        console.error("Supabase error storing status check:")
        console.error("Error code:", error.code)
        console.error("Error message:", error.message)
        console.error("Error details:", error.details)
        console.error("Error hint:", error.hint)
        console.error("Full error object:", JSON.stringify(error, null, 2))
        console.error("Data being inserted:", JSON.stringify(cleanStatusCheck, null, 2))
        return false
      }

      console.log(`✅ Successfully stored status check for ${cleanStatusCheck.endpoint_path}`)
      return true
    } catch (error) {
      console.error("Exception storing status check:")
      console.error("Error type:", typeof error)
      console.error("Error constructor:", error?.constructor?.name)
      console.error("Error message:", error instanceof Error ? error.message : String(error))
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
      console.error("Full error:", error)
      return false
    }
  }

  // Update daily metrics with better error handling
  static async updateDailyMetrics(date?: string): Promise<void> {
    if (!isSupabaseAvailable()) {
      console.log("Supabase not available - skipping daily metrics update")
      return
    }

    try {
      const targetDate = date || new Date().toISOString().split("T")[0]
      const endpoints = [
        "/health",
        "/v1/swarm/completions",
        "/v1/swarm/batch/completions",
        "/v1/agent/completions",
        "/v1/agent/batch/completions",
        "/v1/models/available",
        "/v1/swarms/available",
        "/v1/swarm/logs"
      ]

      console.log(`Updating daily metrics for ${targetDate}`)

      for (const endpoint of endpoints) {
        try {
          console.log(`Calculating daily metrics for ${endpoint} on ${targetDate}`)

          const { error } = await supabase!.rpc("calculate_daily_metrics", {
            target_date: targetDate,
            target_endpoint: endpoint,
          })

          if (error) {
            console.error(`Error updating daily metrics for ${endpoint}:`, {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            })
          } else {
            console.log(`✅ Successfully updated daily metrics for ${endpoint}`)
          }
        } catch (endpointError) {
          console.error(`Exception updating daily metrics for ${endpoint}:`, endpointError)
        }
      }
    } catch (error) {
      console.error("Error in updateDailyMetrics:", error)
    }
  }

  // Test connection method
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseAvailable()) {
      return { success: false, error: "Supabase not available" }
    }

    try {
      // Use proper PostgREST syntax for testing connection
      const { error } = await supabase!
        .from("status_checks")
        .select("id", { count: "exact", head: true })
        .limit(1)

      if (error) {
        return {
          success: false,
          error: `${error.message} (Code: ${error.code})`,
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // Store performance metrics
  static async storePerformanceMetrics(metrics: PerformanceMetrics): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      console.log("Supabase not available - performance metrics not stored")
      return false
    }

    try {
      // Validate required fields
      const requiredFields = ["timestamp", "endpoint_path", "response_time_ms"]
      const missingFields = requiredFields.filter((field) => {
        const value = metrics[field as keyof PerformanceMetrics]
        return value === undefined || value === null
      })

      if (missingFields.length > 0) {
        console.error("Missing required fields in performance metrics:", missingFields)
        return false
      }

      // Clean the data before sending
      const cleanMetrics = {
        timestamp: metrics.timestamp,
        endpoint_path: metrics.endpoint_path,
        response_time_ms: Math.round(metrics.response_time_ms),
        token_usage: metrics.token_usage,
        cost_usd: metrics.cost_usd,
        model_name: metrics.model_name,
        batch_size: metrics.batch_size,
        concurrent_requests: metrics.concurrent_requests,
        memory_usage_mb: metrics.memory_usage_mb,
        cpu_usage_percent: metrics.cpu_usage_percent
      }

      const { error } = await supabase!.from("performance_metrics").insert([cleanMetrics]).select()

      if (error) {
        console.error("Error storing performance metrics:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Exception storing performance metrics:", error)
      return false
    }
  }

  // Store request log
  static async storeRequestLog(log: RequestLog): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      console.log("Supabase not available - request log not stored")
      return false
    }

    try {
      // Validate required fields
      const requiredFields = ["timestamp", "endpoint_path", "method", "response_time_ms"]
      const missingFields = requiredFields.filter((field) => {
        const value = log[field as keyof RequestLog]
        return value === undefined || value === null
      })

      if (missingFields.length > 0) {
        console.error("Missing required fields in request log:", missingFields)
        return false
      }

      // Clean the data before sending
      const cleanLog = {
        timestamp: log.timestamp,
        endpoint_path: log.endpoint_path,
        method: log.method,
        request_headers: log.request_headers,
        request_body: log.request_body,
        response_headers: log.response_headers,
        response_body: log.response_body,
        response_time_ms: Math.round(log.response_time_ms),
        http_status_code: log.http_status_code,
        error_message: log.error_message,
        client_ip: log.client_ip,
        user_agent: log.user_agent
      }

      const { error } = await supabase!.from("request_logs").insert([cleanLog]).select()

      if (error) {
        console.error("Error storing request log:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Exception storing request log:", error)
      return false
    }
  }

  // Get request logs for a specific endpoint
  static async getRequestLogs(endpointPath: string, limit = 100): Promise<RequestLog[]> {
    if (!isSupabaseAvailable()) {
      return []
    }

    try {
      const { data, error } = await supabase!
        .from("request_logs")
        .select("*")
        .eq("endpoint_path", endpointPath)
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching request logs:", error)
      return []
    }
  }

  // Get detailed performance metrics
  static async getDetailedPerformanceMetrics(endpointPath: string, hours = 24): Promise<PerformanceMetrics[]> {
    if (!isSupabaseAvailable()) {
      return []
    }

    try {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() - hours)

      const { data, error } = await supabase!
        .from("performance_metrics")
        .select("*")
        .eq("endpoint_path", endpointPath)
        .gte("timestamp", startTime.toISOString())
        .order("timestamp", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching detailed performance metrics:", error)
      return []
    }
  }

  // Get model-specific performance metrics
  static async getModelPerformanceMetrics(modelName: string, hours = 24): Promise<PerformanceMetrics[]> {
    if (!isSupabaseAvailable()) {
      return []
    }

    try {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() - hours)

      const { data, error } = await supabase!
        .from("performance_metrics")
        .select("*")
        .eq("model_name", modelName)
        .gte("timestamp", startTime.toISOString())
        .order("timestamp", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching model performance metrics:", error)
      return []
    }
  }

  // Get system resource usage
  static async getSystemResourceUsage(hours = 24): Promise<SystemResourceUsage[]> {
    if (!isSupabaseAvailable()) {
      return []
    }

    try {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() - hours)

      const { data, error } = await supabase!
        .from("performance_metrics")
        .select("timestamp, memory_usage_mb, cpu_usage_percent")
        .not("memory_usage_mb", "is", null)
        .not("cpu_usage_percent", "is", null)
        .gte("timestamp", startTime.toISOString())
        .order("timestamp", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching system resource usage:", error)
      return []
    }
  }
}

export { isSupabaseAvailable }
