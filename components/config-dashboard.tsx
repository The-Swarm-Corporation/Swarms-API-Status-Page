"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Settings, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface EdgeConfigData {
  monitoring_enabled?: boolean
  maintenance_mode?: boolean
}

export default function ConfigDashboard() {
  const [config, setConfig] = useState<EdgeConfigData>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/config")
      const data = await response.json()
      setConfig(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch config:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchConfig()
    // Refresh config every 30 seconds
    const interval = setInterval(fetchConfig, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDateTime = (date: Date) => {
    if (!mounted) return "Loading..."
    // Use ISO format for consistency
    return date.toISOString().replace('T', ' ').substring(0, 19)
  }

  const getStatusIcon = (enabled?: boolean) => {
    if (enabled === true) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (enabled === false) return <XCircle className="h-4 w-4 text-red-500" />
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  }

  const getStatusBadge = (enabled?: boolean, trueText = "Enabled", falseText = "Disabled") => {
    if (enabled === true)
      return (
        <Badge variant="default" className="bg-green-600">
          {trueText}
        </Badge>
      )
    if (enabled === false) return <Badge variant="destructive">{falseText}</Badge>
    return <Badge variant="secondary">Unknown</Badge>
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-red-600" />
            <CardTitle className="text-xl font-semibold">Public Status</CardTitle>
          </div>
          {/* 
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConfig}
            disabled={loading}
            className="border-gray-700 hover:bg-gray-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button> 
          */}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monitoring Status */}
          <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(config.monitoring_enabled)}
              <div>
                <div className="font-medium">Monitoring</div>
                <div className="text-sm text-gray-400">API endpoint monitoring</div>
              </div>
            </div>
            {getStatusBadge(config.monitoring_enabled)}
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(config.maintenance_mode)}
              <div>
                <div className="font-medium">Maintenance Mode</div>
                <div className="text-sm text-gray-400">Scheduled maintenance</div>
              </div>
            </div>
            {getStatusBadge(config.maintenance_mode, "Active", "Inactive")}
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="mt-4 text-xs text-gray-500 text-center">Last updated: {formatDateTime(lastUpdated)}</div>
        )}
      </CardContent>
    </Card>
  )
}
