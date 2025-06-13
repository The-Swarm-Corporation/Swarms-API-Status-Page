import { SupabaseService, isSupabaseAvailable } from "./supabase-service"
import type { StatusCheck } from "./supabase"

export interface ServiceCheck {
  id: string
  name: string
  url: string
  status: "up" | "down"
  responseTime: number
  statusCode: number | null
  timestamp: string
  error: string | null
}

export interface StatusResponse {
  timestamp: string
  overall_status: "operational" | "degraded" | "major_outage"
  services: ServiceCheck[]
  summary: {
    total: number
    up: number
    down: number
  }
  supabase_available: boolean
  storage_errors?: string[]
}

interface ServiceConfig {
  id: string
  name: string
  url: string
  method: string
  timeout: number
  expectedStatus: number
  payload?: any
}

const SWARMS_API_KEY = process.env.SWARMS_API_KEY
const SWARMS_API_BASE_URL = "https://api.swarms.world"

const SERVICES: ServiceConfig[] = [
  {
    id: "health",
    name: "API Health Check",
    url: `${SWARMS_API_BASE_URL}/health`,
    method: "GET",
    timeout: 5000,
    expectedStatus: 200,
  },
  {
    id: "swarm-completions",
    name: "Swarm Completions",
    url: `${SWARMS_API_BASE_URL}/v1/swarm/completions`,
    method: "POST",
    timeout: 30000,
    expectedStatus: 200,
    payload: {
      name: "Status Monitor Test Swarm",
      description: "Automated status monitoring test for swarm completions endpoint",
      agents: [
        {
          agent_name: "StatusChecker",
          description: "Primary status checking agent",
          system_prompt: "You are a status checking agent. Respond only with the exact text requested for monitoring purposes.",
          model_name: "gpt-4o-mini",
          role: "worker",
          max_loops: 1,
          max_tokens: 100,
          temperature: 0.1,
          auto_generate_prompt: false
        },
        {
          agent_name: "ValidationAgent",
          description: "Validates the status check response",
          system_prompt: "You are a validation agent. Confirm that the status check was successful.",
          model_name: "gpt-4o-mini",
          role: "worker",
          max_loops: 1,
          max_tokens: 50,
          temperature: 0.1,
          auto_generate_prompt: false
        }
      ],
      max_loops: 1,
      swarm_type: "SequentialWorkflow",
      task: "Perform a status check and respond with 'Status monitoring test successful' to confirm the swarm completions endpoint is operational.",
      output_type: "dict"
    },
  },
  {
    id: "swarm-batch-completions",
    name: "Swarm Batch Completions",
    url: `${SWARMS_API_BASE_URL}/v1/swarm/batch/completions`,
    method: "POST",
    timeout: 45000,
    expectedStatus: 200,
    payload: [
      {
        name: "Status Monitor Batch Test 1",
        description: "First batch test swarm for monitoring",
        agents: [
          {
            agent_name: "BatchTestAgent1",
            description: "First batch test agent",
            system_prompt: "You are a batch test agent. Respond only with the exact text requested for monitoring purposes.",
            model_name: "gpt-4o-mini",
            role: "worker",
            max_loops: 1,
            max_tokens: 50,
            temperature: 0.1,
            auto_generate_prompt: false
          }
        ],
        max_loops: 1,
        swarm_type: "auto",
        task: "Respond with 'Batch test 1 successful' to confirm batch processing.",
        output_type: "dict"
      }
    ],
  },
  {
    id: "agent-completions",
    name: "Agent Completions",
    url: `${SWARMS_API_BASE_URL}/v1/agent/completions`,
    method: "POST",
    timeout: 30000,
    expectedStatus: 200,
    payload: {
      agent_config: {
        agent_name: "StatusTestAgent",
        description: "Agent for comprehensive status monitoring",
        system_prompt: "You are a status monitoring agent. Respond only with the exact text requested for monitoring purposes. Be concise and accurate.",
        model_name: "gpt-4o-mini",
        max_tokens: 100,
        temperature: 0.1,
        role: "worker",
        max_loops: 1,
        auto_generate_prompt: false
      },
      task: "Perform a status check and respond with 'Agent status monitoring test successful' to confirm the agent completions endpoint is operational.",
    },
  },
  {
    id: "agent-batch-completions",
    name: "Agent Batch Completions",
    url: `${SWARMS_API_BASE_URL}/v1/agent/batch/completions`,
    method: "POST",
    timeout: 45000,
    expectedStatus: 200,
    payload: [
      {
        agent_config: {
          agent_name: "BatchTestAgent1",
          description: "First batch test agent",
          system_prompt: "You are a batch test agent. Respond only with the exact text requested.",
          model_name: "gpt-4o-mini",
          max_tokens: 50,
          temperature: 0.1,
          role: "worker",
          max_loops: 1,
        },
        task: "Respond with 'Agent batch test 1 successful' and nothing else.",
      },
      {
        agent_config: {
          agent_name: "BatchTestAgent2",
          description: "Second batch test agent",
          system_prompt: "You are a batch test agent. Respond only with the exact text requested.",
          model_name: "gpt-4o-mini",
          max_tokens: 50,
          temperature: 0.1,
          role: "worker",
          max_loops: 1,
        },
        task: "Respond with 'Agent batch test 2 successful' and nothing else.",
      },
    ],
  },
  {
    id: "models-available",
    name: "Available Models",
    url: `${SWARMS_API_BASE_URL}/v1/models/available`,
    method: "GET",
    timeout: 10000,
    expectedStatus: 200,
  },
  {
    id: "swarms-available",
    name: "Available Swarms",
    url: `${SWARMS_API_BASE_URL}/v1/swarms/available`,
    method: "GET",
    timeout: 10000,
    expectedStatus: 200,
  },
  {
    id: "swarm-logs",
    name: "Swarm Logs",
    url: `${SWARMS_API_BASE_URL}/v1/swarm/logs`,
    method: "GET",
    timeout: 10000,
    expectedStatus: 200,
  },
]

