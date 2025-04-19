import { NextResponse } from "next/server"
import { supabaseAdmin, isAdminClientConfigured } from "../supabase-config"

export async function GET() {
  try {
    // Verificar se o cliente admin está configurado corretamente
    if (!isAdminClientConfigured()) {
      console.error("Cliente admin do Supabase não está configurado corretamente")
      return NextResponse.json(
        {
          success: false,
          message: "Configuração de administrador do Supabase inválida ou ausente",
          error: "Chave de serviço não configurada",
        },
        { status: 500 }
      )
    }

    // Verificar se a tabela suppliers existe
    try {
      const { data: tableInfo, error: tableError } = await supabaseAdmin
        .from('suppliers')
        .select('id')
        .limit(1)
      
      if (tableError) {
        console.error("Erro ao verificar existência da tabela suppliers:", tableError)
        return NextResponse.json(
          {
            success: false,
            message: "A tabela suppliers não existe ou não é acessível",
            error: tableError.message,
          },
          { status: 500 }
        )
      }

      console.log("Tabela suppliers encontrada, prosseguindo com a criação da tabela assessments")
    } catch (checkExistsError: any) {
      console.error("Erro ao verificar tabela suppliers:", checkExistsError)
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao verificar tabela suppliers",
          error: checkExistsError.message,
        },
        { status: 500 }
      )
    }

    // Criar a tabela assessments usando SQL direto
    try {
      const createAssessmentsTableSQL = `
        CREATE TABLE IF NOT EXISTS public.assessments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
          internal_responsible TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          status TEXT DEFAULT 'draft',
          data_volume TEXT,
          data_sensitivity TEXT,
          data_type TEXT,
          supplier_type TEXT,
          contract_type TEXT,
          is_technology BOOLEAN DEFAULT FALSE,
          notes TEXT,
          service_description TEXT
        );
      `

      const { data: assessmentsResult, error: assessmentsError } = await supabaseAdmin
        .rpc('execute_sql', { sql_query: createAssessmentsTableSQL })

      if (assessmentsError) {
        console.error("Erro ao criar tabela assessments:", assessmentsError)
        return NextResponse.json(
          {
            success: false,
            message: "Erro ao criar tabela assessments",
            error: assessmentsError.message,
          },
          { status: 500 }
        )
      }

      console.log("Tabela assessments criada ou já existente")
    } catch (assessmentsCreateError: any) {
      console.error("Erro ao criar tabela assessments:", assessmentsCreateError)
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar tabela assessments",
          error: assessmentsCreateError.message,
        },
        { status: 500 }
      )
    }

    // Criar a tabela checklist_items usando SQL direto
    try {
      const createChecklistTableSQL = `
        CREATE TABLE IF NOT EXISTS public.checklist_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          item_text TEXT NOT NULL,
          is_checked BOOLEAN DEFAULT FALSE,
          is_required BOOLEAN DEFAULT FALSE,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `

      const { data: checklistResult, error: checklistError } = await supabaseAdmin
        .rpc('execute_sql', { sql_query: createChecklistTableSQL })

      if (checklistError) {
        console.error("Erro ao criar tabela checklist_items:", checklistError)
        return NextResponse.json(
          {
            success: false,
            message: "Erro ao criar tabela checklist_items",
            error: checklistError.message,
          },
          { status: 500 }
        )
      }

      console.log("Tabela checklist_items criada ou já existente")
    } catch (checklistCreateError: any) {
      console.error("Erro ao criar tabela checklist_items:", checklistCreateError)
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar tabela checklist_items",
          error: checklistCreateError.message,
        },
        { status: 500 }
      )
    }

    // Habilitar Row Level Security (RLS) nas tabelas e criar políticas usando SQL direto
    try {
      const rlsSQL = `
        -- Habilitar RLS nas tabelas
        ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

        -- Criar políticas para assessments
        CREATE POLICY IF NOT EXISTS "Permitir SELECT para assessments" 
          ON public.assessments FOR SELECT 
          USING (TRUE);
          
        CREATE POLICY IF NOT EXISTS "Permitir INSERT para assessments" 
          ON public.assessments FOR INSERT 
          WITH CHECK (TRUE);
          
        CREATE POLICY IF NOT EXISTS "Permitir UPDATE para assessments" 
          ON public.assessments FOR UPDATE 
          USING (TRUE);

        -- Criar políticas para checklist_items
        CREATE POLICY IF NOT EXISTS "Permitir SELECT para checklist_items" 
          ON public.checklist_items FOR SELECT 
          USING (TRUE);
          
        CREATE POLICY IF NOT EXISTS "Permitir INSERT para checklist_items" 
          ON public.checklist_items FOR INSERT 
          WITH CHECK (TRUE);
          
        CREATE POLICY IF NOT EXISTS "Permitir UPDATE para checklist_items" 
          ON public.checklist_items FOR UPDATE 
          USING (TRUE);
      `
      
      const { data: rlsResult, error: rlsError } = await supabaseAdmin
        .rpc('execute_sql', { sql_query: rlsSQL })

      if (rlsError) {
        console.warn("Erro ao aplicar políticas RLS:", rlsError)
        // Continuamos mesmo se houver erro nas políticas
      } else {
        console.log("Políticas RLS aplicadas às tabelas")
      }
    } catch (policyError) {
      console.warn("Erro ao aplicar políticas RLS:", policyError)
      // Continuamos mesmo se houver erro nas políticas
    }

    return NextResponse.json({
      success: true,
      message: "Tabelas assessments e checklist_items criadas ou já existentes",
    })
  } catch (error: any) {
    console.error("Erro inesperado ao criar tabelas:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro inesperado ao criar tabelas",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
