import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    // Database clearing functionality simplified since Redis/KV is not being used
    return NextResponse.json({
      message: "Database clearing functionality updated (Redis/KV removed)",
      cleared: false,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Clear database error:", error)
    return NextResponse.json(
      {
        error: "Failed to clear database",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