async function checkService(service: ServiceConfig): Promise<ServiceCheck> {
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), service.timeout)

    const requestOptions: RequestInit = {
      method: service.method,
      signal: controller.signal,
      headers: {
        "User-Agent": "SwarmsStatusMonitor/1.0",
        "Content-Type": "application/json",
        ...(SWARMS_API_KEY && { "x-api-key": SWARMS_API_KEY }),
      },
    }

    if (service.method === "POST" && service.payload) {
      requestOptions.body = JSON.stringify(service.payload)
    }

    const response = await fetch(service.url, requestOptions)
    clearTimeout(timeoutId)

    const responseTime = Date.now() - startTime
    const isUp = response.status === service.expectedStatus

    const result: ServiceCheck = {
      id: service.id,
      name: service.name,
      url: service.url,
      status: isUp ? "up" : "down",
      responseTime,
      statusCode: response.status,
      timestamp: new Date().toISOString(),
      error: null,
    }

    return result
  } catch (error: any) {
    const responseTime = Date.now() - startTime

    const result: ServiceCheck = {
      id: service.id,
      name: service.name,
      url: service.url,
      status: "down",
      responseTime,
      statusCode: null,
      timestamp: new Date().toISOString(),
      error: error.name === "AbortError" ? "Timeout" : error.message,
    }

    return result
  }
}

// Separate function to handle storage with better error tracking
async function storeStatusCheck(serviceCheck: ServiceCheck): Promise<string | null> {
  if (!isSupabaseAvailable()) {
    return "Supabase not configured"
  }

  try {
    // Create a valid status check object
    const statusCheck: StatusCheck = {
      timestamp: serviceCheck.timestamp,
      endpoint_path: new URL(serviceCheck.url).pathname,
      endpoint_name: serviceCheck.name,
      status: serviceCheck.status === "up" ? "operational" : "outage",
      response_time_ms: serviceCheck.responseTime,
      http_status_code: serviceCheck.statusCode,
      error_message: serviceCheck.error,
    }

    const stored = await SupabaseService.storeStatusCheck(statusCheck)

    if (!stored) {
      return `Failed to store status check for ${statusCheck.endpoint_path}`
    }

    return null // No error
  } catch (error) {
    const errorMessage = `Storage error for ${serviceCheck.name}: ${error instanceof Error ? error.message : String(error)}`
    console.error(errorMessage)
    return errorMessage
  }
}

export async function checkAllServices(): Promise<StatusResponse> {
  console.log("Starting API status check...")

  // Test Supabase connection first
  if (isSupabaseAvailable()) {
    const connectionTest = await SupabaseService.testConnection()
    if (!connectionTest.success) {
      console.warn("Supabase connection test failed:", connectionTest.error)
    } else {
      console.log("✅ Supabase connection test successful")
    }
  }

  // Check all services concurrently
  const results = await Promise.all(SERVICES.map((service) => checkService(service)))

  // Store results in Supabase (don't block on storage failures)
  const storageErrors: string[] = []

  if (isSupabaseAvailable()) {
    const storagePromises = results.map(async (result) => {
      const error = await storeStatusCheck(result)
      if (error) {
        storageErrors.push(error)
      }
    })

    // Wait for all storage operations to complete
    await Promise.allSettled(storagePromises)
  }

  // Calculate overall status
  const someDown = results.some((result) => result.status === "down")

  let overallStatus: "operational" | "degraded" | "major_outage" = "operational"
  if (someDown) {
    const downCount = results.filter((r) => r.status === "down").length
    const totalCount = results.length

    // If more than 50% are down, it's a major outage
    if (downCount / totalCount > 0.5) {
      overallStatus = "major_outage"
    } else {
      overallStatus = "degraded"
    }
  }

  const statusResponse: StatusResponse = {
    timestamp: new Date().toISOString(),
    overall_status: overallStatus,
    services: results,
    summary: {
      total: results.length,
      up: results.filter((r) => r.status === "up").length,
      down: results.filter((r) => r.status === "down").length,
    },
    supabase_available: isSupabaseAvailable(),
    ...(storageErrors.length > 0 && { storage_errors: storageErrors }),
  }

  console.log(
    `Status check completed. Overall: ${overallStatus}, Up: ${statusResponse.summary.up}/${statusResponse.summary.total}, Supabase: ${statusResponse.supabase_available ? "Available" : "Not configured"}, Storage errors: ${storageErrors.length}`,
  )

  return statusResponse
}
