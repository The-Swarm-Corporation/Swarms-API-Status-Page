import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseAvailable()) {
      return NextResponse.json({
        success: false,
        error: "Supabase not configured",
      })
    }

    const cleanupResults = {
      status_checks: 0,
      daily_metrics: 0,
      performance_metrics: 0,
      request_logs: 0,
    }

    // Clean up status_checks
    const { data: statusChecksData, error: statusChecksError } = await supabase!
      .from("status_checks")
      .delete()
      .in("endpoint_path", ["/test", "/test-rls"])
      .select()

    if (!statusChecksError && statusChecksData) {
      cleanupResults.status_checks = statusChecksData.length
    }

    // Clean up daily_metrics
    const { data: dailyMetricsData, error: dailyMetricsError } = await supabase!
      .from("daily_metrics")
      .delete()
      .in("endpoint_path", ["/test", "/test-rls"])
      .select()

    if (!dailyMetricsError && dailyMetricsData) {
      cleanupResults.daily_metrics = dailyMetricsData.length
    }

    // Clean up performance_metrics
    const { data: performanceMetricsData, error: performanceMetricsError } = await supabase!
      .from("performance_metrics")
      .delete()
      .in("endpoint_path", ["/test", "/test-rls"])
      .select()

    if (!performanceMetricsError && performanceMetricsData) {
      cleanupResults.performance_metrics = performanceMetricsData.length
    }

    // Clean up request_logs
    const { data: requestLogsData, error: requestLogsError } = await supabase!
      .from("request_logs")
      .delete()
      .in("endpoint_path", ["/test", "/test-rls"])
      .select()

    if (!requestLogsError && requestLogsData) {
      cleanupResults.request_logs = requestLogsData.length
    }

    const totalCleaned = Object.values(cleanupResults).reduce((sum, count) => sum + count, 0)

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${totalCleaned} test records`,
      cleanupResults,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
} 