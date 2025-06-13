"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Shield, Database } from "lucide-react"

export default function FallbackIndicator() {
  const [redisHealth, setRedisHealth] = useState<any>(null)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/redis-stats")
        if (response.ok) {
          const data = await response.json()
          setRedisHealth(data.redisHealth)
        }
      } catch (error) {
        console.error("Failed to fetch Redis health:", error)
      }
    }

    fetchHealth()
    const interval = setInterval(fetchHealth, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  if (!redisHealth || redisHealth.available) {
    return null // Don't show if Redis is healthy
  }

  return (
    <div className="flex justify-center mb-4">
      <Badge variant="outline" className="border-yellow-600 bg-yellow-900/20 text-yellow-300 px-3 py-1">
        <Shield className="h-4 w-4 mr-2" />
        Fallback Mode Active - Using Cached Data
        {redisHealth.rateLimited && (
          <>
            <Database className="h-4 w-4 ml-2 mr-1" />
            Redis Rate Limited
          </>
        )}
      </Badge>
    </div>
  )
}
