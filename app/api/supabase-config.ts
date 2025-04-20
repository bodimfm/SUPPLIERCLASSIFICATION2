import { createClient } from "@supabase/supabase-js";

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar se as variáveis de ambiente estão presentes
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Aviso: Variáveis de ambiente do Supabase não estão configuradas corretamente. Operações na API podem falhar.");
}

// Cliente admin do Supabase para uso nas APIs do servidor
export const supabaseAdmin = createClient(
  supabaseUrl || "", 
  supabaseServiceKey || "", 
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Função para verificar se o cliente admin está configurado corretamente
export const isAdminClientConfigured = () => {
  return !!supabaseUrl && !!supabaseServiceKey;
};
