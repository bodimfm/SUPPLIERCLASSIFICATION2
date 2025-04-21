import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get("supplierId")

    let query = supabaseAdmin.from("assessments").select("*").order("created_at", { ascending: false })

    if (supplierId) {
      query = query.eq("supplier_id", supplierId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in assessments GET route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const assessment = await request.json()

    // Validar dados obrigatórios
    if (!assessment.supplier_id) {
      return NextResponse.json({ error: "ID do fornecedor é obrigatório" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("assessments")
      .insert([
        {
          supplier_id: assessment.supplier_id,
          status: assessment.status || "draft",
          data_volume: assessment.data_volume || null,
          data_sensitivity: assessment.data_sensitivity || null,
          data_type: assessment.data_type || null,
          supplier_type: assessment.supplier_type || null,
          contract_type: assessment.contract_type || null,
          is_technology: assessment.is_technology === true,
          internal_responsible: assessment.internal_responsible || "",
          service_description: assessment.service_description || null,
          notes: assessment.notes || null,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data?.[0], { status: 201 })
  } catch (error) {
    console.error("Error in assessments POST route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
