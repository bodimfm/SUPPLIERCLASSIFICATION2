import { getSupabaseBrowser } from "./supabase/client"
import { v4 as uuidv4 } from "uuid"
import { calculateRiskScore, getRiskDescription, RiskAssessmentData, RiskScore } from "./risk-scoring"
import { calculateSupplierType } from "./risk-matrix"

// Definir tipos necessários que estavam anteriormente em risk-assessment.ts
export type SupplierTypeCode = 'A' | 'B' | 'C' | 'D'

export interface SupplierTypeResult {
  code: SupplierTypeCode
  description: string
}

export interface SupplierRiskAssessment {
  id: string
  supplierId: string
  assessmentDate: string
  assessedBy: string
  riskScoreData: RiskAssessmentData
  riskScoreResults: RiskScore
  supplierTypeResult: SupplierTypeResult
  recommendedActions: string[]
  nextAssessmentDate: string | null
  status: "draft" | "completed" | "under_review"
}

export interface SupplierRiskSummary {
  id: string
  name: string
  supplierType: SupplierTypeCode
  riskLevel: string
  riskScore: number
  lastAssessmentDate: string | null
  nextAssessmentDate: string | null
  status: string
}

/**
 * Serviço para gerenciar avaliações de risco de fornecedores
 */
export class RiskAssessmentService {
  private static instance: RiskAssessmentService

  private constructor() {}

  /**
   * Obtém a instância singleton do serviço
   */
  public static getInstance(): RiskAssessmentService {
    if (!RiskAssessmentService.instance) {
      RiskAssessmentService.instance = new RiskAssessmentService()
    }
    return RiskAssessmentService.instance
  }

  /**
   * Cria uma nova avaliação de risco
   */
  public async createAssessment(
    supplierId: string, 
    assessmentData: RiskAssessmentData, 
    isTechnology: boolean,
    assessedBy: string,
    status: "draft" | "completed" | "under_review" = "completed"
  ): Promise<SupplierRiskAssessment | null> {
    try {
      const riskScore = calculateRiskScore(assessmentData)
      
      // Determinar tipo de fornecedor
      let dataVolume: "low" | "medium" | "high" | "massive" = "low"
      if (assessmentData.volume === "high") dataVolume = "massive"
      else if (assessmentData.volume === "medium") dataVolume = "high"
      else if (assessmentData.volume === "low") dataVolume = "medium"
      
      let dataSensitivity: "non-sensitive" | "regular" | "sensitive" = "non-sensitive"
      if (assessmentData.dataType === "sensitive") dataSensitivity = "sensitive"
      else if (assessmentData.dataType === "common") dataSensitivity = "regular"
      
      // Parâmetros adicionais para a avaliação de risco
      const contractType = "continuous"; // valor padrão
      const supplierType = calculateSupplierType(dataVolume, dataSensitivity, contractType)
      
      // Calcular próxima data de avaliação com base no tipo
      const nextAssessmentMap: Record<SupplierTypeCode, number> = {
        'A': 6,  // Tipo A: 6 meses
        'B': 9,  // Tipo B: 9 meses
        'C': 12, // Tipo C: 12 meses
        'D': 24  // Tipo D: 24 meses
      }
      
      const today = new Date()
      const nextAssessmentDate = new Date(today)
      const typeCode = supplierType.code as SupplierTypeCode
      nextAssessmentDate.setMonth(today.getMonth() + nextAssessmentMap[typeCode])
      
      // Recomendações com base no nível de risco
      const recommendedActions = this.generateRecommendations(riskScore.riskLevel, isTechnology)
      
      const assessment: SupplierRiskAssessment = {
        id: uuidv4(),
        supplierId,
        assessmentDate: today.toISOString(),
        assessedBy,
        riskScoreData: assessmentData,
        riskScoreResults: riskScore,
        supplierTypeResult: supplierType,
        recommendedActions,
        nextAssessmentDate: nextAssessmentDate.toISOString(),
        status: status
      }
      
      // Obter cliente Supabase para browser
      const supabase = getSupabaseBrowser()
      
      // Salvar no Supabase
      const { data, error } = await supabase
        .from('supplier_assessments')
        .insert([{
          id: assessment.id,
          supplier_id: assessment.supplierId,
          assessment_date: assessment.assessmentDate,
          assessed_by: assessment.assessedBy,
          risk_score_data: assessment.riskScoreData,
          risk_score: assessment.riskScoreResults.score,
          risk_level: assessment.riskScoreResults.riskLevel,
          supplier_type: assessment.supplierTypeResult.code,
          recommended_actions: assessment.recommendedActions,
          next_assessment_date: assessment.nextAssessmentDate,
          status: assessment.status
        }])
        .select()
      
      if (error) {
        console.error("Erro ao criar avaliação de risco:", error)
        return null
      }
      
      // Atualizar fornecedor com os novos dados de classificação
      await supabase
        .from('suppliers')
        .update({
          risk_level: supplierType.code,
          risk_score: riskScore.score,
          risk_description: getRiskDescription(riskScore.riskLevel),
          supplier_type: supplierType.code,
          supplier_type_description: supplierType.description
        })
        .eq('id', supplierId)
      
      return assessment
    } catch (error) {
      console.error("Erro ao processar avaliação de risco:", error)
      return null
    }
  }

