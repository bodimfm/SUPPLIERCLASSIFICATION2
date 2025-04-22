import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { z } from "zod";

/**
 * Esquema de validação do corpo para atualização de uma avaliação.
 * Ajuste os campos conforme a estrutura real da tabela `assessments`.
 */
const updateSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
});

/**
 * PATCH /api/assessments/[id]
 * Atualiza uma avaliação existente.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = getAdminClient();

  // ---------------------------------------------------------------------------
  // 2) Validar parâmetro ID
  // ---------------------------------------------------------------------------
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "ID da avaliação é obrigatório" }, { status: 400 });
  }

  // ---------------------------------------------------------------------------
  // 3) Validar corpo da requisição com Zod
  // ---------------------------------------------------------------------------
  const body = await req.json().catch(() => null);
  const parse = updateSchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json(
      { error: parse.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // ---------------------------------------------------------------------------
  // 4) Garantir que a avaliação existe
  // ---------------------------------------------------------------------------
  const { data: existing, error: checkErr } = await supabase
    .from("assessments")
    .select("id")
    .eq("id", id)
    .single();

  if (checkErr) {
    return NextResponse.json({ error: checkErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
  }

  // ---------------------------------------------------------------------------
  // 5) Atualizar registro
  // ---------------------------------------------------------------------------
  const { data, error } = await supabase
    .from("assessments")
    .update(parse.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * (Opcional) GET /api/assessments/[id]
 * Retorna uma avaliação pelo ID.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
  }

  return NextResponse.json(data);
}
