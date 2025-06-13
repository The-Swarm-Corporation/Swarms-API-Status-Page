"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Database, AlertTriangle, CheckCircle } from "lucide-react"
import { isSupabaseAvailable } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"

// Add more detailed status information
export default function SupabaseStatus() {
  const [supabaseStatus, setSupabaseStatus] = useState<{
    available: boolean
    checked: boolean
    error?: string
  }>({
    available: false,
    checked: false,
  })

  useEffect(() => {
    // Check Supabase availability
    const checkSupabase = async () => {
      const available = isSupabaseAvailable()

      let error = undefined
      if (available) {
        try {
          // Try a simple query to verify connection
          const { error: queryError } = await supabase!.from("status_checks").select("id").limit(1)

          if (queryError) {
            error = queryError.message
          }
        } catch (e) {
          error = e instanceof Error ? e.message : "Unknown error"
        }
      }

      setSupabaseStatus({
        available: available && !error,
        checked: true,
        error,
      })
    }

    checkSupabase()
  }, [])

  if (!supabaseStatus.checked) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Database className="h-4 w-4 text-gray-400" />
      <span className="text-gray-400">Database:</span>
      {supabaseStatus.available ? (
        <Badge variant="outline" className="border-green-600 text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />
          Supabase Connected
        </Badge>
      ) : (
        <Badge variant="outline" className="border-yellow-600 text-yellow-400">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {supabaseStatus.error ? "Connection Error" : "Not Configured"}
        </Badge>
      )}

      {supabaseStatus.error && <span className="text-xs text-red-400 ml-2">{supabaseStatus.error}</span>}
    </div>
  )
}
