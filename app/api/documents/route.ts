import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

// GET: Obter documentos por ID de avaliação
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get("assessment_id")
    
    if (!assessmentId) {
      return NextResponse.json(
        { error: "ID da avaliação é obrigatório" },
        { status: 400 }
      )
    }

    // Consultar documentos relacionados a esta avaliação
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("assessment_id", assessmentId)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar documentos:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Erro na rota GET de documentos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST: Upload de documentos
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const assessmentId = formData.get("assessment_id") as string
    const files = formData.getAll("files") as File[]
    
    // Validar dados
    if (!assessmentId) {
      return NextResponse.json(
        { error: "ID da avaliação é obrigatório" },
        { status: 400 }
      )
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Nenhum arquivo fornecido" },
        { status: 400 }
      )
    }

    // Processa cada arquivo
    const uploadResults = await Promise.all(files.map(async (file) => {
      try {
        // Gerar nome de arquivo único
        const uniqueId = crypto.randomUUID()
        const fileExtension = file.name.split(".").pop()
        const fileName = `${uniqueId}.${fileExtension}`
        
        // Upload do arquivo para o bucket
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from("documents")
          .upload(`assessments/${assessmentId}/${fileName}`, file)
        
        if (uploadError) {
          console.error(`Erro ao fazer upload do arquivo ${file.name}:`, uploadError)
          return {
            filename: file.name,
            success: false,
            error: uploadError.message
          }
        }
        
        // Obter URL pública (opcional)
        const { data: publicUrlData } = supabaseAdmin
          .storage
          .from("documents")
          .getPublicUrl(`assessments/${assessmentId}/${fileName}`)
        
        // Registrar documento no banco
        const { data: documentData, error: documentError } = await supabaseAdmin
          .from("documents")
          .insert({
            assessment_id: assessmentId,
            filename: file.name,
            storage_path: uploadData?.path,
            file_size: file.size,
            file_type: file.type,
            public_url: publicUrlData?.publicUrl || null,
            uploaded_at: new Date().toISOString()
          })
          .select()
        
        if (documentError) {
          console.error(`Erro ao registrar documento ${file.name}:`, documentError)
          return {
            filename: file.name,
            success: false,
            error: documentError.message
          }
        }
        
        return {
          filename: file.name,
          success: true,
          document: documentData?.[0]
        }
      } catch (error) {
        console.error(`Erro ao processar arquivo ${file.name}:`, error)
        return {
          filename: file.name,
          success: false,
          error: "Erro ao processar arquivo"
        }
      }
    }))

    // Verificar se todos os uploads foram bem-sucedidos
    const allSuccessful = uploadResults.every(result => result.success)
    const statusCode = allSuccessful ? 201 : 207 // Created ou Multi-Status

    return NextResponse.json({
      success: allSuccessful,
      results: uploadResults
    }, { status: statusCode })
  } catch (error) {
    console.error("Erro na rota POST de documentos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// DELETE: Remover documentos
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("id")
    
    if (!documentId) {
      return NextResponse.json(
        { error: "ID do documento é obrigatório" },
        { status: 400 }
      )
    }

    // Primeiro, obter informações do documento para excluir do armazenamento
    const { data: documentData, error: fetchError } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single()
    
    if (fetchError || !documentData) {
      return NextResponse.json(
        { error: fetchError?.message || "Documento não encontrado" },
        { status: fetchError ? 500 : 404 }
      )
    }

    // Excluir o arquivo do armazenamento (se houver caminho)
    if (documentData.storage_path) {
      const { error: storageError } = await supabaseAdmin
        .storage
        .from("documents")
        .remove([documentData.storage_path])
      
      if (storageError) {
        console.warn(`Aviso: Falha ao excluir arquivo do armazenamento: ${storageError.message}`)
      }
    }

    // Excluir o registro do banco de dados
    const { error: dbError } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", documentId)
    
    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro na rota DELETE de documentos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
