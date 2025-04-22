import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * -----------------------------------------------------------------------------
 * Supabase Admin Client (service‑role)
 *
 * • Usa SUPABASE_SERVICE_ROLE_KEY quando disponível; caso contrário,
 *   recorre à chave pública ANON (NEXT_PUBLIC_SUPABASE_ANON_KEY) — útil
 *   em ambientes de desenvolvimento onde a chave de serviço não está
 *   exposta.
 * • Lança erro em tempo de _build_ se as variáveis não estiverem definidas,
 *   evitando estados ambíguos em produção.
 * -----------------------------------------------------------------------------
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Supabase environment variables are missing. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and a service or anon key."
  );
}

/** Instância única NÃO nula do cliente admin */
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  { auth: { persistSession: false } }
);

/**
 * Utilitário de conveniência para obter o cliente já tipado.
 * Lança erro se, por algum motivo, a instância for undefined (não deve ocorrer).
 */
export const getAdminClient = (): SupabaseClient => supabaseAdmin;
