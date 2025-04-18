import type { FormData } from "@/components/supplier-risk-assessment"
import { getSupabaseBrowser } from "./supabase/client"
// import { Database as SupabaseDatabase } from "../supabase"

// Interface para o serviço de banco de dados
export interface DatabaseService {
  saveSupplier: (data: FormData) => Promise<string>
  getSupplier: (id: string) => Promise<FormData | null>
  updateSupplier: (id: string, data: Partial<FormData>) => Promise<boolean>
  listSuppliers: () => Promise<Array<{ id: string; name: string; riskLevel: string; reviewStatus: string }>>
  deleteSupplier: (id: string) => Promise<boolean>
}

// Implementação do serviço de banco de dados usando Supabase
class SupabaseDatabase implements DatabaseService {
  async saveSupplier(data: FormData): Promise<string> {
    try {
      // Mapeamento dos campos do FormData para o formato da tabela suppliers no Supabase
      const supplierData = {
        name: data.supplierName,
        supplier_type: data.supplierType,
        supplier_type_description: data.supplierTypeDescription,
        is_technology: data.isTechnology,
        data_volume: data.dataVolume,
        data_type: data.dataType,
        certification: data.certification,
        policy: data.policy,
        subcontracting: data.subcontracting,
        incidents: data.incidents,
        risk_score: data.riskScore,
        risk_level: data.riskLevel,
        risk_description: data.riskDescription,
        dpo_reviewed: data.dpoReview.reviewed,
        dpo_adjusted_risk_level: data.dpoReview.adjustedRiskLevel,
        dpo_comments: data.dpoReview.comments,
        dpo_review_date: data.dpoReview.reviewDate ? new Date(data.dpoReview.reviewDate).toISOString() : null,
        dpo_reviewer: data.dpoReview.reviewedBy,
        status: 'pending', // Status inicial
        tax_id: '', // Será preenchido posteriormente
        internal_responsible: data.internalResponsible,
        criticality: data.criticality
      }

      const supabase = getSupabaseBrowser()
      const { data: newSupplier, error } = await supabase
        .from('suppliers')
        .insert(supplierData)
        .select('id')
        .single()

      if (error) throw error

      const supplierId = newSupplier.id

      // Se houver documentos, adicionar ao banco de dados
      if (data.uploadedDocuments && data.uploadedDocuments.length > 0) {
        // Para cada documento, criar uma entrada na tabela supplier_documents
        const documentPromises = data.uploadedDocuments.map(docName => {
          return supabase
            .from('supplier_documents')
            .insert({
              supplier_id: supplierId,
              document_name: docName,
              document_id: '', // Será preenchido posteriormente
              is_provided: true
            })
        })

        await Promise.all(documentPromises)
      }

      // Para documentos não fornecidos
      if (data.notProvidedDocuments && data.notProvidedDocuments.length > 0) {
        const notProvidedPromises = data.notProvidedDocuments.map(docId => {
          return supabase
            .from('supplier_documents')
            .insert({
              supplier_id: supplierId,
              document_name: `Não fornecido (${docId})`,
              document_id: docId,
              is_provided: false
            })
        })

        await Promise.all(notProvidedPromises)
      }

      return supplierId
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error)
      throw new Error("Falha ao salvar fornecedor no banco de dados")
    }
  }

  async getSupplier(id: string): Promise<FormData | null> {
    try {
      // Obter os dados do fornecedor
      const supabase = getSupabaseBrowser()
      const { data: supplier, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error("Erro ao buscar fornecedor:", error)
        return null
      }

      if (!supplier) return null

      // Obter documentos do fornecedor
      const { data: documents, error: docsError } = await supabase
        .from('supplier_documents')
        .select('*')
        .eq('supplier_id', id)

      if (docsError) {
        console.error("Erro ao buscar documentos:", docsError)
      }

      // Mapear os dados do banco para o formato FormData
      const formData: FormData = {
        supplierName: supplier.name,
        serviceDescription: supplier.service_description || "",
        internalResponsible: supplier.internal_responsible || "",
        dataVolume: supplier.data_volume as any || "low",
        dataSensitivity: supplier.data_sensitivity as any || "non-sensitive",
        contractType: supplier.contract_type as any || "punctual",
        isTechnology: supplier.is_technology || false,
        supplierType: supplier.supplier_type,
        supplierTypeDescription: supplier.supplier_type_description || "",
        sensitiveFlagged: supplier.data_sensitivity === "sensitive",
        uploadedDocuments: documents 
          ? documents.filter(d => d.is_provided).map(d => d.document_name)
          : [],
        notProvidedDocuments: documents 
          ? documents.filter(d => !d.is_provided).map(d => d.document_id)
          : [],
        submittedToOffice: supplier.status !== "pending",
        dataType: supplier.data_type as any || "none",
        volume: supplier.data_volume as any || "low",
        criticality: supplier.criticality as any || "non-critical",
        policy: supplier.policy as any || "unknown",
        certification: supplier.certification as any || "unknown",
        subcontracting: supplier.subcontracting as any || "none",
        incidents: supplier.incidents as any || "none",
        riskScore: supplier.risk_score || 0,
        riskLevel: supplier.risk_level as any || "low",
        riskDescription: supplier.risk_description || "",
        dpoReview: {
          reviewed: supplier.dpo_reviewed || false,
          adjustedRiskLevel: supplier.dpo_adjusted_risk_level as any || undefined,
          comments: supplier.dpo_comments || undefined,
          reviewDate: supplier.dpo_review_date ? new Date(supplier.dpo_review_date) : undefined,
          reviewedBy: supplier.dpo_reviewer || undefined,
        }
      }

      return formData
    } catch (error) {
      console.error("Erro ao obter fornecedor:", error)
      return null
    }
  }

  async updateSupplier(id: string, data: Partial<FormData>): Promise<boolean> {
    try {
      // Mapear apenas os campos que estão sendo atualizados
      const updateData: any = {}

      if (data.supplierName !== undefined) updateData.name = data.supplierName
      if (data.serviceDescription !== undefined) updateData.service_description = data.serviceDescription
      if (data.dataVolume !== undefined) updateData.data_volume = data.dataVolume
      if (data.dataSensitivity !== undefined) updateData.data_sensitivity = data.dataSensitivity
      if (data.contractType !== undefined) updateData.contract_type = data.contractType
      if (data.isTechnology !== undefined) updateData.is_technology = data.isTechnology
      if (data.supplierType !== undefined) updateData.supplier_type = data.supplierType
      if (data.supplierTypeDescription !== undefined) updateData.supplier_type_description = data.supplierTypeDescription
      if (data.dataType !== undefined) updateData.data_type = data.dataType
      if (data.criticality !== undefined) updateData.criticality = data.criticality
      if (data.policy !== undefined) updateData.policy = data.policy
      if (data.certification !== undefined) updateData.certification = data.certification
      if (data.subcontracting !== undefined) updateData.subcontracting = data.subcontracting
      if (data.incidents !== undefined) updateData.incidents = data.incidents
      if (data.riskScore !== undefined) updateData.risk_score = data.riskScore
      if (data.riskLevel !== undefined) updateData.risk_level = data.riskLevel
      if (data.riskDescription !== undefined) updateData.risk_description = data.riskDescription
      if (data.internalResponsible !== undefined) updateData.internal_responsible = data.internalResponsible

      // Se há atualizações na revisão do DPO
      if (data.dpoReview) {
        if (data.dpoReview.reviewed !== undefined) updateData.dpo_reviewed = data.dpoReview.reviewed
        if (data.dpoReview.adjustedRiskLevel !== undefined) updateData.dpo_adjusted_risk_level = data.dpoReview.adjustedRiskLevel
        if (data.dpoReview.comments !== undefined) updateData.dpo_comments = data.dpoReview.comments
        if (data.dpoReview.reviewDate !== undefined) updateData.dpo_review_date = data.dpoReview.reviewDate.toISOString()
        if (data.dpoReview.reviewedBy !== undefined) updateData.dpo_reviewer = data.dpoReview.reviewedBy
      }

      // Atualizar dados do fornecedor
      const supabase = getSupabaseBrowser()
      const { error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error("Erro ao atualizar fornecedor:", error)
        return false
      }

      // Atualizar documentos se necessário
      if (data.uploadedDocuments) {
        // Primeiro, obter documentos existentes
        const { data: existingDocs } = await supabase
          .from('supplier_documents')
          .select('document_name, id')
          .eq('supplier_id', id)
          .eq('is_provided', true)

        const existingDocNames = existingDocs?.map(d => d.document_name) || []
        
        // Novos documentos a adicionar
        const newDocs = data.uploadedDocuments.filter(name => !existingDocNames.includes(name))
        
        if (newDocs.length > 0) {
          const docsToInsert = newDocs.map(docName => ({
            supplier_id: id,
            document_name: docName,
            document_id: '',
            is_provided: true
          }))
          
          await supabase.from('supplier_documents').insert(docsToInsert)
        }
      }

      // Atualizar documentos não fornecidos se necessário
      if (data.notProvidedDocuments) {
        // Primeiro, obter documentos não fornecidos existentes
        const { data: existingNotProvided } = await supabase
          .from('supplier_documents')
          .select('document_id, id')
          .eq('supplier_id', id)
          .eq('is_provided', false)

        const existingDocIds = existingNotProvided?.map(d => d.document_id) || []
        
        // Novos documentos não fornecidos a adicionar
        const newNotProvided = data.notProvidedDocuments.filter(docId => !existingDocIds.includes(docId))
        
        if (newNotProvided.length > 0) {
          const docsToInsert = newNotProvided.map(docId => ({
            supplier_id: id,
            document_name: `Não fornecido (${docId})`,
            document_id: docId,
            is_provided: false
          }))
          
          await supabase.from('supplier_documents').insert(docsToInsert)
        }
      }

      return true
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error)
      return false
    }
  }

  async listSuppliers(): Promise<Array<{ id: string; name: string; riskLevel: string; reviewStatus: string }>> {
    try {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, supplier_type, risk_level, dpo_reviewed, dpo_adjusted_risk_level')
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Erro ao listar fornecedores:", error)
        return []
      }

      return data.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        riskLevel: supplier.dpo_reviewed && supplier.dpo_adjusted_risk_level 
          ? supplier.dpo_adjusted_risk_level 
          : supplier.risk_level || 'low',
        reviewStatus: supplier.dpo_reviewed ? "Revisado" : "Pendente"
      }))
    } catch (error) {
      console.error("Erro ao listar fornecedores:", error)
      return []
    }
  }

  async deleteSupplier(id: string): Promise<boolean> {
    try {
      // Devido às restrições de chave estrangeira, primeiro excluímos os documentos
      const supabase = getSupabaseBrowser();
      await supabase
        .from('supplier_documents')
        .delete()
        .eq('supplier_id', id)

      // Em seguida, exclua o fornecedor
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) {
        console.error("Erro ao excluir fornecedor:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error)
      return false
    }
  }
}

// Singleton para garantir uma única instância do banco de dados
let databaseInstance: DatabaseService | null = null

export function getDatabase(): DatabaseService {
  if (!databaseInstance) {
    databaseInstance = new SupabaseDatabase()
  }
  return databaseInstance
}
