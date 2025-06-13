import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    // Cleanup functionality removed since Redis/KV is not being used
    return NextResponse.json({
      message: "Cleanup functionality not available (Redis/KV removed)",
      cleaned: false,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json(
      {
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
