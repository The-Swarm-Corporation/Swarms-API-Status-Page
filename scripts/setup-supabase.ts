console.log("🚀 Supabase Setup for Swarms API Status Monitor")
console.log("=".repeat(50))

console.log("\n📋 What you need:")
console.log("1. Supabase account (https://supabase.com)")
console.log("2. Your Swarms API key")

console.log("\n🔧 Setup Steps:")

console.log("\n1. Create Supabase Project:")
console.log("   - Go to https://supabase.com/dashboard")
console.log("   - Click 'New Project'")
console.log("   - Enter project name: 'swarms-status-monitor'")
console.log("   - Wait for project to be ready")

console.log("\n2. Add Supabase Integration to Vercel:")
console.log("   - Go to your Vercel project dashboard")
console.log("   - Settings → Integrations")
console.log("   - Add Supabase integration")
console.log("   - Connect your Supabase project")
console.log("   - This automatically adds environment variables")

console.log("\n3. Set up Database Schema:")
console.log("   - Go to Supabase Dashboard → SQL Editor")
console.log("   - Run the SQL from scripts/supabase-schema.sql")
console.log("   - This creates the required tables")

console.log("\n4. Add Your API Key:")
console.log("   - In Vercel: Settings → Environment Variables")
console.log("   - Add: SWARMS_API_KEY = your_api_key_here")

console.log("\n5. Deploy:")
console.log("   - Run: vercel --prod")
console.log("   - Your status monitor is ready!")

console.log("\n✅ That's it! Only 2 environment variables needed:")
console.log("   • NEXT_PUBLIC_SUPABASE_URL (auto-added by Vercel)")
console.log("   • NEXT_PUBLIC_SUPABASE_ANON_KEY (auto-added by Vercel)")
console.log("   • SWARMS_API_KEY (add manually)")

console.log("\n🎉 Your simplified status monitor is ready!")
