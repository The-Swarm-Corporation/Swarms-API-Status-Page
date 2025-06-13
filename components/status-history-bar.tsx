"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { SupabaseService } from "@/lib/supabase-service"
import type { DailyMetrics } from "@/lib/supabase"

interface StatusHistoryBarProps {
  endpoint: string
  title: string
  days?: number
}

export default function StatusHistoryBar({ endpoint, title, days = 30 }: StatusHistoryBarProps) {
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [overallUptime, setOverallUptime] = useState(0)

  useEffect(() => {
    setMounted(true)
    const fetchData = async () => {
      setLoading(true)
      try {
        // Get daily metrics from Supabase
        const metrics = await SupabaseService.getDailyMetrics(endpoint, days)
        setDailyMetrics(metrics)

        // Calculate overall uptime
        if (metrics.length > 0) {
          const totalUptime = metrics.reduce((sum, metric) => sum + metric.uptime_percentage, 0)
          setOverallUptime(totalUptime / metrics.length)
        } else {
          // Fallback to real-time calculation if no daily metrics
          const uptime = await SupabaseService.calculateUptime(endpoint, days)
          setOverallUptime(uptime)
        }
      } catch (error) {
        console.error("Failed to fetch status history:", error)
        setOverallUptime(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint, days])

  // Generate status visualization
  const statusDays = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const dateStr = date.toISOString().split("T")[0]

    // Find corresponding daily metric
    const metric = dailyMetrics.find((m) => m.date === dateStr)

    let color = "bg-gray-600" // No data
    let operational = 0
    let degraded = 0
    let outage = 0

    if (metric) {
      const uptimePercent = metric.uptime_percentage
      if (uptimePercent >= 99) {
        color = "bg-green-500"
        operational = 1
      } else if (uptimePercent >= 95) {
        color = "bg-yellow-500"
        degraded = 1
      } else {
        color = "bg-red-600"
        outage = 1
      }
    }

    return {
      date: dateStr,
      color,
      operational,
      degraded,
      outage,
      uptime: metric?.uptime_percentage || 0,
      totalChecks: metric?.total_checks || 0,
      avgResponseTime: metric?.avg_response_time || 0,
    }
  })

  const formatDate = (dateString: string) => {
    if (!mounted) return "Loading..."
    // Use consistent date formatting
    return new Date(dateString).toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-800 pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <div className="text-sm text-gray-400">Loading...</div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="text-sm text-gray-400">
            {overallUptime.toFixed(2)}% uptime ({days} days)
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Status bar */}
          <div className="flex gap-1 h-8 rounded overflow-hidden">
            {statusDays.map((day, index) => (
              <div
                key={day.date}
                className={`flex-1 ${day.color} transition-all duration-200 hover:opacity-80 cursor-pointer relative group`}
                title={`${day.date}`}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div>{formatDate(day.date)}</div>
                  <div>Uptime: {day.uptime.toFixed(1)}%</div>
                  <div>Checks: {day.totalChecks}</div>
                  {day.avgResponseTime > 0 && <div>Avg Response: {Math.round(day.avgResponseTime)}ms</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{days} days ago</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span>Operational (≥99%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                <span>Degraded (95-99%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
                <span>Outage (&lt;95%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                <span>No data</span>
              </div>
            </div>
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
