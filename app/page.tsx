import { Suspense } from "react"
import StatusHeader from "@/components/status-header"
import StatusOverview from "@/components/status-overview"
import StatusMetrics from "@/components/status-metrics"
import StatusEndpoints from "@/components/status-endpoints"
import StatusFooter from "@/components/status-footer"
import StatusIndicator from "@/components/status-indicator"
import SetupGuide from "@/components/setup-guide"
import { Loader2 } from "lucide-react"
import StatusDashboard from "@/components/status-dashboard"
import { checkAllServices } from "@/lib/api-checker"
import { RealTimeProvider } from "@/components/real-time-provider"
import { isSupabaseAvailable } from "@/lib/supabase"

export default async function Home() {
  // Server-side initial check
  let initialData = null
  let checkError = null

  try {
    initialData = await checkAllServices()
  } catch (error) {
    console.error("Failed to perform initial status check:", error)
    checkError = error instanceof Error ? error.message : "Unknown error"
  }

  const supabaseConfigured = isSupabaseAvailable()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <StatusHeader />

        {/* Real-time status indicator */}
        <div className="flex justify-center">
          <StatusIndicator />
        </div>

        {/* Error message if initial check failed */}
        {checkError && (
          <div className="p-4 border border-red-600 bg-red-900/20 rounded-lg">
            <p className="text-red-400">Error during initial status check: {checkError}</p>
            <p className="text-sm text-red-300 mt-2">The application will continue to function with limited data.</p>
          </div>
        )}

        {/* Setup guide - show if Supabase is not configured */}
        {!supabaseConfigured && <SetupGuide />}

        <Suspense fallback={<LoadingState />}>
          <div className="space-y-8">
            {/* System Status Section */}
            <section id="overview" className="bg-card rounded-lg shadow-lg">
              <StatusOverview />
            </section>

            {/* Metrics and Endpoints Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div id="metrics" className="bg-card rounded-lg shadow-lg">
                <StatusMetrics />
              </div>
              <div id="endpoints" className="bg-card rounded-lg shadow-lg">
                <StatusEndpoints />
              </div>
            </section>
          </div>
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
