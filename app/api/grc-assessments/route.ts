import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET: Obter avaliações GRC, opcionalmente filtradas por fornecedor
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get("supplier_id")
    const id = searchParams.get("id")

    let query = supabaseAdmin.from("grc_assessments").select("*")

    if (id) {
      query = query.eq("id", id)
    } else if (supplierId) {
      query = query.eq("supplier_id", supplierId)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      // Verificar se o erro é devido à tabela não existir
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return NextResponse.json([])
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (id && data && data.length > 0) {
      return NextResponse.json(data[0])
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GRC assessments GET route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST: Criar uma nova avaliação GRC
export async function POST(request: Request) {
  try {
    const assessment = await request.json()

    // Validar dados obrigatórios
    if (!assessment.supplier_id) {
      return NextResponse.json({ error: "ID do fornecedor é obrigatório" }, { status: 400 })
    }

    if (!assessment.company_name) {
      return NextResponse.json({ error: "Nome da empresa é obrigatório" }, { status: 400 })
    }

    // Preparar dados para salvar, garantindo que campos JSON sejam armazenados corretamente
    const assessmentData = {
      supplier_id: assessment.supplier_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: assessment.status || "draft",
      
      // Informações Gerais do Fornecedor
      company_name: assessment.company_name,
      trade_name: assessment.trade_name || null,
      cnpj: assessment.cnpj || null,
      contact_email: assessment.contact_email || null,
      
      // Governança de Proteção de Dados
      has_dpo: assessment.has_dpo === true,
      has_privacy_policy: assessment.has_privacy_policy === true,
      governance_program: assessment.governance_program || null,
      
      // Dados Tratados & Bases Legais
      data_types: assessment.data_types || [],
      has_sensitive_data: assessment.has_sensitive_data === true,
      legal_bases: assessment.legal_bases || [],
      
      // Segurança da Informação
      encryption_at_rest: assessment.encryption_at_rest === true,
      encryption_in_transit: assessment.encryption_in_transit === true,
      uses_mfa: assessment.uses_mfa === true,
      logs_retention: assessment.logs_retention || null,
      recent_pentest: assessment.recent_pentest === true,
      security_frameworks: assessment.security_frameworks || [],
      
      // Gestão de Incidentes & Continuidade
      has_incident_response: assessment.has_incident_response === true,
      report_timeframe: assessment.report_timeframe || null,
      tests_drp: assessment.tests_drp === true,
      
      // Subcontratados & Cadeia de Suprimento
      uses_subprocessors: assessment.uses_subprocessors === true,
      evaluates_subprocessors: assessment.evaluates_subprocessors || null,
      subprocessor_contracts: assessment.subprocessor_contracts === true,
      
      // Direitos dos Titulares
      has_subject_rights_channel: assessment.has_subject_rights_channel === true,
      response_timeframe_days: assessment.response_timeframe_days || 0,
      
      // Transferências Internacionais
      transfers_data_abroad: assessment.transfers_data_abroad === true,
      transfer_mechanisms: assessment.transfer_mechanisms || [],
      
      // Conformidade & Certificações
      certifications: assessment.certifications || [],
      has_external_audits: assessment.has_external_audits === true,
      had_violations: assessment.had_violations === true,
      
      // Risco & Monitoramento Contínuo
      performs_risk_assessment: assessment.performs_risk_assessment === true,
      security_kpis: assessment.security_kpis || null,
      agrees_to_audits: assessment.agrees_to_audits === true,
    }

    const { data, error } = await supabaseAdmin
      .from("grc_assessments")
      .insert([assessmentData])
      .select()

    if (error) {
      console.error("Error creating GRC assessment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data?.[0] || {}, { status: 201 })
  } catch (error) {
    console.error("Error in GRC assessments POST route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PATCH: Atualizar uma avaliação GRC existente com base em um identificador na URL
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID da avaliação é obrigatório" }, { status: 400 })
    }

    const updates = await request.json()

    // Validar que a avaliação existe
    const { data: existingAssessment, error: checkError } = await supabaseAdmin
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

    const { data, error } = await supabaseAdmin
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
    console.error("Error in GRC assessments PATCH route:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}