"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, AlertTriangle, Database } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DatabaseAdmin() {
  const [isClearing, setIsClearing] = useState(false)
  const [clearResult, setClearResult] = useState<any>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const clearDatabase = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsClearing(true)
    setShowConfirm(false)

    try {
      const adminSecret = prompt("Enter ADMIN_SECRET:")
      if (!adminSecret) {
        setIsClearing(false)
        return
      }

      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminSecret}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      setClearResult(result)

      if (response.ok) {
        // Refresh the page after successful clear
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    } catch (error) {
      setClearResult({ error: "Failed to clear database", message: String(error) })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-red-600" />
            <CardTitle className="text-xl font-semibold">Database Administration</CardTitle>
          </div>
          <Badge variant="destructive">Admin Only</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Warning */}
          <Alert className="border-red-600 bg-red-900/20 text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will permanently delete all monitoring data, history, and incidents. This
              action cannot be undone.
            </AlertDescription>
          </Alert>

          {/* Clear Database Section */}
          <div className="space-y-3">
            <h3 className="font-medium">Clear All Data</h3>
            <p className="text-sm text-gray-400">Remove all stored monitoring data to start fresh. This includes:</p>
            <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
              <li>Latest status for all endpoints</li>
              <li>Historical monitoring data (30+ days)</li>
              <li>Daily aggregated statistics</li>
              <li>Overall system status</li>
              <li>All incidents and updates</li>
              <li>In-memory cache</li>
            </ul>

            <div className="flex gap-3">
              {!showConfirm ? (
                <Button
                  onClick={clearDatabase}
                  disabled={isClearing}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Database
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={clearDatabase}
                    disabled={isClearing}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <AlertTriangle className={`h-4 w-4 mr-2 ${isClearing ? "animate-pulse" : ""}`} />
                    {isClearing ? "Clearing..." : "Confirm Clear"}
                  </Button>
                  <Button onClick={() => setShowConfirm(false)} variant="outline" className="border-gray-700">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Result Display */}
          {clearResult && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <div className="text-sm font-medium mb-2">{clearResult.error ? "❌ Error" : "✅ Success"}</div>
              {clearResult.error ? (
                <div className="text-xs text-red-400">{clearResult.message || clearResult.error}</div>
              ) : (
                <div className="text-xs text-green-400 space-y-1">
                  <div>Total keys cleared: {clearResult.totalKeysCleared}</div>
                  <div>Latest status: {clearResult.results?.latestStatus}</div>
                  <div>History entries: {clearResult.results?.history}</div>
                  <div>Daily data: {clearResult.results?.dailyData}</div>
                  <div>Overall status: {clearResult.results?.overallStatus}</div>
                  <div>Incidents: {clearResult.results?.incidents}</div>
                  {clearResult.results?.errors?.length > 0 && (
                    <div className="text-yellow-400">Errors: {clearResult.results.errors.join(", ")}</div>
                  )}
                  <div className="mt-2 text-blue-400">Page will refresh in 3 seconds...</div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg">
            <div className="text-sm text-blue-300">
              <strong>After clearing:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Run your first monitoring check using the "Manual Monitoring" section</li>
                <li>Data will start accumulating from that point forward</li>
                <li>Historical charts will be empty until you have 24+ hours of data</li>
                <li>Set up automated monitoring via GitHub Actions or external services</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
