import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

/**
 * Rota de callback para autenticação
 * 
 * Usada para confirmar email e resetar senha
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Obtem os parâmetros da URL
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const type = searchParams.get('type')
  
  // Se houver erro, redirecionar para login com mensagem de erro
  if (error || !code) {
    console.error('Erro na callback de autenticação:', error, error_description)
    return redirect(`/login?error=${encodeURIComponent(error_description || 'Erro desconhecido')}`)
  }
  
  try {
    // Criar cliente Supabase para servidor
    const supabase = createSupabaseServerClient()
    
    // Processa a callback de autenticação com base no tipo
    if (type === 'recovery') {
      // Recuperação de senha
      await supabase.auth.exchangeCodeForSession(code)
      return redirect('/reset-password')
    } else {
      // Tipo padrão é confirmação de email
      await supabase.auth.exchangeCodeForSession(code)
      return redirect('/dashboard')
    }
  } catch (error) {
    console.error('Erro ao processar callback:', error)
    return NextResponse.redirect('/login?error=Falha%20ao%20processar%20autenticacao')
  }
}