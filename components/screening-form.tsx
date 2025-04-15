"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { FormData } from "./supplier-risk-assessment"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { calculateRiskScore, getRiskColor, getRiskDescription, type RiskAssessmentData } from "@/lib/risk-scoring"
import { motion } from "framer-motion"
import { AlertCircle, Shield, FileCheck, Award, Users, AlertTriangle, CheckCircle2 } from "lucide-react"

interface ScreeningFormProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  nextStep: () => void
}

export default function ScreeningForm({ formData, updateFormData, nextStep }: ScreeningFormProps) {
  const [showRiskResult, setShowRiskResult] = useState(false)

  // Calcular a pontuação de risco quando os campos relevantes mudarem
  useEffect(() => {
    if (formData.supplierName && formData.serviceDescription) {
      const assessmentData: RiskAssessmentData = {
        dataType: formData.dataType,
        volume: formData.volume,
        criticality: formData.criticality,
        policy: formData.policy,
        certification: formData.certification,
        subcontracting: formData.subcontracting,
        incidents: formData.incidents,
      }

      const riskResult = calculateRiskScore(assessmentData)

      updateFormData({
        riskScore: riskResult.score,
        riskLevel: riskResult.riskLevel,
        riskDescription: riskResult.description,
      })

      // Mostrar o resultado se todos os campos estiverem preenchidos
      const allFieldsFilled =
        formData.dataType !== undefined &&
        formData.volume !== undefined &&
        formData.criticality !== undefined &&
        formData.policy !== undefined &&
        formData.certification !== undefined &&
        formData.subcontracting !== undefined &&
        formData.incidents !== undefined

      setShowRiskResult(allFieldsFilled)
    }
  }, [
    formData.dataType,
    formData.volume,
    formData.criticality,
    formData.policy,
    formData.certification,
    formData.subcontracting,
    formData.incidents,
    formData.supplierName,
    formData.serviceDescription,
    updateFormData,
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Triagem Inicial do Fornecedor</h2>
          <p className="text-gray-500">
            Preencha as informações básicas sobre o fornecedor para determinar a classificação de risco.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="supplierName">Nome do Fornecedor</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => updateFormData({ supplierName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="serviceDescription">Descrição do Serviço</Label>
              <Textarea
                id="serviceDescription"
                value={formData.serviceDescription}
                onChange={(e) => updateFormData({ serviceDescription: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                Dados Pessoais
              </Label>
              <p className="text-xs text-gray-500 mb-2">O fornecedor lida com dados pessoais?</p>
              <RadioGroup
                value={formData.dataType}
                onValueChange={(value) => updateFormData({ dataType: value as "none" | "common" | "sensitive" })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="data-none" />
                  <Label htmlFor="data-none">Não lida com dados pessoais</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="common" id="data-common" />
                  <Label htmlFor="data-common">Sim, mas apenas dados não sensíveis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sensitive" id="data-sensitive" />
                  <Label htmlFor="data-sensitive">Sim, inclusive dados sensíveis (saúde, biometria etc.)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                Volume de Titulares
              </Label>
              <p className="text-xs text-gray-500 mb-2">Qual o volume estimado de titulares de dados tratados?</p>
              <RadioGroup
                value={formData.volume}
                onValueChange={(value) => updateFormData({ volume: value as "low" | "medium" | "high" })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="volume-low" />
                  <Label htmlFor="volume-low">Menos de 100</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="volume-medium" />
                  <Label htmlFor="volume-medium">Entre 100 e 10.000</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="volume-high" />
                  <Label htmlFor="volume-high">Acima de 10.000</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                Criticidade do Serviço
              </Label>
              <p className="text-xs text-gray-500 mb-2">
                O serviço prestado pelo fornecedor é essencial para a operação?
              </p>
              <RadioGroup
                value={formData.criticality}
                onValueChange={(value) => updateFormData({ criticality: value as "critical" | "non-critical" })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="critical" id="criticality-critical" />
                  <Label htmlFor="criticality-critical">Sim, se falhar, impacta severamente o negócio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non-critical" id="criticality-non-critical" />
                  <Label htmlFor="criticality-non-critical">Não, é complementar ou de baixo impacto</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                <FileCheck className="h-4 w-4 mr-2 text-blue-500" />
                Políticas de Privacidade e Segurança
              </Label>
              <p className="text-xs text-gray-500 mb-2">
                O fornecedor declara possuir política de privacidade ou política interna de segurança de dados?
              </p>
              <RadioGroup
                value={formData.policy}
                onValueChange={(value) => updateFormData({ policy: value as "yes" | "no" | "unknown" })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="policy-yes" />
                  <Label htmlFor="policy-yes">Sim, e pode apresentar documento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="policy-no" />
                  <Label htmlFor="policy-no">Não possui nada formal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unknown" id="policy-unknown" />
                  <Label htmlFor="policy-unknown">Desconheço</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-blue-500" />
                Certificações / Normas de Segurança
              </Label>
              <p className="text-xs text-gray-500 mb-2">
                O fornecedor é certificado ou adota alguma norma (ISO 27001, SOC 2, PCI, etc.)?
              </p>
              <RadioGroup
                value={formData.certification}
                onValueChange={(value) => updateFormData({ certification: value as "yes" | "no" | "unknown" })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="certification-yes" />
                  <Label htmlFor="certification-yes">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="certification-no" />
                  <Label htmlFor="certification-no">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unknown" id="certification-unknown" />
                  <Label htmlFor="certification-unknown">Desconheço</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                Subcontratação
              </Label>
              <p className="text-xs text-gray-500 mb-2">
                O fornecedor subcontrata terceiros para processar esses dados?
              </p>
              <RadioGroup
                value={formData.subcontracting}
                onValueChange={(value) =>
                  updateFormData({ subcontracting: value as "none" | "identified" | "unknown" })
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="subcontracting-none" />
                  <Label htmlFor="subcontracting-none">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="identified" id="subcontracting-identified" />
                  <Label htmlFor="subcontracting-identified">Sim, e eles são identificados ao controlador</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unknown" id="subcontracting-unknown" />
                  <Label htmlFor="subcontracting-unknown">Sim, porém não sabemos quem são</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" />
                Histórico de Incidentes
              </Label>
              <p className="text-xs text-gray-500 mb-2">
                Existem relatos de incidentes ou vazamentos de dados envolvendo esse fornecedor?
              </p>
              <RadioGroup
                value={formData.incidents}
                onValueChange={(value) => updateFormData({ incidents: value as "none" | "resolved" | "unresolved" })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="incidents-none" />
                  <Label htmlFor="incidents-none">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="resolved" id="incidents-resolved" />
                  <Label htmlFor="incidents-resolved">Sim, mas foi resolvido adequadamente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unresolved" id="incidents-unresolved" />
                  <Label htmlFor="incidents-unresolved">Sim, e sem evidências de correções</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {showRiskResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Classificação de Risco do Fornecedor</h3>
                    <p className="text-sm text-gray-500">Baseada nas informações fornecidas</p>
                  </div>
                  <div
                    className={`
                    h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold
                    ${getRiskColor(formData.riskLevel)}
                  `}
                  >
                    {formData.riskScore}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      {formData.riskLevel === "low" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {formData.riskLevel === "medium" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                      {formData.riskLevel === "high" && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                      {formData.riskLevel === "critical" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        Com base nas informações fornecidas, o sistema sugere que este fornecedor seja classificado
                        como:
                      </p>
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
                        {formData.riskDescription}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">{getRiskDescription(formData.riskLevel)}</p>
                      <p className="text-sm text-gray-500 mt-4">
                        Esta classificação será revisada pelo DPO antes da decisão final.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!formData.supplierName || !formData.serviceDescription || !showRiskResult}
            className="bg-[#0a3144] hover:bg-[#1a4155]"
          >
            Próximo: Requisitos Documentais
          </Button>
        </div>
      </div>
    </form>
  )
}
