"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, RefreshCw, AlertTriangle, CheckCircle, Trash2, Power, RotateCcw } from "lucide-react"

interface RedisStats {
  cacheSize: number
  redisHealth: {
    available: boolean
    rateLimited: boolean
    lastCheck: number
    consecutiveFailures: number
  }
}

export default function RedisMonitor() {
  const [stats, setStats] = useState<RedisStats | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/redis-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch Redis stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    try {
      const response = await fetch("/api/redis-stats", { method: "DELETE" })
      if (response.ok) {
        await fetchStats()
      }
    } catch (error) {
      console.error("Failed to clear cache:", error)
    }
  }

  const disableRedis = async () => {
    try {
      const response = await fetch("/api/redis-stats", {
        method: "POST",
        body: JSON.stringify({ action: "disable" }),
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        await fetchStats()
      }
    } catch (error) {
      console.error("Failed to disable Redis:", error)
    }
  }

  const resetRedis = async () => {
    try {
      const response = await fetch("/api/redis-stats", {
        method: "POST",
        body: JSON.stringify({ action: "reset" }),
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        await fetchStats()
      }
    } catch (error) {
      console.error("Failed to reset Redis:", error)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const getHealthStatus = () => {
    if (!stats?.redisHealth) return { color: "gray", text: "Unknown", icon: AlertTriangle }

    const { available, rateLimited, consecutiveFailures } = stats.redisHealth

    if (rateLimited) return { color: "red", text: "Rate Limited", icon: AlertTriangle }
    if (!available) return { color: "red", text: "Unavailable", icon: AlertTriangle }
    if (consecutiveFailures > 0) return { color: "yellow", text: "Degraded", icon: AlertTriangle }
    return { color: "green", text: "Healthy", icon: CheckCircle }
  }

  const healthStatus = getHealthStatus()
  const HealthIcon = healthStatus.icon

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-xl font-semibold">Redis Health Monitor</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearCache} className="border-gray-700 hover:bg-gray-800">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
              className="border-gray-700 hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {stats ? (
          <div className="space-y-4">
            {/* Redis Health Status */}
            <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <HealthIcon
                  className={`h-5 w-5 ${
                    healthStatus.color === "green"
                      ? "text-green-500"
                      : healthStatus.color === "yellow"
                        ? "text-yellow-500"
                        : healthStatus.color === "red"
                          ? "text-red-500"
                          : "text-gray-500"
                  }`}
                />
                <div>
                  <div className="font-medium">Redis Status</div>
                  <div className="text-sm text-gray-400">
                    {stats.redisHealth.consecutiveFailures > 0 &&
                      `${stats.redisHealth.consecutiveFailures} consecutive failures`}
                    {stats.redisHealth.rateLimited && "Rate limit exceeded"}
                    {!stats.redisHealth.available && !stats.redisHealth.rateLimited && "Connection unavailable"}
                    {stats.redisHealth.available &&
                      !stats.redisHealth.rateLimited &&
                      stats.redisHealth.consecutiveFailures === 0 &&
                      "All systems operational"}
                  </div>
                </div>
              </div>
              <Badge
                variant={healthStatus.color === "red" ? "destructive" : "outline"}
                className={
                  healthStatus.color === "green"
                    ? "bg-green-600"
                    : healthStatus.color === "yellow"
                      ? "bg-yellow-600"
                      : ""
                }
              >
                {healthStatus.text}
              </Badge>
            </div>

            {/* Cache Info */}
            <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
              <div>
                <div className="font-medium">In-Memory Cache</div>
                <div className="text-sm text-gray-400">{stats.cacheSize} entries cached</div>
              </div>
              <Badge variant="outline" className="bg-blue-600">
                Active
              </Badge>
            </div>

            {/* Emergency Controls */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Emergency Controls</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disableRedis}
                  className="border-red-700 hover:bg-red-900/20 text-red-400"
                >
                  <Power className="h-4 w-4 mr-2" />
                  Disable Redis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetRedis}
                  className="border-green-700 hover:bg-green-900/20 text-green-400"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Health
                </Button>
              </div>
            </div>

            {/* Status Information */}
            {stats.redisHealth.rateLimited && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-400">Rate Limit Exceeded</div>
                    <div className="text-sm text-red-300 mt-1">
                      Redis has hit the 500,000 request limit. The system is now operating in fallback mode using:
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>In-memory cache for recent data</li>
                        <li>Mock data for missing information</li>
                        <li>Reduced functionality to prevent errors</li>
                      </ul>
                      <div className="mt-2 text-xs">
                        The rate limit resets hourly. You can manually reset the health status or wait for automatic
                        recovery.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback Mode Info */}
            {!stats.redisHealth.available && (
              <div className="p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-400">Fallback Mode Active</div>
                    <div className="text-sm text-blue-300 mt-1">
                      The status page is operating normally using cached and mock data. All features remain functional.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400">Loading Redis health status...</div>
        )}
      </CardContent>
    </Card>
  )
}
