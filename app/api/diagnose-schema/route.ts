import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

export async function GET() {
  try {
    // Get the schema for the suppliers table
    const { data: suppliersSchema, error: suppliersError } = await supabaseAdmin.rpc("get_table_definition", {
      p_table_name: "suppliers",
    })

    // Get the schema for the assessments table
    const { data: assessmentsSchema, error: assessmentsError } = await supabaseAdmin.rpc("get_table_definition", {
      p_table_name: "assessments",
    })

    // Try to create a minimal supplier
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

    let assessmentData = null
    let assessmentError = null

    // If supplier was created, try to create a minimal assessment
    if (supplierData && supplierData.length > 0) {
      const supplierId = supplierData[0].id

      const { data, error } = await supabaseAdmin
        .from("assessments")
        .insert([
          {
            supplier_id: supplierId,
            internal_responsible: "Test User",
            status: "draft",
          },
        ])
        .select()

      assessmentData = data
      assessmentError = error
    }

    return NextResponse.json({
      suppliers: {
        schema: suppliersSchema,
        error: suppliersError,
      },
      assessments: {
        schema: assessmentsSchema,
        error: assessmentsError,
      },
      testSupplier: {
        data: supplierData,
        error: supplierError,
      },
      testAssessment: {
        data: assessmentData,
        error: assessmentError,
      },
    })
  } catch (error: any) {
    console.error("Error in diagnose-schema:", error)
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
