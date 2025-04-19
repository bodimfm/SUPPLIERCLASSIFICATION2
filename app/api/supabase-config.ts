import { supabaseAdmin } from "@/lib/supabase-admin"
import { isAdminClientConfigured } from "@/lib/supabase-admin"

// Verificando se o cliente admin está configurado corretamente
if (!isAdminClientConfigured()) {
  console.error("AVISO: Cliente admin do Supabase não está configurado corretamente. Operações na API podem falhar.")
}

// Exportando o cliente admin para uso nas rotas de API
export { supabaseAdmin }

// Exportando também a função para verificar a configuração
export { isAdminClientConfigured }
