import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

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
