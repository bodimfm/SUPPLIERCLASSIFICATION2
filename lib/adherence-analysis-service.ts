import Papa from "papaparse"
import { getSupabaseBrowser } from "./supabase/client"
import { v4 as uuidv4 } from "uuid"

// Tipos para a análise de aderência
export interface ContractData {
  supplierName: string
  contractDate: Date
  isRegistered: boolean
  registrationDate?: Date
  supplierType?: string
  complianceStatus: "compliant" | "non-compliant" | "pending"
  observations?: string
}

export interface AdherenceAnalysisResult {
  totalContracts: number
  registeredContracts: number
  unregisteredContracts: number
  complianceRate: number
  contractsData: ContractData[]
}

export interface SupplierAdherenceData {
  supplierName: string
  registrationDate: Date
  supplierType: string
  status: string
}

export interface ContractAnalysis {
  id: string
  fileName: string
  uploadDate: string
  analyzedBy: string
  totalContracts: number
  complianceRate: number
  findings: string
  recommendations: string
}

/**
 * Serviço para análise de aderência à política de contratação
 */
export class AdherenceAnalysisService {
  private static instance: AdherenceAnalysisService

  // Fallback para caso de falha de conexão com Supabase
  private fallbackRegisteredSuppliers = [
    {
      supplierName: "Acme Corporation",
      registrationDate: new Date("2023-01-15"),
      supplierType: "B",
      status: "approved",
    },
    {
      supplierName: "Tech Solutions Inc",
      registrationDate: new Date("2023-02-20"),
      supplierType: "A",
      status: "approved",
    },
    {
      supplierName: "Data Services Ltd",
      registrationDate: new Date("2023-03-10"),
      supplierType: "C",
      status: "pending",
    },
    {
      supplierName: "Cloud Systems",
      registrationDate: new Date("2023-04-05"),
      supplierType: "B",
      status: "approved",
    },
    {
      supplierName: "Security Partners",
      registrationDate: new Date("2023-05-12"),
      supplierType: "A",
      status: "approved",
    },
  ]

  private constructor() {}

  /**
   * Obtém a instância singleton do serviço
   */
  public static getInstance(): AdherenceAnalysisService {
    if (!AdherenceAnalysisService.instance) {
      AdherenceAnalysisService.instance = new AdherenceAnalysisService()
    }
    return AdherenceAnalysisService.instance
  }

  /**
   * Analisa uma planilha de contratos para verificar aderência à política
   * @param file Arquivo da planilha (CSV ou Excel)
   * @param analyzedBy Email ou nome do usuário que está realizando a análise
   */
  public async analyzeContractsFile(file: File, analyzedBy: string = "sistema"): Promise<AdherenceAnalysisResult> {
    try {
      // Processar o arquivo
      const contractsData = await this.parseContractsFile(file)

      // Buscar fornecedores registrados do Supabase
      const registeredSuppliers = await this.fetchRegisteredSuppliers()

      // Analisar cada contrato
      const analyzedContracts = await this.analyzeContracts(contractsData, registeredSuppliers)

      // Calcular estatísticas
      const totalContracts = analyzedContracts.length
      const registeredContracts = analyzedContracts.filter((c) => c.isRegistered).length
      const unregisteredContracts = totalContracts - registeredContracts
      const complianceRate = totalContracts > 0 ? (registeredContracts / totalContracts) * 100 : 0

      // Criar resumo dos achados
      const findings = `Foram analisados ${totalContracts} contratos, dos quais ${registeredContracts} estão em conformidade (${complianceRate.toFixed(2)}%).`
      
      // Recomendações
      const recommendations = unregisteredContracts > 0 
        ? `É necessário regularizar ${unregisteredContracts} contratos que não passaram pelo processo de avaliação de risco.`
        : "Todos os contratos estão em conformidade com a política de contratação."

      // Salvar a análise no Supabase
      await this.saveAnalysisResults({
        id: uuidv4(),
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        analyzedBy,
        totalContracts,
        complianceRate,
        findings,
        recommendations
      })

      return {
        totalContracts,
        registeredContracts,
        unregisteredContracts,
        complianceRate,
        contractsData: analyzedContracts,
      }
    } catch (error) {
      console.error("Erro ao analisar arquivo de contratos:", error)
      throw new Error("Não foi possível processar o arquivo de contratos. Verifique o formato e tente novamente.")
    }
  }

  /**
   * Salva os resultados da análise no Supabase
   */
  private async saveAnalysisResults(analysis: ContractAnalysis): Promise<void> {
    try {
      await supabase.from('adherence_analyses').insert([{
        id: analysis.id,
        file_name: analysis.fileName,
        upload_date: analysis.uploadDate,
        analyzed_by: analysis.analyzedBy,
        total_contracts: analysis.totalContracts,
        compliance_rate: analysis.complianceRate,
        findings: analysis.findings,
        recommendations: analysis.recommendations
      }])
    } catch (error) {
      console.error("Erro ao salvar resultados da análise:", error)
      // Continua a execução mesmo em caso de erro
    }
  }

