console.log("Setting up Edge Config for Swarms API Status Page")
console.log("=".repeat(60))

const defaultConfig = {
  // Core monitoring settings
  monitoring_enabled: true,
  emergency_mode: false,
  monitoring_interval_minutes: 5,
  alerting_enabled: false,

  // Maintenance settings
  maintenance_mode: false,
  maintenance_message: "Scheduled maintenance in progress. Some services may be temporarily unavailable.",

  // Custom endpoints (optional override)
  custom_endpoints: null,

  // Alert configuration
  alert_webhook_url: null, // Slack webhook URL
  alert_email: null, // Email for alerts

  // Status page customization
  status_page_config: {
    title: "Swarms API Status",
    description: "Real-time status monitoring for the Swarms API infrastructure",
    theme: "dark",
    show_metrics: true,
    show_history: true,
  },

  // Test greeting for /welcome endpoint
  greeting: "Hello from Swarms API Status Page Edge Config! 🚀",
}

console.log("Default Edge Config structure:")
console.log(JSON.stringify(defaultConfig, null, 2))

console.log("\nSetup Instructions:")
console.log("1. Go to your Vercel Dashboard")
console.log("2. Navigate to Storage > Edge Config")
console.log("3. Create a new Edge Config store named 'edge-config-store-kv'")
console.log("4. Add the following key-value pairs:")

Object.entries(defaultConfig).forEach(([key, value]) => {
  console.log(`   ${key}: ${JSON.stringify(value)}`)
})

console.log("\n5. Connect the Edge Config to your project")
console.log("6. Run 'vercel env pull' to get the environment variables")
console.log("7. Install the package: npm install @vercel/edge-config")

console.log("\nUseful Edge Config operations:")
console.log("- Enable emergency mode: Set 'emergency_mode' to true")
console.log("- Disable monitoring: Set 'monitoring_enabled' to false")
console.log("- Change interval: Set 'monitoring_interval_minutes' to desired value")
console.log("- Enable alerts: Set 'alerting_enabled' to true and configure webhook")

console.log("\nTesting:")
console.log("- Visit /welcome to test Edge Config connectivity")
console.log("- Visit /api/config to see current configuration")
console.log("- Monitor logs during /api/monitor calls to see Edge Config in action")
