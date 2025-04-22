
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";

/**
 * GET /api/documents?assessment_id=<id>
 * Lista documentos vinculados a uma avaliação.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get("assessment_id");

  if (!assessmentId) {
    return NextResponse.json(
      { error: "ID da avaliação é obrigatório" },
      { status: 400 },
    );
  }

  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

/**
 * POST /api/documents
 * Exemplo multipart/form‑data:
 *  - supplierId      : string (obrigatório)
 *  - assessment_id   : string (opcional)
 *  - uploadedBy      : string (opcional)
 *  - files[] | file  : File(s)  (campo único ou array)
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const supplierId = formData.get("supplierId") as string | null;
    const assessmentId = formData.get("assessment_id") as string | null;
    const uploadedBy =
      (formData.get("uploadedBy") as string | null) || "system";

    if (!supplierId) {
      return NextResponse.json(
        { error: "supplierId é obrigatório" },
        { status: 400 },
      );
    }

    let files: File[] = [];
    const many = formData.getAll("files") as File[];
    const single = formData.get("file") as File;

    if (many && many.length) files = many;
    else if (single) files = [single];

    if (!files.length) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();

    // Processar uploads em paralelo
    const results = await Promise.all(
      files.map(async (file) => {
        const uniqueId = randomUUID();
        const ext = file.name.split(".").pop() ?? "";
        const fileName = `${uniqueId}.${ext}`;

        const uploadPath = assessmentId
          ? `${supplierId}/${assessmentId}/${fileName}`
          : `${supplierId}/${fileName}`;

        // 1) upload para bucket
        const { error: upErr } = await supabase.storage
          .from("supplier-documents")
          .upload(uploadPath, file);

        if (upErr) {
          return { filename: file.name, success: false, error: upErr.message };
        }

        // 2) registrar no banco
        const insertData: Record<string, unknown> = {
          name: file.name,
          storage_path: uploadPath,
          file_type: file.type,
          file_size: file.size,
          uploaded_at: new Date().toISOString(),
          uploaded_by: uploadedBy,
          supplier_id: supplierId,
        };
        if (assessmentId) insertData.assessment_id = assessmentId;

        const { data, error: dbErr } = await supabase
          .from("documents")
          .insert(insertData)
          .select()
          .single();

        if (dbErr) {
          return { filename: file.name, success: false, error: dbErr.message };
        }

        return { filename: file.name, success: true, document: data };
      }),
    );

    const allSuccess = results.every((r) => r.success);
    return NextResponse.json(
      { success: allSuccess, results },
      { status: allSuccess ? 201 : 207 },
    );
  } catch (err) {
    console.error("Erro no POST /documents:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/documents?id=<documentId>
 * Remove arquivo do storage e registro da tabela.
 */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("id");

  if (!documentId) {
    return NextResponse.json(
      { error: "ID do documento é obrigatório" },
      { status: 400 },
    );
  }

  const supabase = getAdminClient();

  // 1) Obter info do documento
  const { data: doc, error: fetchErr } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (fetchErr || !doc) {
    return NextResponse.json(
      { error: fetchErr?.message || "Documento não encontrado" },
      { status: fetchErr ? 500 : 404 },
    );
  }

  // 2) Remover do storage (se houver path)
  if (doc.storage_path) {
    await supabase.storage
      .from("supplier-documents")
      .remove([doc.storage_path]);
  }

  // 3) Remover registro
  const { error: dbErr } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
