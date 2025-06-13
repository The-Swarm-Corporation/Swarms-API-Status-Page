"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Github, ExternalLink, Zap } from "lucide-react"

export default function ManualMonitoring() {
  const [isRunning, setIsRunning] = useState(false)
  const [lastRun, setLastRun] = useState<Date | null>(null)
  const [lastResult, setLastResult] = useState<Record<string, any> | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDateTime = (date: Date) => {
    if (!mounted) return "Loading..."
    // Use ISO format for consistency
    return date.toISOString().replace('T', ' ').substring(0, 19)
  }

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
      setLastRun(new Date())

      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Monitoring failed:", error)
      setLastResult({ error: "Failed to run monitoring" })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-500" />
            <CardTitle className="text-xl font-semibold">Manual Monitoring</CardTitle>
          </div>
          <Badge variant="default" className="bg-green-600">
            Hobby Plan Compatible
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Manual Trigger */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={runMonitoring} disabled={isRunning} className="bg-red-600 hover:bg-red-700">
              <Play className={`h-4 w-4 mr-2 ${isRunning ? "animate-pulse" : ""}`} />
              {isRunning ? "Running Check..." : "Run Monitoring Check"}
            </Button>

            {lastRun && (
              <div className="flex items-center text-sm text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                Last run: {formatDateTime(lastRun)}
              </div>
            )}
          </div>

          {/* Automation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Github className="h-5 w-5 text-purple-500" />
                <h3 className="font-medium">GitHub Actions</h3>
                <Badge variant="outline" className="border-green-600 text-green-400">
                  FREE
                </Badge>
              </div>
              <p className="text-sm text-gray-400 mb-3">Automated monitoring every 5 minutes using GitHub Actions</p>
              <Button variant="outline" size="sm" className="border-gray-700" asChild>
                <a
                  href="https://github.com/features/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Setup Guide
                </a>
              </Button>
            </div>

            <div className="p-4 border border-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h3 className="font-medium">External Services</h3>
                <Badge variant="outline" className="border-blue-600 text-blue-400">
                  FREE Tier
                </Badge>
              </div>
              <p className="text-sm text-gray-400 mb-3">Use UptimeRobot, Pingdom, or similar services</p>
              <Button variant="outline" size="sm" className="border-gray-700" asChild>
                <a
                  href="https://uptimerobot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  UptimeRobot
                </a>
              </Button>
            </div>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <div className="text-sm font-medium mb-2">Last Result:</div>
              <div className="text-xs text-gray-300">
                <div>
                  Status: <span className="text-green-400">{lastResult.overallApiStatus || "Unknown"}</span>
                </div>
                <div>Endpoints Checked: {lastResult.results?.length || 0}</div>
                <div>
                  Issues Found: {lastResult.results?.filter((r: Record<string, any>) => r.status !== "operational").length || 0}
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg">
            <div className="text-sm text-blue-300">
              <strong>Hobby Plan Limitation:</strong> Vercel Hobby accounts only support daily cron jobs. Use the manual
              trigger above or set up GitHub Actions for automated monitoring.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
