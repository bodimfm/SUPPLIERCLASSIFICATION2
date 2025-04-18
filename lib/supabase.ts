import { createClient } from "@supabase/supabase-js"
import supabaseConfig from "./supabase-config"

// Tipos para as tabelas do Supabase
export type Supplier = {
  id: string
  created_at: string
  updated_at: string
  name: string
  cnpj: string | null
  company_id: string | null
  supplier_type: "A" | "B" | "C" | "D" | null
  supplier_type_description: string | null
  is_technology: boolean
  data_type: "none" | "common" | "sensitive" | null
  data_volume: "low" | "medium" | "high" | null
  criticality: "critical" | "non-critical" | null
  policy: "yes" | "no" | "unknown" | null
  certification: "yes" | "no" | "unknown" | null
  subcontracting: "none" | "identified" | "unknown" | null
  incidents: "none" | "resolved" | "unresolved" | null
  risk_score: number | null
  risk_level: "low" | "medium" | "high" | "critical" | null
  risk_description: string | null
  status: "pending" | "approved" | "rejected"
  registration_date: string | null
  internal_responsible: string | null
  dpo_reviewed: boolean
  dpo_review_date: string | null
  dpo_reviewer: string | null
  dpo_comments: string | null
  dpo_adjusted_risk_level: "low" | "medium" | "high" | "critical" | null
  created_by: string | null
  cliente_rmsa: string | null
  data_primeira_analise: string | null
  service_description?: string | null
  contract_type?: string | null
}

export type Assessment = {
  id: string
  supplier_id: string
  internal_responsible: string
  created_at?: string
  updated_at?: string
  status?: "draft" | "submitted" | "in_review" | "completed"
  data_volume?: string
  data_sensitivity?: string
  data_type?: string
  supplier_type?: string
  contract_type?: string
  is_technology?: boolean
  notes?: string
  service_description?: string | null
}

export type Document = {
  id: string
  supplier_id: string
  assessment_id: string | null
  name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at: string
  uploaded_by: string
}

export type ChecklistItem = {
  id: string
  assessment_id: string
  category: string
  item_text: string
  is_checked: boolean
  is_required: boolean
  notes: string
}

// Criando o cliente Supabase
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

// Funções para interagir com o Supabase
export async function getSuppliers() {
  try {
    const { data, error } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching suppliers:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getSuppliers:", error)
    throw error
  }
}

export async function getSupplierById(id: string) {
  try {
    const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching supplier with id ${id}:`, error)
      throw error
    }

    return data
  } catch (error) {
    console.error(`Error in getSupplierById:`, error)
    throw error
  }
}

export async function createSupplier(supplier: Partial<Supplier>) {
  try {
    console.log("Creating supplier with data:", supplier)

    // Validate required fields
    if (!supplier.name) {
      throw new Error("O nome do fornecedor é obrigatório")
    }

    if (!supplier.internal_responsible) {
      throw new Error("O responsável interno é obrigatório")
    }

    // Ensure we're not sending service_description if it's not a valid field in the suppliers table
    const { service_description, ...supplierData } = supplier as any

    // If service_description is a valid field in your schema, add it back
    if (service_description) {
      supplierData.service_description = service_description
    }

    const { data, error } = await supabase.from("suppliers").insert([supplierData]).select()

    if (error) {
      console.error("Supabase error creating supplier:", error)
      throw new Error(`Erro ao criar fornecedor: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("Nenhum dado retornado ao criar fornecedor")
    }

    console.log("Supplier created successfully:", data[0])
    return data[0]
  } catch (error) {
    console.error("Error in createSupplier function:", error)
    throw error
  }
}

