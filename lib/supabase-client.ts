// lib/supabase-client.ts
// Cliente obsoleto mantido para compatibilidade temporária
// Este arquivo será substituído pelos novos clientes browser e server

import { createClient } from '@supabase/supabase-js'

// Essas variáveis de ambiente devem ser configuradas no seu projeto
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Aviso de depreciação
console.warn('Aviso: lib/supabase-client.ts está depreciado. Use lib/supabase/client.ts ou lib/supabase/server.ts em seu lugar.')