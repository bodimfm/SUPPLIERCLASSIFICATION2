import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

export async function GET() {
  try {
    // Create a test supplier first
    const { data: supplierData, error: supplierError } = await supabaseAdmin
      .from("suppliers")
      .insert([
        {
          name: "Test Supplier",
          internal_responsible: "Test User",
          status: "pending",
        },
      ])
      .select()

    if (supplierError) {
      console.error("Error creating test supplier:", supplierError)
      return NextResponse.json({ error: supplierError.message }, { status: 500 })
    }

    if (!supplierData || supplierData.length === 0) {
      return NextResponse.json({ error: "Failed to create test supplier" }, { status: 500 })
    }

    const supplierId = supplierData[0].id

    // Create a minimal assessment
    const minimalAssessment = {
      supplier_id: supplierId,
      status: "draft",
      internal_responsible: "Test User",
    }

    console.log("Creating minimal assessment:", minimalAssessment)

    const { data, error } = await supabaseAdmin.from("assessments").insert([minimalAssessment]).select()

    if (error) {
      console.error("Error creating minimal assessment:", error)
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Successfully created minimal assessment",
      supplier: supplierData[0],
    })
  } catch (error: any) {
    console.error("Unexpected error in test minimal assessment:", error)
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
