import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { get } from "@vercel/edge-config"

export const config = {
  matcher: ["/api/monitor/:path*", "/welcome", "/api/config/:path*"],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle welcome endpoint for testing Edge Config
  if (pathname === "/welcome") {
    try {
      const greeting = await get("greeting")
      return NextResponse.json(greeting || "Hello from Edge Config!")
    } catch (e) {
      return NextResponse.json({
        message: "Hello from Swarms API Status Page!",
        error: "Edge Config not available",
      })
    }
  }

  // Handle monitoring configuration
  if (pathname.startsWith("/api/monitor")) {
    try {
      // Check if monitoring is enabled
      const isMonitoringEnabled = await get("monitoring_enabled")
      if (isMonitoringEnabled === false) {
        return NextResponse.json({ error: "Monitoring is currently disabled via Edge Config" }, { status: 503 })
      }

      // Check for emergency mode
      const emergencyMode = await get("emergency_mode")
      if (emergencyMode === true) {
        return NextResponse.json(
          {
            message: "Emergency mode active - monitoring suspended",
            emergency_mode: true,
          },
          { status: 200 },
        )
      }

      // Get dynamic monitoring interval
      const monitoringInterval = await get("monitoring_interval_minutes")
      if (monitoringInterval) {
        // Add custom header with interval for the monitoring function
        const response = NextResponse.next()
        response.headers.set("x-monitoring-interval", monitoringInterval.toString())
        return response
      }
    } catch (error) {
      console.error("Edge Config error in middleware:", error)
      // Continue with default behavior if Edge Config fails
    }
  }

  // Handle configuration API endpoints
  if (pathname.startsWith("/api/config")) {
    try {
      const configData = await get("status_page_config")
      return NextResponse.json(configData || {})
    } catch (error) {
      return NextResponse.json({
        error: "Failed to fetch configuration",
        message: "Edge Config not available",
      })
    }
  }

  return NextResponse.next()
}
