import { createClient } from "@supabase/supabase-js"
import { cache } from "react"
import supabaseConfig from "./supabase-config"

// Use a implementação centralizada da configuração
const { url: supabaseUrl, anonKey: supabaseAnonKey } = supabaseConfig

// Use a singleton pattern to ensure only one client instance is created
// Using the cache function to memoize the client
export const createSupabaseClient = cache(() => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
})

// Export a singleton instance
export const supabase = createSupabaseClient()

// Função utilitária para verificar se o cliente está configurado corretamente
export const isClientConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey
}
