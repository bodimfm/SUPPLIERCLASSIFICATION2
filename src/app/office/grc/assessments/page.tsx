"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2,
  Search,
  Plus,
  Check,
  X,
  Clock,
  AlertTriangle,
  Download,
  Filter,
  FileText
} from "lucide-react"

type GRCAssessment = {
  id: string
  supplier_id: string
  created_at: string
  updated_at: string
  status: "draft" | "submitted" | "in_review" | "approved" | "rejected"
  company_name: string
  trade_name: string
  cnpj: string
  reviewer_comments: string | null
  reviewed_at: string | null
  reviewer: string | null
  risk_level: "low" | "medium" | "high" | "critical" | null
}

export default function GRCAssessmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [assessments, setAssessments] = useState<GRCAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredAssessments, setFilteredAssessments] = useState<GRCAssessment[]>([])

  // Carregar avaliações GRC
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true)
        
        // Dados mockados para testes
        const mockAssessments = [
          {
            id: "grc-001",
            supplier_id: "supplier-123",
            created_at: "2025-04-20T10:30:00Z",
            updated_at: "2025-04-20T15:45:00Z",
            status: "approved",
            company_name: "Acme Technology",
            trade_name: "Acme Tech",
            cnpj: "12.345.678/0001-90",
            reviewer_comments: "Fornecedor com boas práticas de segurança",
            reviewed_at: "2025-04-21T09:15:00Z",
            reviewer: "Maria Silva",
            risk_level: "low"
          },
          {
            id: "grc-002",
            supplier_id: "supplier-456",
            created_at: "2025-04-18T09:20:00Z",
            updated_at: "2025-04-19T14:30:00Z", 
            status: "in_review",
            company_name: "DataSoft Soluções",
            trade_name: "DataSoft",
            cnpj: "98.765.432/0001-10",
            reviewer_comments: null,
            reviewed_at: null,
            reviewer: null,
            risk_level: null
          },
          {
            id: "grc-003",
            supplier_id: "supplier-789",
            created_at: "2025-04-15T11:45:00Z",
            updated_at: "2025-04-17T16:20:00Z",
            status: "rejected",
            company_name: "Cyber Security Brasil",
            trade_name: "CyberSec BR",
            cnpj: "45.678.901/0001-23",
            reviewer_comments: "Falhas críticas de segurança identificadas",
            reviewed_at: "2025-04-17T16:20:00Z",
            reviewer: "João Santos",
            risk_level: "critical"
          }
        ];
        
        // Código original para buscar dados da API
        /*
        const response = await fetch("/api/grc-assessments")
        
        if (!response.ok) {
          throw new Error("Falha ao carregar avaliações GRC")
        }
        
        const data = await response.json()
        */
        
        // Usar dados mockados
        setAssessments(mockAssessments)
        setFilteredAssessments(mockAssessments)
        
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as avaliações GRC",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchAssessments()
  }, [toast])

  // Filtrar avaliações com base na busca
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAssessments(assessments)
      return
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase()
    const filtered = assessments.filter(assessment => 
      assessment.company_name.toLowerCase().includes(lowerCaseQuery) ||
      (assessment.trade_name && assessment.trade_name.toLowerCase().includes(lowerCaseQuery)) ||
      (assessment.cnpj && assessment.cnpj.includes(lowerCaseQuery))
    )
    
    setFilteredAssessments(filtered)
  }, [searchQuery, assessments])

  // Navegar para a página de detalhes da avaliação
  const handleViewAssessment = (id: string) => {
    router.push(`/office/grc/assessments/${id}`)
  }

  // Criar nova avaliação GRC
  const handleCreateAssessment = () => {
    // Por enquanto, vamos apenas ir para o primeiro mock
    router.push("/office/grc/assessments/grc-001")
    
    // Depois substituir pela versão real que cria nova avaliação
    // router.push("/office/grc/assessments/new")
  }

  // Baixar resultados como CSV
  const handleDownloadCSV = () => {
    if (filteredAssessments.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há avaliações para exportar",
        variant: "destructive"
      })
      return
    }
    
    // Cabeçalhos do CSV
    const headers = [
      "ID",
      "Fornecedor",
      "Nome Fantasia",
      "CNPJ",
      "Status",
      "Nível de Risco",
      "Data de Criação",
      "Avaliado Por",
      "Data de Avaliação"
    ].join(",")
    
    // Linhas de dados
    const rows = filteredAssessments.map(assessment => [
      assessment.id,
      assessment.company_name,
      assessment.trade_name || "",
      assessment.cnpj || "",
      getStatusTranslation(assessment.status),
      getRiskLevelTranslation(assessment.risk_level),
      new Date(assessment.created_at).toLocaleDateString('pt-BR'),
      assessment.reviewer || "",
      assessment.reviewed_at ? new Date(assessment.reviewed_at).toLocaleDateString('pt-BR') : ""
    ].join(","))
    
    // Combinar tudo no formato CSV
    const csv = [headers, ...rows].join("\n")
    
    // Criar e baixar o arquivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `avaliacoes_grc_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Traduzir status para português
  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "draft": return "Rascunho"
      case "submitted": return "Enviado"
      case "in_review": return "Em Análise"
      case "approved": return "Aprovado"
      case "rejected": return "Rejeitado"
      default: return status
    }
  }

  // Traduzir nível de risco para português
  const getRiskLevelTranslation = (riskLevel: string | null) => {
    if (!riskLevel) return "Não avaliado"
    
    switch (riskLevel) {
      case "low": return "Baixo"
      case "medium": return "Médio"
      case "high": return "Alto"
      case "critical": return "Crítico"
      default: return riskLevel
    }
  }

  // Renderizar o badge de status com a cor apropriada
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
    let icon = null
    
    switch (status) {
      case "draft":
        variant = "outline"
        icon = <Clock className="mr-1 h-3 w-3" />
        break
      case "submitted":
        variant = "secondary"
        icon = <FileText className="mr-1 h-3 w-3" />
        break
      case "in_review":
        variant = "secondary"
        icon = <AlertTriangle className="mr-1 h-3 w-3" />
        break
      case "approved":
        variant = "default"
        icon = <Check className="mr-1 h-3 w-3" />
        break
      case "rejected":
        variant = "destructive"
        icon = <X className="mr-1 h-3 w-3" />
        break
    }
    
    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {getStatusTranslation(status)}
      </Badge>
    )
  }

  // Renderizar o badge de nível de risco com a cor apropriada
  const renderRiskLevelBadge = (riskLevel: string | null) => {
    if (!riskLevel) {
      return <Badge variant="outline">Não avaliado</Badge>
    }
    
    let color = ""
    
    switch (riskLevel) {
      case "low":
        color = "bg-green-100 text-green-800 border-green-200"
        break
      case "medium":
        color = "bg-yellow-100 text-yellow-800 border-yellow-200"
        break
      case "high":
        color = "bg-orange-100 text-orange-800 border-orange-200"
        break
      case "critical":
        color = "bg-red-100 text-red-800 border-red-200"
        break
    }
    
    return (
      <Badge variant="outline" className={`${color}`}>
        {getRiskLevelTranslation(riskLevel)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando avaliações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Avaliações GRC de Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie formulários e respostas de conformidade LGPD e segurança
          </p>
        </div>
        <Button onClick={handleCreateAssessment}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Avaliação
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, fantasia ou CNPJ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" title="Filtrar avaliações">
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                title="Exportar resultados para CSV"
                onClick={handleDownloadCSV}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avaliações de Fornecedores</CardTitle>
          <CardDescription>
            Lista de todas as avaliações de conformidade LGPD e segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-md border">
              {searchQuery ? (
                <>
                  <h3 className="font-medium mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Tente outros termos de busca ou remova os filtros
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-medium mb-2">Nenhuma avaliação encontrada</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie sua primeira avaliação GRC para fornecedores
                  </p>
                  <Button onClick={handleCreateAssessment}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Avaliação
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nível de Risco</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{assessment.company_name}</p>
                          {assessment.trade_name && (
                            <p className="text-sm text-muted-foreground">{assessment.trade_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{assessment.cnpj || "—"}</TableCell>
                      <TableCell>{renderStatusBadge(assessment.status)}</TableCell>
                      <TableCell>{renderRiskLevelBadge(assessment.risk_level)}</TableCell>
                      <TableCell>{new Date(assessment.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewAssessment(assessment.id)}>
                          Ver detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Exibindo {filteredAssessments.length} de {assessments.length} avaliações
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}