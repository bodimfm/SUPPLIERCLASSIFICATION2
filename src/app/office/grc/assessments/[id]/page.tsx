"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, CheckCircle, XCircle, Clock, Loader2, FileText, Save, AlertTriangle, Shield, Key, Lock, Globe, CheckSquare, Award } from "lucide-react"

// GRC Assessment Type
interface GRCAssessment {
  id: string
  supplier_id: string
  created_at: string
  updated_at: string
  status: "draft" | "submitted" | "in_review" | "approved" | "rejected"
  
  // Informações Gerais do Fornecedor
  company_name: string
  trade_name: string | null
  cnpj: string | null
  contact_email: string | null
  
  // Governança de Proteção de Dados
  has_dpo: boolean
  has_privacy_policy: boolean
  governance_program: "yes" | "partial" | "no" | null
  
  // Dados Tratados & Bases Legais
  data_types: string[] 
  has_sensitive_data: boolean
  legal_bases: string[]
  
  // Segurança da Informação
  encryption_at_rest: boolean
  encryption_in_transit: boolean
  uses_mfa: boolean
  logs_retention: "yes_over_year" | "yes_6_12" | "yes_under_6" | "no" | null
  recent_pentest: boolean
  security_frameworks: string[]
  
  // Gestão de Incidentes & Continuidade
  has_incident_response: boolean
  report_timeframe: "under_12h" | "under_24h" | "under_48h" | "over_48h" | null
  tests_drp: boolean
  
  // Subcontratados & Cadeia de Suprimento
  uses_subprocessors: boolean
  evaluates_subprocessors: "always" | "sometimes" | "never" | null
  subprocessor_contracts: boolean
  
  // Direitos dos Titulares
  has_subject_rights_channel: boolean
  response_timeframe_days: number
  
  // Transferências Internacionais
  transfers_data_abroad: boolean
  transfer_mechanisms: string[]
  
  // Conformidade & Certificações
  certifications: string[]
  has_external_audits: boolean
  had_violations: boolean
  
  // Risco & Monitoramento Contínuo
  performs_risk_assessment: boolean
  security_kpis: string | null
  agrees_to_audits: boolean
  
  // Avaliação e Comentários
  total_score: number | null
  risk_level: "low" | "medium" | "high" | "critical" | null
  reviewer_comments: string | null
  reviewed_at: string | null
  reviewer: string | null
}

interface Supplier {
  id: string
  name: string
  cnpj: string | null
  supplier_type: string
  risk_level: string
  status: string
}

