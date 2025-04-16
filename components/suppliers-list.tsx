"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  FileText,
  Edit,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  PlusCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { getRiskAssessmentService, SupplierRiskSummary } from "@/lib/risk-assessment-service"

// Mock data for demonstration purposes - usado como fallback se falhar a conexão com Supabase
const mockSuppliers = [
  {
    id: "1",
    name: "Acme Corporation",
    supplierType: "A",
    riskLevel: "critical",
    riskScore: 95,
    lastAssessmentDate: "2023-05-15T14:30:00Z",
    nextAssessmentDate: "2023-11-15T14:30:00Z",
    status: "approved"
  },
  {
    id: "2",
    name: "Tech Solutions Inc",
    supplierType: "B",
    riskLevel: "high",
    riskScore: 78,
    lastAssessmentDate: "2023-04-10T09:15:00Z",
    nextAssessmentDate: "2024-01-10T09:15:00Z",
    status: "approved"
  },
  {
    id: "3",
    name: "Global Logistics",
    supplierType: "C",
    riskLevel: "medium",
    riskScore: 45,
    lastAssessmentDate: "2023-06-22T11:45:00Z",
    nextAssessmentDate: "2024-06-22T11:45:00Z",
    status: "pending"
  },
  {
    id: "4",
    name: "Marketing Experts",
    supplierType: "D",
    riskLevel: "low",
    riskScore: 20,
    lastAssessmentDate: "2023-07-05T16:20:00Z",
    nextAssessmentDate: "2025-07-05T16:20:00Z",
    status: "approved"
  },
  {
    id: "5",
    name: "Data Analytics Co",
    supplierType: "B",
    riskLevel: "high",
    riskScore: 72,
    lastAssessmentDate: "2023-03-18T13:10:00Z",
    nextAssessmentDate: "2023-12-18T13:10:00Z",
    status: "rejected"
  },
]

interface SuppliersListProps {
  onSupplierSelect?: (supplierId: string) => void
  onAddNewSupplier?: () => void
}

