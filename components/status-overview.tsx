"use client"

import { CheckCircle, AlertTriangle, XCircle, Clock, Database } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import SupabaseStatus from "./supabase-status"
import { useState, useEffect } from "react"
import { SupabaseService } from "@/lib/supabase-service"

export default function StatusOverview() {
  const [statusData, setStatusData] = useState<any>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadStatusData()
  }, [])

  const loadStatusData = async () => {
    try {
      setIsLoading(true)
      const latestStatus = await SupabaseService.getLatestStatus()
      
      if (latestStatus.length > 0) {
        const operationalCount = latestStatus.filter(s => s.status === 'operational').length
        const totalCount = latestStatus.length
        const overallStatus = operationalCount === totalCount ? 'operational' : 
                             operationalCount > totalCount / 2 ? 'degraded' : 'major_outage'
        
        setStatusData({
          overall_status: overallStatus,
          services: latestStatus,
          summary: {
            total: totalCount,
            up: operationalCount,
            down: totalCount - operationalCount
          }
        })
        setLastUpdate(new Date())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (date: Date) => {
    if (!mounted) return "Loading..."
    return date.toISOString().replace('T', ' ').substring(0, 19)
  }

  if (error) {
    return (
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <XCircle className="h-12 w-12 text-red-600 mr-4" />
              <div>
                <h2 className="text-2xl font-bold">
                  System Status: <span className="text-red-600">Error</span>
                </h2>
                <div className="flex items-center text-red-400 mt-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>{error}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end space-y-2">
              <div className="text-4xl font-bold text-white">—</div>
              <div className="text-sm text-gray-400">Error loading data</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !statusData) {
    return (
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <AlertTriangle className="h-12 w-12 text-gray-500 mr-4" />
              <div>
                <h2 className="text-2xl font-bold">
                  System Status: <span className="text-gray-400">Loading...</span>
                </h2>
                <div className="flex items-center text-gray-400 mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Loading status data...</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end space-y-2">
              <div className="text-4xl font-bold text-white">—</div>
              <div className="text-sm text-gray-400">Loading...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const status = statusData.overall_status
  const uptime = (statusData.summary.up / statusData.summary.total) * 100
  const responseTime =
    statusData.services.reduce((sum: number, service: any) => sum + service.response_time_ms, 0) / statusData.services.length

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            {status === "operational" ? (
              <CheckCircle className="h-12 w-12 text-green-500 mr-4" />
            ) : status === "degraded" ? (
              <AlertTriangle className="h-12 w-12 text-yellow-500 mr-4" />
            ) : status === "major_outage" ? (
              <XCircle className="h-12 w-12 text-red-600 mr-4" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-gray-500 mr-4" />
            )}
            <div>
              <h2 className="text-2xl font-bold">
                System Status: <span className={getStatusColor(status)}>{getStatusText(status)}</span>
              </h2>
              <div className="flex flex-col gap-1 text-gray-400 mt-1">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Last updated: {formatDateTime(lastUpdate)}</span>
                  {responseTime > 0 && <span className="ml-4">Avg response: {Math.round(responseTime)}ms</span>}
                </div>
                <SupabaseStatus />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="text-4xl font-bold text-white">{uptime > 0 ? `${uptime.toFixed(2)}%` : "—"}</div>
            <div className="text-sm text-gray-400">{uptime > 0 ? "Current Uptime" : "No data yet"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusText(status: string) {
  switch (status) {
    case "operational":
      return "Fully Operational"
    case "degraded":
      return "Degraded Performance"
    case "major_outage":
      return "Major Outage"
    default:
      return "Unknown"
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "operational":
      return "text-green-500"
    case "degraded":
      return "text-yellow-500"
    case "major_outage":
      return "text-red-600"
    default:
      return "text-gray-400"
  }
}
