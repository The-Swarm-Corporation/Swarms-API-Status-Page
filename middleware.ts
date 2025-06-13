import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { get } from "@vercel/edge-config"
import { SupabaseService } from "@/lib/supabase-service"
import { isSupabaseAvailable } from "@/lib/supabase"

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

export async function middleware(request: NextRequest) {
  // Skip logging for static files and API routes that don't need logging
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/static") ||
    request.nextUrl.pathname.startsWith("/api/status") ||
    request.nextUrl.pathname.startsWith("/api/health")
  ) {
    return NextResponse.next()
  }

  const startTime = Date.now()
  const requestHeaders = new Headers(request.headers)
  const requestBody = request.body ? await request.clone().text() : undefined

  // Create a new response
  const response = NextResponse.next()

  // Add response headers
  response.headers.set("x-response-time", `${Date.now() - startTime}ms`)

  // Log the request if Supabase is available
  if (isSupabaseAvailable()) {
    try {
      const responseTime = Date.now() - startTime
      const responseHeaders = Object.fromEntries(response.headers.entries())
      const responseBody = response.body ? await response.clone().text() : undefined

      await SupabaseService.storeRequestLog({
        timestamp: new Date().toISOString(),
        endpoint_path: request.nextUrl.pathname,
        method: request.method,
        request_headers: Object.fromEntries(requestHeaders.entries()),
        request_body: requestBody ? JSON.parse(requestBody) : undefined,
        response_headers: responseHeaders,
        response_body: responseBody ? JSON.parse(responseBody) : undefined,
        response_time_ms: responseTime,
        http_status_code: response.status,
        client_ip: request.ip || request.headers.get("x-forwarded-for") || undefined,
        user_agent: request.headers.get("user-agent") || undefined
      })
    } catch (error) {
      console.error("Error logging request:", error)
    }
  }

  return response
}
