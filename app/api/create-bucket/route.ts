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

    // Verificar se o bucket já existe
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      console.error("Erro ao listar buckets:", bucketsError)
      // Verificar se é um erro de permissão
      if (bucketsError.message?.includes("permission") || bucketsError.code === "42501") {
        return NextResponse.json(
          {
            success: false,
            message: "Erro de permissão ao listar buckets. A chave de serviço tem permissões administrativas?",
            error: bucketsError.message,
          },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        {
          success: false,
          message: "Falha ao listar buckets do Storage",
          error: bucketsError.message,
        },
        { status: 500 }
      )
    }

    const supplierDocumentsBucket = buckets?.find((bucket) => bucket.name === "supplier-documents")

    // Se o bucket já existir, retornar sucesso
    if (supplierDocumentsBucket) {
      return NextResponse.json({
        success: true,
        message: "Bucket supplier-documents já existe",
        bucket: supplierDocumentsBucket,
      })
    }

    // Criar o bucket usando o cliente admin
    const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket("supplier-documents", {
      public: true, // Permitir acesso público aos arquivos
      fileSizeLimit: 10485760, // 10MB
    })

    if (createError) {
      console.error("Erro ao criar bucket:", createError)
      // Verificar se é erro de permissão
      if (createError.message?.includes("permission") || createError.code === "42501") {
        return NextResponse.json(
          {
            success: false,
            message: "Erro de permissão ao criar bucket. A chave de serviço tem permissões administrativas?",
            error: createError.message,
          },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        {
          success: false,
          message: "Falha ao criar bucket supplier-documents",
          error: createError.message,
        },
        { status: 500 }
      )
    }

    // Configurar políticas de acesso para o bucket
    const policies = [
      {
        name: "Permitir leitura pública",
        definition: `
          CREATE POLICY "Permitir leitura pública" 
          ON storage.objects 
          FOR SELECT 
          USING (bucket_id = 'supplier-documents');
        `,
      },
      {
        name: "Permitir upload para usuários autenticados",
        definition: `
          CREATE POLICY "Permitir upload para usuários autenticados" 
          ON storage.objects 
          FOR INSERT 
          WITH CHECK (bucket_id = 'supplier-documents');
        `,
      },
      {
        name: "Permitir atualização para usuários autenticados",
        definition: `
          CREATE POLICY "Permitir atualização para usuários autenticados" 
          ON storage.objects 
          FOR UPDATE 
          WITH CHECK (bucket_id = 'supplier-documents');
        `,
      },
      {
        name: "Permitir delete para usuários autenticados",
        definition: `
          CREATE POLICY "Permitir delete para usuários autenticados" 
          ON storage.objects 
          FOR DELETE 
          USING (bucket_id = 'supplier-documents');
        `,
      },
    ]

    // Aplicar políticas
    let policiesApplied = 0
    let policiesWithErrors = 0
    
    for (const policy of policies) {
      try {
        const { error } = await supabaseAdmin.rpc('execute_sql', { sql_query: policy.definition })
        if (error) {
          console.warn(`Erro ao criar política "${policy.name}":`, error)
          policiesWithErrors++
        } else {
          policiesApplied++
        }
      } catch (policyError) {
        console.warn(`Erro ao criar política "${policy.name}":`, policyError)
        policiesWithErrors++
      }
    }

    return NextResponse.json({
      success: true,
      message: "Bucket supplier-documents criado com sucesso",
      bucket: newBucket,
      policiesApplied,
      policiesWithErrors,
    })
  } catch (error: any) {
    console.error("Erro inesperado ao criar bucket:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro inesperado ao criar bucket",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
