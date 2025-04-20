import { NextResponse } from 'next/server'
import { supabaseAdmin, createSupabaseAdminClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { id, updates } = await req.json()
  try {
    const updatesWithTimestamp = { ...updates, updated_at: new Date().toISOString() }
    
    // Verificar se temos o supabaseAdmin ou criar um novo cliente
    const adminClient = supabaseAdmin || createSupabaseAdminClient();
    
    // Verificar se o cliente está disponível
    if (!adminClient) {
      return NextResponse.json({ error: 'Cliente Supabase Admin não disponível' }, { status: 500 })
    }
    
    const { data, error } = await adminClient
      .from('suppliers')
      .update(updatesWithTimestamp)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (!data || data.length === 0) {
      return NextResponse.json({ error: `Fornecedor com ID ${id} não encontrado` }, { status: 404 })
    }
    return NextResponse.json({ data: data[0] }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro desconhecido' }, { status: 500 })
  }
}