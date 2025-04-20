import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../supabase-config";

// GET: Obter um fornecedor pelo ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    const id = context.params.id;

    const { data, error } = await supabaseAdmin.from("suppliers").select("*").eq("id", id).single();   

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
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    const id = context.params.id;
    const updates = await request.json();

    const { data, error } = await supabaseAdmin.from("suppliers").update(updates).eq("id", id).select();

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
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  try {
    const id = context.params.id;

    const { error } = await supabaseAdmin.from("suppliers").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in supplier DELETE route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
