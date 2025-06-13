export async function fetchApiStatus() {
  try {
    // Since we're using Supabase instead of KV, return a placeholder
    return {
      status: "unknown",
      uptime: 0,
      lastChecked: "No data available",
      responseTime: 0,
      error: "API status monitoring via Supabase - check dashboard for real data",
    }
  } catch (error) {
    console.error("Failed to fetch API status:", error)
    return {
      status: "unknown",
      uptime: 0,
      lastChecked: "Error loading data",
      responseTime: 0,
      error: "Unable to connect to status service",
    }
  }
}

export async function fetchApiMetrics() {
  try {
    // Since we're using Supabase instead of KV, return empty array
    return []
  } catch (error) {
    console.error("Failed to fetch API metrics:", error)
    return []
  }
}

export async function fetchEndpointStatus() {
  try {
    // Since we're using Supabase instead of KV, return empty array
    return []
  } catch (error) {
    console.error("Failed to fetch endpoint status:", error)
    return []
  }
}

export async function fetchHistoricalStatus(endpoint: string, days = 30) {
  try {
    // Since we're using Supabase instead of KV, return empty array
    return []
  } catch (error) {
    console.error("Failed to fetch historical status:", error)
    return []
  }
}
