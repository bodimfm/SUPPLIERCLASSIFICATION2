import { createClient } from "@supabase/supabase-js"
import { cache } from "react"

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
}

// Use a singleton pattern to ensure only one client instance is created
// Using the cache function to memoize the client
export const createSupabaseClient = cache(() => {
  console.log("Creating Supabase client with URL:", supabaseUrl)

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // No need to persist sessions anymore
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
})

// Export a singleton instance
export const supabase = createSupabaseClient()
