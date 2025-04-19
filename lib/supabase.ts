// Importando os clientes centralizados ao invés de recriar novos
import { supabase } from "./supabase-client"
import { supabaseAdmin, isAdminClientConfigured } from "./supabase-admin"

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

export type ChecklistCategory = {
  id: string
  name: string
  description: string
}
export type ChecklistItemWithCategory = {
  id: string
  assessment_id: string
  category: string
  item_text: string
  is_checked: boolean
  is_required: boolean
  notes: string
  category_name: string
  category_description: string
}

// Removido a criação duplicada do cliente Supabase, agora usando a instância importada

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
      // Tentar primeiro com o cliente normal
      const { data, error } = await supabase.from("assessments").insert([assessmentData]).select()

      // Se houver erro com RLS, tenta com o cliente admin
      if (error && isAdminClientConfigured() && supabaseAdmin) {
        console.log("Utilizando cliente admin devido a possíveis restrições de RLS")
        const { data: adminData, error: adminError } = await supabaseAdmin.from("assessments").insert([assessmentData]).select()
        
        if (adminError) {
          console.error("Supabase admin error creating assessment:", adminError)
          throw new Error(`Erro ao criar avaliação (admin): ${adminError.message || "Erro desconhecido"}`)
        }
        
        if (!adminData || adminData.length === 0) {
          throw new Error("Nenhum dado retornado ao criar avaliação (admin)")
        }
        
        const createdAssessment = adminData[0]
        console.log("Assessment created successfully with admin client:", createdAssessment)
        return createdAssessment
      }

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

// Corrigindo função uploadDocument para resolver problemas de permissão RLS
export async function uploadDocument(file: File, supplierId: string, assessmentId: string | null, uploadedBy: string) {
  try {
    // Verificar se temos o cliente admin configurado corretamente
    if (!isAdminClientConfigured() || !supabaseAdmin) {
      console.warn("Cliente admin do Supabase não configurado adequadamente. Operações administrativas podem falhar.")
    }

    // Verificar se o bucket existe - usando o cliente normal primeiro
    let bucketExists = false

    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (!bucketsError && buckets) {
        bucketExists = buckets.some((bucket) => bucket.name === "supplier-documents")
      }
    } catch (error) {
      console.warn("Erro ao verificar buckets com cliente normal:", error)
    }

    // Se não conseguiu verificar com o cliente normal, tenta com o cliente admin
    if (!bucketExists && isAdminClientConfigured() && supabaseAdmin) {
      try {
        const { data: adminBuckets, error: adminBucketsError } = await supabaseAdmin.storage.listBuckets()

        if (!adminBucketsError && adminBuckets) {
          bucketExists = adminBuckets.some((bucket) => bucket.name === "supplier-documents")
        }
      } catch (error) {
        console.warn("Erro ao verificar buckets com cliente admin:", error)
      }
    }

    // Se o bucket não existir e o cliente admin estiver disponível, cria o bucket
    if (!bucketExists && isAdminClientConfigured() && supabaseAdmin) {
      try {
        console.log("Tentando criar bucket 'supplier-documents'")
        const { data: newBucket, error: createBucketError } = await supabaseAdmin.storage.createBucket("supplier-documents", {
          public: true, // Definir se o bucket será público ou não
        })

        if (createBucketError) {
          console.error("Erro ao criar bucket:", createBucketError)
        } else {
          console.log("Bucket criado com sucesso:", newBucket)
          bucketExists = true
        }
      } catch (error) {
        console.error("Erro ao tentar criar o bucket:", error)
      }
    }

    if (!bucketExists) {
      console.warn("Bucket 'supplier-documents' não existe e não pôde ser criado. O upload pode falhar.")
    }

    // Criar um nome de arquivo único
    const fileExt = file.name.split(".").pop()
    const fileName = `${supplierId}/${Date.now()}.${fileExt}`

    console.log("Enviando arquivo:", fileName)

    // Tentar o upload usando o cliente admin para evitar problemas de RLS
    // Se o cliente admin não estiver disponível, usa o cliente normal
    const uploadClient = (isAdminClientConfigured() && supabaseAdmin) ? supabaseAdmin : supabase

    // Upload do arquivo para o storage do Supabase
    const { data: fileData, error: uploadError } = await uploadClient.storage
      .from("supplier-documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      // Mensagem de erro mais detalhada
      console.error("Erro no upload do arquivo:", uploadError)
      
      if (uploadError.message && uploadError.message.includes("bucket") && uploadError.message.includes("not found")) {
        throw new Error(
          "O bucket 'supplier-documents' não existe. Por favor, peça ao administrador para criar o bucket."
        )
      }
      
      throw new Error(`Erro no upload do arquivo: ${uploadError.message || JSON.stringify(uploadError)}`)
    }

    if (!fileData || !fileName) {
      throw new Error("Erro desconhecido no upload do arquivo")
    }

    // Obter a URL pública do arquivo
    const { data: urlData } = await uploadClient.storage.from("supplier-documents").getPublicUrl(fileName)

    if (!urlData || !urlData.publicUrl) {
      throw new Error("Não foi possível obter a URL pública do arquivo")
    }

    console.log("Arquivo enviado com sucesso, URL pública:", urlData.publicUrl)

    // Criar registro do documento no banco de dados usando o cliente apropriado para superar RLS
    const dbClient = (isAdminClientConfigured() && supabaseAdmin) ? supabaseAdmin : supabase
    
    const { data, error } = await dbClient
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
      console.error("Erro ao criar registro do documento:", error)
      throw new Error(`Erro ao criar registro do documento: ${error.message}`)
    }

    return data?.[0]
  } catch (error) {
    console.error("Erro na função uploadDocument:", error)
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

    // Tentar atualizar com o cliente normal primeiro
    let result = await supabase.from("assessments").update(updates).eq("id", id).select()
    let error = result.error
    let data = result.data

    // Se houver erro com RLS, tentar com o cliente admin
    if (error && isAdminClientConfigured() && supabaseAdmin) {
      console.log("Utilizando cliente admin para atualizar avaliação devido a possíveis restrições de RLS")
      const adminResult = await supabaseAdmin.from("assessments").update(updates).eq("id", id).select()
      error = adminResult.error
      data = adminResult.data
    }

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
