// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase-admin';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


/**
 * Singleton do cliente Supabase para uso em componentes Client e Server.
 * Para chamadas server‑side, combine com cookies/headers conforme a doc.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true },
});