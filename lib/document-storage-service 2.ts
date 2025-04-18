import { createSupabaseServerClient } from "./supabase/server"
import { getSupabaseBrowser } from "./supabase/client"
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
   * Retorna o nome do bucket usado para armazenamento de documentos
   */
  public get bucketName(): string {
    return this.storageBucket
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
  public async uploadFile(file: File, supplierName: string): Promise<{ name: string; webUrl: string; path: string; originalName: string }> {
    try {
      console.log(`Iniciando upload para fornecedor: ${supplierName}, arquivo: ${file.name}, tamanho: ${file.size} bytes`);
      
      // Sanitizar nome do fornecedor para uso em caminho de pasta
      const sanitizedSupplierName = this.sanitizeFolderName(supplierName)
      console.log(`Nome do fornecedor sanitizado: ${sanitizedSupplierName}`);
      
      // Validar tamanho do arquivo
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Arquivo muito grande. O tamanho máximo permitido é 10MB. Tamanho atual: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      }
      
      // Gerar um nome único para o arquivo para evitar colisões
      const fileExtension = file.name.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      console.log(`Nome de arquivo gerado: ${uniqueFileName}`);
      
      // Obter o cliente Supabase do navegador
      const supabase = getSupabaseBrowser();
      
      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }
      
      // Caminho no storage (incluindo ID do usuário para RLS)
      const filePath = `${user.id}/${sanitizedSupplierName}/${uniqueFileName}`
      console.log(`Caminho do arquivo no storage: ${filePath}`);
      
      // Verificar se o bucket existe
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(this.storageBucket);
      if (bucketError || !bucketData) {
        console.error("Erro ao verificar bucket:", bucketError?.message || "Bucket não encontrado");
        throw new Error(`Bucket de armazenamento '${this.storageBucket}' não encontrado. Entre em contato com o administrador.`);
      }
      
      // Fazer upload para o Supabase Storage
      console.log(`Iniciando upload do arquivo para ${this.storageBucket}...`);
      const { data, error } = await supabase.storage
        .from(this.storageBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error("Erro no upload para Supabase Storage:", error);
        throw new Error(`Falha ao fazer upload: ${error.message}`);
      }
      
      console.log("Upload concluído com sucesso!");
      
      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(this.storageBucket)
        .getPublicUrl(filePath);
      
      console.log(`URL pública gerada: ${urlData.publicUrl}`);
      
      return {
        name: file.name,
        webUrl: urlData.publicUrl,
        path: filePath,
        originalName: file.name
      }
    } catch (error) {
      console.error("Erro no upload de documento:", error);
      throw error instanceof Error ? error : new Error("Falha ao fazer upload do arquivo.");
    }
  }

  /**
   * Garante que o bucket de armazenamento existe
   */
  private async ensureBucket(): Promise<void> {
    try {
      // Obter cliente Supabase para o servidor (preferencial para operações de admin)
      let supabase;
      
      try {
        // Primeiro, tente usar o cliente do servidor
        supabase = await createSupabaseServerClient();
      } catch (error) {
        // Se falhar, estamos no cliente
        supabase = getSupabaseBrowser();
      }
      
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
      let supabase;
      
      try {
        // Primeiro, tente usar o cliente do servidor
        supabase = await createSupabaseServerClient();
      } catch (error) {
        // Se falhar, estamos no cliente
        supabase = getSupabaseBrowser();
      }
      
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
 * @deprecated Use uploadToStorage em vez disso
 */
export async function uploadToSharePoint(file: File, supplierName: string) {
  console.warn("uploadToSharePoint está depreciado. Use uploadToStorage em vez disso.")
  return uploadToStorage(file, supplierName)
}

/**
 * Função de conveniência para upload de arquivo com nome mais descritivo
 */
export async function uploadToStorage(file: File, supplierName: string) {
  const service = DocumentService.getInstance()
  return service.uploadFile(file, supplierName)
}
