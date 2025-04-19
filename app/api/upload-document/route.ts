import { NextResponse } from 'next/server'
import { supabaseAdmin, isAdminClientConfigured } from '../supabase-config'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: Request) {
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
    
    const form = await request.formData()
    const file = form.get('file') as File
    const supplierId = form.get('supplierId')?.toString() || ''
    const assessmentId = form.get('assessmentId')?.toString() || null
    const uploadedBy = form.get('uploadedBy')?.toString() || 'unknown'

    // Validação mais completa dos dados de entrada
    if (!supplierId) {
      return NextResponse.json({ success: false, message: 'ID do fornecedor não fornecido' }, { status: 400 })
    }
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'Arquivo não fornecido' }, { status: 400 })
    }

    if (file.size <= 0) {
      return NextResponse.json({ success: false, message: 'Arquivo vazio' }, { status: 400 })
    }

    if (file.size > 10485760) { // 10MB
      return NextResponse.json({ success: false, message: 'Arquivo muito grande (limite de 10MB)' }, { status: 400 })
    }
    
    console.log(`Iniciando upload para fornecedor ${supplierId}, arquivo: ${file.name}, tamanho: ${file.size} bytes`)

    // Verificar se o bucket existe e criar se necessário
    let bucketExists = false
    try {
      const { data: bucketsList, error: listError } = await supabaseAdmin.storage.listBuckets()
      
      if (listError) {
        console.warn('Não foi possível listar buckets:', listError)
        if (listError.message?.includes("permission") || listError.code === "42501") {
          return NextResponse.json({ 
            success: false, 
            message: 'Erro de permissão ao listar buckets. A chave de serviço tem permissões administrativas?', 
            error: listError.message 
          }, { status: 403 })
        }
      } else {
        bucketExists = bucketsList && bucketsList.some((b) => b.name === 'supplier-documents') || false
      }

      // Se o bucket não existir, tenta criar
      if (!bucketExists) {
        console.log('Bucket supplier-documents não encontrado. Tentando criar...')
        const { data: createBucketData, error: createBucketError } = await supabaseAdmin.storage.createBucket('supplier-documents', { 
          public: true,
          fileSizeLimit: 10485760 // 10MB
        })
        
        if (createBucketError) {
          console.error('Falha ao criar bucket supplier-documents:', createBucketError)
          if (createBucketError.message?.includes("permission") || createBucketError.code === "42501") {
            return NextResponse.json({ 
              success: false, 
              message: 'Erro de permissão ao criar bucket. A chave de serviço tem permissões administrativas?', 
              error: createBucketError.message 
            }, { status: 403 })
          }
        } else {
          console.log('Bucket supplier-documents criado com sucesso')
          bucketExists = true
        }
      }
    } catch (err: any) {
      console.warn('Erro ao verificar/criar bucket:', err)
      return NextResponse.json({ 
        success: false, 
        message: 'Erro ao verificar/criar bucket',
        error: err.message 
      }, { status: 500 })
    }

    if (!bucketExists) {
      return NextResponse.json({ 
        success: false, 
        message: 'Não foi possível confirmar a existência ou criar o bucket supplier-documents' 
      }, { status: 500 })
    }

    // Upload do arquivo
    const fileExt = file.name.split('.').pop() || ''
    const fileName = `${supplierId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    console.log(`Enviando arquivo: ${fileName}`)
    
    try {
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('supplier-documents')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        console.error('Erro ao fazer upload do arquivo:', uploadError)
        return NextResponse.json({ 
          success: false, 
          message: 'Erro ao fazer upload do arquivo',
          error: uploadError.message 
        }, { status: 500 })
      }

      if (!uploadData) {
        return NextResponse.json({ 
          success: false, 
          message: 'Falha ao fazer upload do arquivo: nenhum dado retornado' 
        }, { status: 500 })
      }

      console.log('Upload realizado com sucesso:', uploadData.path)
      
      // Obter URL pública
      const { data: urlData } = supabaseAdmin.storage
        .from('supplier-documents')
        .getPublicUrl(fileName)

      if (!urlData || !urlData.publicUrl) {
        return NextResponse.json({ 
          success: false, 
          message: 'Falha ao obter URL pública' 
        }, { status: 500 })
      }
      
      const publicUrl = urlData.publicUrl
      console.log('URL pública:', publicUrl)

      // Inserir registro na tabela documents
      console.log('Inserindo registro na tabela documents')
      
      const { data: docData, error: docError } = await supabaseAdmin
        .from('documents')
        .insert([
          {
            supplier_id: supplierId,
            assessment_id: assessmentId,
            name: file.name,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: uploadedBy,
          },
        ])
        .select()

      if (docError) {
        console.error('Erro ao inserir registro do documento:', docError)
        return NextResponse.json({ 
          success: false, 
          message: 'Erro ao inserir registro do documento',
          error: docError.message 
        }, { status: 500 })
      }

      if (!docData || docData.length === 0) {
        return NextResponse.json({ 
          success: false, 
          message: 'Falha ao inserir registro do documento: nenhum dado retornado' 
        }, { status: 500 })
      }

      console.log('Documento registrado com sucesso:', docData[0].id)

      return NextResponse.json({ 
        success: true, 
        message: 'Arquivo enviado e registrado com sucesso',
        document: docData[0] 
      })
    } catch (uploadError: any) {
      console.error('Erro inesperado durante upload:', uploadError)
      return NextResponse.json({ 
        success: false, 
        message: 'Erro inesperado durante upload',
        error: uploadError.message 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Erro na API de upload de documento:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno no servidor',
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 })
  }
}