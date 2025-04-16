import { supabase } from "./supabase-client"
import { v4 as uuidv4 } from "uuid"

/**
 * Serviço para upload e gerenciamento de documentos
 * Implementado com Supabase Storage
 */
export class DocumentService {
  private static instance: DocumentService
  private storageBucket = "supplier-documents"

  private constructor() {
    // Inicializar o bucket se necessário
    this.ensureBucket()
  }

  /**
   * Obtém a instância singleton do serviço
   */
  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService()
    }
    return DocumentService.instance
  }

  /**
   * Faz upload de um arquivo para o Supabase Storage
   * @param file Arquivo a ser enviado
   * @param supplierName Nome do fornecedor (usado para criar subpasta)
   * @returns Informações do arquivo enviado
   */
  public async uploadFile(file: File, supplierName: string): Promise<{ name: string; webUrl: string }> {
    try {
      // Sanitizar nome do fornecedor para uso em caminho de pasta
      const sanitizedSupplierName = this.sanitizeFolderName(supplierName)
      
      // Gerar um nome único para o arquivo para evitar colisões
      const fileExtension = file.name.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      
      // Caminho no storage
      const filePath = `${sanitizedSupplierName}/${uniqueFileName}`
      
      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.storageBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) {
        console.error("Erro no upload para Supabase Storage:", error)
        throw new Error(`Falha ao fazer upload: ${error.message}`)
      }
      
      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(this.storageBucket)
        .getPublicUrl(filePath)
      
      return {
        name: file.name,
        webUrl: urlData.publicUrl,
        path: filePath,
        originalName: file.name
      }
    } catch (error) {
      console.error("Erro no upload de documento:", error)
      throw new Error("Falha ao fazer upload do arquivo.")
    }
  }

  /**
   * Garante que o bucket de armazenamento existe
   */
  private async ensureBucket(): Promise<void> {
    try {
      // Verificar se o bucket já existe
      const { data } = await supabase.storage.getBucket(this.storageBucket)
      
      // Se não existir, criar
      if (!data) {
        const { error } = await supabase.storage.createBucket(this.storageBucket, {
          public: true // Documentos acessíveis publicamente
        })
        
        if (error) {
          console.error("Erro ao criar bucket:", error)
        }
      }
    } catch (error) {
      console.error("Erro ao verificar/criar bucket:", error)
    }
  }

  /**
   * Sanitiza o nome do fornecedor para uso em caminhos de pasta
   * @param name Nome original
   * @returns Nome sanitizado
   */
  private sanitizeFolderName(name: string): string {
    // Remover caracteres inválidos para nomes de pasta
    return name
      .trim()
      .replace(/[<>:"/\\|?*]/g, "_") // Caracteres inválidos
      .replace(/\s+/g, "_") // Espaços para underscore
      .replace(/__+/g, "_") // Múltiplos underscores para um único
      .toLowerCase() // Tornar minúsculo para consistência
  }
  
  /**
   * Remove um arquivo do storage
   * @param filePath Caminho do arquivo a ser removido
   */
  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.storageBucket)
        .remove([filePath])
      
      if (error) {
        console.error("Erro ao remover arquivo:", error)
        return false
      }
      
      return true
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error)
      return false
    }
  }
}

/**
 * Função de conveniência para upload de arquivo
 */
export async function uploadToSharePoint(file: File, supplierName: string) {
  // Mantém o nome da função para compatibilidade
  const service = DocumentService.getInstance()
  return service.uploadFile(file, supplierName)
}
