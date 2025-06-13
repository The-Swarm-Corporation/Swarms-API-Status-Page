"use client"

import { useRealTime } from "./real-time-provider"
import { Clock, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

export default function StatusIndicator() {
  const { lastUpdate, isUpdating, nextUpdate } = useRealTime()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatDateTime = (date: Date) => {
    if (!mounted) return "Loading..."
    // Use a consistent format that works the same on server and client
    return date.toISOString().replace('T', ' ').substring(0, 19)
  }

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-400">
      <div className="flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        <span>Last update: {formatDateTime(lastUpdate)}</span>
      </div>

      <div className="flex items-center">
        <RefreshCw className={`h-4 w-4 mr-1 ${isUpdating ? "animate-spin text-red-600" : ""}`} />
        <span>{isUpdating ? "Updating..." : `Next update in ${formatTime(nextUpdate)}`}</span>
      </div>
    </div>
  )
}
