export interface Incident {
  id: string
  title: string
  description: string
  status: "investigating" | "identified" | "monitoring" | "resolved"
  severity: "minor" | "major" | "critical"
  affected_services: string[]
  created_at: string
  updated_at: string
  resolved_at?: string
}

// Simple in-memory storage (since KV is removed)
// Note: This will reset when the server restarts
const activeIncidents: Incident[] = []
const allIncidents: Incident[] = []

export async function createIncident(incident: Omit<Incident, "id" | "created_at" | "updated_at">): Promise<Incident> {
  const newIncident: Incident = {
    ...incident,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  activeIncidents.push(newIncident)
  allIncidents.push(newIncident)

  return newIncident
}

export async function updateIncident(id: string, updates: Partial<Omit<Incident, "id" | "created_at">>): Promise<Incident | null> {
  const activeIndex = activeIncidents.findIndex((incident) => incident.id === id)
  const allIndex = allIncidents.findIndex((incident) => incident.id === id)

  if (activeIndex === -1 && allIndex === -1) {
    return null
  }

  const updatedIncident: Incident = {
    ...(activeIncidents[activeIndex] || allIncidents[allIndex]),
    ...updates,
    updated_at: new Date().toISOString(),
  }

  if (updates.status === "resolved") {
    updatedIncident.resolved_at = new Date().toISOString()
    if (activeIndex !== -1) {
      activeIncidents.splice(activeIndex, 1)
    }
  }

  if (activeIndex !== -1) {
    activeIncidents[activeIndex] = updatedIncident
  }
  if (allIndex !== -1) {
    allIncidents[allIndex] = updatedIncident
  }

  return updatedIncident
}

export async function getActiveIncidents(): Promise<Incident[]> {
  return activeIncidents
}

export async function getAllIncidents(): Promise<Incident[]> {
  return allIncidents
}

export async function getIncident(id: string): Promise<Incident | null> {
  return allIncidents.find((incident) => incident.id === id) || null
}

export async function resolveIncident(id: string): Promise<Incident | null> {
  return updateIncident(id, { status: "resolved" })
}

export class IncidentManager {
  // Auto-incident creation based on service status
  async createAutoIncident(
    title: string,
    description: string,
    affectedServices: string[],
    severity: "minor" | "major" | "critical" = "major"
  ): Promise<Incident> {
    const incident: Omit<Incident, "id" | "created_at" | "updated_at"> = {
      title,
      description,
      severity,
      status: "investigating",
      affected_services: affectedServices,
    }

    return createIncident(incident)
  }

  async updateIncidentStatus(
    id: string,
    status: "investigating" | "identified" | "monitoring" | "resolved"
  ): Promise<Incident | null> {
    const updates: Partial<Omit<Incident, "id" | "created_at">> = { status }

    // If resolved, set resolved timestamp
    if (status === "resolved") {
      updates.resolved_at = new Date().toISOString()
    }

    return updateIncident(id, updates)
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return activeIncidents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Check if an incident already exists for a specific endpoint
  async checkExistingIncident(endpoint: string): Promise<Incident | null> {
    const existingIncident = activeIncidents.find(
      (incident) => incident.affected_services.includes(endpoint) && incident.status !== "resolved"
    )

    return existingIncident || null
  }

  // Auto-resolve incidents when services come back online
  async autoResolveIncidents(endpoint: string): Promise<void> {
    const incidentsToResolve = activeIncidents.filter(
      (incident) => incident.affected_services.includes(endpoint) && incident.status !== "resolved"
    )

    for (const incident of incidentsToResolve) {
      await this.updateIncidentStatus(incident.id, "resolved")
    }
  }

  // Detect if an incident should be created for service outages
  async detectIncident(endpoint: string, status: string, errorMessage: string): Promise<Incident | null> {
    // Check if there's already an active incident for this service
    const existingIncident = await this.checkExistingIncident(endpoint)

    if (existingIncident) {
      // Update existing incident if status changed
      if (status === "up") {
        await this.updateIncidentStatus(existingIncident.id, "monitoring")
      }
      return existingIncident
    }

    // Create new incident for outages
    if (status === "down") {
      const severity = this.determineSeverity(endpoint, status)
      const title = `${this.getServiceName(endpoint)} Outage`
      const description = errorMessage || "Service is experiencing an outage"

      return await this.createAutoIncident(title, description, [endpoint], severity)
    }

    return null
  }

  private determineSeverity(endpoint: string, status: string): "minor" | "major" | "critical" {
    // Critical services
    if (endpoint === "/health") return "critical"

    // Major services
    if (endpoint.includes("/v1/swarm/completions") || endpoint.includes("/v1/agent/completions")) {
      return status === "down" ? "major" : "minor"
    }

    return "minor"
  }

  private getServiceName(endpoint: string): string {
    const names: Record<string, string> = {
      "/health": "Health Check",
      "/v1/swarm/completions": "Swarm API",
      "/v1/agent/completions": "Agent API",
      "/v1/swarm/batch/completions": "Batch Swarm API",
      "/v1/agent/batch/completions": "Agent Batch API",
      "/v1/models/available": "Available Models",
      "/v1/swarms/available": "Available Swarms",
      "/v1/swarm/logs": "Swarm Logs",
    }
    return names[endpoint] || endpoint
  }
}
