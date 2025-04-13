"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { ChevronDown, ChevronRight, Shield, CheckCircle, AlertCircle, HelpCircle, FileText } from "lucide-react"
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
  
  // Estado para rastrear o progresso da avaliação
  const [progress, setProgress] = useState({
    compliance: 0,
    technical: 0,
    subcontractors: 0,
    critical: 0,
    significant: 0,
    technology: 0
  });
  
  // Estado para gerenciar se cada seção está completa
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({
    compliance: false,
    technical: false,
    subcontractors: false,
    critical: false,
    significant: false,
    technology: false
  });
  
  // Calcula o progresso geral com base nas seções relevantes
  const calculateOverallProgress = () => {
    let relevantSections = ['compliance', 'technical', 'subcontractors'];
    if (code === 'A') relevantSections.push('critical');
    if (code === 'B') relevantSections.push('significant');
    if (formData.isTechnology) relevantSections.push('technology');
    
    const totalProgress = relevantSections.reduce((sum, section) => sum + progress[section as keyof typeof progress], 0);
    return Math.round(totalProgress / relevantSections.length);
  }
  
  // Atualiza o progresso de uma seção específica
  const updateSectionProgress = (section: string, completedItems: number, totalItems: number) => {
    const percentage = Math.round((completedItems / totalItems) * 100);
    
    setProgress(prev => ({
      ...prev,
      [section]: percentage
    }));
    
    setCompletedSections(prev => ({
      ...prev,
      [section]: percentage === 100
    }));
  };

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
  
  // Verifica se todas as seções necessárias foram preenchidas
  const allRequiredSectionsCompleted = () => {
    const requiredSections = ['compliance', 'technical', 'subcontractors'];
    if (code === 'A') requiredSections.push('critical');
    if (code === 'B') requiredSections.push('significant');
    if (formData.isTechnology) requiredSections.push('technology');
    
    return requiredSections.every(section => completedSections[section]);
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
        <h2 className="text-xl font-bold mb-2 flex items-center text-blue-800">
          <Shield size={20} className="mr-2" />
          Etapa 2: Avaliação de Conformidade do Fornecedor
        </h2>
        <p className="text-sm text-blue-700">
          Esta etapa deve ser preenchida pelo escritório terceirizado para avaliar a conformidade legal e técnica do fornecedor.
        </p>
      </div>

      <div className="mb-6 p-4 border rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h3 className="font-medium">Resultado da Triagem</h3>
            <p className="text-sm text-gray-600">Fornecedor: <span className="font-medium">{formData.supplierName}</span></p>
            <p className="text-sm text-gray-600">Escopo: <span className="font-medium">{formData.serviceDescription.substring(0, 60)}{formData.serviceDescription.length > 60 ? '...' : ''}</span></p>
          </div>
          <div className="flex items-center mt-3 sm:mt-0">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${riskLevelColor[code]}`}
            >
              {code}
            </div>
            <div className="ml-3">
              <p className="font-medium">Tipo {code}</p>
              <p className="text-sm">{description}</p>
            </div>
          </div>
        </div>
        
        {/* Barra de progresso da avaliação */}
        <div className="mt-5 pt-4 border-t">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progresso da avaliação</span>
            <span className="text-sm font-medium">{calculateOverallProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                calculateOverallProgress() === 100 ? 'bg-green-600' : 
                calculateOverallProgress() > 70 ? 'bg-blue-600' : 
                calculateOverallProgress() > 30 ? 'bg-yellow-500' : 'bg-orange-500'
              }`} 
              style={{ width: `${calculateOverallProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Seção de Conformidade Legal */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div
            className={`flex items-center justify-between p-3 ${
              expandedSections.compliance 
                ? 'bg-gray-100 border-b' 
                : completedSections.compliance
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50'
            } cursor-pointer`}
            onClick={() => toggleSection("compliance")}
          >
            <div className="flex items-center">
              <FileText size={18} className={`mr-2 ${completedSections.compliance ? 'text-green-500' : 'text-gray-500'}`} />
              <h3 className="font-medium">1. Avaliação de Conformidade Legal</h3>
              {completedSections.compliance && (
                <CheckCircle size={16} className="ml-2 text-green-500" />
              )}
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">{progress.compliance}%</span>
              {expandedSections.compliance ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </div>

          {expandedSections.compliance && (
            <div className="p-4">
              <Checklist 
                title="Conformidade Documental do Fornecedor" 
                items={basicChecklist} 
                type="compliance"
                onProgressUpdate={(completed, total) => updateSectionProgress('compliance', completed, total)}
              />
              
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                <div className="flex items-start">
                  <HelpCircle size={16} className="text-blue-500 mr-2 mt-0.5" />
                  <p className="text-blue-700">
                    Verifique se os documentos apresentados estão atualizados e cobrem adequadamente o escopo de tratamento de dados proposto.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seção de Maturidade Técnica */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div
            className={`flex items-center justify-between p-3 ${
              expandedSections.technical 
                ? 'bg-gray-100 border-b' 
                : completedSections.technical
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50'
            } cursor-pointer`}
            onClick={() => toggleSection("technical")}
          >
            <div className="flex items-center">
              <Shield size={18} className={`mr-2 ${completedSections.technical ? 'text-green-500' : 'text-gray-500'}`} />
              <h3 className="font-medium">2. Avaliação de Maturidade Técnica</h3>
              {completedSections.technical && (
                <CheckCircle size={16} className="ml-2 text-green-500" />
              )}
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">{progress.technical}%</span>
              {expandedSections.technical ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </div>

          {expandedSections.technical && (
            <div className="p-4">
              <Checklist 
                title="Controles de Segurança" 
                items={technicalChecklist} 
                type="technical"
                onProgressUpdate={(completed, total) => updateSectionProgress('technical', completed, total)}
              />
            </div>
          )}
        </div>

        {/* Seção de Subcontratados */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div
            className={`flex items-center justify-between p-3 ${
              expandedSections.subcontractors 
                ? 'bg-gray-100 border-b' 
                : completedSections.subcontractors
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50'
            } cursor-pointer`}
            onClick={() => toggleSection("subcontractors")}
          >
            <div className="flex items-center">
              <Shield size={18} className={`mr-2 ${completedSections.subcontractors ? 'text-green-500' : 'text-gray-500'}`} />
              <h3 className="font-medium">3. Avaliação de Subcontratados</h3>
              {completedSections.subcontractors && (
                <CheckCircle size={16} className="ml-2 text-green-500" />
              )}
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">{progress.subcontractors}%</span>
              {expandedSections.subcontractors ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </div>

          {expandedSections.subcontractors && (
            <div className="p-4">
              <Checklist 
                title="Governança de Subcontratação" 
                items={subcontractorChecklist} 
                type="subcontractors"
                onProgressUpdate={(completed, total) => updateSectionProgress('subcontractors', completed, total)}
              />
            </div>
          )}
        </div>

        {/* Checklists específicos para categorias de risco */}
        {code === "A" && (
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div
              className={`flex items-center justify-between p-3 ${
                expandedSections.critical 
                  ? 'bg-red-50 border-b border-red-100' 
                  : completedSections.critical
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50'
              } cursor-pointer`}
              onClick={() => toggleSection("critical")}
            >
              <div className="flex items-center">
                <AlertCircle size={18} className={`mr-2 ${completedSections.critical ? 'text-green-500' : 'text-red-500'}`} />
                <h3 className="font-medium">Checklist Adicional para Fornecedores Críticos (A)</h3>
                {completedSections.critical && (
                  <CheckCircle size={16} className="ml-2 text-green-500" />
                )}
              </div>
              <div className="flex items-center">
                <span className="text-sm mr-2">{progress.critical}%</span>
                {expandedSections.critical ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
            </div>

            {expandedSections.critical && (
              <div className="p-4">
                <Checklist 
                  title="Governança Avançada" 
                  items={criticalChecklist} 
                  type="critical"
                  onProgressUpdate={(completed, total) => updateSectionProgress('critical', completed, total)}
                />
              </div>
            )}
          </div>
        )}

        {code === "B" && (
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div
              className={`flex items-center justify-between p-3 ${
                expandedSections.significant 
                  ? 'bg-orange-50 border-b border-orange-100' 
                  : completedSections.significant
                    ? 'bg-green-50 text-green-800'
                    : 'bg-orange-50'
              } cursor-pointer`}
              onClick={() => toggleSection("significant")}
            >
              <div className="flex items-center">
                <AlertCircle size={18} className={`mr-2 ${completedSections.significant ? 'text-green-500' : 'text-orange-500'}`} />
                <h3 className="font-medium">Checklist Adicional para Fornecedores Significativos (B)</h3>
                {completedSections.significant && (
                  <CheckCircle size={16} className="ml-2 text-green-500" />
                )}
              </div>
              <div className="flex items-center">
                <span className="text-sm mr-2">{progress.significant}%</span>
                {expandedSections.significant ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
            </div>

            {expandedSections.significant && (
              <div className="p-4">
                <Checklist 
                  title="Governança Intermediária" 
                  items={significantChecklist} 
                  type="significant"
                  onProgressUpdate={(completed, total) => updateSectionProgress('significant', completed, total)}
                />
              </div>
            )}
          </div>
        )}

        {formData.isTechnology && (
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div
              className={`flex items-center justify-between p-3 ${
                expandedSections.technology 
                  ? 'bg-blue-50 border-b border-blue-100' 
                  : completedSections.technology
                    ? 'bg-green-50 text-green-800'
                    : 'bg-blue-50'
              } cursor-pointer`}
              onClick={() => toggleSection("technology")}
            >
              <div className="flex items-center">
                <AlertCircle size={18} className={`mr-2 ${completedSections.technology ? 'text-green-500' : 'text-blue-500'}`} />
                <h3 className="font-medium">Checklist Adicional para Fornecedores de TI/SaaS</h3>
                {completedSections.technology && (
                  <CheckCircle size={16} className="ml-2 text-green-500" />
                )}
              </div>
              <div className="flex items-center">
                <span className="text-sm mr-2">{progress.technology}%</span>
                {expandedSections.technology ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
            </div>

            {expandedSections.technology && (
              <div className="p-4">
                <Checklist 
                  title="Controles Específicos para TI" 
                  items={technologyChecklist} 
                  type="technology"
                  onProgressUpdate={(completed, total) => updateSectionProgress('technology', completed, total)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t">
        <button 
          onClick={prevStep} 
          className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Voltar para Triagem
        </button>
        <button 
          onClick={nextStep} 
          className={`px-4 py-2 ${
            allRequiredSectionsCompleted() 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-300 cursor-not-allowed'
          } text-white rounded-md transition-colors flex items-center`}
          disabled={!allRequiredSectionsCompleted()}
        >
          Avançar para Contratação
          <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
      
      {!allRequiredSectionsCompleted() && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded text-sm">
          <div className="flex items-start">
            <AlertCircle size={18} className="text-yellow-500 mr-2 mt-0.5" />
            <p className="text-yellow-700">
              Complete todas as seções obrigatórias antes de avançar para a etapa de contratação.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

