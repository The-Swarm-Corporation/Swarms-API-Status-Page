"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Clock, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MonitoringConfig {
  enabled: boolean
  interval: number
  lastRun: Date | null
  nextRun: Date | null
  mode: "manual" | "auto"
}

export default function ClientSideMonitor() {
  const [config, setConfig] = useState<MonitoringConfig>({
    enabled: false,
    interval: 5, // minutes
    lastRun: null,
    nextRun: null,
    mode: "manual",
  })
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDateTime = (date: Date) => {
    if (!mounted) return "Loading..."
    // Use ISO format for consistency
    return date.toISOString().replace('T', ' ').substring(0, 19)
  }

  // Auto-monitoring effect
  useEffect(() => {
    if (!config.enabled || config.mode !== "auto") return

    const intervalMs = config.interval * 60 * 1000
    const interval = setInterval(() => {
      runMonitoring()
    }, intervalMs)

    // Set next run time
    setConfig((prev) => ({
      ...prev,
      nextRun: new Date(Date.now() + intervalMs),
    }))

    return () => clearInterval(interval)
  }, [config.enabled, config.interval, config.mode])

  const runMonitoring = async () => {
    setIsRunning(true)
    try {
      const response = await fetch("/api/monitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      setLastResult(result)
      setConfig((prev) => ({
        ...prev,
        lastRun: new Date(),
      }))

      // Trigger a page refresh to update the UI with new data
      window.location.reload()
    } catch (error) {
      console.error("Monitoring failed:", error)
      setLastResult({ error: "Failed to run monitoring" })
    } finally {
      setIsRunning(false)
    }
  }

  const toggleAutoMonitoring = () => {
    setConfig((prev) => ({
      ...prev,
      enabled: !prev.enabled,
      mode: prev.enabled ? "manual" : "auto",
    }))
  }

  const updateInterval = (minutes: number) => {
    setConfig((prev) => ({
      ...prev,
      interval: minutes,
    }))
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-xl font-semibold">Client-Side Monitoring</CardTitle>
          </div>
          <Badge variant={config.enabled ? "default" : "secondary"} className={config.enabled ? "bg-green-600" : ""}>
            {config.enabled ? "Auto" : "Manual"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Control Panel */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={runMonitoring} disabled={isRunning} className="bg-red-600 hover:bg-red-700" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Running..." : "Run Now"}
            </Button>

            <Button onClick={toggleAutoMonitoring} variant="outline" size="sm" className="border-gray-700">
              {config.enabled ? "Disable Auto" : "Enable Auto"}
            </Button>
          </div>

          {/* Interval Selection */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Interval:</span>
            {[1, 5, 10, 15, 30].map((minutes) => (
              <Button
                key={minutes}
                onClick={() => updateInterval(minutes)}
                variant={config.interval === minutes ? "default" : "outline"}
                size="sm"
                className={
                  config.interval === minutes ? "bg-red-600 hover:bg-red-700" : "border-gray-700 hover:bg-gray-800"
                }
              >
                {minutes}m
              </Button>
            ))}
          </div>

          {/* Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {config.lastRun && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Last run:</span>
                <span>{formatDateTime(config.lastRun)}</span>
              </div>
            )}

            {config.enabled && config.nextRun && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-400" />
                <span className="text-gray-400">Next run:</span>
                <span>{formatDateTime(config.nextRun)}</span>
              </div>
            )}
          </div>

          {/* Last Result */}
          {lastResult && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <div className="text-sm font-medium mb-2">Last Result:</div>
              <pre className="text-xs text-gray-300 overflow-x-auto">{JSON.stringify(lastResult, null, 2)}</pre>
            </div>
          )}

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg">
            <div className="text-sm text-blue-300">
              <strong>Note:</strong> Vercel Hobby accounts are limited to daily cron jobs. This client-side monitor
              allows more frequent monitoring by running checks directly in your browser.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
