"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, Key } from "lucide-react"
import { isSupabaseAvailable } from "@/lib/supabase"

export default function SetupGuide() {
  const supabaseAvailable = isSupabaseAvailable()
  const swarmsApiKey = !!process.env.SWARMS_API_KEY

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
