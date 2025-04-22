"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, FileCheck, FileX, Clock, Eye, ArrowUpDown, Loader2, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Assessment {
  id: string
  supplier_id: string
  internal_responsible: string
  status: "draft" | "pending" | "in_review" | "approved" | "rejected" | "completed"
  data_volume: string
  data_sensitivity: string
  created_at: string
  updated_at: string
  supplier_type: string
  supplier?: {
    name: string
    cnpj: string
  }
}

export default function DashboardPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [suppliers, setSuppliers] = useState<Record<string, { name: string; cnpj?: string }>>({})

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await fetch("/api/assessments")
        if (!response.ok) throw new Error("Falha ao carregar avaliações")
        
        const data = await response.json()
        
        // Para cada avaliação, buscar informações do fornecedor
        const assessmentsWithSuppliers = await Promise.all(
          data.map(async (assessment: Assessment) => {
            if (!suppliers[assessment.supplier_id]) {
              try {
                const supplierResponse = await fetch(`/api/suppliers?id=${assessment.supplier_id}`)
                if (supplierResponse.ok) {
                  const supplierData = await supplierResponse.json()
                  if (supplierData && supplierData.length > 0) {
                    setSuppliers(prev => ({
                      ...prev, 
                      [assessment.supplier_id]: {
                        name: supplierData[0].name,
                        cnpj: supplierData[0].cnpj
                      }
                    }))
                    assessment.supplier = {
                      name: supplierData[0].name,
                      cnpj: supplierData[0].cnpj || ""
                    }
                  }
                }
              } catch (error) {
                console.error("Erro ao buscar dados do fornecedor:", error)
              }
            } else {
              assessment.supplier = {
                name: suppliers[assessment.supplier_id].name,
                cnpj: suppliers[assessment.supplier_id].cnpj || ""
              }
            }
            return assessment
          })
        )
        
        setAssessments(assessmentsWithSuppliers)
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssessments()
  }, [suppliers])

  // Funções para filtrar e ordenar
  const filteredAssessments = assessments.filter(assessment => {
    // Filtro de busca
    const supplierName = assessment.supplier?.name?.toLowerCase() || ""
    const searchMatch = 
      supplierName.includes(searchTerm.toLowerCase()) ||
      assessment.internal_responsible.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtro de status
    const statusMatch = statusFilter === "all" || assessment.status === statusFilter
    
    return searchMatch && statusMatch
  })

  // Ordenação
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    if (sortBy === "date-desc") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy === "date-asc") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortBy === "name-asc") {
      return (a.supplier?.name || "").localeCompare(b.supplier?.name || "")
    } else if (sortBy === "name-desc") {
      return (b.supplier?.name || "").localeCompare(a.supplier?.name || "")
    }
    return 0
  })

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

  function renderAssessmentsList(assessmentsList: Assessment[]) {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Carregando avaliações...</span>
        </div>
      )
    }

    if (assessmentsList.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-500">Nenhuma avaliação encontrada com os filtros selecionados.</p>
        </div>
      )
    }

    return (
      <div className="grid gap-4">
        {assessmentsList.map((assessment) => (
          <div 
            key={assessment.id} 
            className="border rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4 hover:bg-gray-50"
          >
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">
                    {assessment.supplier?.name || "Fornecedor não identificado"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {assessment.supplier?.cnpj && `CNPJ: ${assessment.supplier.cnpj}`}
                  </p>
                </div>
                <div>{getStatusBadge(assessment.status)}</div>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                </span>
                <span>•</span>
                <span>Responsável: {assessment.internal_responsible}</span>
                <span>•</span>
                <span>Tipo: {assessment.supplier_type || "Não classificado"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end md:self-center">
              <div className="flex gap-2">
                <Link href={`/office/assessments/${assessment.id}`} passHref>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Visualizar
                  </Button>
                </Link>
                <Link href={`/office/assessments/${assessment.id}?edit=true`} passHref>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Editar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="assessments">Avaliações</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fornecedores
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(suppliers).length}</div>
                <p className="text-xs text-muted-foreground">
                  +0% desde o último mês
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avaliações
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assessments.length}</div>
                <p className="text-xs text-muted-foreground">
                  +0% desde o último mês
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Alto Risco
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assessments.filter(a => a.data_sensitivity === 'high' || a.data_volume === 'high').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +0% desde o último mês
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conformidade
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assessments.length ? 
                    Math.round((assessments.filter(a => a.status === 'approved' || a.status === 'completed').length / assessments.length) * 100) 
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  +0% desde o último mês
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
                <CardDescription>
                  Distribuição de fornecedores por nível de risco
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    {assessments.length > 0 ? 
                      "Dados de fornecedores carregados, gráfico em desenvolvimento" : 
                      "Sem dados disponíveis"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Avaliações Recentes</CardTitle>
                <CardDescription>
                  Últimas avaliações de fornecedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assessments.length > 0 ? (
                  <div className="space-y-4">
                    {sortedAssessments.slice(0, 3).map(assessment => (
                      <div key={assessment.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{assessment.supplier?.name || "Sem nome"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        {getStatusBadge(assessment.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Sem dados disponíveis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Análises</CardTitle>
                <CardDescription>
                  Análise de dados de fornecedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">Sem dados disponíveis</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>
                  Relatórios de fornecedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">Sem dados disponíveis</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Avaliações de Fornecedores</CardTitle>
              <CardDescription>
                Visualize, filtre e gerencie todas as avaliações de fornecedores submetidas para análise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por fornecedor ou responsável..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_review">Em análise</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" /> Ordenar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy("date-desc")}>
                        Data (mais recente)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("date-asc")}>
                        Data (mais antiga)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                        Fornecedor (A-Z)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                        Fornecedor (Z-A)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="review">Em Análise</TabsTrigger>
                  <TabsTrigger value="completed">Concluídas</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  {renderAssessmentsList(sortedAssessments)}
                </TabsContent>
                
                <TabsContent value="pending">
                  {renderAssessmentsList(sortedAssessments.filter(a => a.status === "pending"))}
                </TabsContent>
                
                <TabsContent value="review">
                  {renderAssessmentsList(sortedAssessments.filter(a => a.status === "in_review"))}
                </TabsContent>
                
                <TabsContent value="completed">
                  {renderAssessmentsList(sortedAssessments.filter(
                    a => ["approved", "rejected", "completed"].includes(a.status)
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}