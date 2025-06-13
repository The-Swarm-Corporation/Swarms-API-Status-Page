import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseAvailable()) {
      return NextResponse.json({
        success: false,
        error: "Supabase not configured",
      })
    }

    const testResults = {
      connection: false,
      selectTest: false,
      insertTest: false,
      updateTest: false,
      functionTest: false,
      errors: [] as string[],
    }

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase!.from("status_checks").select("count(*)").limit(1)
      if (error) throw error
      testResults.connection = true
    } catch (error) {
      testResults.errors.push(`Connection test failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Test 2: Select from daily_metrics
    try {
      const { data, error } = await supabase!.from("daily_metrics").select("*").limit(1)
      if (error) throw error
      testResults.selectTest = true
    } catch (error) {
      testResults.errors.push(`Select test failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Test 3: Insert into daily_metrics
    const testDate = new Date().toISOString().split("T")[0]
    const testEndpoint = "/test-rls"

    try {
      const { data, error } = await supabase!
        .from("daily_metrics")
        .insert({
          date: testDate,
          endpoint_path: testEndpoint,
          total_checks: 1,
          successful_checks: 1,
          failed_checks: 0,
          avg_response_time: 100,
          uptime_percentage: 100,
        })
        .select()

      if (error) throw error
      testResults.insertTest = true
    } catch (error) {
      testResults.errors.push(`Insert test failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Test 4: Update daily_metrics
    try {
      const { data, error } = await supabase!
        .from("daily_metrics")
        .update({
          total_checks: 2,
          successful_checks: 2,
          avg_response_time: 150,
        })
        .eq("date", testDate)
        .eq("endpoint_path", testEndpoint)

      if (error) throw error
      testResults.updateTest = true
    } catch (error) {
      testResults.errors.push(`Update test failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Test 5: Function call
    try {
      const { data, error } = await supabase!.rpc("calculate_daily_metrics", {
        target_date: testDate,
        target_endpoint: testEndpoint,
      })

      if (error) throw error
      testResults.functionTest = true
    } catch (error) {
      testResults.errors.push(`Function test failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Cleanup test data
    try {
      await supabase!.from("daily_metrics").delete().eq("date", testDate).eq("endpoint_path", testEndpoint)
    } catch (error) {
      // Ignore cleanup errors
    }

    return NextResponse.json({
      success:
        testResults.connection &&
        testResults.selectTest &&
        testResults.insertTest &&
        testResults.updateTest &&
        testResults.functionTest,
      testResults,
      message: testResults.errors.length === 0 ? "All RLS tests passed!" : "Some tests failed - check errors",
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
