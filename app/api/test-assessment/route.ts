import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("Received test assessment data:", body)

    const testAssessment = {
      supplier_id: body.supplier_id || "00000000-0000-0000-0000-000000000000",
      status: "draft",
      data_volume: "low",
      data_type: "none",
      supplier_type: "D",
      contract_type: "punctual",
      is_technology: false,
      internal_responsible: "Test User",
      notes: "Test assessment",
      service_description: "Test service description", // Include this field to test if it exists in the assessments table
    }

    const { data, error } = await supabaseAdmin.from("assessments").insert([testAssessment]).select()

    if (error) {
      console.error("Error creating test assessment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Unexpected error in test assessment:", error)
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
