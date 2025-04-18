import { createClient } from "@supabase/supabase-js"
import supabaseConfig from "@/lib/supabase-config"

// Create a single Supabase admin client instance for server components and API routes
export const supabaseAdmin = createClient(supabaseConfig.url, supabaseConfig.serviceKey || supabaseConfig.anonKey, {
  auth: {
    persistSession: false, // Don't persist sessions server-side
    autoRefreshToken: false,
  },
})

// Log configuration for debugging (without exposing actual keys)
console.log("API Supabase Admin client initialized with URL:", !!supabaseConfig.url)
console.log("Using service key:", !!supabaseConfig.serviceKey)
console.log("Falling back to anon key:", !supabaseConfig.serviceKey && !!supabaseConfig.anonKey)