export default function SuppliersList({ onSupplierSelect, onAddNewSupplier }: SuppliersListProps) {
  const [suppliers, setSuppliers] = useState<SupplierRiskSummary[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof SupplierRiskSummary>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { isClient, isDpoMember, isAdmin } = useAuth()

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Usar o serviço de avaliação de risco para obter resumos de fornecedores
      const riskService = getRiskAssessmentService()
      const supplierSummaries = await riskService.getSupplierRiskSummaries()
      
      if (supplierSummaries.length === 0) {
        setSuppliers(mockSuppliers) // Usar dados mock se não houver registros no Supabase
      } else {
        setSuppliers(supplierSummaries)
      }
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error)
      setError("Falha ao carregar a lista de fornecedores. Usando dados de demonstração temporários.")
      setSuppliers(mockSuppliers) // Usar dados mock em caso de erro
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar e ordenar fornecedores
  const filteredSuppliers = suppliers
    .filter((supplier) => 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "lastAssessmentDate" || sortField === "nextAssessmentDate") {
        const dateA = a[sortField] ? new Date(a[sortField] as string).getTime() : 0
        const dateB = b[sortField] ? new Date(b[sortField] as string).getTime() : 0
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      }
      
      if (sortField === "riskScore") {
        return sortDirection === "asc" 
          ? (a.riskScore || 0) - (b.riskScore || 0) 
          : (b.riskScore || 0) - (a.riskScore || 0)
      }
      
      const valA = String(a[sortField] || "").toLowerCase()
      const valB = String(b[sortField] || "").toLowerCase()
      return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA)
    })

  const handleSort = (field: keyof SupplierRiskSummary) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getRiskLevelBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Crítico</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Alto</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Médio</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Baixo</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  }

  const getSupplierTypeBadge = (type: string) => {
    switch (type) {
      case "A":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Tipo A</Badge>
      case "B":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Tipo B</Badge>
      case "C":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Tipo C</Badge>
      case "D":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Tipo D</Badge>
      default:
        return <Badge>Não classificado</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aprovado</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pendente</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejeitado</Badge>
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Em Revisão</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Indefinido</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Data inválida"
    
    return date.toLocaleDateString("pt-BR")
  }

  // Verifica se a data de reavaliação está próxima (dentro de 30 dias) ou vencida
  const isReassessmentDue = (nextDate: string | null) => {
    if (!nextDate) return false
    
    const today = new Date()
    const reassessmentDate = new Date(nextDate)
    
    // Se a data já passou
    if (reassessmentDate < today) return "overdue"
    
    // Se está dentro de 30 dias
    const differenceInTime = reassessmentDate.getTime() - today.getTime()
    const differenceInDays = differenceInTime / (1000 * 3600 * 24)
    
    if (differenceInDays <= 30) return "upcoming"
    
    return false
  }

  const getNextAssessmentLabel = (nextDate: string | null) => {
    const status = isReassessmentDue(nextDate)
    
    if (status === "overdue") {
      return (
        <span className="flex items-center text-red-600">
          <AlertTriangle className="h-4 w-4 mr-1" />
          {formatDate(nextDate)} (Vencida)
        </span>
      )
    }
    
    if (status === "upcoming") {
      return (
        <span className="flex items-center text-amber-600">
          <Clock className="h-4 w-4 mr-1" />
          {formatDate(nextDate)} (Em breve)
        </span>
      )
    }
    
    return formatDate(nextDate)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fornecedores</h2>
          <p className="text-gray-500">Gerencie e monitore os fornecedores da empresa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSuppliers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          {/* Apenas clientes podem adicionar novos fornecedores (pois serão aprovados pelo DPO) */}
          {!isDpoMember && (
            <Button size="sm" onClick={onAddNewSupplier}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar fornecedor..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-x-2">
              <Badge className="bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200" onClick={() => setSearchTerm("")}>
                Todos ({suppliers.length})
              </Badge>
              <Badge className="bg-red-100 text-red-800 cursor-pointer hover:bg-red-200" onClick={() => setSearchTerm("A")}>
                Tipo A ({suppliers.filter(s => s.supplierType === "A").length})
              </Badge>
              <Badge className="bg-orange-100 text-orange-800 cursor-pointer hover:bg-orange-200" onClick={() => setSearchTerm("B")}>
                Tipo B ({suppliers.filter(s => s.supplierType === "B").length})
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 cursor-pointer hover:bg-yellow-200" onClick={() => setSearchTerm("C")}>
                Tipo C ({suppliers.filter(s => s.supplierType === "C").length})
              </Badge>
              <Badge className="bg-green-100 text-green-800 cursor-pointer hover:bg-green-200" onClick={() => setSearchTerm("D")}>
                Tipo D ({suppliers.filter(s => s.supplierType === "D").length})
              </Badge>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">Carregando fornecedores...</span>
            </div>
          ) : error ? (
            <div className="bg-amber-50 text-amber-800 rounded-lg p-4 mb-4">
              {error}
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">Nenhum fornecedor encontrado</p>
              <p className="text-sm mt-1">Tente ajustar os filtros ou adicione um novo fornecedor.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>Lista de {filteredSuppliers.length} fornecedores</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => handleSort("name")}
                    >
                      Nome do Fornecedor
                      {sortField === "name" && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("supplierType")}
                    >
                      Classificação
                      {sortField === "supplierType" && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("riskLevel")}
                    >
                      Nível de Risco
                      {sortField === "riskLevel" && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("nextAssessmentDate")}
                    >
                      Próxima Avaliação
                      {sortField === "nextAssessmentDate" && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      {sortField === "status" && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{getSupplierTypeBadge(supplier.supplierType)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className={`w-3 h-3 rounded-full mr-2 ${
                              supplier.riskLevel === "critical" ? "bg-red-500" :
                              supplier.riskLevel === "high" ? "bg-orange-500" :
                              supplier.riskLevel === "medium" ? "bg-amber-500" :
                              "bg-green-500"
                            }`}
                          ></div>
                          {getRiskLevelBadge(supplier.riskLevel)}
                        </div>
                      </TableCell>
                      <TableCell>{getNextAssessmentLabel(supplier.nextAssessmentDate)}</TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {isDpoMember ? (
                            // Membros do DPO podem editar
                            <Button variant="outline" size="icon" onClick={() => onSupplierSelect?.(supplier.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          ) : (
                            // Clientes só podem visualizar
                            <Button variant="outline" size="icon" disabled title="Apenas membros do DPO podem editar">
                              <Edit className="h-4 w-4 text-gray-400" />
                            </Button>
                          )}
                          {/* Todos podem visualizar análises e detalhes */}
                          <Button variant="outline" size="icon" onClick={() => onSupplierSelect?.(supplier.id)}>
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}