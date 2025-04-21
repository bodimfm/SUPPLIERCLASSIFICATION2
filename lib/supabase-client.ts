import { createClient } from "@supabase/supabase-js"
import { cache } from "react"
import supabaseConfig from "./supabase-config"

// Use a implementação centralizada da configuração
const { url: supabaseUrl, anonKey: supabaseAnonKey } = supabaseConfig

// Use a singleton pattern para garantir apenas uma instância do cliente
// Usando a função cache para memorizar o cliente
export const createSupabaseClient = cache(() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Tentativa de criar cliente Supabase com URL ou chave indefinida.")
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
})

// Exporta uma instância singleton
export const supabase = createSupabaseClient()

// Função utilitária para verificar se o cliente está configurado corretamente
export const isClientConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey
}
