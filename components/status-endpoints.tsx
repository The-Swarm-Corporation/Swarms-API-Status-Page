"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, XCircle, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { SupabaseService } from "@/lib/supabase-service"

export default function StatusEndpoints() {
  const [endpoints, setEndpoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEndpoints = async () => {
      setLoading(true)
      try {
        const latestStatus = await SupabaseService.getLatestStatus()
        
        const endpointsData = latestStatus.map((status) => ({
          path: status.endpoint_path,
          description: status.endpoint_name,
          status: status.status,
          latency: status.response_time_ms,
          error: status.error_message,
        }))

        setEndpoints(endpointsData)
      } catch (error) {
        console.error("Failed to fetch endpoints:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEndpoints()
  }, [])

  if (loading) {
    return (
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-xl font-semibold">API Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading endpoint status...</div>
        </CardContent>
      </Card>
    )
  }

  if (endpoints.length === 0) {
    return (
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-xl font-semibold">API Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-400">No endpoint data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-xl font-semibold">API Endpoints</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.path}
              className="flex items-center justify-between p-3 border border-gray-800 rounded-lg"
            >
              <div className="flex items-center">
                {endpoint.status === "operational" ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                ) : endpoint.status === "degraded" ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-3" />
                )}
                <div>
                  <div className="font-mono text-sm">{endpoint.path}</div>
                  <div className="text-xs text-gray-400">{endpoint.description}</div>
                  {endpoint.error && (
                    <div className="flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 text-red-400 mr-1" />
                      <span className="text-xs text-red-400">{endpoint.error}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs font-mono px-2 py-1 rounded bg-gray-800">
                {endpoint.latency > 0 ? `${endpoint.latency}ms` : "N/A"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