export default function GRCAssessmentDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { edit?: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [assessment, setAssessment] = useState<GRCAssessment | null>(null)
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reviewerComments, setReviewerComments] = useState("")
  const [reviewer, setReviewer] = useState("")
  const [adjustedRiskLevel, setAdjustedRiskLevel] = useState<string | null>(null)
  const [totalScore, setTotalScore] = useState<number | null>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false)
  const [actionInProgress, setActionInProgress] = useState(false)
  const [editMode, setEditMode] = useState(false)
  
  // Verificar se está em modo de edição
  useEffect(() => {
    if (searchParams.edit === "true") {
      setEditMode(true);
    }
  }, [searchParams.edit]);

  // Carregar os dados da avaliação
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setLoading(true)
        
        // Exemplo de dados para testes - remover quando a API estiver funcionando
        // Mock data para desenvolvimento
        const mockData: GRCAssessment = {
          id: params.id,
          supplier_id: "supplier-123",
          created_at: "2025-04-20T10:30:00Z",
          updated_at: "2025-04-20T15:45:00Z",
          status: "in_review",
          company_name: "Acme Technology",
          trade_name: "Acme Tech",
          cnpj: "12.345.678/0001-90",
          contact_email: "contato@acmetech.com.br",
          has_dpo: true,
          has_privacy_policy: true,
          governance_program: "partial",
          data_types: ["Dados cadastrais", "Dados financeiros", "Dados de localização"],
          has_sensitive_data: false,
          legal_bases: ["Consentimento", "Legítimo interesse", "Obrigação legal"],
          encryption_at_rest: true,
          encryption_in_transit: true,
          uses_mfa: true,
          logs_retention: "yes_over_year",
          recent_pentest: true,
          security_frameworks: ["ISO 27001", "NIST"],
          has_incident_response: true,
          report_timeframe: "under_24h",
          tests_drp: true,
          uses_subprocessors: true,
          evaluates_subprocessors: "sometimes",
          subprocessor_contracts: true,
          has_subject_rights_channel: true,
          response_timeframe_days: 10,
          transfers_data_abroad: false,
          transfer_mechanisms: [],
          certifications: ["ISO 27001", "SOC 2"],
          has_external_audits: true,
          had_violations: false,
          performs_risk_assessment: true,
          security_kpis: "Monitoramento mensal de incidentes de segurança e tempo de resposta",
          agrees_to_audits: true,
          total_score: 78,
          risk_level: "low",
          reviewer_comments: "Fornecedor com boas práticas de segurança e conformidade",
          reviewed_at: "2025-04-21T09:15:00Z",
          reviewer: "Maria Silva"
        };
        
        // Carregar dados da avaliação GRC - comentar temporariamente para usar o mock acima
        /*
        const assessmentResponse = await fetch(`/api/grc-assessments/${params.id}`)
        if (!assessmentResponse.ok) throw new Error("Falha ao carregar dados da avaliação GRC")
        
        const assessmentData = await assessmentResponse.json()
        */
        
        // Usar os dados mockados
        const assessmentData = mockData;
        
        if (assessmentData) {
          setAssessment(assessmentData)
          
          // Inicializar campos do revisor com valores existentes
          setReviewerComments(assessmentData.reviewer_comments || "")
          setReviewer(assessmentData.reviewer || "")
          setAdjustedRiskLevel(assessmentData.risk_level || null)
          setTotalScore(assessmentData.total_score || calculateScore(assessmentData))
          
          // Carregar dados do fornecedor - usar dados mockados para teste
          const mockSupplier = {
            id: "supplier-123",
            name: "Acme Technology",
            cnpj: "12.345.678/0001-90",
            supplier_type: "B",
            risk_level: assessmentData.risk_level || "medium",
            status: "in_review"
          };
          
          setSupplier(mockSupplier);
          
          // Código original para carregar dados do fornecedor - descomentado quando a API estiver pronta
          /*
          if (assessmentData.supplier_id) {
            const supplierResponse = await fetch(`/api/suppliers?id=${assessmentData.supplier_id}`)
            if (supplierResponse.ok) {
              const supplierData = await supplierResponse.json()
              if (supplierData && supplierData.length > 0) {
                setSupplier(supplierData[0])
              }
            }
          }
          */
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da avaliação GRC",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAssessmentData()
  }, [params.id, toast])

  // Calcular pontuação com base nas respostas
  const calculateScore = (assessment: GRCAssessment): number => {
    if (!assessment) return 0
    
    let score = 0
    
    // Governança de Proteção de Dados (0-20 pontos)
    if (assessment.has_dpo) score += 6
    if (assessment.has_privacy_policy) score += 6
    if (assessment.governance_program === "yes") score += 8
    else if (assessment.governance_program === "partial") score += 4
    
    // Segurança da Informação (0-25 pontos)
    if (assessment.encryption_at_rest) score += 5
    if (assessment.encryption_in_transit) score += 5
    if (assessment.uses_mfa) score += 5
    if (assessment.logs_retention === "yes_over_year") score += 5
    else if (assessment.logs_retention === "yes_6_12") score += 3
    else if (assessment.logs_retention === "yes_under_6") score += 2
    if (assessment.recent_pentest) score += 5
    
    // Gestão de Incidentes & Continuidade (0-15 pontos)
    if (assessment.has_incident_response) score += 5
    if (assessment.report_timeframe === "under_12h") score += 5
    else if (assessment.report_timeframe === "under_24h") score += 3
    else if (assessment.report_timeframe === "under_48h") score += 1
    if (assessment.tests_drp) score += 5
    
    // Subcontratados (0-10 pontos)
    if (!assessment.uses_subprocessors) score += 5
    else {
      if (assessment.evaluates_subprocessors === "always") score += 3
      else if (assessment.evaluates_subprocessors === "sometimes") score += 1
      if (assessment.subprocessor_contracts) score += 2
    }
    
    // Direitos dos Titulares (0-10 pontos)
    if (assessment.has_subject_rights_channel) score += 5
    if (assessment.response_timeframe_days <= 5) score += 5
    else if (assessment.response_timeframe_days <= 10) score += 3
    else if (assessment.response_timeframe_days <= 15) score += 1
    
    // Transferências Internacionais (0-5 pontos)
    if (!assessment.transfers_data_abroad) score += 5
    else if (assessment.transfer_mechanisms && assessment.transfer_mechanisms.length > 0) score += 3
    
    // Conformidade & Certificações (0-10 pontos)
    if (assessment.certifications && assessment.certifications.length > 0) score += 4
    if (assessment.has_external_audits) score += 4
    if (!assessment.had_violations) score += 2
    
    // Risco & Monitoramento (0-5 pontos)
    if (assessment.performs_risk_assessment) score += 2
    if (assessment.security_kpis) score += 1
    if (assessment.agrees_to_audits) score += 2
    
    return score
  }

  // Determinar nível de risco com base na pontuação
  const determineRiskLevel = (score: number): "low" | "medium" | "high" | "critical" => {
    if (score >= 75) return "low"
    if (score >= 50) return "medium"
    if (score >= 30) return "high"
    return "critical"
  }

  // Função para salvar comentários e análise do revisor
  const saveReview = async () => {
    if (!assessment) return
    
    try {
      setSaving(true)
      
      const calculatedScore = totalScore || calculateScore(assessment)
      const calculatedRiskLevel = adjustedRiskLevel || determineRiskLevel(calculatedScore)
      
      const updateData = {
        reviewer_comments: reviewerComments,
        reviewer: reviewer,
        risk_level: calculatedRiskLevel as "low" | "medium" | "high" | "critical",
        total_score: calculatedScore,
        reviewed_at: new Date().toISOString(),
        status: (assessment.status === "submitted" || assessment.status === "draft" ? "in_review" : assessment.status) as "draft" | "submitted" | "in_review" | "approved" | "rejected"
      }
      
      // Código comentado para fins de demonstração - ativar quando a API estiver disponível
      /*
      const response = await fetch(`/api/grc-assessments/${assessment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) throw new Error("Falha ao salvar revisão")
      */
      
      // Simular uma requisição bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Análise salva",
        description: "Sua revisão foi salva com sucesso",
      })
      
      // Atualizar dados locais
      setAssessment(prev => prev ? {...prev, ...updateData} : null)
      
      // Desativar modo de edição após salvar
      if (editMode) {
        setEditMode(false);
        router.push(`/office/grc/assessments/${assessment.id}`);
      }
      
    } catch (error) {
      console.error("Erro ao salvar revisão:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a revisão",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Função para editar a avaliação
  const startEdit = () => {
    setEditMode(true);
    router.push(`/office/grc/assessments/${params.id}?edit=true`);
  }

  // Função para aprovar a avaliação
  const approveAssessment = async () => {
    if (!assessment) return
    
    try {
      setActionInProgress(true)
      
      const calculatedScore = totalScore || calculateScore(assessment)
      const calculatedRiskLevel = adjustedRiskLevel || determineRiskLevel(calculatedScore)
      
      const updateData = {
        status: "approved" as "draft" | "submitted" | "in_review" | "approved" | "rejected",
        reviewer: reviewer || "Escritório terceirizado",
        reviewed_at: new Date().toISOString(),
        reviewer_comments: reviewerComments || "Avaliação aprovada pelo escritório terceirizado",
        total_score: calculatedScore,
        risk_level: calculatedRiskLevel as "low" | "medium" | "high" | "critical"
      }
      
      // Código a ser descomentado quando a API estiver pronta
      /*
      const response = await fetch(`/api/grc-assessments/${assessment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) throw new Error("Falha ao aprovar avaliação")
      
      // Atualizar o status do fornecedor também
      if (supplier) {
        const supplierResponse = await fetch(`/api/suppliers/${supplier.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: "approved",
            risk_level: calculatedRiskLevel
          }),
        })
        
        if (!supplierResponse.ok) {
          console.warn("Aviso: Avaliação aprovada, mas o status do fornecedor não foi atualizado")
        }
      }
      */
      
      // Simular uma requisição bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Avaliação aprovada",
        description: "A avaliação foi aprovada com sucesso",
      })
      
      // Atualizar dados locais
      setAssessment(prev => prev ? {...prev, ...updateData} : null)
      
      // Atualizar fornecedor local
      if (supplier) {
        setSupplier(prev => prev ? {...prev, status: "approved", risk_level: calculatedRiskLevel} : null)
      }
      
    } catch (error) {
      console.error("Erro ao aprovar avaliação:", error)
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a avaliação",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(false)
      setIsApprovalDialogOpen(false)
    }
  }

  // Função para rejeitar a avaliação
  const rejectAssessment = async () => {
    if (!assessment) return
    
    try {
      setActionInProgress(true)
      
      if (!reviewerComments) {
        toast({
          title: "Comentários necessários",
          description: "É necessário fornecer comentários para rejeitar a avaliação",
          variant: "destructive",
        })
        setActionInProgress(false)
        return
      }
      
      const updateData = {
        status: "rejected" as "draft" | "submitted" | "in_review" | "approved" | "rejected",
        reviewer: reviewer || "Escritório terceirizado",
        reviewed_at: new Date().toISOString(),
        reviewer_comments: reviewerComments,
        risk_level: "critical" as "low" | "medium" | "high" | "critical"
      }
      
      // Código a ser descomentado quando a API estiver pronta
      /*
      const response = await fetch(`/api/grc-assessments/${assessment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) throw new Error("Falha ao rejeitar avaliação")
      
      // Atualizar o status do fornecedor também
      if (supplier) {
        const supplierResponse = await fetch(`/api/suppliers/${supplier.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: "rejected",
            risk_level: "critical"
          }),
        })
        
        if (!supplierResponse.ok) {
          console.warn("Aviso: Avaliação rejeitada, mas o status do fornecedor não foi atualizado")
        }
      }
      */
      
      // Simular uma requisição bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Avaliação rejeitada",
        description: "A avaliação foi rejeitada com sucesso",
      })
      
      // Atualizar dados locais
      setAssessment(prev => prev ? {...prev, ...updateData} : null)
      
      // Atualizar fornecedor local
      if (supplier) {
        setSupplier(prev => prev ? {...prev, status: "rejected", risk_level: "critical"} : null)
      }
      
    } catch (error) {
      console.error("Erro ao rejeitar avaliação:", error)
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a avaliação",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(false)
      setIsRejectionDialogOpen(false)
    }
  }

  // Função para renderizar o status
  function getStatusBadge(status: string) {
    switch(status) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-100">Rascunho</Badge>
      case "submitted":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Enviado</Badge>
      case "in_review":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Em análise</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Aprovado</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeitado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Renderizar o badge de nível de risco com a cor apropriada
  const renderRiskLevelBadge = (riskLevel: string | null) => {
    if (!riskLevel) {
      return <Badge variant="outline">Não avaliado</Badge>
    }
    
    let color = ""
    let label = ""
    
    switch (riskLevel) {
      case "low":
        color = "bg-green-100 text-green-800"
        label = "Baixo"
        break
      case "medium":
        color = "bg-yellow-100 text-yellow-800"
        label = "Médio"
        break
      case "high":
        color = "bg-orange-100 text-orange-800"
        label = "Alto"
        break
      case "critical":
        color = "bg-red-100 text-red-800"
        label = "Crítico"
        break
    }
    
    return (
      <Badge variant="outline" className={color}>
        {label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-600">Carregando dados da avaliação GRC...</p>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Avaliação GRC não encontrada</h2>
          <p className="text-red-700 mb-4">
            Não foi possível encontrar os dados da avaliação solicitada.
          </p>
          <Button onClick={() => router.push('/office/grc/dashboard')}>
            Voltar para o Dashboard GRC
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4" 
          onClick={() => router.push('/office/grc/assessments')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para Avaliações
        </Button>
        <h1 className="text-3xl font-bold flex-1">
          Avaliação GRC de Fornecedor
        </h1>
        {getStatusBadge(assessment.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Fornecedor</CardTitle>
            <CardDescription>
              Detalhes do fornecedor e da avaliação de conformidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{assessment.company_name}</h3>
                {assessment.trade_name && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Nome fantasia:</span> {assessment.trade_name}
                  </p>
                )}
                {assessment.cnpj && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">CNPJ:</span> {assessment.cnpj}
                  </p>
                )}
                {assessment.contact_email && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Email de contato:</span> {assessment.contact_email}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Data de submissão:</span> {' '}
                  {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-medium text-sm">Pontuação total:</div>
                  <div className="flex-1"></div>
                  <div className="text-xl font-bold">
                    {assessment.total_score || totalScore || 0}/100
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-medium text-sm">Nível de risco:</div>
                  <div className="flex-1"></div>
                  <div>
                    {renderRiskLevelBadge(assessment.risk_level || (totalScore ? determineRiskLevel(totalScore) : null))}
                  </div>
                </div>
                {assessment.reviewed_at && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Última análise:</span> {' '}
                    {new Date(assessment.reviewed_at).toLocaleDateString('pt-BR')}
                    {assessment.reviewer && ` por ${assessment.reviewer}`}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span> {' '}
                  {assessment.status === "draft" ? "Rascunho" :
                   assessment.status === "submitted" ? "Enviado" :
                   assessment.status === "in_review" ? "Em análise" :
                   assessment.status === "approved" ? "Aprovado" :
                   assessment.status === "rejected" ? "Rejeitado" : assessment.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>
              Gerencie o status desta avaliação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(assessment.status === "submitted" || assessment.status === "in_review") ? (
                <>
                  <Button 
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setIsApprovalDialogOpen(true)} 
                    disabled={saving || actionInProgress}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprovar Avaliação
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => setIsRejectionDialogOpen(true)}
                    disabled={saving || actionInProgress}
                  >
                    <XCircle className="h-4 w-4" />
                    Rejeitar Avaliação
                  </Button>
                </>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600 text-sm">
                    Esta avaliação já foi {assessment.status === "approved" ? "aprovada" : 
                                          assessment.status === "rejected" ? "rejeitada" : 
                                          "processada"}.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="governance">Governança</TabsTrigger>
          <TabsTrigger value="security">Segurança da Informação</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
          <TabsTrigger value="review">Análise de Risco</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Avaliação</CardTitle>
              <CardDescription>
                Visão geral dos resultados da avaliação GRC do fornecedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-blue-50 p-3 font-medium text-blue-800 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Governança de Proteção de Dados
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Possui encarregado de dados (DPO)</span>
                        <Badge variant={assessment.has_dpo ? "default" : "destructive"}>
                          {assessment.has_dpo ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Política de privacidade</span>
                        <Badge variant={assessment.has_privacy_policy ? "default" : "destructive"}>
                          {assessment.has_privacy_policy ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Programa de governança</span>
                        <Badge variant={assessment.governance_program === "yes" ? "default" : 
                                      assessment.governance_program === "partial" ? "outline" : "destructive"}>
                          {assessment.governance_program === "yes" ? "Completo" : 
                           assessment.governance_program === "partial" ? "Parcial" : "Não possui"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-yellow-50 p-3 font-medium text-yellow-800 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Segurança da Informação
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Criptografia em repouso</span>
                        <Badge variant={assessment.encryption_at_rest ? "default" : "destructive"}>
                          {assessment.encryption_at_rest ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Criptografia em trânsito</span>
                        <Badge variant={assessment.encryption_in_transit ? "default" : "destructive"}>
                          {assessment.encryption_in_transit ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Autenticação de múltiplos fatores</span>
                        <Badge variant={assessment.uses_mfa ? "default" : "destructive"}>
                          {assessment.uses_mfa ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Teste de penetração recente</span>
                        <Badge variant={assessment.recent_pentest ? "default" : "destructive"}>
                          {assessment.recent_pentest ? "Sim" : "Não"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-purple-50 p-3 font-medium text-purple-800 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Transferências Internacionais
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Transfere dados para o exterior</span>
                        <Badge variant={!assessment.transfers_data_abroad ? "default" : "outline"}>
                          {assessment.transfers_data_abroad ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      {assessment.transfers_data_abroad && (
                        <div>
                          <span className="text-sm font-medium">Mecanismos utilizados:</span>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {assessment.transfer_mechanisms && assessment.transfer_mechanisms.length > 0 ? (
                              assessment.transfer_mechanisms.map((mechanism, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {mechanism}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-red-500">Nenhum mecanismo informado</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-green-50 p-3 font-medium text-green-800 flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Conformidade & Certificações
                    </div>
                    <div className="p-4 space-y-2">
                      <div>
                        <span className="text-sm font-medium">Certificações:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {assessment.certifications && assessment.certifications.length > 0 ? (
                            assessment.certifications.map((cert, index) => (
                              <Badge key={index} variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                {cert}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">Nenhuma certificação informada</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">Auditorias externas</span>
                        <Badge variant={assessment.has_external_audits ? "default" : "destructive"}>
                          {assessment.has_external_audits ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Histórico de incidentes/violações</span>
                        <Badge variant={!assessment.had_violations ? "default" : "destructive"}>
                          {assessment.had_violations ? "Sim" : "Não"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-orange-50 p-3 font-medium text-orange-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Gestão de Incidentes
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Plano de resposta a incidentes</span>
                        <Badge variant={assessment.has_incident_response ? "default" : "destructive"}>
                          {assessment.has_incident_response ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Prazo para comunicação</span>
                        <Badge variant={assessment.report_timeframe === "under_12h" || assessment.report_timeframe === "under_24h" ? "default" : "destructive"}>
                          {assessment.report_timeframe === "under_12h" ? "Menos de 12h" :
                           assessment.report_timeframe === "under_24h" ? "Menos de 24h" :
                           assessment.report_timeframe === "under_48h" ? "Menos de 48h" : "Mais de 48h"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Testes do plano de recuperação</span>
                        <Badge variant={assessment.tests_drp ? "default" : "destructive"}>
                          {assessment.tests_drp ? "Sim" : "Não"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-red-50 p-3 font-medium text-red-800 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Dados e Bases Legais
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Trata dados sensíveis</span>
                        <Badge variant={!assessment.has_sensitive_data ? "default" : "outline"}>
                          {assessment.has_sensitive_data ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Tipos de dados tratados:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {assessment.data_types && assessment.data_types.length > 0 ? (
                            assessment.data_types.map((type, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">Nenhum tipo informado</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Bases legais utilizadas:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {assessment.legal_bases && assessment.legal_bases.length > 0 ? (
                            assessment.legal_bases.map((base, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {base}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">Nenhuma base legal informada</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="governance">
          <Card>
            <CardHeader>
              <CardTitle>Governança de Proteção de Dados</CardTitle>
              <CardDescription>
                Análise da estrutura de governança do fornecedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-4">Estrutura de Governança</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Possui Encarregado (DPO)</label>
                        <Switch checked={assessment.has_dpo} disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Política de Privacidade</label>
                        <Switch checked={assessment.has_privacy_policy} disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">Programa de Governança</label>
                        <Select value={assessment.governance_program || ""} disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Programa completo</SelectItem>
                            <SelectItem value="partial">Programa parcial</SelectItem>
                            <SelectItem value="no">Não possui</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-4">Direitos dos Titulares</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Canal para exercício de direitos</label>
                        <Switch checked={assessment.has_subject_rights_channel} disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">Prazo de resposta (em dias)</label>
                        <Input 
                          type="number" 
                          value={assessment.response_timeframe_days || 0} 
                          disabled 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Dados Tratados & Bases Legais</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Trata dados sensíveis</label>
                      <Switch checked={assessment.has_sensitive_data} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Tipos de dados tratados</label>
                      <div className="flex flex-wrap gap-2 border rounded-md p-3 bg-gray-50">
                        {assessment.data_types && assessment.data_types.length > 0 ? (
                          assessment.data_types.map((type, index) => (
                            <Badge key={index} variant="secondary">
                              {type}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Nenhum tipo informado</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Bases legais utilizadas</label>
                      <div className="flex flex-wrap gap-2 border rounded-md p-3 bg-gray-50">
                        {assessment.legal_bases && assessment.legal_bases.length > 0 ? (
                          assessment.legal_bases.map((base, index) => (
                            <Badge key={index} variant="secondary">
                              {base}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Nenhuma base legal informada</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Subcontratados & Cadeia de Suprimento</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Utiliza subcontratados como operadores</label>
                      <Switch checked={assessment.uses_subprocessors} disabled />
                    </div>
                    {assessment.uses_subprocessors && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm">Frequência de avaliação dos subcontratados</label>
                          <Select value={assessment.evaluates_subprocessors || ""} disabled>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma opção" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="always">Sempre</SelectItem>
                              <SelectItem value="sometimes">Às vezes</SelectItem>
                              <SelectItem value="never">Nunca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Contratos com cláusulas de proteção de dados</label>
                          <Switch checked={assessment.subprocessor_contracts} disabled />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Informação</CardTitle>
              <CardDescription>
                Análise dos controles de segurança implementados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-4">Controles Técnicos</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Criptografia de dados em repouso</label>
                        <Switch checked={assessment.encryption_at_rest} disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Criptografia de dados em trânsito</label>
                        <Switch checked={assessment.encryption_in_transit} disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Autenticação de múltiplos fatores</label>
                        <Switch checked={assessment.uses_mfa} disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">Retenção de logs</label>
                        <Select value={assessment.logs_retention || ""} disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes_over_year">Mais de 1 ano</SelectItem>
                            <SelectItem value="yes_6_12">Entre 6 e 12 meses</SelectItem>
                            <SelectItem value="yes_under_6">Menos de 6 meses</SelectItem>
                            <SelectItem value="no">Não mantém logs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Pentest realizado nos últimos 12 meses</label>
                        <Switch checked={assessment.recent_pentest} disabled />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-4">Gestão de Incidentes & Continuidade</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Plano de resposta a incidentes</label>
                        <Switch checked={assessment.has_incident_response} disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">Prazo para comunicação de incidentes</label>
                        <Select value={assessment.report_timeframe || ""} disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under_12h">Menos de 12 horas</SelectItem>
                            <SelectItem value="under_24h">Menos de 24 horas</SelectItem>
                            <SelectItem value="under_48h">Menos de 48 horas</SelectItem>
                            <SelectItem value="over_48h">Mais de 48 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Testes periódicos do plano de recuperação</label>
                        <Switch checked={assessment.tests_drp} disabled />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Frameworks de Segurança</h3>
                  <div className="space-y-2">
                    <label className="text-sm">Frameworks implementados</label>
                    <div className="flex flex-wrap gap-2 border rounded-md p-3 bg-gray-50">
                      {assessment.security_frameworks && assessment.security_frameworks.length > 0 ? (
                        assessment.security_frameworks.map((framework, index) => (
                          <Badge key={index} variant="secondary">
                            {framework}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Nenhum framework informado</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Monitoramento Contínuo</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Realiza avaliações periódicas de risco</label>
                      <Switch checked={assessment.performs_risk_assessment} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Indicadores de segurança (KPIs)</label>
                      <Textarea 
                        value={assessment.security_kpis || ""} 
                        className="h-24"
                        disabled 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Concorda com auditorias periódicas</label>
                      <Switch checked={assessment.agrees_to_audits} disabled />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Conformidade</CardTitle>
              <CardDescription>
                Análise da conformidade legal e certificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-4">Transferências Internacionais</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Transfere dados para o exterior</label>
                        <Switch checked={assessment.transfers_data_abroad} disabled />
                      </div>
                      {assessment.transfers_data_abroad && (
                        <div className="space-y-2">
                          <label className="text-sm">Mecanismos de transferência utilizados</label>
                          <div className="flex flex-wrap gap-2 border rounded-md p-3 bg-gray-50">
                            {assessment.transfer_mechanisms && assessment.transfer_mechanisms.length > 0 ? (
                              assessment.transfer_mechanisms.map((mechanism, index) => (
                                <Badge key={index} variant="secondary">
                                  {mechanism}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">Nenhum mecanismo informado</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-4">Certificações & Auditorias</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm">Certificações obtidas</label>
                        <div className="flex flex-wrap gap-2 border rounded-md p-3 bg-gray-50">
                          {assessment.certifications && assessment.certifications.length > 0 ? (
                            assessment.certifications.map((cert, index) => (
                              <Badge key={index} variant="secondary">
                                {cert}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">Nenhuma certificação informada</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Realiza auditorias externas periódicas</label>
                        <Switch checked={assessment.has_external_audits} disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Sofreu violações ou multas nos últimos 3 anos</label>
                        <Switch checked={assessment.had_violations} disabled />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Risco</CardTitle>
              <CardDescription>
                Avaliação de risco e comentários do revisor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalScore">Pontuação Total (0-100)</Label>
                    <Input
                      id="totalScore"
                      type="number"
                      min="0"
                      max="100"
                      value={totalScore || 0}
                      onChange={(e) => setTotalScore(parseInt(e.target.value))}
                      disabled={!editMode}
                    />
                    <p className="text-xs text-muted-foreground">
                      A pontuação é calculada automaticamente com base nas respostas. 
                      Você pode ajustar manualmente se necessário.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adjustedRiskLevel">Nível de Risco</Label>
                    <Select 
                      value={adjustedRiskLevel || ""} 
                      onValueChange={setAdjustedRiskLevel}
                      disabled={!editMode}
                    >
                      <SelectTrigger id="adjustedRiskLevel">
                        <SelectValue placeholder="Selecione um nível de risco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Baseado na pontuação</SelectItem>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      O nível é determinado pela pontuação, mas você pode sobrescrever.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reviewer">Nome do Revisor</Label>
                  <Input
                    id="reviewer"
                    value={reviewer}
                    onChange={(e) => setReviewer(e.target.value)}
                    placeholder="Nome do revisor"
                    disabled={!editMode && (assessment.status === "approved" || assessment.status === "rejected")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reviewerComments">Comentários e Análise</Label>
                  <Textarea
                    id="reviewerComments"
                    value={reviewerComments}
                    onChange={(e) => setReviewerComments(e.target.value)}
                    placeholder="Digite seus comentários e análise sobre esta avaliação GRC..."
                    rows={8}
                    disabled={!editMode && (assessment.status === "approved" || assessment.status === "rejected")}
                    className="resize-y"
                  />
                </div>
                
                {(editMode || assessment.status === "submitted" || assessment.status === "in_review" || assessment.status === "draft") && (
                  <div className="flex justify-end gap-2">
                    {!editMode && (
                      <Button 
                        onClick={startEdit} 
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Editar Análise
                      </Button>
                    )}
                    {editMode && (
                      <Button 
                        onClick={() => {
                          setEditMode(false);
                          router.push(`/office/grc/assessments/${params.id}`);
                        }} 
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button 
                      onClick={saveReview} 
                      className="flex items-center gap-2"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Salvar Análise
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {assessment.reviewed_at && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Última revisão em {new Date(assessment.reviewed_at).toLocaleDateString('pt-BR')}
                      {assessment.reviewer && ` por ${assessment.reviewer}`}
                    </p>
                  </div>
                )}
                
                <div className="border rounded-md overflow-hidden mt-4">
                  <div className="bg-orange-50 p-3 font-medium text-orange-800">
                    Guia de Classificação de Risco
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800">Baixo</Badge>
                      <span>Pontuação: 75-100 — Fornecedor com controles robustos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Médio</Badge>
                      <span>Pontuação: 50-74 — Fornecedor com controles adequados, mas com oportunidades de melhoria</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-orange-100 text-orange-800">Alto</Badge>
                      <span>Pontuação: 30-49 — Fornecedor com deficiências significativas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-100 text-red-800">Crítico</Badge>
                      <span>Pontuação: 0-29 — Fornecedor com graves deficiências ou ausência de controles</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de confirmação para aprovar */}
      <AlertDialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar aprovação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar esta avaliação GRC? O status do fornecedor será atualizado para aprovado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionInProgress}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                approveAssessment()
              }}
              disabled={actionInProgress}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar aprovação'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo de confirmação para rejeitar */}
      <AlertDialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar rejeição</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja rejeitar esta avaliação GRC? O status do fornecedor será atualizado para rejeitado.
              {!reviewerComments && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  É necessário fornecer comentários para justificar a rejeição.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionInProgress}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                rejectAssessment()
              }}
              disabled={actionInProgress || !reviewerComments}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar rejeição'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}