export async function updateSupplier(id: string, updates: Partial<Supplier>) {
  try {
    // Adicionar updated_at
    updates.updated_at = new Date().toISOString()

    // Ensure we're not sending service_description if it's not a valid field in the suppliers table
    const { service_description, ...updatesData } = updates as any

    // If service_description is a valid field in your schema, add it back
    if (service_description) {
      updatesData.service_description = service_description
    }

    const { data, error } = await supabase.from("suppliers").update(updatesData).eq("id", id).select()

    if (error) {
      console.error(`Error updating supplier with id ${id}:`, error)
      throw new Error(`Erro ao atualizar fornecedor: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error(`Fornecedor com ID ${id} não encontrado`)
    }

    return data[0]
  } catch (error) {
    console.error(`Error in updateSupplier function:`, error)
    throw error
  }
}

// Substitua a função createAssessment existente pela versão abaixo:

export async function createAssessment(assessment: Partial<Assessment>) {
  try {
    console.log("Creating assessment with data:", JSON.stringify(assessment, null, 2))

    // Validate required fields
    if (!assessment.supplier_id) {
      throw new Error("O ID do fornecedor é obrigatório")
    }

    if (!assessment.internal_responsible) {
      throw new Error("O responsável interno é obrigatório")
    }

    // First, check if the supplier exists
    try {
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("id")
        .eq("id", assessment.supplier_id)
        .single()

      if (supplierError) {
        console.error("Error checking supplier existence:", supplierError)
        throw new Error(`Fornecedor não encontrado: ${supplierError.message}`)
      }

      if (!supplierData) {
        throw new Error(`Fornecedor com ID ${assessment.supplier_id} não encontrado`)
      }
    } catch (supplierCheckError) {
      console.error("Error checking supplier:", supplierCheckError)
      throw new Error(
        `Erro ao verificar fornecedor: ${supplierCheckError instanceof Error ? supplierCheckError.message : "Erro desconhecido"}`,
      )
    }

    // Prepare assessment data based on the actual database schema
    const assessmentData = {
      supplier_id: assessment.supplier_id,
      internal_responsible: assessment.internal_responsible,
      status: assessment.status || "draft",
      data_volume: assessment.data_volume || null,
      data_sensitivity: assessment.data_sensitivity || null,
      data_type: assessment.data_type || null,
      supplier_type: assessment.supplier_type || null,
      contract_type: assessment.contract_type || null,
      is_technology: assessment.is_technology !== undefined ? assessment.is_technology : false,
      notes: assessment.notes || null,
      service_description: assessment.service_description || null,
    }

    console.log("Sending assessment data to Supabase:", JSON.stringify(assessmentData, null, 2))

    // Insert the assessment
    try {
      const { data, error } = await supabase.from("assessments").insert([assessmentData]).select()

      if (error) {
        console.error("Supabase error creating assessment:", error)
        console.error("Error code:", error.code)
        console.error("Error message:", error.message)
        console.error("Error details:", error.details)

        throw new Error(`Erro ao criar avaliação: ${error.message || "Erro desconhecido"}`)
      }

      if (!data || data.length === 0) {
        throw new Error("Nenhum dado retornado ao criar avaliação")
      }

      const createdAssessment = data[0]
      console.log("Assessment created successfully:", createdAssessment)
      return createdAssessment
    } catch (insertError) {
      console.error("Error inserting assessment:", insertError)
      throw new Error(
        `Erro ao inserir avaliação: ${insertError instanceof Error ? insertError.message : "Erro desconhecido"}`,
      )
    }
  } catch (error: any) {
    console.error("Error in createAssessment function:", error)

    // Ensure we always have a meaningful error message
    let errorMessage = "Erro desconhecido ao criar avaliação"

    if (error instanceof Error) {
      errorMessage = error.message
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    } else if (typeof error === "object" && error !== null) {
      try {
        errorMessage = JSON.stringify(error)
      } catch (e) {
        errorMessage = "Erro não serializável ao criar avaliação"
      }
    }

    throw new Error(errorMessage)
  }
}

export async function getAssessmentsBySupplier(supplierId: string) {
  try {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("created_at", { ascending: false })

    if (error) {
      // Verificar se o erro é devido à tabela não existir
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.warn("A tabela 'assessments' não existe. Retornando array vazio.")
        return []
      }

      console.error(`Error fetching assessments for supplier ${supplierId}:`, error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error(`Error in getAssessmentsBySupplier:`, error)
    // Retornar um array vazio em vez de propagar o erro
    return []
  }
}

// Modificando apenas a função uploadDocument para corrigir o erro de RLS
export async function uploadDocument(file: File, supplierId: string, assessmentId: string | null, uploadedBy: string) {
  try {
    // Verificar se o bucket existe usando o cliente admin
    let bucketExists = false

    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (!bucketsError && buckets) {
        bucketExists = buckets.some((bucket) => bucket.name === "supplier-documents")
      }
    } catch (error) {
      console.warn("Erro ao verificar buckets, assumindo que o bucket não existe:", error)
    }

    // Se o bucket não existir, prosseguir com o upload mesmo assim
    // O bucket provavelmente precisa ser criado pelo administrador do Supabase
    if (!bucketExists) {
      console.log("Bucket 'supplier-documents' não encontrado. O upload será tentado mesmo assim.")
      // Não tentamos criar o bucket aqui, pois isso requer permissões de admin
    }

    // Criar um nome de arquivo único
    const fileExt = file.name.split(".").pop()
    const fileName = `${supplierId}/${Date.now()}.${fileExt}`

    console.log("Uploading file:", fileName)

    // Upload do arquivo para o storage do Supabase
    // Assumindo que o bucket já existe e o usuário tem permissão para upload
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("supplier-documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      // Se o erro for relacionado ao bucket não existir, informamos claramente
      if (uploadError.message && uploadError.message.includes("bucket") && uploadError.message.includes("not found")) {
        throw new Error(
          "O bucket 'supplier-documents' não existe. Por favor, peça ao administrador para criar o bucket.",
        )
      }

      console.error("Error uploading file:", uploadError)
      throw new Error(`Erro ao fazer upload do arquivo: ${uploadError.message}`)
    }

    // Obter a URL pública do arquivo
    const { data: urlData } = await supabase.storage.from("supplier-documents").getPublicUrl(fileName)

    if (!urlData || !urlData.publicUrl) {
      throw new Error("Não foi possível obter a URL pública do arquivo")
    }

    console.log("File uploaded successfully, public URL:", urlData.publicUrl)

    // Criar registro do documento no banco de dados
    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          supplier_id: supplierId,
          assessment_id: assessmentId,
          name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: uploadedBy,
        },
      ])
      .select()

    if (error) {
      console.error("Error creating document record:", error)
      throw new Error(`Erro ao criar registro do documento: ${error.message}`)
    }

    return data?.[0]
  } catch (error) {
    console.error("Error in uploadDocument function:", error)
    throw error
  }
}

export async function getDocumentsBySupplier(supplierId: string) {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("uploaded_at", { ascending: false })

    if (error) {
      // Verificar se o erro é devido à tabela não existir
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.warn("A tabela 'documents' não existe. Retornando array vazio.")
        return []
      }

      console.error(`Error fetching documents for supplier ${supplierId}:`, error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error(`Error in getDocumentsBySupplier:`, error)
    // Retornar um array vazio em vez de propagar o erro
    return []
  }
}

export async function saveChecklistItems(items: Omit<ChecklistItem, "id">[]) {
  try {
    const { data, error } = await supabase.from("checklist_items").insert(items).select()

    if (error) {
      console.error("Error saving checklist items:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in saveChecklistItems:", error)
    throw error
  }
}

export async function getChecklistItemsByAssessment(assessmentId: string) {
  try {
    const { data, error } = await supabase.from("checklist_items").select("*").eq("assessment_id", assessmentId)

    if (error) {
      console.error(`Error fetching checklist items for assessment ${assessmentId}:`, error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error(`Error in getChecklistItemsByAssessment:`, error)
    throw error
  }
}

export async function updateChecklistItem(id: string, updates: Partial<ChecklistItem>) {
  try {
    const { data, error } = await supabase.from("checklist_items").update(updates).eq("id", id).select()

    if (error) {
      console.error(`Error updating checklist item with id ${id}:`, error)
      throw error
    }

    return data?.[0]
  } catch (error) {
    console.error(`Error in updateChecklistItem:`, error)
    throw error
  }
}

// Adicione esta função ao arquivo lib/supabase.ts

export async function updateAssessment(id: string, updates: Partial<Assessment>, returnData = false) {
  try {
    // Adicionar updated_at se não estiver presente
    if (!updates.updated_at) {
      updates.updated_at = new Date().toISOString()
    }

    if (returnData) {
      // Apenas retornar os dados sem atualizar
      const { data, error } = await supabase.from("assessments").select("*").eq("id", id).single()

      if (error) {
        console.error(`Error fetching assessment with id ${id}:`, error)
        return { error }
      }

      return { data, error: null }
    }

    const { data, error } = await supabase.from("assessments").update(updates).eq("id", id).select()

    if (error) {
      console.error(`Error updating assessment with id ${id}:`, error)
      return { error }
    }

    if (!data || data.length === 0) {
      return { error: new Error(`Avaliação com ID ${id} não encontrada`) }
    }

    return { data: data[0], error: null }
  } catch (error) {
    console.error(`Error in updateAssessment function:`, error)
    return { error }
  }
}
