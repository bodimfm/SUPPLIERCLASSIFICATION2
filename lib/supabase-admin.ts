import { createClient } from "@supabase/supabase-js"

// Initialize the Supabase admin client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

// Use SUPABASE_SERVICE_ROLE_KEY para operações administrativas
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl) {
  console.error("Missing Supabase URL environment variable")
}

if (!supabaseKey) {
  console.error("Missing Supabase Service Role Key environment variable")
}

// Log configuration for debugging (without exposing actual keys)
console.log("Admin client URL configured:", !!supabaseUrl)
console.log("Admin client key configured:", !!supabaseKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
