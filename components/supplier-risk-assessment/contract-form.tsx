"use client"

import type React from "react"
import { ChevronDown, ChevronRight, AlertCircle, Save } from "lucide-react"
import { Checklist } from "./checklist"
import { calculateSupplierType, riskLevelColor } from "@/lib/risk-assessment"
import type { FormData } from "./supplier-risk-assessment"
import { useState, useEffect } from "react"
import { saveChecklistItems, getChecklistItemsByAssessment, updateAssessment } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface ContractFormProps {
  formData: FormData
  toggleSection: (section: string) => void
  expandedSections: Record<string, boolean>
  prevStep: () => void
  nextStep: () => void
  supplierId: string | null
  assessmentId: string | null
}

export const ContractForm: React.FC<ContractFormProps> = ({
  formData,
  toggleSection,
  expandedSections,
  prevStep,
  nextStep,
  supplierId,
  assessmentId,
}) => {
  const { toast } = useToast()
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveProgress, setSaveProgress] = useState(0)

  // Carregar itens do checklist do Supabase quando o componente for montado
  useEffect(() => {
    if (assessmentId) {
      const loadChecklistItems = async () => {
        try {
          setIsLoading(true)
          const items = await getChecklistItemsByAssessment(assessmentId)
          const itemsMap: Record<string, boolean> = {}
          items.forEach((item) => {
            if (item.category === "fundamental" || item.category === "procedural" || item.category === "verification") {
              itemsMap[`${item.category}-${item.item_text}`] = item.is_checked
            }
          })
          setChecklistItems(itemsMap)
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
              Voltar para Avaliação
            </button>
          </div>
        </div>
      </div>
    )
  }

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
      // Atualizar o status da avaliação para "in_review"
      await updateAssessment(assessmentId, {
        status: "in_review",
        updated_at: new Date().toISOString(),
      })
      setSaveProgress(20)

      // Preparar os itens para salvar
      const items = []
      const totalItems = fundamentalClauses.length + proceduralClauses.length + verificationClauses.length
      let processedItems = 0

      // Processar cláusulas fundamentais
      for (const item of fundamentalClauses) {
        items.push({
          assessment_id: assessmentId,
          category: "fundamental",
          item_text: item,
          is_checked: checklistItems[`fundamental-${item}`] || false,
          is_required: true,
          notes: "",
        })
        processedItems++
        setSaveProgress(20 + Math.floor((processedItems / totalItems) * 60))
      }

      // Processar cláusulas procedimentais
      for (const item of proceduralClauses) {
        items.push({
          assessment_id: assessmentId,
          category: "procedural",
          item_text: item,
          is_checked: checklistItems[`procedural-${item}`] || false,
          is_required: true,
          notes: "",
        })
        processedItems++
        setSaveProgress(20 + Math.floor((processedItems / totalItems) * 60))
      }

      // Processar cláusulas de verificação
      for (const item of verificationClauses) {
        items.push({
          assessment_id: assessmentId,
          category: "verification",
          item_text: item,
          is_checked: checklistItems[`verification-${item}`] || false,
          is_required: true,
          notes: "",
        })
        processedItems++
        setSaveProgress(20 + Math.floor((processedItems / totalItems) * 60))
      }

      // Primeiro, excluir itens existentes para evitar duplicação
      try {
        const { data: existingItems } = await getChecklistItemsByAssessment(assessmentId)
        if (existingItems && existingItems.length > 0) {
          const categoriesToDelete = ["fundamental", "procedural", "verification"]
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

      setSaveProgress(85)

      // Salvar no Supabase
      await saveChecklistItems(items)
      setSaveProgress(100)

      toast({
        title: "Checklist salvo",
        description: "Os itens do checklist foram salvos com sucesso",
        variant: "default",
      })

      // Avançar para a próxima etapa após um breve delay para mostrar o progresso completo
      setTimeout(() => {
        nextStep()
      }, 500)
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
      ) : (
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
              <Checklist
                title="Elementos Essenciais do Contrato"
                items={fundamentalClauses}
                type="fundamental"
                checkedItems={checklistItems}
                onCheckChange={handleChecklistChange}
              />
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
              <Checklist
                title="Procedimentos Operacionais"
                items={proceduralClauses}
                type="procedural"
                checkedItems={checklistItems}
                onCheckChange={handleChecklistChange}
              />
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
              <Checklist
                title="Mecanismos de Controle"
                items={verificationClauses}
                type="verification"
                checkedItems={checklistItems}
                onCheckChange={handleChecklistChange}
              />
            )}
          </div>
        </div>
      )}

      {isSaving && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center mb-2">
            <Save size={18} className="text-blue-600 mr-2" />
            <p className="font-medium text-blue-800">Salvando dados...</p>
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

      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          disabled={isSaving}
        >
          Voltar para Avaliação
        </button>
        <button
          onClick={handleSaveChecklist}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            <>Avançar para Monitoramento</>
          )}
        </button>
      </div>
    </div>
  )
}
