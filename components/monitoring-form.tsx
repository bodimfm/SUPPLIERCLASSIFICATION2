"use client"

import type React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Checklist } from "./checklist"
import { calculateSupplierType, riskLevelColor } from "@/lib/risk-assessment"
import type { FormData } from "./supplier-risk-assessment"
import { useToast } from "@/hooks/use-toast"

interface MonitoringFormProps {
  formData: FormData
  toggleSection: (section: string) => void
  expandedSections: Record<string, boolean>
  prevStep: () => void
}

export const MonitoringForm: React.FC<MonitoringFormProps> = ({
  formData,
  toggleSection,
  expandedSections,
  prevStep,
}) => {
  const { toast } = useToast()

  const periodicChecks = [
    "Cronograma de verificações baseado em risco",
    "Questionários de autoavaliação periódicos",
    "Auditorias presenciais (para fornecedores Tipo A)",
    "Verificação de certificações renovadas",
    "Testes de invasão/vulnerabilidade (quando aplicável)",
  ]

  const updateManagement = [
    "Procedimento de notificação de mudanças/atualizações significativas",
    "Reavaliação em caso de alteração de escopo",
    "Atualização de inventário de dados/fluxos",
    "Revisão em caso de reorganização societária do fornecedor",
    "Avaliação de impacto para mudanças críticas",
  ]

  const handleComplete = () => {
    toast({
      title: "Processo concluído",
      description: "O processo de avaliação do fornecedor foi finalizado com sucesso.",
      variant: "default",
    })
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Etapa 4: Monitoramento do Fornecedor</h2>

      <div className="mb-6 p-4 border rounded bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Plano de Monitoramento</h3>
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
            onClick={() => toggleSection("periodic")}
          >
            <h3 className="font-medium">Verificações Periódicas</h3>
            {expandedSections.periodic ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          {expandedSections.periodic && (
            <Checklist title="Monitoramento Regular" items={periodicChecks} type="periodic" />
          )}
        </div>

        <div>
          <div
            className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded"
            onClick={() => toggleSection("updates")}
          >
            <h3 className="font-medium">Gestão de Atualizações</h3>
            {expandedSections.updates ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          {expandedSections.updates && (
            <Checklist title="Controle de Mudanças" items={updateManagement} type="updates" />
          )}
        </div>

        <div className="p-4 border rounded bg-blue-50 mt-6">
          <h3 className="font-medium text-blue-800 mb-2">Cronograma de Monitoramento Recomendado</h3>
          <p className="text-sm mb-3">
            Com base na classificação do fornecedor:{" "}
            <strong>{calculateSupplierType(formData.dataVolume, formData.dataSensitivity).description}</strong>
          </p>

          <div className="space-y-2">
            {formData.supplierType === "A" && (
              <>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <p className="text-sm">
                    Auditoria completa: <strong>Anual</strong>
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <p className="text-sm">
                    Questionário de autoavaliação: <strong>Trimestral</strong>
                  </p>
                </div>
              </>
            )}

            {formData.supplierType === "B" && (
              <>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <p className="text-sm">
                    Auditoria documental: <strong>Anual</strong>
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <p className="text-sm">
                    Questionário de autoavaliação: <strong>Semestral</strong>
                  </p>
                </div>
              </>
            )}

            {formData.supplierType === "C" && (
              <>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <p className="text-sm">
                    Verificação documental: <strong>Anual</strong>
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <p className="text-sm">
                    Questionário simplificado: <strong>Anual</strong>
                  </p>
                </div>
              </>
            )}

            {formData.supplierType === "D" && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <p className="text-sm">
                  Verificação básica: <strong>Bienal</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
          Voltar para Contratação
        </button>
        <button onClick={handleComplete} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Concluir Processo
        </button>
      </div>
    </div>
  )
}
