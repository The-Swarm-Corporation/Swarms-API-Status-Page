"use client"

import { Clock } from "lucide-react"
import { useState, useEffect } from "react"

export default function StatusIndicator() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDateTime = (date: Date) => {
    if (!mounted) return "Loading..."
    return date.toISOString().replace('T', ' ').substring(0, 19)
  }

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-400">
      <div className="flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        <span>Last update: {formatDateTime(new Date())}</span>
      </div>

      {/* <div className="flex items-center">
        <span>Data from cron job monitoring</span>
      </div> */}
    </div>
  )
}
