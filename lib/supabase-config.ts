// This file centralizes Supabase configuration for the entire application

// Environment variables for Supabase
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
}

// Validate that we have the required environment variables
if (!supabaseConfig.url) {
  console.warn("Missing Supabase URL. Please check your environment variables.")
}

if (!supabaseConfig.anonKey) {
  console.warn("Missing Supabase Anon Key. Please check your environment variables.")
}

if (!supabaseConfig.serviceKey) {
  console.warn("Missing Supabase Service Key. This is required for server-side operations.")
}

// Log configuration for debugging (without exposing actual keys)
console.log("Supabase URL configured:", !!supabaseConfig.url)
console.log("Supabase Anon Key configured:", !!supabaseConfig.anonKey)
console.log("Supabase Service Role Key configured:", !!supabaseConfig.serviceKey)

export default supabaseConfig
