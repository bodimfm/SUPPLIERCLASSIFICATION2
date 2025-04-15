"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileSpreadsheet, BarChart3, ArrowLeft } from "lucide-react"
import ContractUpload from "./contract-upload"
import AdherenceAnalysisResults from "./adherence-analysis-results"
import { type AdherenceAnalysisResult, getAdherenceAnalysisService } from "@/lib/adherence-analysis-service"

interface AdherenceAnalysisProps {
  onBack: () => void
}

export default function AdherenceAnalysis({ onBack }: AdherenceAnalysisProps) {
  const [activeTab, setActiveTab] = useState("upload")
  const [analysisResult, setAnalysisResult] = useState<AdherenceAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileProcessed = async (file: File) => {
    setIsAnalyzing(true)

    try {
      const adherenceService = getAdherenceAnalysisService()
      const result = await adherenceService.analyzeContractsFile(file)

      setAnalysisResult(result)
      setActiveTab("results")
    } catch (error) {
      console.error("Erro na análise de aderência:", error)
      // Em um cenário real, mostraríamos uma mensagem de erro
    } finally {
      setIsAnalyzing(false)
    }
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
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="upload">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Upload de Contratos
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisResult}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Resultados da Análise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <ContractUpload onFileProcessed={handleFileProcessed} />
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          {analysisResult && <AdherenceAnalysisResults analysisResult={analysisResult} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
