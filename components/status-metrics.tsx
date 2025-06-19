"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { SupabaseService } from "@/lib/supabase-service"

interface MetricData {
  name: string
  value: string
  percentage: number
  timeframe: string
  status: string
  uptime?: number
  cost?: number
}

export default function StatusMetrics() {
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      try {
        // Get latest status from Supabase
        const latestStatus = await SupabaseService.getLatestStatus()
        
        if (latestStatus.length === 0) {
          setLoading(false)
          return
        }

        const metricsData: MetricData[] = []

        // Get daily metrics for all endpoints in one efficient call
        const endpoints = latestStatus.map(s => s.endpoint_path)
        const allDailyMetrics = await SupabaseService.getDailyMetricsForEndpoints(endpoints, 1)
        
        // Create a map for quick lookup
        const dailyMetricsMap = new Map()
        allDailyMetrics.forEach(metric => {
          dailyMetricsMap.set(metric.endpoint_path, metric)
        })

        // Process each endpoint
        for (const status of latestStatus) {
          try {
            // Use daily metrics if available, otherwise fallback to current status
            const todayMetric = dailyMetricsMap.get(status.endpoint_path)
            
            let avgResponseTime = status.response_time_ms
            let uptime = status.status === "operational" ? 100 : 0
            let totalCost = 0
            let timeframe = "Current"

            if (todayMetric) {
              avgResponseTime = todayMetric.avg_response_time || status.response_time_ms
              uptime = todayMetric.uptime_percentage || (status.status === "operational" ? 100 : 0)
              totalCost = todayMetric.total_cost_usd || 0
              timeframe = "24h avg"
            }
            
            metricsData.push({
              name: status.endpoint_name,
              value: `${Math.round(avgResponseTime)}ms`,
              percentage: Math.min((avgResponseTime / 5000) * 100, 100),
              timeframe: timeframe,
              status: status.status === "operational" ? "Operational" : "Error",
              uptime: uptime,
              cost: totalCost,
            })
          } catch (error) {
            console.error(`Failed to fetch metrics for ${status.endpoint_path}:`, error)
            // Add fallback data
            metricsData.push({
              name: status.endpoint_name,
              value: `${status.response_time_ms}ms`,
              percentage: Math.min((status.response_time_ms / 5000) * 100, 100),
              timeframe: "Current",
              status: status.status === "operational" ? "Operational" : "Error",
              uptime: status.status === "operational" ? 100 : 0,
            })
          }
        }

        setMetrics(metricsData)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-xl font-semibold">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading metrics...</div>
        </CardContent>
      </Card>
    )
  }

  if (metrics.length === 0) {
    return (
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-xl font-semibold">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-400">No metrics data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-xl font-semibold">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {metrics.map((metric) => (
            <div key={metric.name} className="relative">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{metric.value}</span>
                  {metric.uptime !== undefined && (
                    <span className="text-xs text-green-400">{metric.uptime.toFixed(1)}% uptime</span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${metric.status === "Operational" ? "bg-green-600" : "bg-red-600"}`}
                  style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">{metric.timeframe}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{metric.status}</span>
                  {metric.cost !== undefined && metric.cost > 0 && (
                    <span className="text-xs text-blue-400">${metric.cost.toFixed(4)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
