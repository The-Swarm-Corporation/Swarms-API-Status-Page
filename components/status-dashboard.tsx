import StatusHistoryBar from "./status-history-bar"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const MONITORED_ENDPOINTS = [
  { path: "/health", title: "API Health Check" },
  { path: "/v1/swarm/completions", title: "Swarm Completions" },
  { path: "/v1/swarm/batch/completions", title: "Swarm Batch Completions" },
  { path: "/v1/agent/completions", title: "Agent Completions" },
  { path: "/v1/agent/batch/completions", title: "Agent Batch Completions" },
  { path: "/v1/models/available", title: "Available Models" },
  { path: "/v1/swarms/available", title: "Available Swarms" },
]

function StatusHistorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export default function StatusDashboard() {
  return (
    <div className="space-y-6 mt-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Service Status History</h2>
        <p className="text-gray-400 mb-6">Real-time status monitoring for Swarms API endpoints</p>
      </div>

      <div className="space-y-4">
        {MONITORED_ENDPOINTS.map((endpoint) => (
          <Suspense key={endpoint.path} fallback={<StatusHistorySkeleton />}>
            <StatusHistoryBar endpoint={endpoint.path} title={endpoint.title} days={30} />
          </Suspense>
        ))}
      </div>
    </div>
  )
}