  /**
   * Obtém o histórico de avaliações de risco de um fornecedor
   */
  public async getAssessmentHistory(supplierId: string): Promise<SupplierRiskAssessment[]> {
    try {
      const supabase = getSupabaseBrowser()
      
      const { data, error } = await supabase
        .from('supplier_assessments')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('assessment_date', { ascending: false })
      
      if (error) {
        console.error(`Erro ao buscar histórico de avaliações para fornecedor ${supplierId}:`, error)
        return []
      }
      
      return data.map(item => ({
        id: item.id,
        supplierId: item.supplier_id,
        assessmentDate: item.assessment_date,
        assessedBy: item.assessed_by,
        riskScoreData: item.risk_score_data,
        riskScoreResults: {
          score: item.risk_score,
          riskLevel: item.risk_level,
          description: getRiskDescription(item.risk_level)
        },
        supplierTypeResult: {
          code: item.supplier_type,
          description: this.getTypeDescription(item.supplier_type)
        },
        recommendedActions: item.recommended_actions || [],
        nextAssessmentDate: item.next_assessment_date,
        status: item.status
      }))
    } catch (error) {
      console.error("Erro ao buscar histórico de avaliações:", error)
      return []
    }
  }

  /**
   * Obtém uma lista de fornecedores e seus resumos de risco
   */
  public async getSupplierRiskSummaries(): Promise<SupplierRiskSummary[]> {
    try {
      const supabase = getSupabaseBrowser()
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, risk_level, risk_score, supplier_type, status')
        .order('name')
      
      if (error) {
        console.error("Erro ao buscar resumos de risco dos fornecedores:", error)
        return []
      }
      
      // Buscar as datas da última avaliação para cada fornecedor
      const supplierIds = data.map(supplier => supplier.id)
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('supplier_assessments')
        .select('supplier_id, assessment_date, next_assessment_date')
        .in('supplier_id', supplierIds)
        .order('assessment_date', { ascending: false })
      
      if (assessmentsError) {
        console.error("Erro ao buscar datas de avaliação:", assessmentsError)
      }
      
      // Agrupar avaliações por fornecedor e pegar a mais recente
      const assessmentsBySupplier: Record<string, { lastDate: string | null, nextDate: string | null }> = {}
      assessmentsData?.forEach(assessment => {
        if (!assessmentsBySupplier[assessment.supplier_id]) {
          assessmentsBySupplier[assessment.supplier_id] = {
            lastDate: assessment.assessment_date,
            nextDate: assessment.next_assessment_date
          }
        }
      })
      
      return data.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        supplierType: supplier.supplier_type || 'D',
        riskLevel: supplier.risk_level || 'low',
        riskScore: supplier.risk_score || 0,
        lastAssessmentDate: assessmentsBySupplier[supplier.id]?.lastDate || null,
        nextAssessmentDate: assessmentsBySupplier[supplier.id]?.nextDate || null,
        status: supplier.status
      }))
    } catch (error) {
      console.error("Erro ao buscar resumos de risco:", error)
      return []
    }
  }

  /**
   * Obtém a lista de fornecedores que precisam de reavaliação
   */
  public async getSuppliersForReassessment(): Promise<SupplierRiskSummary[]> {
    const today = new Date().toISOString()
    
    try {
      const supabase = getSupabaseBrowser()
      
      // Buscar fornecedores que têm data de próxima avaliação anterior a hoje
      const { data, error } = await supabase
        .from('supplier_assessments')
        .select('supplier_id, next_assessment_date')
        .lt('next_assessment_date', today)
        .order('next_assessment_date')
      
      if (error) {
        console.error("Erro ao buscar fornecedores para reavaliação:", error)
        return []
      }
      
      // Deduplicate suppliers (keep only the most recent assessment)
      const supplierIds = new Set<string>()
      data.forEach(item => supplierIds.add(item.supplier_id))
      
      if (supplierIds.size === 0) return []
      
      // Buscar dados dos fornecedores
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, name, risk_level, risk_score, supplier_type, status')
        .in('id', Array.from(supplierIds))
        .order('name')
      
      if (suppliersError) {
        console.error("Erro ao buscar dados dos fornecedores para reavaliação:", suppliersError)
        return []
      }
      
      // Criar o map de datas de próxima avaliação
      const nextAssessmentDates: Record<string, string> = {}
      data.forEach(item => {
        nextAssessmentDates[item.supplier_id] = item.next_assessment_date
      })
      
      return suppliersData.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        supplierType: supplier.supplier_type || 'D',
        riskLevel: supplier.risk_level || 'low',
        riskScore: supplier.risk_score || 0,
        lastAssessmentDate: null, // Não é necessário para esta listagem
        nextAssessmentDate: nextAssessmentDates[supplier.id],
        status: supplier.status
      }))
    } catch (error) {
      console.error("Erro ao buscar fornecedores para reavaliação:", error)
      return []
    }
  }

  /**
   * Obtém a descrição do tipo de fornecedor a partir do código
   */
  private getTypeDescription(typeCode: SupplierTypeCode): string {
    const descriptions: Record<SupplierTypeCode, string> = {
      A: "CRÍTICO",
      B: "SIGNIFICATIVO",
      C: "MODERADO",
      D: "BÁSICO",
    }
    return descriptions[typeCode] || "Não classificado"
  }

  /**
   * Gera recomendações com base no nível de risco
   */
  private generateRecommendations(riskLevel: string, isTechnology: boolean): string[] {
    const baseRecommendations: Record<string, string[]> = {
      low: [
        "Incluir cláusulas básicas de privacidade no contrato",
        "Solicitar política de privacidade do fornecedor",
        "Realizar reavaliação a cada 24 meses"
      ],
      medium: [
        "Incluir cláusulas detalhadas de privacidade no contrato",
        "Solicitar política de privacidade e contatos do DPO",
        "Solicitar procedimentos de manuseio de dados",
        "Realizar reavaliação a cada 12 meses"
      ],
      high: [
        "Incluir cláusulas extensas de privacidade e segurança no contrato",
        "Realizar due diligence detalhada antes da contratação",
        "Solicitar evidências de controles de segurança",
        "Solicitar lista de subcontratados",
        "Estabelecer processo de monitoramento periódico",
        "Realizar reavaliação a cada 9 meses"
      ],
      critical: [
        "Obter aprovação específica do DPO antes da contratação",
        "Incluir cláusulas robustas de privacidade, segurança e auditoria no contrato",
        "Realizar auditoria completa de privacidade e segurança",
        "Solicitar certificações de segurança (ISO 27001, ISO 27701)",
        "Exigir DPIA (Relatório de Impacto à Proteção de Dados)",
        "Estabelecer processo de monitoramento constante",
        "Implementar plano de contingência para eventual substituição",
        "Realizar reavaliação a cada 6 meses"
      ]
    }
    
    const techRecommendations: Record<string, string[]> = {
      low: [
        "Verificar controles básicos de acesso e autenticação"
      ],
      medium: [
        "Verificar controles de acesso, autenticação e criptografia",
        "Solicitar documentação sobre procedimentos de backup"
      ],
      high: [
        "Verificar controles avançados de segurança e criptografia",
        "Solicitar detalhes sobre armazenamento, backup e restauração",
        "Solicitar informações sobre procedimentos de exclusão de dados"
      ],
      critical: [
        "Verificar todos os controles técnicos de segurança",
        "Solicitar detalhes sobre procedimentos de logging e monitoramento",
        "Exigir testes de penetração regulares",
        "Considerar realização de auditoria técnica independente",
        "Exigir plano de continuidade de negócios e recuperação de desastres"
      ]
    }
    
    let recommendations = [...baseRecommendations[riskLevel] || []]
    
    if (isTechnology) {
      recommendations = [...recommendations, ...techRecommendations[riskLevel] || []]
    }
    
    return recommendations
  }
}

export function getRiskAssessmentService(): RiskAssessmentService {
  return RiskAssessmentService.getInstance()
}