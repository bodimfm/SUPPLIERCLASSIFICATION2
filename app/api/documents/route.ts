import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

export const config = {
  api: { bodyParser: false },
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get("supplierId")
    const assessmentId = searchParams.get("assessmentId")

    let query = supabaseAdmin.from("documents").select("*").order("uploaded_at", { ascending: false })

    if (supplierId) {
      query = query.eq("supplier_id", supplierId)
    }

    if (assessmentId) {
      query = query.eq("assessment_id", assessmentId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in documents GET route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File
    const supplierId = form.get('supplierId')?.toString() || ''
    const assessmentId = form.get('assessmentId')?.toString() || null
    const uploadedBy = form.get('uploadedBy')?.toString() || 'unknown'

    if (!supplierId || !file) {
      return NextResponse.json({ success: false, message: 'supplierId ou arquivo não fornecido' }, { status: 400 })
    }

    // Garantir bucket
    try {
      const { data: buckets, error: listErr } = await supabaseAdmin.storage.listBuckets()
      if (!listErr && buckets && !buckets.find(b => b.name === 'supplier-documents')) {
        const { error: createErr } = await supabaseAdmin.storage.createBucket('supplier-documents', { public: true })
        if (createErr) console.warn('Falha ao criar bucket supplier-documents:', createErr)
      }
    } catch {} // ignorar

    // Upload do arquivo
    const ext = file.name.split('.').pop() || ''
    const path = `${supplierId}/${Date.now()}.${ext}`
    const { data: upData, error: upErr } = await supabaseAdmin.storage
      .from('supplier-documents')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (upErr) {
      return NextResponse.json({ success: false, message: upErr.message }, { status: 500 })
    }

    // URL pública
    const { data: urlData } = supabaseAdmin.storage.from('supplier-documents').getPublicUrl(path)
    if (!urlData?.publicUrl) {
      return NextResponse.json({ success: false, message: 'Falha ao obter URL pública' }, { status: 500 })
    }
    const publicUrl = urlData.publicUrl

    // Inserção no banco
    const { data: doc, error: dbErr } = await supabaseAdmin
      .from('documents')
      .insert([{ supplier_id: supplierId, assessment_id: assessmentId, name: file.name, file_url: publicUrl, file_type: file.type, file_size: file.size, uploaded_by: uploadedBy }])
      .select()
    if (dbErr) {
      return NextResponse.json({ success: false, message: dbErr.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, document: doc?.[0] })
  } catch (error: any) {
    console.error('Erro no documents POST:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
