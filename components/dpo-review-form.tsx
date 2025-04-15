"use client"

import type React from "react"

import { useState } from "react"
import type { FormData } from "./supplier-risk-assessment"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getRiskColor } from "@/lib/risk-scoring"
import { CheckCircle2, AlertCircle, AlertTriangle, ArrowLeft, Save, FileCheck } from "lucide-react"
import { motion } from "framer-motion"

interface DpoReviewFormProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onBack: () => void
  onComplete: () => void
}

export default function DpoReviewForm({ formData, updateFormData, onBack, onComplete }: DpoReviewFormProps) {
  const [adjustedRiskLevel, setAdjustedRiskLevel] = useState<"low" | "medium" | "high" | "critical">(
    formData.dpoReview.adjustedRiskLevel || formData.riskLevel,
  )
  const [comments, setComments] = useState(formData.dpoReview.comments || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    updateFormData({
      dpoReview: {
        reviewed: true,
        adjustedRiskLevel,
        comments,
        reviewDate: new Date(),
        reviewedBy: "DPO", // Em um sistema real, isso viria da autenticação
      },
    })

    onComplete()
  }

  const getRiskLevelLabel = (level: string) => {
    switch (level) {
      case "low":
        return "Risco Baixo"
      case "medium":
        return "Risco Médio"
      case "high":
        return "Risco Alto"
      case "critical":
        return "Risco Crítico"
      default:
        return "Desconhecido"
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Revisão do DPO</h2>
          <p className="text-gray-500">Revise a classificação automática do fornecedor e faça ajustes se necessário.</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium">Fornecedor: {formData.supplierName}</h3>
                <p className="text-sm text-gray-500">{formData.serviceDescription}</p>
              </div>
              <div
                className={`
                h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold
                ${getRiskColor(formData.riskLevel)}
              `}
              >
                {formData.riskScore}
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {formData.riskLevel === "low" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {formData.riskLevel === "medium" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                  {formData.riskLevel === "high" && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                  {formData.riskLevel === "critical" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                </div>
                <div>
                  <p className="font-medium">Classificação Automática:</p>
                  <p
                    className={`text-lg font-bold mt-1 ${
                      formData.riskLevel === "low"
                        ? "text-green-600"
                        : formData.riskLevel === "medium"
                          ? "text-yellow-600"
                          : formData.riskLevel === "high"
                            ? "text-orange-600"
                            : "text-red-600"
                    }`}
                  >
                    {formData.riskDescription} (Pontuação: {formData.riskScore})
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Label className="text-lg font-medium">Ajustar Classificação de Risco</Label>
          <RadioGroup
            value={adjustedRiskLevel}
            onValueChange={(value) => setAdjustedRiskLevel(value as "low" | "medium" | "high" | "critical")}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value="low" id="risk-low" />
              <div>
                <Label htmlFor="risk-low" className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium text-green-600">Risco Baixo</span>
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Fornecedor de baixo risco. Requer controles básicos de privacidade.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value="medium" id="risk-medium" />
              <div>
                <Label htmlFor="risk-medium" className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="font-medium text-yellow-600">Risco Médio</span>
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Fornecedor de risco médio. Requer controles moderados e revisão periódica.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value="high" id="risk-high" />
              <div>
                <Label htmlFor="risk-high" className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="font-medium text-orange-600">Risco Alto</span>
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Fornecedor de alto risco. Requer controles rigorosos, cláusulas contratuais específicas e
                  monitoramento frequente.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value="critical" id="risk-critical" />
              <div>
                <Label htmlFor="risk-critical" className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="font-medium text-red-600">Risco Crítico</span>
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Fornecedor de risco crítico. Requer avaliação detalhada pelo DPO, controles rigorosos, cláusulas
                  contratuais específicas e monitoramento constante.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label htmlFor="dpo-comments">Observações e Recomendações</Label>
          <Textarea
            id="dpo-comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Insira observações, justificativas para ajustes na classificação ou recomendações específicas..."
            className="min-h-[150px]"
          />
        </div>

        <motion.div
          className="p-4 border border-blue-200 bg-blue-50 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start">
            <FileCheck className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-blue-700">Próximos Passos</p>
              <p className="text-sm text-blue-600 mt-1">Após sua revisão, o sistema irá:</p>
              <ul className="text-sm text-blue-600 mt-2 list-disc list-inside space-y-1">
                <li>Registrar a classificação final do fornecedor</li>
                <li>Determinar os requisitos documentais com base na classificação</li>
                <li>Definir o plano de monitoramento adequado</li>
                <li>Gerar recomendações para cláusulas contratuais</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button type="submit" className="bg-[#0a3144] hover:bg-[#1a4155]">
            <Save className="h-4 w-4 mr-2" />
            Salvar Revisão e Finalizar
          </Button>
        </div>
      </div>
    </form>
  )
}
