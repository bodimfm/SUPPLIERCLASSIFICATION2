import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

export async function GET() {
  try {
    // Teste simples para verificar a conexão com o Supabase
    const { data, error } = await supabaseAdmin.from("suppliers").select("count").limit(1)

    if (error) {
      console.error("Erro ao conectar com o Supabase:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Falha ao conectar com o Supabase",
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 500 },
      )
    }

    // Verificar se o bucket supplier-documents existe
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      console.error("Erro ao listar buckets:", bucketsError)
      return NextResponse.json(
        {
          success: false,
          message: "Falha ao listar buckets do Storage",
          error: bucketsError.message,
          code: bucketsError.code,
          details: bucketsError.details,
        },
        { status: 500 },
      )
    }

    const supplierDocumentsBucket = buckets?.find((bucket) => bucket.name === "supplier-documents")

    // Se o bucket não existir, tente criá-lo
    if (!supplierDocumentsBucket) {
      try {
        const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket("supplier-documents", {
          public: false,
          allowedMimeTypes: [
            "image/png",
            "image/jpeg",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/zip",
          ],
          fileSizeLimit: 10485760, // 10MB
        })

        if (createError) {
          console.error("Erro ao criar bucket:", createError)
          return NextResponse.json(
            {
              success: false,
              message: "Falha ao criar bucket supplier-documents",
              error: createError.message,
              code: createError.code,
              details: createError.details,
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          message: "Conexão com Supabase estabelecida com sucesso",
          bucketsExist: true,
          supplierDocumentsBucket: "Criado com sucesso",
          tables: {
            suppliers: data,
          },
        })
      } catch (error: any) {
        console.error("Erro ao criar bucket:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Falha ao criar bucket supplier-documents",
            error: error.message,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Conexão com Supabase estabelecida com sucesso",
      bucketsExist: true,
      supplierDocumentsBucket: "Já existe",
      tables: {
        suppliers: data,
      },
    })
  } catch (error: any) {
    console.error("Erro inesperado ao testar conexão:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro inesperado ao testar conexão com Supabase",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
