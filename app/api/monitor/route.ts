import { type NextRequest, NextResponse } from "next/server"
import { checkAllServices } from "@/lib/api-checker"
import { SupabaseService } from "@/lib/supabase-service"

// Remove edge runtime
// export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    console.log(`Monitoring check triggered at ${new Date().toISOString()}`)

    // Perform the status check
    const statusData = await checkAllServices()

    // Update daily metrics in the background
    SupabaseService.updateDailyMetrics().catch((error) => {
      console.error("Failed to update daily metrics:", error)
    })

    return NextResponse.json(statusData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Monitoring error:", error)
    return NextResponse.json(
      {
        error: "Monitoring failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        services: [],
        overall_status: "major_outage",
        summary: {
          total: 0,
          up: 0,
          down: 0
        }
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request) // Allow both GET and POST for flexibility
}
