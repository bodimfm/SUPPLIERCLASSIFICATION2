import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

export async function GET() {
  try {
    // 1. Criar um fornecedor de teste
    const { data: supplierData, error: supplierError } = await supabaseAdmin
      .from("suppliers")
      .insert([
        {
          name: "Fornecedor de Teste",
          internal_responsible: "Teste Automatizado",
          status: "pending",
          service_description: "Serviço de teste para verificar a criação de avaliação",
        },
      ])
      .select()

    if (supplierError) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar fornecedor de teste",
          error: supplierError,
        },
        { status: 500 },
      )
    }

    if (!supplierData || supplierData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Fornecedor de teste não foi criado",
        },
        { status: 500 },
      )
    }

    const supplierId = supplierData[0].id

    // 2. Criar uma avaliação para o fornecedor
    const { data: assessmentData, error: assessmentError } = await supabaseAdmin
      .from("assessments")
      .insert([
        {
          supplier_id: supplierId,
          internal_responsible: "Teste Automatizado",
          status: "draft",
          data_volume: "low",
          data_sensitivity: "non-sensitive",
          supplier_type: "D",
          contract_type: "punctual",
          is_technology: false,
          service_description: "Serviço de teste para verificar a criação de avaliação",
        },
      ])
      .select()

    if (assessmentError) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar avaliação de teste",
          error: assessmentError,
          supplier: supplierData[0],
        },
        { status: 500 },
      )
    }

    // 3. Criar alguns itens de checklist para a avaliação
    let checklistError = null
    let checklistData = null

    if (assessmentData && assessmentData.length > 0) {
      const assessmentId = assessmentData[0].id

      const { data, error } = await supabaseAdmin
        .from("checklist_items")
        .insert([
          {
            assessment_id: assessmentId,
            category: "compliance",
            item_text: "Política de Privacidade e Proteção de Dados formalizada",
            is_checked: true,
            is_required: true,
          },
          {
            assessment_id: assessmentId,
            category: "technical",
            item_text: "Criptografia de dados em repouso",
            is_checked: false,
            is_required: true,
          },
        ])
        .select()

      checklistData = data
      checklistError = error
    }

    return NextResponse.json({
      success: true,
      message: "Teste de criação de avaliação concluído com sucesso",
      supplier: supplierData[0],
      assessment: assessmentData?.[0] || null,
      checklistItems: checklistData || [],
      errors: {
        checklist: checklistError,
      },
    })
  } catch (error: any) {
    console.error("Erro inesperado no teste de criação de avaliação:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro inesperado no teste de criação de avaliação",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
