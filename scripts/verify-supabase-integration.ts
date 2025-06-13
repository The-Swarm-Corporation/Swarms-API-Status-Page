console.log("🔍 Verifying Supabase Integration")
console.log("=".repeat(50))

console.log("\n✅ Steps to verify your integration:")

console.log("\n1. Check Environment Variables:")
console.log("   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables")
console.log("   - Verify these variables exist:")
console.log("     • NEXT_PUBLIC_SUPABASE_URL")
console.log("     • NEXT_PUBLIC_SUPABASE_ANON_KEY")
console.log("     • SUPABASE_SERVICE_ROLE_KEY")

console.log("\n2. Check Database Tables:")
console.log("   - Go to Supabase Dashboard > Table Editor")
console.log("   - Verify these tables exist:")
console.log("     • status_checks")
console.log("     • daily_metrics")
console.log("     • performance_metrics")

console.log("\n3. Test the Status Page:")
console.log("   - Visit your deployed status page")
console.log("   - Look for 'Supabase Connected' badge")
console.log("   - Run a manual monitoring check")
console.log("   - Check if data appears in Supabase tables")

console.log("\n4. Test API Endpoints:")
console.log("   - GET /api/status - Should return real data")
console.log("   - POST /api/monitor - Should store data in Supabase")
console.log("   - GET /api/metrics?endpoint=/health&days=7 - Should return metrics")

console.log("\n🚀 If all checks pass, your integration is successful!")

console.log("\n🔧 Troubleshooting:")
console.log("   • If 'Using Mock Data' appears: Check environment variables")
console.log("   • If monitoring fails: Check SWARMS_API_KEY")
console.log("   • If no data in tables: Check RLS policies in Supabase")
console.log("   • If errors in logs: Check Supabase project is active")

console.log("\n📊 Next Steps:")
console.log("   1. Set up automated monitoring (GitHub Actions)")
console.log("   2. Configure alerting webhooks")
console.log("   3. Customize monitoring endpoints")
console.log("   4. Set up daily metrics calculation")

console.log("\n🎉 Your Swarms API Status Monitor is now powered by Supabase!")
