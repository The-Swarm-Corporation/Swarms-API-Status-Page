"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useRealTime } from "./real-time-provider"

interface LiveIndicatorProps {
  className?: string
}

export function LiveIndicator({ className }: LiveIndicatorProps) {
  const [isBlinking, setIsBlinking] = useState(true)
  const { isUpdating } = useRealTime()

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking((prev) => !prev)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn("flex items-center", className)}>
      <div
        className={cn(
          "h-2 w-2 rounded-full mr-2 transition-colors duration-300",
          isUpdating ? "bg-yellow-500 animate-pulse" : isBlinking ? "bg-red-600" : "bg-red-900",
        )}
      />
      <span className="text-xs uppercase tracking-wider">{isUpdating ? "Updating" : "Live"}</span>
    </div>
  )
}
