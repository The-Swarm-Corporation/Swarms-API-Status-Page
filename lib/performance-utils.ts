import { SupabaseService } from "./supabase-service"
import type { PerformanceMetrics } from "./supabase"

export async function collectPerformanceMetrics(
  endpointPath: string,
  responseTime: number,
  options: {
    tokenUsage?: number
    costUsd?: number
    modelName?: string
    batchSize?: number
    concurrentRequests?: number
    memoryUsageMb?: number
    cpuUsagePercent?: number
  } = {}
): Promise<void> {
  if (!SupabaseService) return

  const metrics: PerformanceMetrics = {
    timestamp: new Date().toISOString(),
    endpoint_path: endpointPath,
    response_time_ms: responseTime,
    ...options
  }

  await SupabaseService.storePerformanceMetrics(metrics)
}

export async function getSystemMetrics(): Promise<{ memory: number; cpu: number }> {
  try {
    // Get memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsageMb = Math.round(memoryUsage.heapUsed / 1024 / 1024)

    // Get CPU usage (this is a simple approximation)
    const startUsage = process.cpuUsage()
    await new Promise(resolve => setTimeout(resolve, 100))
    const endUsage = process.cpuUsage(startUsage)
    const cpuUsagePercent = Math.round((endUsage.user + endUsage.system) / 10000)

    return {
      memory: memoryUsageMb,
      cpu: cpuUsagePercent
    }
  } catch (error) {
    console.error("Error collecting system metrics:", error)
    return { memory: 0, cpu: 0 }
  }
}

export async function collectSystemMetrics(endpointPath: string, responseTime: number): Promise<void> {
  const { memory, cpu } = await getSystemMetrics()
  await collectPerformanceMetrics(endpointPath, responseTime, {
    memoryUsageMb: memory,
    cpuUsagePercent: cpu
  })
} 