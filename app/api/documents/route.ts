import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { randomUUID } from "crypto"

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
    const supplierId = formData.get("supplierId") as string
    const assessmentId = formData.get("assessment_id") as string
    const uploadedBy = formData.get("uploadedBy") as string || "system"
    
    // Verificar se os arquivos foram enviados
    let files: File[] = []
    const filesPlural = formData.getAll("files") as File[]
    const fileSingular = formData.get("file") as File
    
    if (filesPlural && filesPlural.length > 0) {
      files = filesPlural
    } else if (fileSingular) {
      files = [fileSingular]
    }
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Nenhum arquivo fornecido" },
        { status: 400 }
      )
    }

    if (!supplierId) {
      return NextResponse.json(
        { error: "ID do fornecedor é obrigatório" },
        { status: 400 }
      )
    }

    // Processa cada arquivo
    const uploadResults = await Promise.all(files.map(async (file) => {
      try {
        // Gerar nome de arquivo único
        const uniqueId = randomUUID()
        const fileExtension = file.name.split(".").pop()
        const fileName = `${uniqueId}.${fileExtension}`
        
        // Definir pasta de destino com estrutura consistente: supplierId/documentId.ext
        // Se houver assessmentId, usamos ele como subpasta
        const uploadPath = assessmentId 
          ? `${supplierId}/${assessmentId}/${fileName}`
          : `${supplierId}/${fileName}`;
        
        // Upload do arquivo para o bucket
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from("supplier-documents")
          .upload(uploadPath, file)
        
        if (uploadError) {
          console.error(`Erro ao fazer upload do arquivo ${file.name}:`, uploadError)
          return {
            filename: file.name,
            success: false,
            error: uploadError.message
          }
        }
        
        // Armazenar apenas o path relativo no banco de dados em vez da URL completa
        const storagePath = uploadPath;
        
        // Registrar documento no banco
        const insertData = {
          name: file.name,
          storage_path: storagePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_at: new Date().toISOString(),
          uploaded_by: uploadedBy,
          supplier_id: supplierId
        };
        
        // Adicionar assessment_id apenas se ele existir
        if (assessmentId) {
          insertData.assessment_id = assessmentId;
        }
        
        const { data: documentData, error: documentError } = await supabaseAdmin
          .from("documents")
          .insert(insertData)
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

    // Excluir o arquivo do armazenamento usando o path armazenado
    if (documentData.storage_path) {
      const { error: storageError } = await supabaseAdmin
        .storage
        .from("supplier-documents")
        .remove([documentData.storage_path])
      
      if (storageError) {
        console.warn(`Aviso: Falha ao excluir arquivo do armazenamento: ${storageError.message}`)
      }
    } else {
      console.warn(`Aviso: Não foi possível determinar o caminho de armazenamento para o documento ID ${documentId}`)
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
