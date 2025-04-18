import { NextResponse } from "next/server"
import { supabaseAdmin } from "../supabase-config"

export async function GET() {
  try {
    // Script SQL para criar a tabela assessments
    const createAssessmentsTable = `
      CREATE TABLE IF NOT EXISTS assessments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        internal_responsible TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT DEFAULT 'draft',
        data_volume TEXT,
        data_sensitivity TEXT,
        data_type TEXT,
        supplier_type TEXT,
        contract_type TEXT,
        is_technology BOOLEAN DEFAULT FALSE,
        notes TEXT,
        service_description TEXT
      );
    `

    const createAssessmentsIndex1 = `
      CREATE INDEX IF NOT EXISTS idx_assessments_supplier_id ON assessments(supplier_id);
    `

    const createAssessmentsIndex2 = `
      CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
    `

    const createChecklistItemsTable = `
      CREATE TABLE IF NOT EXISTS checklist_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        item_text TEXT NOT NULL,
        is_checked BOOLEAN DEFAULT FALSE,
        is_required BOOLEAN DEFAULT TRUE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const createChecklistItemsIndex = `
      CREATE INDEX IF NOT EXISTS idx_checklist_items_assessment_id ON checklist_items(assessment_id);
    `

    // Executar cada comando SQL separadamente usando o método SQL direto
    const commands = [
      createAssessmentsTable,
      createAssessmentsIndex1,
      createAssessmentsIndex2,
      createChecklistItemsTable,
      createChecklistItemsIndex,
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
          message: "Erro ao criar tabelas",
          error: errorDetails,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Tabelas assessments e checklist_items criadas com sucesso",
    })
  } catch (error: any) {
    console.error("Erro inesperado ao criar tabelas:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro inesperado ao criar tabelas",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
