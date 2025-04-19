// This file centralizes Supabase configuration for the entire application

// Environment variables for Supabase
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY, 
}

// Validate that we have the required environment variables
if (!supabaseConfig.url) {
  throw new Error("Erro crítico: URL do Supabase não está definida. Verifique as suas variáveis de ambiente.")
}

if (!supabaseConfig.anonKey) {
  throw new Error("Erro crítico: Chave anônima do Supabase não está definida. Verifique as suas variáveis de ambiente.")
}

// Service key is optional for client-side operations but required for admin operations
if (!supabaseConfig.serviceKey) {
  console.warn("Chave de serviço do Supabase não está definida. Operações administrativas podem falhar.")
}

// Log configuration for debugging (without exposing actual keys)
console.log("Supabase URL configurada:", !!supabaseConfig.url)
console.log("Supabase Anon Key configurada:", !!supabaseConfig.anonKey)
console.log("Supabase Service Role Key configurada:", !!supabaseConfig.serviceKey)

export default supabaseConfig
