import { Suspense } from "react"
import StatusHeader from "@/components/status-header"
import StatusFooter from "@/components/status-footer"
import StatusIndicator from "@/components/status-indicator"
import SetupGuide from "@/components/setup-guide"
import StatusPageClient from "@/components/status-page-client"
import { Loader2 } from "lucide-react"
import StatusDashboard from "@/components/status-dashboard"
import { isSupabaseAvailable } from "@/lib/supabase"

export default async function Home() {
  const supabaseConfigured = isSupabaseAvailable()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <StatusHeader />

        {/* Real-time status indicator */}
        <div className="flex justify-center">
          <StatusIndicator />
        </div>

        {/* Setup guide - show if Supabase is not configured */}
        {!supabaseConfigured && <SetupGuide />}

        <Suspense fallback={<LoadingState />}>
          <StatusPageClient />
        </Suspense>

        <StatusDashboard />
        <StatusFooter />
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-16 w-16 text-primary animate-spin" />
      <p className="mt-4 text-lg text-muted-foreground">Loading API status...</p>
    </div>
  )
}
