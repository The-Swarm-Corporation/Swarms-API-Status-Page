import { type NextRequest, NextResponse } from "next/server"
import { SupabaseService } from "@/lib/supabase-service"
import { isSupabaseAvailable } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseAvailable()) {
      return NextResponse.json({
        success: false,
        error: "Supabase not configured",
        message: "Environment variables missing",
      })
    }

    // Test connection
    const connectionTest = await SupabaseService.testConnection()

    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: connectionTest.error,
        message: "Connection test failed",
      })
    }

    // Test storing a sample status check
    const testStatusCheck = {
      timestamp: new Date().toISOString(),
      endpoint_path: "/test",
      endpoint_name: "Test Endpoint",
      status: "operational" as const,
      response_time_ms: 100,
      http_status_code: 200,
      error_message: null,
    }

    const storeResult = await SupabaseService.storeStatusCheck(testStatusCheck)

    return NextResponse.json({
      success: true,
      connectionTest: connectionTest,
      storeTest: {
        success: storeResult,
        message: storeResult ? "Test data stored successfully" : "Failed to store test data",
      },
      testData: testStatusCheck,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Test endpoint error",
      },
      { status: 500 },
    )
  }
}
