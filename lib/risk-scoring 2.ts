// Tipos para o sistema de pontuação
export type DataType = "none" | "common" | "sensitive"
export type VolumeType = "low" | "medium" | "high"
export type CriticalityType = "critical" | "non-critical"
export type PolicyType = "yes" | "no" | "unknown"
export type CertificationType = "yes" | "no" | "unknown"
export type SubcontractingType = "none" | "identified" | "unknown"
export type IncidentType = "none" | "resolved" | "unresolved"

export interface RiskAssessmentData {
  dataType: DataType
  volume: VolumeType
  criticality: CriticalityType
  policy: PolicyType
  certification: CertificationType
  subcontracting: SubcontractingType
  incidents: IncidentType
}

export interface RiskScore {
  score: number
  riskLevel: "low" | "medium" | "high" | "critical"
  description: string
}

// Pontuação para cada resposta
const SCORE_MAP = {
  dataType: {
    none: 0,
    common: 20,
    sensitive: 40,
  },
  volume: {
    low: 5,
    medium: 20,
    high: 35,
  },
  criticality: {
    critical: 30,
    "non-critical": 0,
  },
  policy: {
    yes: -10,
    no: 20,
    unknown: 10,
  },
  certification: {
    yes: -15,
    no: 10,
    unknown: 10,
  },
  subcontracting: {
    none: 0,
    identified: 10,
    unknown: 20,
  },
  incidents: {
    none: 0,
    resolved: 10,
    unresolved: 30,
  },
}

// Função para calcular a pontuação de risco
export function calculateRiskScore(data: RiskAssessmentData): RiskScore {
  let score = 0

  // Somar pontos para cada critério
  score += SCORE_MAP.dataType[data.dataType]
  score += SCORE_MAP.volume[data.volume]
  score += SCORE_MAP.criticality[data.criticality]
  score += SCORE_MAP.policy[data.policy]
  score += SCORE_MAP.certification[data.certification]
  score += SCORE_MAP.subcontracting[data.subcontracting]
  score += SCORE_MAP.incidents[data.incidents]

  // Determinar o nível de risco com base na pontuação
  let riskLevel: "low" | "medium" | "high" | "critical"
  let description: string

  if (score <= 30) {
    riskLevel = "low"
    description = "Risco Baixo"
  } else if (score <= 60) {
    riskLevel = "medium"
    description = "Risco Médio"
  } else if (score <= 90) {
    riskLevel = "high"
    description = "Risco Alto"
  } else {
    riskLevel = "critical"
    description = "Risco Crítico"
  }

  return {
    score,
    riskLevel,
    description,
  }
}

// Função para obter a cor correspondente ao nível de risco
export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "low":
      return "bg-green-500"
    case "medium":
      return "bg-yellow-500"
    case "high":
      return "bg-orange-500"
    case "critical":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

// Função para obter a descrição detalhada do nível de risco
export function getRiskDescription(riskLevel: string): string {
  switch (riskLevel) {
    case "low":
      return "Fornecedor de baixo risco. Requer controles básicos de privacidade."
    case "medium":
      return "Fornecedor de risco médio. Requer controles moderados e revisão periódica."
    case "high":
      return "Fornecedor de alto risco. Requer controles rigorosos, cláusulas contratuais específicas e monitoramento frequente."
    case "critical":
      return "Fornecedor de risco crítico. Requer avaliação detalhada pelo DPO, controles rigorosos, cláusulas contratuais específicas e monitoramento constante."
    default:
      return "Classificação de risco não determinada."
  }
}
