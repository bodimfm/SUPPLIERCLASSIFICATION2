// This file centralizes Supabase configuration for the entire application

// Environment variables for Supabase
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '', 
}

// Check environment variables but don't throw errors that would crash the app
if (!supabaseConfig.url) {
  console.warn("Aviso: URL do Supabase não está definida. Configure a variável de ambiente NEXT_PUBLIC_SUPABASE_URL.")
}

if (!supabaseConfig.anonKey) {
  console.warn("Aviso: Chave anônima do Supabase não está definida. Configure a variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY.")
}

// Service key is optional for client-side operations but required for admin operations
if (!supabaseConfig.serviceKey) {
  console.warn("Aviso: Chave de serviço do Supabase não está definida. Configure a variável de ambiente SUPABASE_SERVICE_ROLE_KEY.")
}

// Log configuration for debugging (without exposing actual keys)
console.log("Supabase URL configurada:", !!supabaseConfig.url)
console.log("Supabase Anon Key configurada:", !!supabaseConfig.anonKey)
console.log("Supabase Service Role Key configurada:", !!supabaseConfig.serviceKey)

export default supabaseConfig
