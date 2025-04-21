import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET: Obter itens de checklist filtrados por avaliação
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get("assessment_id")
    const category = searchParams.get("category")

    if (!assessmentId) {
      return NextResponse.json(
        { error: "ID da avaliação é obrigatório" },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from("checklist_items")
      .select("*")
      .eq("assessment_id", assessmentId)

    if (category) {
      query = query.eq("category", category)
    }

    query = query.order("category")

    const { data, error } = await query

    if (error) {
      console.error("Erro ao buscar itens do checklist:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Erro na rota GET de itens de checklist:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST: Adicionar novos itens de checklist
export async function POST(request: Request) {
  try {
    const items = await request.json()

    // Validar dados
    if (!Array.isArray(items) && !items.assessment_id) {
      return NextResponse.json(
        { error: "Dados inválidos. Forneça um item ou uma lista de itens com assessment_id" },
        { status: 400 }
      )
    }

    // Se for um único item, converte para array
    const itemsArray = Array.isArray(items) ? items : [items]

    // Inserir itens
    const { data, error } = await supabaseAdmin
      .from("checklist_items")
      .insert(itemsArray)
      .select()

    if (error) {
      console.error("Erro ao criar itens do checklist:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [], { status: 201 })
  } catch (error) {
    console.error("Erro na rota POST de itens de checklist:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// PATCH: Atualizar vários itens de checklist
export async function PATCH(request: Request) {
  try {
    const { assessmentId, items } = await request.json()

    if (!assessmentId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Dados inválidos. Forneça o assessmentId e uma lista de itens para atualizar" },
        { status: 400 }
      )
    }

    // Para cada item, executar uma operação de atualização
    const updatePromises = items.map(async (item) => {
      const { id, is_checked, notes } = item
      
      if (!id) return null

      const updateData: { is_checked?: boolean; notes?: string } = {}
      
      if (typeof is_checked === "boolean") {
        updateData.is_checked = is_checked
      }
      
      if (notes !== undefined) {
        updateData.notes = notes
      }

      const { data, error } = await supabaseAdmin
        .from("checklist_items")
        .update(updateData)
        .eq("id", id)
        .eq("assessment_id", assessmentId) // Garantir que o item pertence à avaliação
        .select()

      if (error) {
        console.error(`Erro ao atualizar item ${id}:`, error)
        return { id, error: error.message }
      }

      return data?.[0] || null
    })

    const results = await Promise.all(updatePromises)
    const successItems = results.filter(r => r !== null && !("error" in r))
    const errorItems = results.filter(r => r === null || "error" in r)

    return NextResponse.json({
      success: errorItems.length === 0,
      updated: successItems.length,
      failed: errorItems.length,
      items: successItems,
      errors: errorItems
    })
  } catch (error) {
    console.error("Erro na rota PATCH de itens de checklist:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}