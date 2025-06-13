"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Database, Key, TestTube } from "lucide-react"
import { isSupabaseAvailable } from "@/lib/supabase"
import { useState } from "react"

export default function SetupGuide() {
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const supabaseAvailable = isSupabaseAvailable()
  const swarmsApiKey = !!process.env.SWARMS_API_KEY

  const runSupabaseTest = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/test-supabase")
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
      })
    } finally {
      setTesting(false)
    }
  }

  const setupItems = [
    {
      name: "Supabase Database",
      description: "Database for storing monitoring data",
      status: supabaseAvailable,
      icon: Database,
      required: true,
      envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    },
    {
      name: "Swarms API Key",
      description: "API key for accessing Swarms endpoints",
      status: swarmsApiKey,
      icon: Key,
      required: true,
      envVars: ["SWARMS_API_KEY"],
    },
  ]

  const allRequired = setupItems.every((item) => item.status)

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Configuration Status</CardTitle>
          <Badge variant={allRequired ? "default" : "destructive"} className={allRequired ? "bg-green-600" : ""}>
            {allRequired ? "Ready" : "Setup Required"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {setupItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.name} className="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {item.name}
                      <span className="text-xs text-red-400">(Required)</span>
                    </div>
                    <div className="text-sm text-gray-400">{item.description}</div>
                    <div className="text-xs text-gray-500 mt-1">Env vars: {item.envVars.join(", ")}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  {item.status ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            )
          })}

          {/* Supabase Test Section */}
          {supabaseAvailable && (
            <div className="p-3 border border-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4 text-blue-400" />
                  <span className="font-medium">Database Connection Test</span>
                </div>
                <Button
                  onClick={runSupabaseTest}
                  disabled={testing}
                  size="sm"
                  variant="outline"
                  className="border-gray-700"
                >
                  {testing ? "Testing..." : "Test Connection"}
                </Button>
              </div>

              {testResult && (
                <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
                  <div className={`font-medium ${testResult.success ? "text-green-400" : "text-red-400"}`}>
                    {testResult.success ? "✅ Test Passed" : "❌ Test Failed"}
                  </div>
                  {testResult.error && <div className="text-red-400 mt-1">Error: {testResult.error}</div>}
                  {testResult.storeTest && (
                    <div className="text-gray-400 mt-1">
                      Store test: {testResult.storeTest.success ? "✅ Success" : "❌ Failed"}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {!allRequired && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg">
            <div className="text-sm text-blue-300">
              <strong>Setup Instructions:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Add Supabase integration to your Vercel project</li>
                <li>Run the database schema in Supabase SQL Editor</li>
                <li>Add your SWARMS_API_KEY environment variable</li>
                <li>Deploy your project</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
