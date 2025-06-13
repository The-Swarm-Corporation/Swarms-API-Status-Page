import { type NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/edge-config"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    // Default config values if Edge Config is not available
    const defaultConfig = {
      monitoring_enabled: true,
      emergency_mode: false,
      monitoring_interval_minutes: 5,
      alerting_enabled: false,
      maintenance_mode: false,
      maintenance_message: "Scheduled maintenance in progress. Some services may be temporarily unavailable.",
      custom_endpoints: null,
      alert_webhook_url: null,
      alert_email: null,
      status_page_config: {
        title: "Swarms API Status",
        description: "Real-time status monitoring for the Swarms API infrastructure",
        theme: "dark",
        show_metrics: true,
        show_history: true,
      },
      greeting: "Hello from Swarms API Status Page!",
    }

    try {
      if (key) {
        // Get specific configuration value
        const value = await get(key)
        return NextResponse.json({ key, value: value ?? defaultConfig[key as keyof typeof defaultConfig] })
      }

      // Get all status page configuration
      const config = {
        monitoring_enabled: (await get("monitoring_enabled")) ?? defaultConfig.monitoring_enabled,
        emergency_mode: (await get("emergency_mode")) ?? defaultConfig.emergency_mode,
        monitoring_interval_minutes:
          (await get("monitoring_interval_minutes")) ?? defaultConfig.monitoring_interval_minutes,
        alerting_enabled: (await get("alerting_enabled")) ?? defaultConfig.alerting_enabled,
        custom_endpoints: (await get("custom_endpoints")) ?? defaultConfig.custom_endpoints,
        alert_webhook_url: (await get("alert_webhook_url")) ?? defaultConfig.alert_webhook_url,
        alert_email: (await get("alert_email")) ?? defaultConfig.alert_email,
        maintenance_mode: (await get("maintenance_mode")) ?? defaultConfig.maintenance_mode,
        maintenance_message: (await get("maintenance_message")) ?? defaultConfig.maintenance_message,
        status_page_config: (await get("status_page_config")) ?? defaultConfig.status_page_config,
      }

      return NextResponse.json(config)
    } catch (e) {
      console.log("Edge Config not available, using default values")
      return NextResponse.json({
        ...defaultConfig,
        edge_config_available: false,
        message: "Using default values - Edge Config not available",
      })
    }
  } catch (error) {
    console.error("Edge Config API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch configuration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
