// Tipos de fornecedor com base na matriz de risco
export type DataVolume = "low" | "medium" | "high" | "massive"
export type DataSensitivity = "non-sensitive" | "regular" | "sensitive"
export type SupplierTypeCode = "A" | "B" | "C" | "D"

export interface SupplierTypeResult {
  code: SupplierTypeCode
  description: string
}

export interface DocumentRequirement {
  id: string
  name: string
  required: boolean
}

// Cores para os níveis de risco
export const riskLevelColor: Record<SupplierTypeCode, string> = {
  A: "bg-red-500",
  B: "bg-orange-500",
  C: "bg-yellow-500",
  D: "bg-green-500",
}

// Função para calcular o tipo de fornecedor com base na matriz de risco
export function calculateSupplierType(dataVolume: DataVolume, dataSensitivity: DataSensitivity): SupplierTypeResult {
  // Matriz de classificação conforme documento
  const riskMatrix: Record<DataVolume, Record<DataSensitivity, SupplierTypeCode>> = {
    low: {
      "non-sensitive": "D",
      regular: "D",
      sensitive: "C",
    },
    medium: {
      "non-sensitive": "D",
      regular: "C",
      sensitive: "B",
    },
    high: {
      "non-sensitive": "C",
      regular: "C",
      sensitive: "B",
    },
    massive: {
      "non-sensitive": "C",
      regular: "B",
      sensitive: "A",
    },
  }

  const supplierType = riskMatrix[dataVolume][dataSensitivity]

  // Mapeamento para descrições
  const typeDescriptions: Record<SupplierTypeCode, string> = {
    A: "CRÍTICO",
    B: "SIGNIFICATIVO",
    C: "MODERADO",
    D: "BÁSICO",
  }

  return {
    code: supplierType,
    description: typeDescriptions[supplierType],
  }
}

// Função para determinar os requisitos documentais com base na classificação
export function getRequiredDocuments(supplierType: SupplierTypeCode, isTechnology: boolean): DocumentRequirement[] {
  // Lista base de documentos para todos os fornecedores
  const baseDocuments: DocumentRequirement[] = [
    { id: "privacy_policy", name: "Política de Privacidade e Proteção de Dados", required: true },
    { id: "dpo_appointment", name: "Nomeação de DPO/Encarregado", required: true },
    { id: "processing_records", name: "Registro das Operações de Tratamento (Art. 37 LGPD)", required: false },
  ]

  // Documentos adicionais baseados no tipo
  const additionalDocuments: Record<SupplierTypeCode, DocumentRequirement[]> = {
    A: [
      // Crítico
      { id: "incident_response", name: "Procedimentos de Resposta a Incidentes", required: true },
      {
        id: "security_certifications",
        name: "Certificações de Segurança (ISO 27001, ISO 27701, SOC 2)",
        required: true,
      },
      { id: "dpia", name: "Relatório de Impacto à Proteção de Dados (DPIA)", required: true },
      { id: "data_mapping", name: "Mapeamento de Dados Detalhado", required: true },
      { id: "subcontractors_list", name: "Lista de Subcontratados e Controles", required: true },
      { id: "security_controls", name: "Evidências de Controles de Segurança", required: true },
      { id: "awareness_program", name: "Programa de Conscientização em Privacidade", required: true },
    ],
    B: [
      // Significativo
      { id: "incident_response", name: "Procedimentos de Resposta a Incidentes", required: true },
      { id: "security_certifications", name: "Certificações de Segurança (opcional ISO 27001)", required: false },
      { id: "data_mapping", name: "Mapeamento de Dados", required: true },
      { id: "subcontractors_list", name: "Lista de Subcontratados", required: true },
      { id: "security_controls", name: "Descrição de Controles de Segurança", required: true },
    ],
    C: [
      // Moderado
      { id: "incident_response", name: "Procedimentos de Resposta a Incidentes", required: false },
      { id: "subcontractors_list", name: "Lista de Subcontratados (se houver)", required: false },
      { id: "data_handling", name: "Procedimentos de Manuseio de Dados", required: true },
    ],
    D: [
      // Básico
      { id: "confidentiality_terms", name: "Termos de Confidencialidade", required: true },
    ],
  }

  // Documentos específicos para fornecedores de TI/SaaS
  const techDocuments: DocumentRequirement[] = [
    { id: "tech_access_controls", name: "Controles de Acesso Implementados", required: true },
    { id: "tech_encryption", name: "Métodos de Criptografia Utilizados", required: true },
    { id: "tech_logging", name: "Procedimentos de Logging e Monitoramento", required: true },
  ]

  let requiredDocs = [...baseDocuments]

  // Adicionar documentos específicos do tipo
  if (additionalDocuments[supplierType]) {
    requiredDocs = [...requiredDocs, ...additionalDocuments[supplierType]]
  }

  // Adicionar documentos de TI se aplicável
  if (isTechnology) {
    requiredDocs = [...requiredDocs, ...techDocuments]
  }

  return requiredDocs
}

