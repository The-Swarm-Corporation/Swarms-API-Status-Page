import { type NextRequest, NextResponse } from "next/server"
import { getActiveIncidents, getAllIncidents, createIncident, updateIncident } from "../monitor/incident-manager"

export const runtime = "edge"

const ADMIN_SECRET = process.env.ADMIN_SECRET

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization")
  if (!ADMIN_SECRET || !authHeader) return false

  const token = authHeader.split("Bearer ")[1]
  return token === ADMIN_SECRET
}

// GET - List incidents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // "active" | "all"
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let incidents
    if (status === "active") {
      incidents = await getActiveIncidents()
    } else {
      incidents = await getAllIncidents()
    }

    return NextResponse.json({
      incidents: incidents.slice(0, limit),
      total: incidents.length,
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 })
  }
}

// POST - Create manual incident
export async function POST(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, severity, affectedServices } = body

    if (!title || !description || !severity || !affectedServices) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, severity, affectedServices" },
        { status: 400 },
      )
    }

    if (!["minor", "major", "critical"].includes(severity)) {
      return NextResponse.json({ error: "Invalid severity. Must be: minor, major, or critical" }, { status: 400 })
    }

    const incident = await createIncident({
      title,
      description,
      severity,
      status: "investigating",
      affected_services: Array.isArray(affectedServices) ? affectedServices : [affectedServices],
    })

    return NextResponse.json({ incident }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create incident" }, { status: 500 })
  }
}

// PATCH - Update incident
export async function PATCH(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { incidentId, status } = body

    if (!incidentId || !status) {
      return NextResponse.json({ error: "Missing required fields: incidentId, status" }, { status: 400 })
    }

    if (!["investigating", "identified", "monitoring", "resolved"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: investigating, identified, monitoring, or resolved" },
        { status: 400 },
      )
    }

    const incident = await updateIncident(incidentId, { status })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    return NextResponse.json({ incident })
  } catch {
    return NextResponse.json({ error: "Failed to update incident" }, { status: 500 })
  }
}
