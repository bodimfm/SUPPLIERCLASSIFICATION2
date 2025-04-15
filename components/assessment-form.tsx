"use client"

import type React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Checklist } from "./checklist"
import { calculateSupplierType, riskLevelColor } from "@/lib/risk-assessment"
import type { FormData } from "./supplier-risk-assessment"

interface AssessmentFormProps {
  formData: FormData
  toggleSection: (section: string) => void
  expandedSections: Record<string, boolean>
  prevStep: () => void
  nextStep: () => void
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  formData,
  toggleSection,
  expandedSections,
  prevStep,
  nextStep,
}) => {
  const { code, description } = calculateSupplierType(formData.dataVolume, formData.dataSensitivity)

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

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Etapa 2: Avaliação do Fornecedor</h2>

      <div className="mb-6 p-4 border rounded bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Resultado da Triagem</h3>
            <p className="text-sm text-gray-600">Fornecedor: {formData.supplierName}</p>
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

          {expandedSections.compliance && (
            <Checklist title="Conformidade Documental do Fornecedor" items={basicChecklist} type="compliance" />
          )}
        </div>

        <div>
          <div
            className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded"
            onClick={() => toggleSection("technical")}
          >
            <h3 className="font-medium">Avaliação de Maturidade Técnica</h3>
            {expandedSections.technical ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          {expandedSections.technical && (
            <Checklist title="Controles de Segurança" items={technicalChecklist} type="technical" />
          )}
        </div>

        <div>
          <div
            className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer rounded"
            onClick={() => toggleSection("subcontractors")}
          >
            <h3 className="font-medium">Avaliação de Subcontratados</h3>
            {expandedSections.subcontractors ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          {expandedSections.subcontractors && (
            <Checklist title="Governança de Subcontratação" items={subcontractorChecklist} type="subcontractors" />
          )}
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

            {expandedSections.critical && (
              <Checklist title="Governança Avançada" items={criticalChecklist} type="critical" />
            )}
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

            {expandedSections.significant && (
              <Checklist title="Governança Intermediária" items={significantChecklist} type="significant" />
            )}
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

            {expandedSections.technology && (
              <Checklist title="Controles Específicos para TI" items={technologyChecklist} type="technology" />
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
          Voltar para Triagem
        </button>
        <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Avançar para Contratação
        </button>
      </div>
    </div>
  )
}
