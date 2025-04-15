"use client"

import type React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Checklist } from "./checklist"
import { calculateSupplierType, riskLevelColor } from "@/lib/risk-assessment"
import type { FormData } from "./supplier-risk-assessment"

interface ContractFormProps {
  formData: FormData
  toggleSection: (section: string) => void
  expandedSections: Record<string, boolean>
  prevStep: () => void
  nextStep: () => void
}

export const ContractForm: React.FC<ContractFormProps> = ({
  formData,
  toggleSection,
  expandedSections,
  prevStep,
  nextStep,
}) => {
  const fundamentalClauses = [
    "Definição clara das responsabilidades (operador/controlador)",
    "Definição do escopo e finalidade do tratamento",
    "Obrigações de confidencialidade",
    "Medidas técnicas e organizativas exigidas",
    "Procedimentos de término de contrato e devolução/exclusão de dados",
  ]

  const proceduralClauses = [
    "SLAs para resposta a solicitações de titulares",
    "Procedimentos de notificação de violações (prazos <24h)",
    "Requisitos para transferências internacionais",
    "Limitações de uso para novas finalidades",
    "Requisitos de minimização e retenção de dados",
  ]

  const verificationClauses = [
    "Direitos de auditoria claramente estabelecidos",
    "Periodicidade de verificações de conformidade",
    "Obrigação de cooperação em investigações",
    "Evidenciação de controles implementados",
    "Penalidades por não-conformidade",
  ]

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Etapa 3: Contratação do Fornecedor</h2>

      <div className="mb-6 p-4 border rounded bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Requisitos Contratuais</h3>
            <p className="text-sm text-gray-600">
              Fornecedor: {formData.supplierName} - Tipo {formData.supplierType}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-white ${riskLevelColor[formData.supplierType]}`}>
            {calculateSupplierType(formData.dataVolume, formData.dataSensitivity).description}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div
            className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded"
            onClick={() => toggleSection("fundamental")}
          >
            <h3 className="font-medium">Cláusulas Fundamentais</h3>
            {expandedSections.fundamental ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          {expandedSections.fundamental && (
            <Checklist title="Elementos Essenciais do Contrato" items={fundamentalClauses} type="fundamental" />
          )}
        </div>

        <div>
          <div
            className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded"
            onClick={() => toggleSection("procedural")}
          >
            <h3 className="font-medium">Cláusulas Procedimentais</h3>
            {expandedSections.procedural ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          {expandedSections.procedural && (
            <Checklist title="Procedimentos Operacionais" items={proceduralClauses} type="procedural" />
          )}
        </div>

        <div>
          <div
            className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded"
            onClick={() => toggleSection("verification")}
          >
            <h3 className="font-medium">Cláusulas de Verificação</h3>
            {expandedSections.verification ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          {expandedSections.verification && (
            <Checklist title="Mecanismos de Controle" items={verificationClauses} type="verification" />
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
          Voltar para Avaliação
        </button>
        <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Avançar para Monitoramento
        </button>
      </div>
    </div>
  )
}
