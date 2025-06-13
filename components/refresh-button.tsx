"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRealTime } from "./real-time-provider"

export default function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { refreshData, isUpdating } = useRealTime()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshData()

    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing || isUpdating}
      className="border-gray-700 hover:bg-gray-800"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing || isUpdating ? "animate-spin" : ""}`} />
      {isRefreshing || isUpdating ? "Refreshing..." : "Refresh"}
    </Button>
  )
}
