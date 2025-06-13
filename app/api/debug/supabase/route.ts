import { type NextRequest, NextResponse } from "next/server"
import { debugSupabaseConnection } from "@/lib/supabase-debug"
import { isSupabaseAvailable, supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Basic environment check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? "✅ Set" : "❌ Missing",
      supabaseClientInitialized: supabase ? "✅ Yes" : "❌ No",
      isSupabaseAvailable: isSupabaseAvailable() ? "✅ Yes" : "❌ No",
    }

    // Run connection test
    const debugResult = await debugSupabaseConnection()

    // Check table structure if connection is successful
    let tableStructure = null
    if (debugResult.success && isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase!.rpc("calculate_daily_metrics", {
          target_date: new Date().toISOString().split("T")[0],
          target_endpoint: "/health",
        })

        tableStructure = {
          rpcTest: error ? `❌ Error: ${error.message}` : "✅ Success",
          rpcResult: data,
        }
      } catch (error) {
        tableStructure = {
          rpcTest: `❌ Exception: ${error instanceof Error ? error.message : String(error)}`,
        }
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environmentCheck: envCheck,
      connectionTest: debugResult,
      tableStructure,
      message: "Check server logs for more detailed debugging information",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Debug endpoint error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
