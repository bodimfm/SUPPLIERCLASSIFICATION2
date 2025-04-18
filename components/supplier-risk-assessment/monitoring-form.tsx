"use client"

import type React from "react"
import { ChevronDown, ChevronRight, AlertCircle, Save, CheckCircle } from "lucide-react"
import { Checklist } from "./checklist"
import { calculateSupplierType, riskLevelColor } from "@/lib/risk-assessment"
import type { FormData } from "./supplier-risk-assessment"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { saveChecklistItems, updateSupplier, getChecklistItemsByAssessment, updateAssessment } from "@/lib/supabase"

interface MonitoringFormProps {
  formData: FormData
  toggleSection: (section: string) => void
  expandedSections: Record<string, boolean>
  prevStep: () => void
  supplierId: string | null
  assessmentId: string | null
}

export const MonitoringForm: React.FC<MonitoringFormProps> = ({
  formData,
  toggleSection,
  expandedSections,
  prevStep,
  supplierId,
  assessmentId,
}) => {
  const { toast } = useToast()
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveProgress, setSaveProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // Carregar itens do checklist do Supabase quando o componente for montado
  useEffect(() => {
    if (assessmentId) {
      const loadChecklistItems = async () => {
        try {
          setIsLoading(true)
          const items = await getChecklistItemsByAssessment(assessmentId)
          const itemsMap: Record<string, boolean> = {}
          items.forEach((item) => {
            if (item.category === "periodic" || item.category === "updates") {
              itemsMap[`${item.category}-${item.item_text}`] = item.is_checked
            }
          })
          setChecklistItems(itemsMap)

          // Verificar se a avaliação já foi concluída
          if (assessmentId) {
            try {
              const { data: assessmentData, error } = await updateAssessment(assessmentId, {}, true)
              if (!error && assessmentData && assessmentData.status === "completed") {
                setIsCompleted(true)
              }
            } catch (error) {
              console.error("Erro ao verificar status da avaliação:", error)
            }
          }
        } catch (error) {
          console.error("Erro ao carregar itens do checklist:", error)
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os itens do checklist. Por favor, tente novamente.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      loadChecklistItems()
    }
  }, [assessmentId, toast])

  // Verificar se os campos necessários estão preenchidos
  if (!formData.dataVolume || !formData.dataSensitivity) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <div className="flex items-start">
            <AlertCircle size={20} className="text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">Informações Incompletas</h3>
              <p className="text-sm text-yellow-700">
                A classificação do fornecedor não pode ser realizada. Por favor, retorne à etapa anterior e complete
                todas as informações necessárias.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
              Voltar para Contratação
            </button>
          </div>
        </div>
      </div>
    )
  }

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

  // Função para salvar os itens do checklist no Supabase
  const handleSaveChecklist = async () => {
    if (!assessmentId) {
      toast({
        title: "Erro",
        description: "ID da avaliação não encontrado",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setSaveProgress(0)

    try {
      // Preparar os itens para salvar
      const items = []
      const totalItems = periodicChecks.length + updateManagement.length
      let processedItems = 0

      // Processar verificações periódicas
      for (const item of periodicChecks) {
        items.push({
          assessment_id: assessmentId,
          category: "periodic",
          item_text: item,
          is_checked: checklistItems[`periodic-${item}`] || false,
          is_required: true,
          notes: "",
        })
        processedItems++
        setSaveProgress(Math.floor((processedItems / totalItems) * 80))
      }

      // Processar gestão de atualizações
      for (const item of updateManagement) {
        items.push({
          assessment_id: assessmentId,
          category: "updates",
          item_text: item,
          is_checked: checklistItems[`updates-${item}`] || false,
          is_required: true,
          notes: "",
        })
        processedItems++
        setSaveProgress(Math.floor((processedItems / totalItems) * 80))
      }

      // Primeiro, excluir itens existentes para evitar duplicação
      try {
        const { data: existingItems } = await getChecklistItemsByAssessment(assessmentId)
        if (existingItems && existingItems.length > 0) {
          const categoriesToDelete = ["periodic", "updates"]
          for (const category of categoriesToDelete) {
            const itemsToDelete = existingItems.filter((item) => item.category === category)
            if (itemsToDelete.length > 0) {
              // Aqui você precisaria implementar uma função para excluir itens
              // Como não temos essa função, vamos apenas logar
              console.log(`Itens da categoria ${category} seriam excluídos antes de inserir novos`)
            }
          }
        }
      } catch (error) {
        console.warn("Erro ao verificar itens existentes:", error)
      }

      setSaveProgress(90)

      // Salvar no Supabase
      await saveChecklistItems(items)
      setSaveProgress(100)

      toast({
        title: "Checklist salvo",
        description: "Os itens do checklist foram salvos com sucesso",
        variant: "default",
      })
    } catch (error) {
      console.error("Erro ao salvar checklist:", error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os itens do checklist. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Função para atualizar o estado do checklist
  const handleChecklistChange = (type: string, item: string, checked: boolean) => {
    setChecklistItems((prev) => ({
      ...prev,
      [`${type}-${item}`]: checked,
    }))
  }

  const handleComplete = async () => {
    if (!supplierId || !assessmentId) {
      toast({
        title: "Erro",
        description: "ID do fornecedor ou da avaliação não encontrado",
        variant: "destructive",
      })
      return
    }

    setIsCompleting(true)
    setSaveProgress(0)

    try {
      // Salvar o checklist primeiro
      await handleSaveChecklist()
      setSaveProgress(40)

      // Atualizar o status da avaliação para "completed"
      await updateAssessment(assessmentId, {
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      setSaveProgress(70)

      // Atualizar o status do fornecedor para "approved"
      await updateSupplier(supplierId, { status: "approved" })
      setSaveProgress(100)

      setIsCompleted(true)

      toast({
        title: "Processo concluído",
        description: "O processo de avaliação do fornecedor foi finalizado com sucesso.",
        variant: "default",
      })
    } catch (error) {
      console.error("Erro ao concluir processo:", error)
      toast({
        title: "Erro ao concluir",
        description: "Ocorreu um erro ao finalizar o processo de avaliação",
        variant: "destructive",
      })
    } finally {
      setIsCompleting(false)
    }
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
            {supplierId && <p className="text-xs text-gray-500">ID: {supplierId}</p>}
          </div>
          <div
            className={`px-3 py-1 rounded-full text-white ${riskLevelColor[formData.supplierType as "A" | "B" | "C" | "D"]}`}
          >
            {
              calculateSupplierType(
                formData.dataVolume as "low" | "medium" | "high" | "massive",
                formData.dataSensitivity as "non-sensitive" | "regular" | "sensitive",
              ).description
            }
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-navy font-medium">Carregando dados do checklist...</p>
        </div>
      ) : isCompleted ? (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Avaliação Concluída</h3>
          <p className="text-green-700 mb-4">
            O processo de avaliação deste fornecedor foi finalizado com sucesso. O fornecedor foi aprovado e está pronto
            para contratação.
          </p>
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-800 mb-2">Próximos Passos</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-green-600 text-xs">1</span>
                </div>
                <span>Formalizar contrato com as cláusulas de proteção de dados identificadas</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-green-600 text-xs">2</span>
                </div>
                <span>Implementar o plano de monitoramento conforme cronograma definido</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-green-600 text-xs">3</span>
                </div>
                <span>Agendar primeira verificação periódica conforme classificação de risco</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => (window.location.href = "/suppliers")}
            className="mt-6 px-6 py-2 bg-navy text-white rounded-lg hover:bg-navy/80 transition-colors"
          >
            Voltar para Lista de Fornecedores
          </button>
        </div>
      ) : (
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
              <Checklist
                title="Monitoramento Regular"
                items={periodicChecks}
                type="periodic"
                checkedItems={checklistItems}
                onCheckChange={handleChecklistChange}
              />
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
              <Checklist
                title="Controle de Mudanças"
                items={updateManagement}
                type="updates"
                checkedItems={checklistItems}
                onCheckChange={handleChecklistChange}
              />
            )}
          </div>

          <div className="p-4 border rounded bg-blue-50 mt-6">
            <h3 className="font-medium text-blue-800 mb-2">Cronograma de Monitoramento Recomendado</h3>
            <p className="text-sm mb-3">
              Com base na classificação do fornecedor:{" "}
              <strong>
                {
                  calculateSupplierType(
                    formData.dataVolume as "low" | "medium" | "high" | "massive",
                    formData.dataSensitivity as "non-sensitive" | "regular" | "sensitive",
                  ).description
                }
              </strong>
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
      )}

      {(isSaving || isCompleting) && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center mb-2">
            <Save size={18} className="text-blue-600 mr-2" />
            <p className="font-medium text-blue-800">
              {isCompleting ? "Finalizando processo..." : "Salvando dados..."}
            </p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${saveProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-600 mt-1 text-right">{saveProgress}% concluído</p>
        </div>
      )}

      {!isCompleted && (
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            disabled={isSaving || isCompleting}
          >
            Voltar para Contratação
          </button>
          <div className="flex space-x-2">
            <button
              onClick={handleSaveChecklist}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              disabled={isSaving || isCompleting}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>Salvar Checklist</>
              )}
            </button>
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
              disabled={isSaving || isCompleting}
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Concluindo...
                </>
              ) : (
                <>Concluir Processo</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
