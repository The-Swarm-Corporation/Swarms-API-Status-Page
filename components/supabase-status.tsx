"use client"

import { useState, useEffect } from "react"
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

      const status = {
        available: available && !error,
        checked: true,
        error,
      }

      setSupabaseStatus(status)

      // Log the status to the console
      console.log("Supabase Status:", status)
    }

    checkSupabase()
  }, [])

  if (!supabaseStatus.checked) {
    return null
  }

  return null // No UI elements are rendered
}
