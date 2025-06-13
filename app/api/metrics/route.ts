import { type NextRequest, NextResponse } from "next/server"
import { SupabaseService } from "@/lib/supabase-service"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get("endpoint")
    const days = Number.parseInt(searchParams.get("days") || "7")
    const type = searchParams.get("type") || "uptime"

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint parameter required" }, { status: 400 })
    }

    let data: any

    switch (type) {
      case "uptime":
        data = await SupabaseService.calculateUptime(endpoint, days)
        break
      case "response_time":
        data = await SupabaseService.getAverageResponseTime(endpoint, days * 24)
        break
      case "history":
        data = await SupabaseService.getStatusHistory(endpoint, days * 24)
        break
      case "daily_metrics":
        data = await SupabaseService.getDailyMetrics(endpoint, days)
        break
      case "performance":
        data = await SupabaseService.getPerformanceMetrics(endpoint, days * 24)
        break
      case "cost":
        data = await SupabaseService.getTotalCost(days)
        break
      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }

    return NextResponse.json({
      endpoint,
      type,
      days,
      data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Metrics API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
