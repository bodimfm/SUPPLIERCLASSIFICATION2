"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileSpreadsheet, BarChart3, ArrowLeft, History, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import ContractUpload from "./contract-upload"
import AdherenceAnalysisResults from "./adherence-analysis-results"
import { 
  type AdherenceAnalysisResult, 
  type ContractAnalysis,
  getAdherenceAnalysisService 
} from "@/lib/adherence-analysis-service"

interface AdherenceAnalysisProps {
  onBack: () => void
  userEmail?: string
}

export default function AdherenceAnalysis({ onBack, userEmail = "sistema" }: AdherenceAnalysisProps) {
  const [activeTab, setActiveTab] = useState("upload")
  const [analysisResult, setAnalysisResult] = useState<AdherenceAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previousAnalyses, setPreviousAnalyses] = useState<ContractAnalysis[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  useEffect(() => {
    // Carregar histórico de análises anteriores
    const loadPreviousAnalyses = async () => {
      try {
        const adherenceService = getAdherenceAnalysisService()
        const analyses = await adherenceService.getPreviousAnalyses()
        setPreviousAnalyses(analyses)
      } catch (error) {
        console.error("Erro ao carregar histórico de análises:", error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadPreviousAnalyses()
  }, [])

  const handleFileProcessed = async (file: File) => {
    setIsAnalyzing(true)

    try {
      const adherenceService = getAdherenceAnalysisService()
      const result = await adherenceService.analyzeContractsFile(file, userEmail)

      setAnalysisResult(result)
      setActiveTab("results")
      
      // Recarregar histórico após nova análise
      const analyses = await adherenceService.getPreviousAnalyses()
      setPreviousAnalyses(analyses)
    } catch (error) {
      console.error("Erro na análise de aderência:", error)
      // Em um cenário real, mostraríamos uma mensagem de erro
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análise de Aderência à Política de Contratação</h2>
          <p className="text-gray-500">
            Verifique se os contratos estão em conformidade com a política de avaliação de fornecedores.
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="upload">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Upload de Contratos
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisResult}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Resultados da Análise
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Histórico de Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <ContractUpload 
            onFileProcessed={handleFileProcessed} 
            isProcessing={isAnalyzing}
          />
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          {analysisResult && <AdherenceAnalysisResults analysisResult={analysisResult} />}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Histórico de Análises</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  <span className="ml-2 text-gray-600">Carregando histórico...</span>
                </div>
              ) : previousAnalyses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Nenhuma análise foi realizada anteriormente.</p>
                  <p className="text-sm mt-2">
                    Realize uma análise de contratos para começar a construir o histórico.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Arquivo</TableHead>
                        <TableHead>Contratos</TableHead>
                        <TableHead>Taxa de Conformidade</TableHead>
                        <TableHead>Analisado por</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previousAnalyses.map((analysis) => (
                        <TableRow key={analysis.id}>
                          <TableCell>{formatDate(analysis.uploadDate)}</TableCell>
                          <TableCell>{analysis.fileName}</TableCell>
                          <TableCell>{analysis.totalContracts}</TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                analysis.complianceRate >= 80 ? "bg-green-100 text-green-800" :
                                analysis.complianceRate >= 50 ? "bg-amber-100 text-amber-800" :
                                "bg-red-100 text-red-800"
                              }
                            >
                              {analysis.complianceRate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>{analysis.analyzedBy}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <div className="text-center">
                  <h3 className="text-lg font-medium">Analisando Contratos</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Verificando a conformidade dos contratos com a política de contratação...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
