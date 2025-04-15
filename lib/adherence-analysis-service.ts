import Papa from "papaparse"

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

/**
 * Serviço para análise de aderência à política de contratação
 */
export class AdherenceAnalysisService {
  private static instance: AdherenceAnalysisService

  // Simulação de fornecedores registrados no sistema
  private registeredSuppliers = [
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
   */
  public async analyzeContractsFile(file: File): Promise<AdherenceAnalysisResult> {
    try {
      // Processar o arquivo
      const contractsData = await this.parseContractsFile(file)

      // Analisar cada contrato
      const analyzedContracts = this.analyzeContracts(contractsData)

      // Calcular estatísticas
      const totalContracts = analyzedContracts.length
      const registeredContracts = analyzedContracts.filter((c) => c.isRegistered).length
      const unregisteredContracts = totalContracts - registeredContracts
      const complianceRate = totalContracts > 0 ? (registeredContracts / totalContracts) * 100 : 0

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
   */
  private analyzeContracts(contractsData: { supplierName: string; contractDate: string }[]): ContractData[] {
    return contractsData.map((contract) => {
      // Verificar se o fornecedor está registrado
      const registeredSupplier = this.registeredSuppliers.find(
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
  public getRegisteredSuppliers() {
    return [...this.registeredSuppliers]
  }

  /**
   * Adiciona um fornecedor à lista de registrados (para simulação)
   */
  public addRegisteredSupplier(supplier: {
    supplierName: string
    registrationDate: Date
    supplierType: string
    status: string
  }) {
    this.registeredSuppliers.push(supplier)
  }
}

/**
 * Função de conveniência para obter o serviço de análise de aderência
 */
export function getAdherenceAnalysisService(): AdherenceAnalysisService {
  return AdherenceAnalysisService.getInstance()
}
