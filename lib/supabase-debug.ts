import { supabase, isSupabaseAvailable } from "./supabase"

export async function debugSupabaseConnection() {
  console.log("🔍 Debugging Supabase Connection")

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("Environment Variables:")
  console.log(`- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✅ Set" : "❌ Missing"}`)
  console.log(`- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? "✅ Set" : "❌ Missing"}`)

  // Check client initialization
  console.log(`Supabase Client: ${supabase ? "✅ Initialized" : "❌ Not initialized"}`)
  console.log(`isSupabaseAvailable(): ${isSupabaseAvailable() ? "✅ True" : "❌ False"}`)

  // Try a simple query if client is available
  if (isSupabaseAvailable()) {
    try {
      console.log("Testing connection with a simple query...")
      const start = Date.now()
      const { data, error } = await supabase!.from("status_checks").select("count(*)", { count: "exact" })

      const duration = Date.now() - start

      if (error) {
        console.error("❌ Query failed:", error)
        return {
          success: false,
          error: error.message,
          details: error,
        }
      }

      console.log(`✅ Query successful (${duration}ms)`)
      console.log("Result:", data)

      return {
        success: true,
        duration,
        data,
      }
    } catch (error) {
      console.error("❌ Connection test failed with exception:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  return {
    success: false,
    error: "Supabase client not available",
  }
}
