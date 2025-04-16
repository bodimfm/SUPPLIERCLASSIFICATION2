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
      
      // Obter o cliente Supabase apropriado para o ambiente
      let supabase;
      let userId = 'anonymous';
      let clientType = '';
      
      try {
        // Primeiro, tente obter o cliente do servidor
        console.log("Tentando obter cliente Supabase do servidor...");
        supabase = await createSupabaseServerClient();
        clientType = 'server';
        
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.warn("Aviso ao obter usuário no servidor:", error.message);
        }
        
        if (data?.user) {
          userId = data.user.id;
          console.log(`Usando ID de usuário autenticado: ${userId} (servidor)`);
        } else {
          console.log("Nenhum usuário autenticado encontrado no servidor, usando 'anonymous'");
        }
      } catch (error) {
        // Se falhar, estamos no cliente
        console.log("Não foi possível obter cliente do servidor, usando cliente do navegador...");
        supabase = getSupabaseBrowser();
        clientType = 'browser';
        
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.warn("Aviso ao obter usuário no navegador:", userError.message);
        }
        
        if (userData?.user) {
          userId = userData.user.id;
          console.log(`Usando ID de usuário autenticado: ${userId} (navegador)`);
        } else {
          console.log("Nenhum usuário autenticado encontrado no navegador, usando 'anonymous'");
        }
      }
      
      // Caminho no storage (incluindo ID do usuário para RLS)
      const filePath = `${userId}/${sanitizedSupplierName}/${uniqueFileName}`
      console.log(`Caminho do arquivo no storage: ${filePath}`);
      
      // Verificar se o bucket existe
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(this.storageBucket);
      if (bucketError || !bucketData) {
        console.error("Erro ao verificar bucket:", bucketError?.message || "Bucket não encontrado");
        
        // Tentativa de criar o bucket se não existir
        try {
          console.log(`Tentando criar bucket: ${this.storageBucket}`);
          const { error: createError } = await supabase.storage.createBucket(this.storageBucket, {
            public: true
          });
          
          if (createError) {
            console.error("Erro ao criar bucket:", createError);
            throw new Error(`Não foi possível criar o bucket de armazenamento: ${createError.message}`);
          } else {
            console.log("Bucket criado com sucesso!");
          }
        } catch (createBucketError) {
          console.error("Erro ao tentar criar bucket:", createBucketError);
          throw new Error("Falha ao criar bucket de armazenamento");
        }
      } else {
        console.log(`Bucket ${this.storageBucket} verificado e disponível (${bucketData.public ? 'público' : 'privado'})`);
      }
      
      // Fazer upload para o Supabase Storage
      console.log(`Iniciando upload do arquivo para ${this.storageBucket}...`);
      const { data, error } = await supabase.storage
        .from(this.storageBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Mudado para true para sobrescrever se existir
        });
      
      if (error) {
        console.error("Erro no upload para Supabase Storage:", error);
        
        // Fornecer mensagens de erro mais úteis baseadas no código de erro
        if (error.message.includes('storage/bucket-not-found')) {
          throw new Error(`Bucket de armazenamento '${this.storageBucket}' não encontrado. Entre em contato com o administrador.`);
        } else if (error.message.includes('storage/object-too-large')) {
          throw new Error(`Arquivo muito grande. Tamanho máximo: 10MB. Tamanho atual: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        } else if (error.message.includes('storage/unauthorized')) {
          throw new Error(`Sem permissão para upload de arquivos. Verifique se você está logado corretamente. Usando cliente: ${clientType}`);
        } else {
          throw new Error(`Falha ao fazer upload: ${error.message}`);
        }
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
      // Repassar a mensagem de erro se já for uma Error, ou criar nova mensagem genérica
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Falha ao fazer upload do arquivo.");
      }
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
 * Mantém o nome por compatibilidade com código existente
 */
export async function uploadToSharePoint(file: File, supplierName: string) {
  const service = DocumentService.getInstance()
  return service.uploadFile(file, supplierName)
}

/**
 * Função de conveniência para upload de arquivo com nome mais descritivo
 */
export async function uploadToStorage(file: File, supplierName: string) {
  const service = DocumentService.getInstance()
  return service.uploadFile(file, supplierName)
}
