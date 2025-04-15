"use client"

import type { FormData } from "./supplier-risk-assessment"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"

interface ContractingFormProps {
  formData: FormData
  nextStep: () => void
  prevStep: () => void
}

export default function ContractingForm({ formData, nextStep, prevStep }: ContractingFormProps) {
  const fundamentalClauses = [
    {
      id: "roles_definition",
      label: "Definição de Papéis",
      description: "Definição clara dos papéis como controlador e operador",
    },
    {
      id: "data_scope",
      label: "Escopo dos Dados",
      description: "Definição precisa dos dados pessoais tratados",
    },
    {
      id: "processing_purpose",
      label: "Finalidade do Tratamento",
      description: "Especificação das finalidades do tratamento de dados",
    },
    {
      id: "responsibilities",
      label: "Responsabilidades",
      description: "Delimitação das responsabilidades de cada parte",
    },
  ]

  const proceduralClauses = [
    {
      id: "sla",
      label: "Acordo de Nível de Serviço (SLA)",
      description: "Definição de métricas e tempos de resposta",
    },
    {
      id: "breach_notification",
      label: "Notificação de Incidentes",
      description: "Procedimentos para notificação de violações de dados",
    },
    {
      id: "operational_limits",
      label: "Limitações Operacionais",
      description: "Restrições ao processamento de dados pessoais",
    },
  ]

  const verificationClauses = [
    {
      id: "audit_rights",
      label: "Direitos de Auditoria",
      description: "Possibilidade de auditoria pelo controlador",
    },
    {
      id: "compliance_verification",
      label: "Verificação de Conformidade",
      description: "Mecanismos para verificação contínua da conformidade",
    },
    {
      id: "penalties",
      label: "Penalidades",
      description: "Sanções por descumprimento das obrigações contratuais",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Requisitos Contratuais</h2>
        <p className="text-gray-500">Recomendações de cláusulas contratuais para o fornecedor.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <FileText className="h-10 w-10 text-purple-500" />
            <div>
              <h3 className="text-lg font-medium">Fornecedor: {formData.supplierName}</h3>
              <p className="text-sm text-gray-500">
                Tipo {formData.supplierType}: {formData.supplierTypeDescription}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Cláusulas Fundamentais</h3>
          <div className="space-y-4">
            {fundamentalClauses.map((clause) => (
              <div key={clause.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox id={clause.id} className="mt-1" />
                <div>
                  <Label htmlFor={clause.id} className="font-medium">
                    {clause.label}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">{clause.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Cláusulas Procedimentais</h3>
          <div className="space-y-4">
            {proceduralClauses.map((clause) => (
              <div key={clause.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox id={clause.id} className="mt-1" />
                <div>
                  <Label htmlFor={clause.id} className="font-medium">
                    {clause.label}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">{clause.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Cláusulas de Verificação</h3>
          <div className="space-y-4">
            {verificationClauses.map((clause) => (
              <div key={clause.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox id={clause.id} className="mt-1" />
                <div>
                  <Label htmlFor={clause.id} className="font-medium">
                    {clause.label}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">{clause.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="contract_notes">Observações Contratuais</Label>
          <Textarea
            id="contract_notes"
            placeholder="Insira observações relevantes sobre as cláusulas contratuais..."
            className="min-h-[120px]"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Voltar
        </Button>
        <Button onClick={nextStep}>Próximo: Monitoramento</Button>
      </div>
    </div>
  )
}
