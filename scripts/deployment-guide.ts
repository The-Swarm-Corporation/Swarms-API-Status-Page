console.log("🚀 Swarms API Uptime Monitor - Deployment Guide")
console.log("=".repeat(60))

console.log("\n📋 Prerequisites:")
console.log("1. Vercel account (Hobby plan is sufficient)")
console.log("2. Swarms API key")
console.log("3. GitHub repository (for automated monitoring)")

console.log("\n🔧 Setup Steps:")

console.log("\n1. Create Vercel KV Database:")
console.log("   vercel kv create swarms-status-monitor")
console.log("   # This provides KV_REST_API_URL and KV_REST_API_TOKEN")

console.log("\n2. Create Edge Config (Optional):")
console.log("   vercel edge-config create swarms-monitor-config")
console.log("   vercel edge-config set monitoring_enabled true")
console.log("   vercel edge-config set emergency_mode false")
console.log("   vercel edge-config set alerting_enabled true")
console.log("   vercel edge-config set alert_webhook_url 'https://hooks.slack.com/your/webhook'")

console.log("\n3. Set Environment Variables:")
const envVars = [
  "SWARMS_API_KEY",
  "MONITORING_CRON_SECRET",
  "ADMIN_SECRET",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "EDGE_CONFIG",
]

envVars.forEach((env) => {
  console.log(`   vercel env add ${env}`)
})

console.log("\n4. Deploy to Vercel:")
console.log("   vercel deploy --prod")

console.log("\n📊 API Endpoints:")

console.log("\n   Public Endpoints:")
console.log("   • GET /api/status - Current status and metrics")
console.log("   • GET /api/status?endpoint=/health - Specific endpoint status")
console.log("   • GET /api/config - Public configuration")

console.log("\n   Admin Endpoints (require ADMIN_SECRET):")
console.log("   • POST /api/incidents - Create manual incident")
console.log("   • PATCH /api/incidents - Update incident")
console.log("   • GET /api/incidents - List incidents")

console.log("\n   Cron Endpoints (require MONITORING_CRON_SECRET):")
console.log("   • GET /api/monitor - Run monitoring check")
console.log("   • GET /api/monitor/cleanup - Run cleanup")

console.log("\n⚙️ Configuration Examples:")

console.log("\n   Disable monitoring temporarily:")
console.log("   vercel edge-config set monitoring_enabled false")

console.log("\n   Enable emergency mode:")
console.log("   vercel edge-config set emergency_mode true")

console.log("\n   Add custom endpoints:")
console.log(`   vercel edge-config set custom_endpoints '[
     {
       "path": "/api/custom",
       "method": "GET",
       "description": "Custom API",
       "criticalityLevel": "high"
     }
   ]'`)

console.log("\n🔔 Alerting Setup:")
console.log("1. Create Slack app with incoming webhooks")
console.log("2. Set alert_webhook_url in Edge Config")
console.log("3. Test with: curl -X POST https://your-domain.vercel.app/api/monitor")

console.log("\n📈 Monitoring Features:")
console.log("• Automatic incident detection and management")
console.log("• 24h/7d/30d uptime calculations")
console.log("• Response time monitoring")
console.log("• Criticality-based alerting")
console.log("• Historical data storage")
console.log("• Emergency mode controls")

console.log("\n🛠️ Customization:")
console.log("• Add endpoints in /api/monitor/route.ts")
console.log("• Modify alert thresholds")
console.log("• Extend incident management")
console.log("• Add email notifications")

console.log("\n📊 Monitoring Options:")
console.log("• Client-side monitoring (browser-based)")
console.log("• GitHub Actions (every 5 minutes, FREE)")
console.log("• Manual API triggers")
console.log("• External monitoring services")

console.log("\n💰 Estimated Costs (monthly):")
console.log("• Vercel Hobby: FREE")
console.log("• GitHub Actions: FREE (public repos)")
console.log("• External monitoring: FREE tier available")

console.log("\n✅ Post-Deployment Checklist:")
console.log("□ Verify cron jobs are running in Vercel dashboard")
console.log("□ Test /api/status endpoint")
console.log("□ Check KV database for data")
console.log("□ Test incident creation")
console.log("□ Verify alerts are working")
console.log("□ Monitor function logs")

console.log("\n🚨 Troubleshooting:")
console.log("• Check Vercel function logs for errors")
console.log("• Verify environment variables are set")
console.log("• Ensure KV database is accessible")
console.log("• Test Edge Config connectivity")
console.log("• Monitor Redis usage to avoid rate limits")

console.log("\n🎉 Your uptime monitor is ready!")
console.log("Visit https://your-domain.vercel.app to see your status page")
