import { getSupabaseBrowser } from "./supabase/client"
import { v4 as uuidv4 } from "uuid"
import type { SupplierFormValues } from "./schemas/supplier-schema"

/**
 * Serviço para gerenciamento de rascunhos de fornecedores
 */
export class DraftService {
  private static instance: DraftService
  private draftTable = 'suppliers_drafts'
  
  private constructor() {}
  
  /**
   * Obtém a instância singleton do serviço
   */
  public static getInstance(): DraftService {
    if (!DraftService.instance) {
      DraftService.instance = new DraftService()
    }
    return DraftService.instance
  }
  
  /**
   * Salva o rascunho de um fornecedor
   * @param formData Dados do formulário do fornecedor
   * @returns ID do rascunho salvo
   */
  public async saveDraft(formData: SupplierFormValues): Promise<string> {
    try {
      const supabase = getSupabaseBrowser()
      
      // Obter o usuário atual
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      
      if (!userId) {
        throw new Error("Usuário não autenticado")
      }
      
      // Verificar se já existe um rascunho para este fornecedor (por CNPJ)
      const { data: existingDrafts } = await supabase
        .from(this.draftTable)
        .select('id')
        .eq('tax_id', formData.taxId)
        .eq('created_by', userId)
        .maybeSingle()
      
      // Preparar dados para inserção/atualização
      const draftData = {
        name: formData.supplierName,
        tax_id: formData.taxId,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        contact_person: formData.contactPerson || null,
        service_description: formData.serviceDescription,
        form_data: formData, // Armazenar todo o objeto formData em um campo JSON
        created_by: userId,
        updated_at: new Date().toISOString()
      }
      
      let draftId: string
      
      if (existingDrafts) {
        // Atualizar rascunho existente
        draftId = existingDrafts.id
        
        const { error } = await supabase
          .from(this.draftTable)
          .update(draftData)
          .eq('id', draftId)
        
        if (error) throw error
      } else {
        // Criar novo rascunho
        draftId = uuidv4()
        
        const { error } = await supabase
          .from(this.draftTable)
          .insert([{ 
            id: draftId, 
            ...draftData,
            created_at: new Date().toISOString()
          }])
        
        if (error) throw error
      }
      
      return draftId
    } catch (error) {
      console.error("Erro ao salvar rascunho:", error)
      throw error
    }
  }
  
  /**
   * Recupera um rascunho pelo ID
   * @param draftId ID do rascunho
   * @returns Dados do rascunho
   */
  public async getDraft(draftId: string): Promise<SupplierFormValues | null> {
    try {
      const supabase = getSupabaseBrowser()
      
      const { data, error } = await supabase
        .from(this.draftTable)
        .select('form_data')
        .eq('id', draftId)
        .single()
      
      if (error) throw error
      
      return data?.form_data || null
    } catch (error) {
      console.error("Erro ao recuperar rascunho:", error)
      return null
    }
  }
  
  /**
   * Lista todos os rascunhos do usuário atual
   * @returns Array de rascunhos
   */
  public async listDrafts(): Promise<Array<{id: string, name: string, tax_id: string, updated_at: string}>> {
    try {
      const supabase = getSupabaseBrowser()
      
      // Obter o usuário atual
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      
      if (!userId) {
        throw new Error("Usuário não autenticado")
      }
      
      const { data, error } = await supabase
        .from(this.draftTable)
        .select('id, name, tax_id, updated_at')
        .eq('created_by', userId)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error("Erro ao listar rascunhos:", error)
      return []
    }
  }
  
  /**
   * Remove um rascunho
   * @param draftId ID do rascunho
   * @returns true se removido com sucesso
   */
  public async removeDraft(draftId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseBrowser()
      
      const { error } = await supabase
        .from(this.draftTable)
        .delete()
        .eq('id', draftId)
      
      if (error) throw error
      
      return true
    } catch (error) {
      console.error("Erro ao remover rascunho:", error)
      return false
    }
  }
}

// Função auxiliar para obter o serviço
export function getDraftService(): DraftService {
  return DraftService.getInstance()
}

// Hook personalizado para debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Importação para o hook useDebounce
import { useState, useEffect } from "react"