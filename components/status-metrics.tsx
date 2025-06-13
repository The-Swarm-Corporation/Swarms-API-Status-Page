"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRealTime } from "./real-time-provider"
import { useState, useEffect, useMemo } from "react"
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

// Cache for metrics data
const metricsCache = new Map<string, { data: MetricData; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default function StatusMetrics() {
  const { statusData } = useRealTime()
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [loading, setLoading] = useState(true)

  // Memoize the service paths to prevent unnecessary recalculations
  const servicePaths = useMemo(() => {
    if (!statusData) return []
    return statusData.services.map(service => new URL(service.url).pathname)
  }, [statusData])

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!statusData) return

      setLoading(true)
      try {
        const metricsData: MetricData[] = []
        const currentTime = Date.now()

        // Fetch all metrics in parallel
        const metricsPromises = statusData.services.map(async (service) => {
          const endpointPath = new URL(service.url).pathname
          const cacheKey = `${endpointPath}-${currentTime}`
          const cachedData = metricsCache.get(cacheKey)

          if (cachedData && currentTime - cachedData.timestamp < CACHE_DURATION) {
            return cachedData.data
          }

          // Fetch all data in parallel
          const [uptime, avgResponseTime, performanceMetrics] = await Promise.all([
            SupabaseService.calculateUptime(endpointPath, 7),
            SupabaseService.getAverageResponseTime(endpointPath, 24),
            SupabaseService.getPerformanceMetrics(endpointPath, 24).catch(() => []),
          ])

          const totalCost = performanceMetrics.reduce((sum, metric) => sum + (metric.cost_usd || 0), 0)
          const metricData = {
            name: service.name,
            value: `${avgResponseTime || service.responseTime}ms`,
            percentage: Math.min(((avgResponseTime || service.responseTime) / 5000) * 100, 100),
            timeframe: "24h avg",
            status: service.status === "up" ? "Operational" : "Error",
            uptime: uptime,
            cost: totalCost,
          }

          // Cache the result
          metricsCache.set(cacheKey, { data: metricData, timestamp: currentTime })
          return metricData
        })

        const results = await Promise.all(metricsPromises)
        setMetrics(results)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
        // Fallback to current data
        const fallbackMetrics = statusData.services.map((service) => ({
          name: service.name,
          value: `${service.responseTime}ms`,
          percentage: Math.min((service.responseTime / 5000) * 100, 100),
          timeframe: "Current",
          status: service.status === "up" ? "Operational" : "Error",
          uptime: service.status === "up" ? 100 : 0,
        }))
        setMetrics(fallbackMetrics)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [statusData])

  if (!statusData) {
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

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-xl font-semibold">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-400">Loading historical data...</div>
          ) : (
            metrics.map((metric) => (
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
