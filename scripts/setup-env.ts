const requiredEnvVars = ["SWARMS_API_KEY", "MONITORING_CRON_SECRET", "KV_REST_API_URL", "KV_REST_API_TOKEN"]

console.log("Required environment variables for Swarms API Status Page:")
console.log("=".repeat(60))

requiredEnvVars.forEach((envVar, index) => {
  console.log(`${index + 1}. ${envVar}`)

  switch (envVar) {
    case "SWARMS_API_KEY":
      console.log("   Description: Your Swarms API key for monitoring")
      console.log("   Get it from: https://swarms.world/platform/api-keys")
      break
    case "MONITORING_CRON_SECRET":
      console.log("   Description: Secret key to secure the monitoring endpoint")
      console.log("   Generate: Use a random string (e.g., openssl rand -hex 32)")
      break
    case "KV_REST_API_URL":
      console.log("   Description: Vercel KV REST API URL")
      console.log("   Get it from: Vercel Dashboard > Storage > KV Database")
      break
    case "KV_REST_API_TOKEN":
      console.log("   Description: Vercel KV REST API Token")
      console.log("   Get it from: Vercel Dashboard > Storage > KV Database")
      break
  }
  console.log("")
})

console.log("Setup Instructions:")
console.log("1. Create a Vercel KV database in your Vercel dashboard")
console.log("2. Add all environment variables to your Vercel project settings")
console.log("3. Deploy the project to activate the cron job")
console.log("4. The monitoring will start automatically every 5 minutes")
console.log("")
console.log("Manual trigger for testing:")
console.log("curl -X POST https://your-domain.vercel.app/api/monitor \\")
console.log('  -H "Authorization: Bearer YOUR_MONITORING_CRON_SECRET"')
