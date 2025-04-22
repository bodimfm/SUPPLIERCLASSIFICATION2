import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase-admin";

// GET: Obter uma avaliação GRC específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const supabase = getAdminClient();
    
    if (!id) {
      return NextResponse.json({ error: "ID da avaliação é obrigatório" }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from("grc_assessments")
      .select("*")
      .eq("id", id)
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GRC assessment GET route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PATCH: Atualizar uma avaliação GRC específica
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const supabase = getAdminClient();
    
    if (!id) {
      return NextResponse.json({ error: "ID da avaliação é obrigatório" }, { status: 400 })
    }
    
    const updates = await request.json()
    
    // Validar que a avaliação existe
    const { data: existingAssessment, error: checkError } = await supabase
      .from("grc_assessments")
      .select("id")
      .eq("id", id)
      .single()
    
    if (checkError || !existingAssessment) {
      return NextResponse.json(
        { error: checkError?.message || "Avaliação não encontrada" },
        { status: checkError ? 500 : 404 }
      )
    }
    
    // Adicionar data de atualização
    updates.updated_at = new Date().toISOString()
    
    const { data, error } = await supabase
      .from("grc_assessments")
      .update(updates)
      .eq("id", id)
      .select()
    
    if (error) {
      console.error("Error updating GRC assessment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data?.[0] || {})
  } catch (error) {
    console.error("Error in GRC assessment PATCH route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE: Excluir uma avaliação GRC específica
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const supabase = getAdminClient();
    
    if (!id) {
      return NextResponse.json({ error: "ID da avaliação é obrigatório" }, { status: 400 })
    }
    
    // Verificar se a avaliação existe
    const { data: existingAssessment, error: checkError } = await supabase
      .from("grc_assessments")
      .select("id")
      .eq("id", id)
      .single()
    
    if (checkError || !existingAssessment) {
      return NextResponse.json(
        { error: checkError?.message || "Avaliação não encontrada" },
        { status: checkError ? 500 : 404 }
      )
    }
    
    // Excluir a avaliação
    const { error } = await supabase
      .from("grc_assessments")
      .delete()
      .eq("id", id)
    
    if (error) {
      console.error("Error deleting GRC assessment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in GRC assessment DELETE route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}