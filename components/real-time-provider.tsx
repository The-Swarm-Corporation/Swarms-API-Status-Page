"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { StatusResponse } from "@/lib/api-checker"

interface RealTimeContextType {
  lastUpdate: Date
  isUpdating: boolean
  nextUpdate: number
  statusData: StatusResponse | null
  refreshData: () => Promise<void>
  error: string | null
}

const RealTimeContext = createContext<RealTimeContextType>({
  lastUpdate: new Date(),
  isUpdating: false,
  nextUpdate: 300,
  statusData: null,
  refreshData: async () => {},
  error: null
})

export function useRealTime() {
  return useContext(RealTimeContext)
}

interface RealTimeProviderProps {
  children: ReactNode
  initialData?: StatusResponse
}

export function RealTimeProvider({ children, initialData }: RealTimeProviderProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isUpdating, setIsUpdating] = useState(false)
  const [nextUpdate, setNextUpdate] = useState(300) // 5 minutes in seconds
  const [statusData, setStatusData] = useState<StatusResponse | null>(initialData || null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const refreshData = async () => {
    setIsUpdating(true)
    setError(null)
    try {
      const response = await fetch("/api/monitor")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setStatusData(data)
      setLastUpdate(new Date())
      setRetryCount(0) // Reset retry count on success
    } catch (error) {
      console.error("Failed to refresh status data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch status data")
      
      // Implement retry logic
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => {
          refreshData()
        }, 5000) // Retry after 5 seconds
      }
    } finally {
      setIsUpdating(false)
      setNextUpdate(300) // Reset countdown
    }
  }

  useEffect(() => {
    // Initial fetch if no data provided
    if (!initialData) {
      refreshData()
    }

    // Update countdown timer
    const countdownInterval = setInterval(() => {
      setNextUpdate((prev) => {
        if (prev <= 1) {
          refreshData()
          return 300
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(countdownInterval)
    }
  }, [initialData])

  return (
    <RealTimeContext.Provider value={{ lastUpdate, isUpdating, nextUpdate, statusData, refreshData, error }}>
      {children}
    </RealTimeContext.Provider>
  )
}
