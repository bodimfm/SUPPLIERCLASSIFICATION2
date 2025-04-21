import { createClient } from "@supabase/supabase-js"
import { cache } from "react"
import supabaseConfig, { isServer } from "./supabase-config"

// Use a implementação centralizada da configuração
const { url: supabaseUrl, serviceKey: supabaseKey } = supabaseConfig

// Verificar se temos uma chave de serviço, mas apenas no ambiente de servidor
if (!supabaseKey && isServer) {
  console.error("Erro crítico: Chave de serviço do Supabase não definida. Operações administrativas não funcionarão corretamente.")
}

// Usar o padrão singleton para garantir apenas uma instância do cliente, mas apenas no servidor
export const createSupabaseAdminClient = cache(() => {
  if (!isServer) {
    console.warn("Tentativa de criar cliente admin no navegador. Este cliente só deve ser usado no servidor.")
    return null
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL ou chave de serviço indefinida. Não é possível criar o cliente admin.")
    return null
  }
  
  return createClient(supabaseUrl, supabaseKey, { 
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
})

// Exportar uma instância singleton, mas apenas se estivermos no servidor
export const supabaseAdmin = isServer ? createSupabaseAdminClient() : null

// Função utilitária para verificar se o cliente admin está configurado corretamente
export const isAdminClientConfigured = () => {
  return isServer && !!supabaseUrl && !!supabaseKey
}

// Função auxiliar para garantir que o cliente admin está configurado corretamente antes do uso
export function getAdminClient() {
  if (!isAdminClientConfigured()) {
    throw new Error("Cliente Supabase Admin não está configurado corretamente ou está sendo chamado do cliente")
  }
  
  return supabaseAdmin
}
