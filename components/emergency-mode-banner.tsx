"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, Database, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function EmergencyModeBanner() {
  const [redisHealth, setRedisHealth] = useState<any>(null)
  const [timeUntilReset, setTimeUntilReset] = useState<string>("")

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/redis-stats")
        if (response.ok) {
          const data = await response.json()
          setRedisHealth(data.redisHealth)

          // Calculate time until reset
          if (data.redisHealth.rateLimited) {
            const lastCheck = new Date(data.redisHealth.lastCheck)
            const resetTime = new Date(lastCheck.getTime() + 2 * 60 * 60 * 1000) // 2 hours
            const now = new Date()
            const diff = resetTime.getTime() - now.getTime()

            if (diff > 0) {
              const hours = Math.floor(diff / (1000 * 60 * 60))
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
              setTimeUntilReset(`${hours}h ${minutes}m`)
            } else {
              setTimeUntilReset("Soon")
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch Redis health:", error)
      }
    }

    fetchHealth()
    const interval = setInterval(fetchHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Only show if Redis is having issues
  if (!redisHealth || (redisHealth.available && !redisHealth.rateLimited && redisHealth.consecutiveFailures === 0)) {
    return null
  }

  return (
    <div className="mb-6">
      <Alert className="border-yellow-600 bg-yellow-900/20 text-yellow-300">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <AlertDescription>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <strong className="text-yellow-400">Operating in Emergency Mode</strong>
                  <div className="text-sm mt-1">
                    {redisHealth.rateLimited && (
                      <>
                        <Database className="inline h-4 w-4 mr-1" />
                        Redis rate limit exceeded (500K requests). Using cached and mock data.
                      </>
                    )}
                    {!redisHealth.available && !redisHealth.rateLimited && (
                      <>
                        <Shield className="inline h-4 w-4 mr-1" />
                        Database connection issues. Using cached and mock data.
                      </>
                    )}
                    {redisHealth.consecutiveFailures > 0 && (
                      <>
                        <AlertTriangle className="inline h-4 w-4 mr-1" />
                        {redisHealth.consecutiveFailures} consecutive failures detected.
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-1">
                  <Badge variant="outline" className="border-yellow-600 text-yellow-300 w-fit">
                    {redisHealth.rateLimited ? "Rate Limited" : "Connection Issues"}
                  </Badge>

                  {timeUntilReset && redisHealth.rateLimited && (
                    <div className="text-xs text-yellow-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Reset in ~{timeUntilReset}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 text-xs text-yellow-200">
                <strong>Current Status:</strong> All features remain functional using fallback systems. Real-time
                monitoring continues with cached data.
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  )
}
