import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";

// GET: Obter um fornecedor pelo ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const supabase = getAdminClient();

    const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single();   

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in supplier GET route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Atualizar um fornecedor pelo ID
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const supabase = getAdminClient();
    const updates = await request.json();

    const { data, error } = await supabase.from("suppliers").update(updates).eq("id", id).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error in supplier PUT route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Excluir um fornecedor pelo ID
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const supabase = getAdminClient();

    const { error } = await supabase.from("suppliers").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in supplier DELETE route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json(
        { error: "ID do fornecedor é obrigatório" },
        { status: 400 }
      )
    }
    const supabase = getAdminClient();

    const updateData = await request.json()

    // Validar que o fornecedor existe
    const { data: existingSupplier, error: checkError } = await supabase
      .from("suppliers")
      .select("*")
      .eq("id", id)
      .single()

    if (checkError || !existingSupplier) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado" },
        { status: 404 }
      )
    }

    // Campos permitidos para atualização
    const allowedFields = [
      "status",
      "risk_level",
      "risk_description",
      "dpo_reviewed",
      "dpo_review_date",
      "dpo_reviewer",
      "dpo_comments",
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
    const { data, error } = await supabase
      .from("suppliers")
      .update(filteredUpdateData)
      .eq("id", id)
      .select()

    if (error) {
      console.error("Erro ao atualizar fornecedor:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data?.[0] || {}, { status: 200 })
  } catch (error) {
    console.error("Erro na rota PATCH de fornecedores:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
