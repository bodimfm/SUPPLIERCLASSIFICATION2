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
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, CheckCircle, XCircle, Clock, Loader2, FileText, Save, AlertTriangle } from "lucide-react"
import { RiskMatrix } from "@/components/supplier-risk-assessment/risk-matrix"

// Estas configurações de rota são colocadas em um arquivo de configuração separado
// export const dynamic = 'force-dynamic';
// export const dynamicParams = true;

// Esta função não é compatível com "use client"
// export async function generateStaticParams() {
//   return [];
// }

interface Assessment {
  id: string
  supplier_id: string
  internal_responsible: string
  status: string
  data_volume: string
  data_sensitivity: string
  supplier_type: string
  contract_type: string
  is_technology: boolean
  service_description: string
  notes: string
  created_at: string
  updated_at: string
  dpo_reviewed: boolean
  dpo_review_date: string | null
  dpo_reviewer: string | null
  dpo_comments: string | null
  dpo_adjusted_risk_level: string | null
}

interface Supplier {
  id: string
  name: string
  cnpj: string | null
  supplier_type: string
  risk_level: string
  status: string
}

interface ChecklistItem {
  id: string
  assessment_id: string
  category: string
  item_text: string
  is_checked: boolean
  is_required: boolean
  notes: string
}

export default function AssessmentDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { edit?: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dpoComments, setDpoComments] = useState("")
  const [dpoReviewer, setDpoReviewer] = useState("")
  const [dpoAdjustedRiskLevel, setDpoAdjustedRiskLevel] = useState<string | null>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false)
  const [actionInProgress, setActionInProgress] = useState(false)
  const [documents, setDocuments] = useState<Array<{ id: string; filename: string; uploaded_at: string }>>([])
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
        
        // Carregar dados da avaliação
        const assessmentResponse = await fetch(`/api/assessments?id=${params.id}`)
        if (!assessmentResponse.ok) throw new Error("Falha ao carregar dados da avaliação")
        const assessmentData = await assessmentResponse.json()
        
        if (assessmentData && assessmentData.length > 0) {
          const assessmentDetails = assessmentData[0]
          setAssessment(assessmentDetails)
          
          // Inicializar campos do DPO com valores existentes
          setDpoComments(assessmentDetails.dpo_comments || "")
          setDpoReviewer(assessmentDetails.dpo_reviewer || "")
          setDpoAdjustedRiskLevel(assessmentDetails.dpo_adjusted_risk_level || null)
          
          // Carregar dados do fornecedor
          const supplierResponse = await fetch(`/api/suppliers?id=${assessmentDetails.supplier_id}`)
          if (supplierResponse.ok) {
            const supplierData = await supplierResponse.json()
            if (supplierData && supplierData.length > 0) {
              setSupplier(supplierData[0])
            }
          }
          
          // Carregar itens de checklist
          const checklistResponse = await fetch(`/api/checklist-items?assessment_id=${params.id}`)
          if (checklistResponse.ok) {
            const checklistData = await checklistResponse.json()
            setChecklistItems(checklistData)
          }
          
          // Carregar documentos
          const documentsResponse = await fetch(`/api/documents?assessment_id=${params.id}`)
          if (documentsResponse.ok) {
            const documentsData = await documentsResponse.json()
            setDocuments(documentsData)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da avaliação",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAssessmentData()
  }, [params.id, toast])

  // Função para salvar comentários e análise do DPO
  const saveReview = async () => {
    if (!assessment) return
    
    try {
      setSaving(true)
      
      const updateData = {
        dpo_comments: dpoComments,
        dpo_reviewer: dpoReviewer,
        dpo_adjusted_risk_level: dpoAdjustedRiskLevel,
        dpo_reviewed: true,
        dpo_review_date: new Date().toISOString()
      }
      
      const response = await fetch(`/api/assessments/${assessment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) throw new Error("Falha ao salvar revisão")
      
      toast({
        title: "Análise salva",
        description: "Sua revisão foi salva com sucesso",
      })
      
      // Atualizar dados locais
      setAssessment(prev => prev ? {...prev, ...updateData} : null)
      
      // Desativar modo de edição após salvar
      if (editMode) {
        setEditMode(false);
        router.push(`/office/assessments/${assessment.id}`);
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
    router.push(`/office/assessments/${params.id}?edit=true`);
  }

  // Função para aprovar a avaliação
  const approveAssessment = async () => {
    if (!assessment) return
    
    try {
      setActionInProgress(true)
      
      const updateData = {
        status: "approved",
        dpo_reviewed: true,
        dpo_reviewer: dpoReviewer || "Escritório terceirizado",
        dpo_review_date: new Date().toISOString(),
        dpo_comments: dpoComments || "Avaliação aprovada pelo escritório terceirizado"
      }
      
      const response = await fetch(`/api/assessments/${assessment.id}`, {
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
            status: "approved"
          }),
        })
        
        if (!supplierResponse.ok) {
          console.warn("Aviso: Avaliação aprovada, mas o status do fornecedor não foi atualizado")
        }
      }
      
      toast({
        title: "Avaliação aprovada",
        description: "A avaliação foi aprovada com sucesso",
      })
      
      // Atualizar dados locais
      setAssessment(prev => prev ? {...prev, ...updateData} : null)
      
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
      
      if (!dpoComments) {
        toast({
          title: "Comentários necessários",
          description: "É necessário fornecer comentários para rejeitar a avaliação",
          variant: "destructive",
        })
        setActionInProgress(false)
        return
      }
      
      const updateData = {
        status: "rejected",
        dpo_reviewed: true,
        dpo_reviewer: dpoReviewer || "Escritório terceirizado",
        dpo_review_date: new Date().toISOString(),
        dpo_comments: dpoComments
      }
      
      const response = await fetch(`/api/assessments/${assessment.id}`, {
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
            status: "rejected"
          }),
        })
        
        if (!supplierResponse.ok) {
          console.warn("Aviso: Avaliação rejeitada, mas o status do fornecedor não foi atualizado")
        }
      }
      
      toast({
        title: "Avaliação rejeitada",
        description: "A avaliação foi rejeitada com sucesso",
      })
      
      // Atualizar dados locais
      setAssessment(prev => prev ? {...prev, ...updateData} : null)
      
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
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case "in_review":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Em análise</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Aprovado</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeitado</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Concluído</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-600">Carregando dados da avaliação...</p>
      </div>
    )
  }

  if (!assessment || !supplier) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Avaliação não encontrada</h2>
          <p className="text-red-700 mb-4">
            Não foi possível encontrar os dados da avaliação solicitada.
          </p>
          <Button onClick={() => router.push('/office/dashboard')}>
            Voltar para o Dashboard
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
          onClick={() => router.push('/office/dashboard')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para o Dashboard
        </Button>
        <h1 className="text-3xl font-bold flex-1">
          Detalhes da Avaliação
        </h1>
        {getStatusBadge(assessment.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Fornecedor</CardTitle>
            <CardDescription>
              Detalhes básicos do fornecedor e da avaliação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{supplier.name}</h3>
                {supplier.cnpj && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">CNPJ:</span> {supplier.cnpj}
                  </p>
                )}
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Responsável interno:</span> {assessment.internal_responsible}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Data de submissão:</span> {' '}
                  {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tipo de contrato:</span> {' '}
                  {assessment.contract_type === 'continuous' ? 'Continuado' : 'Pontual'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Tipo de fornecedor:</span> {' '}
                  {assessment.supplier_type || "Não classificado"} - {' '}
                  {assessment.supplier_type === 'A' ? 'Crítico' : 
                   assessment.supplier_type === 'B' ? 'Significativo' : 
                   assessment.supplier_type === 'C' ? 'Moderado' : 
                   assessment.supplier_type === 'D' ? 'Básico' : 'Não classificado'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Volume de dados:</span> {' '}
                  {assessment.data_volume === 'low' ? 'Baixo' :
                   assessment.data_volume === 'medium' ? 'Médio' :
                   assessment.data_volume === 'high' ? 'Alto' :
                   assessment.data_volume === 'massive' ? 'Massivo' : assessment.data_volume}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Sensibilidade dos dados:</span> {' '}
                  {assessment.data_sensitivity === 'non-sensitive' ? 'Não-sensíveis' :
                   assessment.data_sensitivity === 'regular' ? 'Regulares' :
                   assessment.data_sensitivity === 'sensitive' ? 'Sensíveis' : assessment.data_sensitivity}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Fornecedor de TI/SaaS:</span> {' '}
                  {assessment.is_technology ? 'Sim' : 'Não'}
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
              {assessment.status === "pending" || assessment.status === "in_review" ? (
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
                                          assessment.status === "completed" ? "concluída" : "processada"}.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="dpo-review">Análise do DPO</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Descrição do Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                {assessment.service_description || "Nenhuma descrição fornecida."}
              </div>
              
              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">Matriz de Classificação de Risco</h3>
                <RiskMatrix />
              </div>
              
              {assessment.notes && (
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2">Notas Adicionais</h3>
                  <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {assessment.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Itens do Checklist</CardTitle>
              <CardDescription>
                Itens verificados durante a avaliação do fornecedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checklistItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhum item de checklist encontrado para esta avaliação.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Agrupamento por categoria */}
                  {['fundamental', 'procedural', 'verification', 'compliance', 'technical', 'subcontractors', 
                    'critical', 'significant', 'technology', 'periodic', 'updates']
                    .filter(category => 
                      checklistItems.some(item => item.category === category)
                    )
                    .map(category => (
                      <div key={category} className="border rounded-md overflow-hidden">
                        <div className="bg-gray-100 p-3 font-medium capitalize">
                          {category === 'compliance' ? 'Conformidade Legal' :
                           category === 'technical' ? 'Controles Técnicos' :
                           category === 'fundamental' ? 'Cláusulas Fundamentais' :
                           category === 'procedural' ? 'Cláusulas Procedimentais' :
                           category === 'verification' ? 'Mecanismos de Verificação' :
                           category === 'subcontractors' ? 'Subcontratados' :
                           category === 'critical' ? 'Controles Críticos' :
                           category === 'significant' ? 'Controles Significativos' :
                           category === 'technology' ? 'Controles de TI' :
                           category === 'periodic' ? 'Verificações Periódicas' :
                           category === 'updates' ? 'Gestão de Mudanças' : category}
                        </div>
                        <div className="p-3">
                          <div className="divide-y">
                            {checklistItems
                              .filter(item => item.category === category)
                              .map(item => (
                                <div key={item.id} className="py-2 flex items-start">
                                  <div className={`h-5 w-5 rounded mr-3 mt-0.5 flex items-center justify-center 
                                    ${item.is_checked ? 'bg-green-500' : 'bg-gray-200'}`}>
                                    {item.is_checked && <CheckCircle className="h-3 w-3 text-white" />}
                                  </div>
                                  <div>
                                    <p className={`text-sm ${item.is_checked ? 'text-gray-600' : 'font-medium'}`}>
                                      {item.item_text}
                                    </p>
                                    {item.notes && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Observação: {item.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Enviados</CardTitle>
              <CardDescription>
                Documentação enviada pelo responsável para análise
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhum documento encontrado para esta avaliação.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">{doc.filename}</p>
                          <p className="text-xs text-gray-500">
                            Enviado em {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dpo-review">
          <Card>
            <CardHeader>
              <CardTitle>Análise do Encarregado (DPO)</CardTitle>
              <CardDescription>
                Análise e parecer do escritório terceirizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dpoReviewer">Nome do Revisor</Label>
                  <Input
                    id="dpoReviewer"
                    value={dpoReviewer}
                    onChange={(e) => setDpoReviewer(e.target.value)}
                    placeholder="Nome do revisor/encarregado"
                    disabled={!editMode && (assessment.status === "approved" || assessment.status === "rejected")}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dpoAdjustedRiskLevel">Nível de Risco Ajustado (opcional)</Label>
                  <Select 
                    value={dpoAdjustedRiskLevel || ""} 
                    onValueChange={setDpoAdjustedRiskLevel}
                    disabled={!editMode && (assessment.status === "approved" || assessment.status === "rejected")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um nível de risco ajustado (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Manter classificação original</SelectItem>
                      <SelectItem value="A">A - Crítico</SelectItem>
                      <SelectItem value="B">B - Significativo</SelectItem>
                      <SelectItem value="C">C - Moderado</SelectItem>
                      <SelectItem value="D">D - Básico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dpoComments">Comentários e Análise</Label>
                  <Textarea
                    id="dpoComments"
                    value={dpoComments}
                    onChange={(e) => setDpoComments(e.target.value)}
                    placeholder="Digite seus comentários e análise sobre esta avaliação..."
                    rows={6}
                    disabled={!editMode && (assessment.status === "approved" || assessment.status === "rejected")}
                    className="resize-y"
                  />
                </div>
                
                {(editMode || assessment.status === "pending" || assessment.status === "in_review") && (
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
                          router.push(`/office/assessments/${params.id}`);
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
                
                {assessment.dpo_reviewed && assessment.dpo_review_date && (
                  <div className="p-4 bg-blue-50 rounded-lg mt-4">
                    <p className="text-sm text-blue-800">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Última revisão em {new Date(assessment.dpo_review_date).toLocaleDateString('pt-BR')}
                      {assessment.dpo_reviewer && ` por ${assessment.dpo_reviewer}`}
                    </p>
                  </div>
                )}
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
              Tem certeza que deseja aprovar esta avaliação? O status do fornecedor será atualizado para aprovado.
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
              Tem certeza que deseja rejeitar esta avaliação? O status do fornecedor será atualizado para rejeitado.
              {!dpoComments && (
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
              disabled={actionInProgress || !dpoComments}
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