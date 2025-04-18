// lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

// Essas variáveis de ambiente devem ser configuradas no seu projeto
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)