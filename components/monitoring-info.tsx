import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, Github, Webhook, CreditCard } from "lucide-react"

export default function MonitoringInfo() {
  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-xl font-semibold">Monitoring Options</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Daily Cron */}
            <div className="p-4 border border-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium">Cron Jobs</h3>
                <Badge variant="secondary">Disabled</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-2">Removed due to Hobby plan limitations</p>
              <p className="text-xs text-gray-500">✗ Requires Pro plan ($20/month)</p>
            </div>

            {/* Client-Side */}
            <div className="p-4 border border-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h3 className="font-medium">Client-Side Monitor</h3>
                <Badge variant="outline">Available</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-2">Browser-based monitoring with custom intervals</p>
              <p className="text-xs text-gray-500">✓ No server limitations</p>
            </div>

            {/* GitHub Actions */}
            <div className="p-4 border border-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Github className="h-5 w-5 text-purple-500" />
                <h3 className="font-medium">GitHub Actions</h3>
                <Badge variant="secondary">Setup Required</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-2">External monitoring every 5 minutes</p>
              <p className="text-xs text-gray-500">✓ Free for public repos</p>
            </div>

            {/* Webhook */}
            <div className="p-4 border border-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Webhook className="h-5 w-5 text-green-500" />
                <h3 className="font-medium">Webhook Triggers</h3>
                <Badge variant="outline">Available</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-2">External services can trigger monitoring</p>
              <p className="text-xs text-gray-500">✓ Works with UptimeRobot, etc.</p>
            </div>
          </div>

          {/* Upgrade Option */}
          <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-purple-400" />
              <h3 className="font-medium text-purple-300">Vercel Pro Plan</h3>
              <Badge variant="outline" className="border-purple-400 text-purple-300">
                Upgrade
              </Badge>
            </div>
            <p className="text-sm text-purple-200 mb-2">Unlimited cron jobs with custom schedules</p>
            <p className="text-xs text-purple-300">• Run every minute • Multiple cron jobs • Advanced features</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
