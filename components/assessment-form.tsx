"use client"

import type { FormData } from "./supplier-risk-assessment"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Shield, AlertTriangle } from "lucide-react"

interface AssessmentFormProps {
  formData: FormData
  nextStep: () => void
  prevStep: () => void
}

export default function AssessmentForm({ formData, nextStep, prevStep }: AssessmentFormProps) {
  const checklistItems = [
    {
      id: "privacy_policy",
      label: "Política de Privacidade",
      description: "Verificação da existência e adequação da política de privacidade",
    },
    {
      id: "dpo",
      label: "Encarregado de Dados (DPO)",
      description: "Verificação da nomeação e qualificação do encarregado",
    },
    {
      id: "security_measures",
      label: "Medidas de Segurança",
      description: "Análise das medidas técnicas e organizacionais de segurança",
    },
    {
      id: "data_processing",
      label: "Processamento de Dados",
      description: "Verificação da conformidade do processamento de dados pessoais",
    },
    {
      id: "international_transfer",
      label: "Transferência Internacional",
      description: "Análise de eventuais transferências internacionais de dados",
    },
  ]

  // Adiciona itens específicos para fornecedores de alto risco (A e B)
  const highRiskItems =
    formData.supplierType === "A" || formData.supplierType === "B"
      ? [
          {
            id: "dpia",
            label: "RIPD/DPIA",
            description: "Relatório de Impacto à Proteção de Dados Pessoais",
          },
          {
            id: "breach_notification",
            label: "Procedimento de Notificação de Incidentes",
            description: "Verificação do processo de notificação de violações de dados",
          },
        ]
      : []

  // Adiciona itens específicos para fornecedores de tecnologia
  const techItems = formData.isTechnology
    ? [
        {
          id: "tech_security",
          label: "Segurança Técnica",
          description: "Análise aprofundada das medidas de segurança técnica",
        },
        {
          id: "access_control",
          label: "Controle de Acesso",
          description: "Verificação dos mecanismos de controle de acesso aos dados",
        },
      ]
    : []

  const allItems = [...checklistItems, ...highRiskItems, ...techItems]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Avaliação do Fornecedor</h2>
        <p className="text-gray-500">Simulação da avaliação realizada pelo escritório terceirizado.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Shield className="h-10 w-10 text-purple-500" />
            <div>
              <h3 className="text-lg font-medium">Fornecedor: {formData.supplierName}</h3>
              <p className="text-sm text-gray-500">
                Tipo {formData.supplierType}: {formData.supplierTypeDescription}
              </p>
              <p className="text-sm text-gray-500 mt-1">{formData.serviceDescription}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {formData.sensitiveFlagged && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <div>
                <h3 className="font-medium text-amber-800">Atenção: Dados Sensíveis</h3>
                <p className="text-sm text-amber-700">
                  Este fornecedor processa dados pessoais sensíveis, exigindo análise mais rigorosa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Checklist de Avaliação</h3>

        <div className="space-y-4">
          {allItems.map((item) => (
            <div key={item.id} className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox id={item.id} className="mt-1" />
              <div>
                <Label htmlFor={item.id} className="font-medium">
                  {item.label}
                </Label>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Label htmlFor="assessment_notes">Observações da Avaliação</Label>
          <Textarea
            id="assessment_notes"
            placeholder="Insira observações relevantes sobre a avaliação do fornecedor..."
            className="min-h-[120px]"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Voltar
        </Button>
        <Button onClick={nextStep}>Próximo: Contratação</Button>
      </div>
    </div>
  )
}
