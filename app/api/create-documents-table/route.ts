import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

export async function GET() {
  try {
    // Script SQL para criar a tabela documents
    const createDocumentsTable = `
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        uploaded_by TEXT,
        notes TEXT
      );
    `

    const createDocumentsIndex1 = `
      CREATE INDEX IF NOT EXISTS idx_documents_supplier_id ON documents(supplier_id);
    `

    const createDocumentsIndex2 = `
      CREATE INDEX IF NOT EXISTS idx_documents_assessment_id ON documents(assessment_id);
    `

    const enableRLS = `
      ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    `

    const createPolicy1 = `
      CREATE POLICY IF NOT EXISTS "Permitir select para todos" ON documents FOR SELECT USING (true);
    `

    const createPolicy2 = `
      CREATE POLICY IF NOT EXISTS "Permitir insert para todos" ON documents FOR INSERT WITH CHECK (true);
    `

    const createPolicy3 = `
      CREATE POLICY IF NOT EXISTS "Permitir update para todos" ON documents FOR UPDATE USING (true);
    `

    const createPolicy4 = `
      CREATE POLICY IF NOT EXISTS "Permitir delete para todos" ON documents FOR DELETE USING (true);
    `

    // Executar cada comando SQL separadamente
    const commands = [
      createDocumentsTable,
      createDocumentsIndex1,
      createDocumentsIndex2,
      enableRLS,
      createPolicy1,
      createPolicy2,
      createPolicy3,
      createPolicy4,
    ]

    let success = true
    let errorDetails = null

    for (const command of commands) {
      try {
        // Usar o método SQL direto do Supabase
        const { error } = await supabaseAdmin.sql(command)

        if (error) {
          console.error(`Erro ao executar comando SQL: ${command}`, error)
          success = false
          errorDetails = error
          break
        }
      } catch (cmdError) {
        console.error(`Erro ao executar comando: ${command}`, cmdError)
        success = false
        errorDetails = cmdError
        break
      }
    }

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar tabela documents",
          error: errorDetails,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Tabela documents criada com sucesso",
    })
  } catch (error: any) {
    console.error("Erro inesperado ao criar tabela documents:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro inesperado ao criar tabela documents",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
