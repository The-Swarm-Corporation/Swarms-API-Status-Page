"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { SupabaseService } from "@/lib/supabase-service"
import { DollarSign, TrendingUp, Activity, Clock } from "lucide-react"

export default function CostMonitor() {
  const [costData, setCostData] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    loading: true,
  })

  useEffect(() => {
    const fetchCostData = async () => {
      try {
        const [dailyCost, weeklyCost, monthlyCost] = await Promise.all([
          SupabaseService.getTotalCost(1),
          SupabaseService.getTotalCost(7),
          SupabaseService.getTotalCost(30),
        ])

        setCostData({
          daily: dailyCost,
          weekly: weeklyCost,
          monthly: monthlyCost,
          loading: false,
        })
      } catch (error) {
        console.error("Failed to fetch cost data:", error)
        setCostData((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchCostData()

    // Refresh cost data every 5 minutes
    const interval = setInterval(fetchCostData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (costData.loading) {
    return (
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-xl font-semibold">API Cost Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading cost data...</div>
        </CardContent>
      </Card>
    )
  }

  const costMetrics = [
    {
      label: "Today",
      value: costData.daily,
      icon: Clock,
      color: "text-blue-400",
    },
    {
      label: "This Week",
      value: costData.weekly,
      icon: Activity,
      color: "text-green-400",
    },
    {
      label: "This Month",
      value: costData.monthly,
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ]

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          <CardTitle className="text-xl font-semibold">API Cost Monitoring</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {costMetrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.label} className="p-4 border border-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                  <span className="text-sm text-gray-400">{metric.label}</span>
                </div>
                <div className="text-2xl font-bold">${metric.value.toFixed(4)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {metric.value > 0 ? "Active usage" : "No usage recorded"}
                </div>
              </div>
            )
          })}
        </div>

        {costData.monthly > 0 && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg">
            <div className="text-sm text-blue-300">
              <strong>Monthly Projection:</strong> Based on current usage, estimated monthly cost is $
              {(costData.daily * 30).toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
