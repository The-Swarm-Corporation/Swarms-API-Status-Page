import { type NextRequest, NextResponse } from "next/server"
import { SupabaseService } from "@/lib/supabase-service"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get("endpoint")
    const days = Number.parseInt(searchParams.get("days") || "30")

    if (endpoint) {
      // Return specific endpoint data
      const history = await SupabaseService.getStatusHistory(endpoint, days * 24)
      const uptime = await SupabaseService.calculateUptime(endpoint, days)
      const avgResponseTime = await SupabaseService.getAverageResponseTime(endpoint, 24)

      return NextResponse.json({
        endpoint,
        uptime,
        avgResponseTime,
        history: history.slice(0, 100),
        timestamp: new Date().toISOString(),
      })
    }

    // Get all services data
    const endpoints = [
      "/health", 
      "/v1/swarm/completions", 
      "/v1/swarm/batch/completions",
      "/v1/agent/completions",
      "/v1/agent/batch/completions",
      "/v1/models/available",
      "/v1/swarms/available"
    ]

    const services = await Promise.all(
      endpoints.map(async (ep) => {
        const uptime = await SupabaseService.calculateUptime(ep, 7)
        const avgResponseTime = await SupabaseService.getAverageResponseTime(ep, 24)
        const recentHistory = await SupabaseService.getStatusHistory(ep, 10)

        return {
          endpoint: ep,
          name: getServiceName(ep),
          uptime,
          avgResponseTime,
          recentStatus: recentHistory[0]?.status || "unknown",
        }
      }),
    )

    const response = {
      timestamp: new Date().toISOString(),
      services,
      overall_uptime: services.reduce((sum, s) => sum + s.uptime, 0) / services.length,
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Status API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch status data",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

function getServiceName(endpoint: string): string {
  const names: Record<string, string> = {
    "/health": "Health Check",
    "/v1/swarm/completions": "Swarm API",
    "/v1/swarm/batch/completions": "Swarm Batch API",
    "/v1/agent/completions": "Agent API",
    "/v1/agent/batch/completions": "Agent Batch API",
    "/v1/models/available": "Available Models",
    "/v1/swarms/available": "Available Swarms",
  }
  return names[endpoint] || endpoint
}
