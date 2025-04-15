import { getToken } from "./auth-service"

// Configuração do SharePoint
const SHAREPOINT_CONFIG = {
  siteUrl: "https://rafaelmacielbr-my.sharepoint.com",
  basePath: "/personal/rafael_rafaelmaciel_com_br",
  folderId: "Es1bb-icj9lHi0h9i2Ekqr4BkC7HneZ66ju-d9-R0Sgu5A",
}

/**
 * Serviço para interação com o SharePoint usando Microsoft Graph API
 */
export class SharePointService {
  private static instance: SharePointService
  private baseUrl = "https://graph.microsoft.com/v1.0"

  private constructor() {}

  /**
   * Obtém a instância singleton do serviço
   */
  public static getInstance(): SharePointService {
    if (!SharePointService.instance) {
      SharePointService.instance = new SharePointService()
    }
    return SharePointService.instance
  }

  /**
   * Faz upload de um arquivo para uma pasta específica no SharePoint
   * @param file Arquivo a ser enviado
   * @param supplierName Nome do fornecedor (usado para criar subpasta)
   * @returns Informações do arquivo enviado
   */
  public async uploadFile(file: File, supplierName: string): Promise<{ name: string; webUrl: string }> {
    try {
      // Obter token de autenticação
      const token = await getToken()

      // Sanitizar nome do fornecedor para uso em caminho de pasta
      const sanitizedSupplierName = this.sanitizeFolderName(supplierName)

      // Verificar se a pasta do fornecedor existe, se não, criar
      const supplierFolderPath = await this.ensureSupplierFolder(sanitizedSupplierName, token)

      // Preparar o upload do arquivo
      const uploadUrl = `${this.baseUrl}/drives/items/${SHAREPOINT_CONFIG.folderId}/children/${sanitizedSupplierName}/${file.name}/content`

      // Fazer upload do arquivo
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": file.type,
        },
        body: file,
      })

      if (!response.ok) {
        throw new Error(`Erro ao fazer upload: ${response.status} ${response.statusText}`)
      }

      const fileData = await response.json()
      return {
        name: file.name,
        webUrl: fileData.webUrl,
      }
    } catch (error) {
      console.error("Erro no upload para SharePoint:", error)
      throw new Error("Falha ao fazer upload do arquivo para o SharePoint")
    }
  }

  /**
   * Garante que a pasta do fornecedor existe no SharePoint
   * @param supplierName Nome sanitizado do fornecedor
   * @param token Token de autenticação
   * @returns Caminho da pasta do fornecedor
   */
  private async ensureSupplierFolder(supplierName: string, token: string): Promise<string> {
    try {
      // Verificar se a pasta já existe
      const checkUrl = `${this.baseUrl}/drives/items/${SHAREPOINT_CONFIG.folderId}/children?$filter=name eq '${supplierName}' and folder ne null`

      const checkResponse = await fetch(checkUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!checkResponse.ok) {
        throw new Error(`Erro ao verificar pasta: ${checkResponse.status}`)
      }

      const folderData = await checkResponse.json()

      // Se a pasta não existir, criar
      if (folderData.value.length === 0) {
        const createUrl = `${this.baseUrl}/drives/items/${SHAREPOINT_CONFIG.folderId}/children`

        const createResponse = await fetch(createUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: supplierName,
            folder: {},
            "@microsoft.graph.conflictBehavior": "rename",
          }),
        })

        if (!createResponse.ok) {
          throw new Error(`Erro ao criar pasta: ${createResponse.status}`)
        }
      }

      return `${SHAREPOINT_CONFIG.basePath}/${supplierName}`
    } catch (error) {
      console.error("Erro ao garantir pasta do fornecedor:", error)
      throw error
    }
  }

  /**
   * Sanitiza o nome do fornecedor para uso em caminhos de pasta
   * @param name Nome original
   * @returns Nome sanitizado
   */
  private sanitizeFolderName(name: string): string {
    // Remover caracteres inválidos para nomes de pasta no SharePoint
    return name
      .trim()
      .replace(/[<>:"/\\|?*]/g, "_") // Caracteres inválidos para SharePoint
      .replace(/\s+/g, "_") // Espaços para underscore
      .replace(/__+/g, "_") // Múltiplos underscores para um único
  }
}

/**
 * Função de conveniência para upload de arquivo
 */
export async function uploadToSharePoint(file: File, supplierName: string) {
  const service = SharePointService.getInstance()
  return service.uploadFile(file, supplierName)
}
