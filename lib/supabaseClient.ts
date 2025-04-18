import { createClient } from "@supabase/supabase-js"
import supabaseConfig from "./supabase-config"

// Initialize the Supabase client with environment variables
const supabaseUrl = supabaseConfig.url || ""
const supabaseAnonKey = supabaseConfig.anonKey || ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
}

// Create a single Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
