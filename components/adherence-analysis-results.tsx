"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, AlertTriangle, Calendar, Search, Download, FileText, BarChart3 } from "lucide-react"
import type { AdherenceAnalysisResult, ContractData } from "@/lib/adherence-analysis-service"

interface AdherenceAnalysisResultsProps {
  analysisResult: AdherenceAnalysisResult
}

export default function AdherenceAnalysisResults({ analysisResult }: AdherenceAnalysisResultsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof ContractData>("supplierName")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Filtrar e ordenar os dados
  const filteredData = analysisResult.contractsData
    .filter((contract) => contract.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortField === "contractDate" || sortField === "registrationDate") {
        const dateA = a[sortField] ? new Date(a[sortField] as Date).getTime() : 0
        const dateB = b[sortField] ? new Date(b[sortField] as Date).getTime() : 0
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      } else {
        const valueA = String(a[sortField] || "").toLowerCase()
        const valueB = String(b[sortField] || "").toLowerCase()
        return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      }
    })

  const handleSort = (field: keyof ContractData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Conforme</Badge>
      case "non-compliant":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Não Conforme</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pendente</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  }

  const getSupplierTypeBadge = (type: string | undefined) => {
    if (!type) return null

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
        return <Badge>Tipo {type}</Badge>
    }
  }

  const exportToCSV = () => {
    // Preparar os dados para CSV
    const headers = [
      "Fornecedor",
      "Data do Contrato",
      "Registrado",
      "Data de Registro",
      "Tipo",
      "Status",
      "Observações",
    ]
    const rows = analysisResult.contractsData.map((contract) => [
      contract.supplierName,
      formatDate(contract.contractDate),
      contract.isRegistered ? "Sim" : "Não",
      formatDate(contract.registrationDate),
      contract.supplierType || "N/A",
      contract.complianceStatus === "compliant"
        ? "Conforme"
        : contract.complianceStatus === "non-compliant"
          ? "Não Conforme"
          : "Pendente",
      contract.observations || "",
    ])

    // Criar conteúdo CSV
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // Criar e baixar o arquivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `analise-aderencia-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToReport = () => {
    // Em um cenário real, aqui geraria um relatório PDF ou similar
    alert("Funcionalidade de exportação de relatório detalhado será implementada em breve.")
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <div className="text-3xl font-bold text-blue-600 mb-2">{analysisResult.totalContracts}</div>
            <div className="text-sm text-gray-500 text-center">Total de Contratos Analisados</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <div className="text-3xl font-bold text-green-600 mb-2">{analysisResult.complianceRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-500 text-center">Taxa de Conformidade</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <div className="text-3xl font-bold text-red-600 mb-2">{analysisResult.unregisteredContracts}</div>
            <div className="text-sm text-gray-500 text-center">Contratos Não Conformes</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-semibold">Resultados da Análise de Aderência</h3>
              <p className="text-sm text-gray-500">
                Análise de {analysisResult.totalContracts} contratos em relação à política de contratação de
                fornecedores
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToReport}>
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <Search className="h-4 w-4 mr-2 text-gray-400" />
            <Input
              placeholder="Buscar fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("supplierName")}>
                    Fornecedor
                    {sortField === "supplierName" && (
                      <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("contractDate")}>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Data do Contrato
                      {sortField === "contractDate" && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("registrationDate")}>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Data de Registro
                      {sortField === "registrationDate" && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      Nenhum resultado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((contract, index) => (
                    <TableRow key={index} className={contract.complianceStatus === "non-compliant" ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{contract.supplierName}</TableCell>
                      <TableCell>{formatDate(contract.contractDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {contract.isRegistered ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          {getStatusBadge(contract.complianceStatus)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(contract.registrationDate)}</TableCell>
                      <TableCell>{getSupplierTypeBadge(contract.supplierType)}</TableCell>
                      <TableCell className="max-w-xs truncate" title={contract.observations}>
                        {contract.observations}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Mostrando {filteredData.length} de {analysisResult.contractsData.length} contratos
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Resumo da Análise</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-1">Taxa de Conformidade</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    analysisResult.complianceRate >= 80
                      ? "bg-green-500"
                      : analysisResult.complianceRate >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${analysisResult.complianceRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-2">Distribuição de Status</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Conformes</span>
                    </div>
                    <span className="text-sm font-medium">
                      {analysisResult.registeredContracts} ({Math.round(analysisResult.complianceRate)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm">Não Conformes</span>
                    </div>
                    <span className="text-sm font-medium">
                      {analysisResult.unregisteredContracts} ({Math.round(100 - analysisResult.complianceRate)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Recomendações</div>
                <div className="space-y-2 text-sm">
                  {analysisResult.complianceRate < 70 && (
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                      <span>
                        Recomenda-se revisar o processo de contratação para garantir que todos os fornecedores passem
                        pela avaliação de risco antes da assinatura do contrato.
                      </span>
                    </div>
                  )}
                  {analysisResult.unregisteredContracts > 0 && (
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                      <span>
                        Existem {analysisResult.unregisteredContracts} fornecedores que precisam ser submetidos à
                        avaliação de risco o mais breve possível.
                      </span>
                    </div>
                  )}
                  <div className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>
                      Mantenha um registro atualizado de todos os contratos e suas respectivas avaliações de risco para
                      facilitar auditorias futuras.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
