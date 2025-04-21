import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("suppliers").select("*").order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in suppliers GET route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supplier = await request.json()

    // Validar dados obrigatórios
    if (!supplier.name || !supplier.internal_responsible) {
      return NextResponse.json({ error: "Nome do fornecedor e responsável interno são obrigatórios" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("suppliers")
      .insert([
        {
          name: supplier.name,
          internal_responsible: supplier.internal_responsible,
          service_description: supplier.serviceDescription || null,
          data_volume: supplier.dataVolume || null,
          data_type: supplier.dataType || null, // Usar o campo correto conforme o schema
          contract_type: supplier.contractType || null,
          is_technology: supplier.isTechnology === true,
          supplier_type: supplier.supplierType || null,
          criticality: supplier.criticality || null,
          cnpj: supplier.cnpj || null,
          policy: supplier.policy || null,
          certification: supplier.certification || null,
          status: "pending",
          company_id: supplier.companyId || "CLIENTE001",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data?.[0], { status: 201 })
  } catch (error) {
    console.error("Error in suppliers POST route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
