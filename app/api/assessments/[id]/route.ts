import { NextResponse } from "next/server"
import { supabaseAdmin } from "../../supabase-config"

// Endpoint para atualizar uma avaliação específica
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json(
        { error: "ID da avaliação é obrigatório" },
        { status: 400 }
      )
    }

    const updateData = await request.json()

    // Validar que o ID da avaliação existe
    const { data: existingAssessment, error: checkError } = await supabaseAdmin
      .from("assessments")
      .select("*")
      .eq("id", id)
      .single()

    if (checkError || !existingAssessment) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
      )
    }

    // Campos permitidos para atualização
    const allowedFields = [
      "status",
      "dpo_comments",
      "dpo_reviewer",
      "dpo_review_date",
      "dpo_reviewed",
      "dpo_adjusted_risk_level",
      "updated_at"
    ]

    // Filtrar apenas campos permitidos
    const filteredUpdateData: Record<string, any> = {}
    for (const key of allowedFields) {
      if (key in updateData) {
        filteredUpdateData[key] = updateData[key]
      }
    }

    // Adicionar data de atualização se não fornecida
    if (!filteredUpdateData.updated_at) {
      filteredUpdateData.updated_at = new Date().toISOString()
    }

    // Executar a atualização
    const { data, error } = await supabaseAdmin
      .from("assessments")
      .update(filteredUpdateData)
      .eq("id", id)
      .select()

    if (error) {
      console.error("Erro ao atualizar avaliação:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data?.[0] || {}, { status: 200 })
  } catch (error) {
    console.error("Erro na rota PATCH de avaliações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Endpoint para buscar uma avaliação específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json(
        { error: "ID da avaliação é obrigatório" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("assessments")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Erro na rota GET de avaliação específica:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}