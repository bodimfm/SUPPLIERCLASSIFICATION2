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

    // SQL para criar a tabela de documentos se não existir
    const createDocumentsTableSQL = `
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        uploaded_by TEXT NOT NULL
      );
    `

    // Criar a extensão uuid-ossp se ainda não existir (caso ainda não tenha sido criada)
    try {
      await supabaseAdmin.rpc('execute_sql', { 
        sql_query: "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" 
      })
      console.log("Extensão uuid-ossp verificada/criada")
    } catch (extensionError) {
      console.warn("Erro ao criar extensão uuid-ossp:", extensionError)
      // Continua mesmo se não conseguir criar a extensão
    }

    // Executar SQL para criar tabela documents
    try {
      const { error: documentsError } = await supabaseAdmin.rpc('execute_sql', { 
        sql_query: createDocumentsTableSQL 
      })
      
      if (documentsError) {
        console.error("Erro ao criar tabela documents:", documentsError)
        // Verificar se o erro é devido à tabela de referência não existir
        if (documentsError.message?.includes("referenced table") || documentsError.code === "42P01") {
          return NextResponse.json(
            {
              success: false,
              message: "Erro ao criar tabela documents: tabela referenciada não existe",
              error: documentsError.message,
              hint: "Certifique-se de criar primeiro as tabelas 'suppliers' e 'assessments'"
            },
            { status: 500 }
          )
        }
        
        return NextResponse.json(
          {
            success: false,
            message: "Erro ao criar tabela documents",
            error: documentsError.message,
          },
          { status: 500 }
        )
      }

      console.log("Tabela documents criada ou já existente")
    } catch (documentsCreateError: any) {
      console.error("Erro ao criar tabela documents:", documentsCreateError)
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar tabela documents",
          error: documentsCreateError.message,
        },
        { status: 500 }
      )
    }

    // Configurar RLS (Row Level Security) para permitir acesso anônimo
    const policies = [
      {
        name: "Permitir SELECT para documents",
        definition: `
          CREATE POLICY "Permitir SELECT para documents" 
          ON documents
          FOR SELECT 
          USING (true);
        `,
      },
      {
        name: "Permitir INSERT para documents",
        definition: `
          CREATE POLICY "Permitir INSERT para documents" 
          ON documents
          FOR INSERT 
          WITH CHECK (true);
        `,
      },
      {
        name: "Permitir UPDATE para documents",
        definition: `
          CREATE POLICY "Permitir UPDATE para documents" 
          ON documents
          FOR UPDATE 
          USING (true);
        `,
      },
      {
        name: "Permitir DELETE para documents",
        definition: `
          CREATE POLICY "Permitir DELETE para documents" 
          ON documents
          FOR DELETE 
          USING (true);
        `,
      }
    ]

    // Habilitar RLS na tabela
    try {
      await supabaseAdmin.rpc('execute_sql', { 
        sql_query: "ALTER TABLE documents ENABLE ROW LEVEL SECURITY;" 
      })
      console.log("RLS habilitado na tabela documents")
    } catch (rlsError) {
      console.warn("Erro ao habilitar RLS na tabela documents:", rlsError)
      // Continua mesmo se não conseguir habilitar RLS
    }

    // Aplicar políticas
    let policiesApplied = 0
    let policiesWithErrors = 0
    
    for (const policy of policies) {
      try {
        const { error } = await supabaseAdmin.rpc('execute_sql', { sql_query: policy.definition })
        if (error) {
          if (error.message?.includes("already exists")) {
            console.log(`Política "${policy.name}" já existe`)
            policiesApplied++
          } else {
            console.warn(`Erro ao criar política "${policy.name}":`, error)
            policiesWithErrors++
          }
        } else {
          policiesApplied++
          console.log(`Política "${policy.name}" criada com sucesso`)
        }
      } catch (policyError) {
        console.warn(`Erro ao criar política "${policy.name}":`, policyError)
        policiesWithErrors++
      }
    }

    // Criar índices para melhorar o desempenho de consultas
    const indices = [
      {
        name: "documents_supplier_id_idx",
        definition: "CREATE INDEX IF NOT EXISTS documents_supplier_id_idx ON documents (supplier_id);"
      },
      {
        name: "documents_assessment_id_idx",
        definition: "CREATE INDEX IF NOT EXISTS documents_assessment_id_idx ON documents (assessment_id);"
      }
    ]

    // Aplicar índices
    let indicesApplied = 0
    
    for (const index of indices) {
      try {
        await supabaseAdmin.rpc('execute_sql', { sql_query: index.definition })
        indicesApplied++
        console.log(`Índice "${index.name}" criado com sucesso ou já existente`)
      } catch (indexError) {
        console.warn(`Erro ao criar índice "${index.name}":`, indexError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tabela documents criada ou já existente",
      policiesApplied,
      policiesWithErrors,
      indicesApplied
    })
  } catch (error: any) {
    console.error("Erro inesperado ao criar tabela documents:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro inesperado ao criar tabela documents",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
