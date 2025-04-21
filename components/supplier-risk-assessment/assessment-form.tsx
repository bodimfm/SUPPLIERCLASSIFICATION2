"use client"

import type React from "react"
import { ChevronDown, ChevronRight, AlertCircle } from "lucide-react"
import { Checklist } from "./checklist"
import { calculateSupplierType, riskLevelColor } from "@/lib/risk-assessment"
import type { FormData } from "./supplier-risk-assessment"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { saveChecklistItems, getChecklistItemsByAssessment } from "@/lib/supabase"

interface AssessmentFormProps {
  formData: FormData
  toggleSection: (section: string) => void
  expandedSections: Record<string, boolean>
  prevStep: () => void
  nextStep: () => void
  supplierId: string | null
  assessmentId: string | null
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  formData,
  toggleSection,
  expandedSections,
  prevStep,
  nextStep,
  supplierId,
  assessmentId,
}) => {
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Carregar itens do checklist do Supabase quando o componente for montado
  useEffect(() => {
    if (assessmentId) {
      const loadChecklistItems = async () => {
        try {
          const items = await getChecklistItemsByAssessment(assessmentId)
          const itemsMap: Record<string, boolean> = {}
          items.forEach((item) => {
            itemsMap[`${item.category}-${item.item_text}`] = item.is_checked
          })
          setChecklistItems(itemsMap)
        } catch (error) {
          console.error("Erro ao carregar itens do checklist:", error)
        }
      }

      loadChecklistItems()
    }
  }, [assessmentId])

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
              Voltar para Triagem
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { code, description } = calculateSupplierType(
    formData.dataVolume as "low" | "medium" | "high" | "massive",
    formData.dataSensitivity as "non-sensitive" | "regular" | "sensitive",
  )

  const basicChecklist = [
    "Política de Privacidade e Proteção de Dados formalizada",
    "Nomeação de DPO/Encarregado documentada",
    "Registro das operações de tratamento (Art. 37 da LGPD)",
    "Procedimentos de resposta a incidentes documentados",
    "Procedimentos de atendimento aos direitos dos titulares",
  ]

  const technicalChecklist = [
    "Criptografia de dados em repouso",
    "Criptografia de dados em trânsito",
    "Implementação de controle de acesso (RBAC)",
    "Proteção de perímetro (firewalls, IPS/IDS)",
    "Gestão de vulnerabilidades (scans regulares)",
    "Segurança física de datacenters/instalações",
  ]

  const subcontractorChecklist = [
    "Política documentada para subcontratação",
    "Registro atualizado de todos os subcontratados",
    "Processo de aprovação prévia de novos subcontratados",
    "Extensão contratual das obrigações aos subcontratados",
    "Responsabilidade solidária claramente estabelecida",
  ]

  // Checklists adicionais para tipos específicos
  const criticalChecklist = [
    "Comitê formal de privacidade/segurança estabelecido",
    "Framework documentado de gestão de riscos",
    "Programa estruturado de conscientização em privacidade",
    "Auditoria interna específica para proteção de dados",
    "Análise documentada de impacto à proteção de dados (DPIA)",
  ]

  const significantChecklist = [
    "Política específica de classificação de dados",
    "Programa básico de conscientização em privacidade",
    "Procedimentos documentados de gestão de riscos",
    "Relatórios periódicos de conformidade",
  ]

  const technologyChecklist = [
    "Registro detalhado de atividades administrativas (logs)",
    "Preservação de logs por mínimo de 12 meses",
    "Capacidade de exportação de logs em formato estruturado",
    "Implementação de alarmes para atividades suspeitas",
    "Processo documentado de gestão de patches/vulnerabilidades",
  ]

  // Função para salvar os itens do checklist no Supabase
  const handleSaveChecklist = async () => {
    if (!assessmentId) return

    setIsSaving(true)
    try {
      // Preparar os itens para salvar
      const items = []

      // Processar checklist básico
      for (const item of basicChecklist) {
        items.push({
          assessment_id: assessmentId,
          category: "compliance",
          item_text: item,
          is_checked: checklistItems[`compliance-${item}`] || false,
          is_required: true,
          notes: "",
        })
      }

      // Processar checklist técnico
      for (const item of technicalChecklist) {
        items.push({
          assessment_id: assessmentId,
          category: "technical",
          item_text: item,
          is_checked: checklistItems[`technical-${item}`] || false,
          is_required: true,
          notes: "",
        })
      }

      // Processar checklist de subcontratados
      for (const item of subcontractorChecklist) {
        items.push({
          assessment_id: assessmentId,
          category: "subcontractors",
          item_text: item,
          is_checked: checklistItems[`subcontractors-${item}`] || false,
          is_required: true,
          notes: "",
        })
      }

      // Processar checklists específicos
      if (code === "A") {
        for (const item of criticalChecklist) {
          items.push({
            assessment_id: assessmentId,
            category: "critical",
            item_text: item,
            is_checked: checklistItems[`critical-${item}`] || false,
            is_required: true,
            notes: "",
          })
        }
      }

      if (code === "B") {
        for (const item of significantChecklist) {
          items.push({
            assessment_id: assessmentId,
            category: "significant",
            item_text: item,
            is_checked: checklistItems[`significant-${item}`] || false,
            is_required: true,
            notes: "",
          })
        }
      }

      if (formData.isTechnology) {
        for (const item of technologyChecklist) {
          items.push({
            assessment_id: assessmentId,
            category: "technology",
            item_text: item,
            is_checked: checklistItems[`technology-${item}`] || false,
            is_required: true,
            notes: "",
          })
        }
      }

      // Salvar no Supabase
      await saveChecklistItems(items)

      // Avançar para a próxima etapa
      nextStep()
    } catch (error) {
      console.error("Erro ao salvar checklist:", error)
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
      <h2 className="text-xl font-bold mb-4">Etapa 2: Avaliação do Fornecedor</h2>

      <div className="mb-6 p-4 border rounded bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Resultado da Triagem</h3>
            <p className="text-sm text-gray-600">Fornecedor: {formData.supplierName}</p>
            {supplierId && <p className="text-xs text-gray-500">ID: {supplierId}</p>}
          </div>
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${riskLevelColor[code]}`}
            >
              {code}
            </div>
            <div className="ml-3">
              <p className="font-medium">Tipo {code}</p>
              <p className="text-sm">{description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div
            className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded"
            onClick={() => toggleSection("compliance")}
          >
            <h3 className="font-medium">Avaliação de Conformidade Legal</h3>
            {expandedSections.compliance ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          <AnimatePresence>
            {expandedSections.compliance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Checklist
                  title="Conformidade Documental do Fornecedor"
                  items={basicChecklist}
                  type="compliance"
                  checkedItems={checklistItems}
                  onCheckChange={handleChecklistChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <div
            className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded"
            onClick={() => toggleSection("technical")}
          >
            <h3 className="font-medium">Avaliação de Maturidade Técnica</h3>
            {expandedSections.technical ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          <AnimatePresence>
            {expandedSections.technical && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Checklist
                  title="Controles de Segurança"
                  items={technicalChecklist}
                  type="technical"
                  checkedItems={checklistItems}
                  onCheckChange={handleChecklistChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <div
            className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded"
            onClick={() => toggleSection("subcontractors")}
          >
            <h3 className="font-medium">Avaliação de Subcontratados</h3>
            {expandedSections.subcontractors ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          <AnimatePresence>
            {expandedSections.subcontractors && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Checklist
                  title="Governança de Subcontratação"
                  items={subcontractorChecklist}
                  type="subcontractors"
                  checkedItems={checklistItems}
                  onCheckChange={handleChecklistChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Checklists específicos para categorias de risco */}
        {code === "A" && (
          <div>
            <div
              className="flex items-center justify-between p-3 bg-red-100 cursor-pointer rounded"
              onClick={() => toggleSection("critical")}
            >
              <h3 className="font-medium">Checklist Adicional para Fornecedores Críticos (A)</h3>
              {expandedSections.critical ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>

            <AnimatePresence>
              {expandedSections.critical && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Checklist
                    title="Governança Avançada"
                    items={criticalChecklist}
                    type="critical"
                    checkedItems={checklistItems}
                    onCheckChange={handleChecklistChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {code === "B" && (
          <div>
            <div
              className="flex items-center justify-between p-3 bg-orange-100 cursor-pointer rounded"
              onClick={() => toggleSection("significant")}
            >
              <h3 className="font-medium">Checklist Adicional para Fornecedores Significativos (B)</h3>
              {expandedSections.significant ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>

            <AnimatePresence>
              {expandedSections.significant && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Checklist
                    title="Governança Intermediária"
                    items={significantChecklist}
                    type="significant"
                    checkedItems={checklistItems}
                    onCheckChange={handleChecklistChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {formData.isTechnology && (
          <div>
            <div
              className="flex items-center justify-between p-3 bg-blue-100 cursor-pointer rounded"
              onClick={() => toggleSection("technology")}
            >
              <h3 className="font-medium">Checklist Adicional para Fornecedores de TI/SaaS</h3>
              {expandedSections.technology ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>

            <AnimatePresence>
              {expandedSections.technology && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Checklist
                    title="Controles Específicos para TI"
                    items={technologyChecklist}
                    type="technology"
                    checkedItems={checklistItems}
                    onCheckChange={handleChecklistChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
          Voltar para Triagem
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
            <>Avançar para Contratação</>
          )}
        </button>
      </div>
    </div>
  )
}
