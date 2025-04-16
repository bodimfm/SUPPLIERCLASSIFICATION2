'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type CookieOptions } from '@supabase/ssr'
import { Database } from '../types/supabase'

/**
 * Cria um cliente Supabase para uso em Server Components, Server Actions e Route Handlers
 * 
 * Este cliente deve ser recriado para cada requisição para garantir que os cookies estejam atualizados
 */
export async function createSupabaseServerClient() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name)
          return cookie?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          await cookieStore.set({ name, value, ...options })
        },
        async remove(name: string, options: CookieOptions) {
          await cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

/**
 * Função auxiliar para verificar se o usuário está autenticado
 * 
 * Mais segura do que apenas verificar a sessão, pois valida o token JWT
 * 
 * @returns O usuário autenticado ou null
 */
export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient()
  
  // getUser() valida o token JWT e é mais seguro para verificações de autenticação
  const { data: { user } } = await supabase.auth.getUser()
  
  return user
}

/**
 * Função auxiliar para obter a sessão atual
 * 
 * Nota: Para verificações de segurança, sempre prefira getAuthenticatedUser()
 * 
 * @returns A sessão atual ou null
 */
export async function getCurrentSession() {
  const supabase = await createSupabaseServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  return session
}

/**
 * Função para obter o perfil completo do usuário incluindo o papel (role)
 * 
 * @returns O perfil do usuário autenticado ou null
 */
export async function getUserProfile() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return data
}