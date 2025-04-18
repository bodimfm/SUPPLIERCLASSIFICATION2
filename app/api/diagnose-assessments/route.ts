import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

export async function GET() {
  try {
    // Verificar a estrutura da tabela assessments
    const { data: assessmentsSchema, error: assessmentsError } = await supabaseAdmin.rpc("get_table_definition", {
      p_table_name: "assessments",
    })

    // Tentar criar um fornecedor de teste
    const { data: supplierData, error: supplierError } = await supabaseAdmin
      .from("suppliers")
      .insert([
        {
          name: "Fornecedor de Teste para Diagnóstico",
          internal_responsible: "Teste Diagnóstico",
          status: "pending",
        },
      ])
      .select()

    let assessmentData = null
    let assessmentError = null
    let assessmentErrorDetails = null

    // Se o fornecedor foi criado, tentar criar uma avaliação mínima
    if (supplierData && supplierData.length > 0) {
      const supplierId = supplierData[0].id

      try {
        // Tentar criar uma avaliação com campos mínimos
        const { data, error } = await supabaseAdmin
          .from("assessments")
          .insert([
            {
              supplier_id: supplierId,
              internal_responsible: "Teste Diagnóstico",
              status: "draft",
            },
          ])
          .select()

        assessmentData = data
        assessmentError = error

        if (error) {
          assessmentErrorDetails = {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          }
        }
      } catch (error: any) {
        assessmentError = {
          message: error.message,
          name: error.name,
        }
        assessmentErrorDetails = error
      }
    }

    // Tentar listar todas as avaliações
    const { data: allAssessments, error: listError } = await supabaseAdmin.from("assessments").select("*").limit(5)

    return NextResponse.json({
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
        errorDetails: assessmentErrorDetails,
      },
      listAssessments: {
        data: allAssessments,
        error: listError,
      },
    })
  } catch (error: any) {
    console.error("Error in diagnose-assessments:", error)
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
