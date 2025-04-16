'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../types/supabase'

/**
 * Cria um cliente Supabase para uso em Client Components
 * 
 * Este cliente é compartilhado entre todas as requisições no navegador
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Cliente singleton para uso em componentes do cliente
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | undefined

/**
 * Retorna a instância do cliente do Supabase para o navegador
 * 
 * Cliente singleton que é reutilizado entre renderizações/eventos
 */
export function getSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient()
  }
  
  return browserClient
}