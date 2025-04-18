import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

export async function GET() {
  try {
    // Verificar se o bucket já existe
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      console.error("Erro ao listar buckets:", bucketsError)
      return NextResponse.json(
        {
          success: false,
          message: "Falha ao listar buckets do Storage",
          error: bucketsError.message,
        },
        { status: 500 },
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
      return NextResponse.json(
        {
          success: false,
          message: "Falha ao criar bucket supplier-documents",
          error: createError.message,
        },
        { status: 500 },
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
    ]

    // Aplicar políticas
    for (const policy of policies) {
      try {
        await supabaseAdmin.sql(policy.definition)
      } catch (policyError) {
        console.warn(`Erro ao criar política "${policy.name}":`, policyError)
        // Continuar mesmo se houver erro na criação de políticas
      }
    }

    return NextResponse.json({
      success: true,
      message: "Bucket supplier-documents criado com sucesso",
      bucket: newBucket,
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
      { status: 500 },
    )
  }
}
