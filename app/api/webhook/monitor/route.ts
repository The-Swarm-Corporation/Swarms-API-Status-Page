import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "your-webhook-secret"

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get("authorization")
    const providedSecret = authHeader?.replace("Bearer ", "")

    if (providedSecret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Trigger monitoring
    const monitorUrl = new URL("/api/monitor", request.url)
    const monitorResponse = await fetch(monitorUrl.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MONITORING_CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    })

    const result = await monitorResponse.json()

    return NextResponse.json({
      message: "Monitoring triggered successfully",
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Webhook monitoring error:", error)
    return NextResponse.json(
      {
        error: "Failed to trigger monitoring",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