  /**
   * Busca fornecedores registrados do Supabase
   */
  private async fetchRegisteredSuppliers(): Promise<SupplierAdherenceData[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('name, registration_date, supplier_type, status')
      
      if (error) throw error
      
      return data.map(supplier => ({
        supplierName: supplier.name,
        registrationDate: new Date(supplier.registration_date || Date.now()),
        supplierType: supplier.supplier_type,
        status: supplier.status
      }))
    } catch (error) {
      console.error("Erro ao buscar fornecedores do Supabase:", error)
      // Em caso de erro, retorna dados de fallback
      return this.fallbackRegisteredSuppliers
    }
  }

  /**
   * Processa o arquivo de contratos (CSV ou Excel)
   * @param file Arquivo a ser processado
   */
  private async parseContractsFile(file: File): Promise<{ supplierName: string; contractDate: string }[]> {
    return new Promise((resolve, reject) => {
      // Para CSV
      if (file.type === "text/csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data as { supplierName: string; contractDate: string }[])
          },
          error: (error) => {
            reject(error)
          },
        })
      }
      // Para Excel (em um cenário real, usaríamos uma biblioteca como xlsx)
      else if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        // Simulação de processamento de Excel
        // Em um cenário real, usaríamos uma biblioteca como xlsx
        setTimeout(() => {
          // Dados simulados para demonstração
          resolve([
            { supplierName: "Acme Corporation", contractDate: "2023-01-20" },
            { supplierName: "Tech Solutions Inc", contractDate: "2023-02-25" },
            { supplierName: "Global Logistics", contractDate: "2023-03-15" },
            { supplierName: "Marketing Experts", contractDate: "2023-04-10" },
            { supplierName: "Cloud Systems", contractDate: "2023-04-01" },
            { supplierName: "Data Analytics Co", contractDate: "2023-05-05" },
            { supplierName: "Security Partners", contractDate: "2023-05-10" },
          ])
        }, 1000)
      } else {
        reject(new Error("Formato de arquivo não suportado. Por favor, envie um arquivo CSV ou Excel."))
      }
    })
  }

  /**
   * Analisa os contratos comparando com fornecedores registrados
   * @param contractsData Dados dos contratos da planilha
   * @param registeredSuppliers Lista de fornecedores registrados
   */
  private async analyzeContracts(
    contractsData: { supplierName: string; contractDate: string }[], 
    registeredSuppliers: SupplierAdherenceData[]
  ): Promise<ContractData[]> {
    return contractsData.map((contract) => {
      // Verificar se o fornecedor está registrado
      const registeredSupplier = registeredSuppliers.find(
        (s) => s.supplierName.toLowerCase() === contract.supplierName.toLowerCase(),
      )

      const contractDate = new Date(contract.contractDate)

      // Determinar status de conformidade
      let complianceStatus: "compliant" | "non-compliant" | "pending" = "non-compliant"
      let observations = ""

      if (registeredSupplier) {
        // Verificar se o contrato foi assinado após o registro
        if (contractDate >= registeredSupplier.registrationDate) {
          complianceStatus = "compliant"
          observations = "Contrato assinado após avaliação de risco"
        } else {
          complianceStatus = "non-compliant"
          observations = "Contrato assinado antes da avaliação de risco"
        }
      } else {
        complianceStatus = "non-compliant"
        observations = "Fornecedor não avaliado pelo escritório"
      }

      return {
        supplierName: contract.supplierName,
        contractDate: contractDate,
        isRegistered: !!registeredSupplier,
        registrationDate: registeredSupplier?.registrationDate,
        supplierType: registeredSupplier?.supplierType,
        complianceStatus,
        observations,
      }
    })
  }

  /**
   * Obtém a lista de fornecedores registrados
   */
  public async getRegisteredSuppliers(): Promise<SupplierAdherenceData[]> {
    return await this.fetchRegisteredSuppliers()
  }

  /**
   * Busca análises já realizadas
   */
  public async getPreviousAnalyses(): Promise<ContractAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('adherence_analyses')
        .select('*')
        .order('upload_date', { ascending: false })
      
      if (error) throw error
      
      return data.map(item => ({
        id: item.id,
        fileName: item.file_name,
        uploadDate: item.upload_date,
        analyzedBy: item.analyzed_by,
        totalContracts: item.total_contracts,
        complianceRate: item.compliance_rate,
        findings: item.findings,
        recommendations: item.recommendations
      }))
    } catch (error) {
      console.error("Erro ao buscar análises anteriores:", error)
      return []
    }
  }
}

/**
 * Função de conveniência para obter o serviço de análise de aderência
 */
export function getAdherenceAnalysisService(): AdherenceAnalysisService {
  return AdherenceAnalysisService.getInstance()
}
