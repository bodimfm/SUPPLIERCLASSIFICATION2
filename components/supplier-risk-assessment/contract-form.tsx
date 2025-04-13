"use client"

import { useState } from "react"
import type React from "react"
import { ChevronDown, ChevronRight, FileText, AlertCircle, CheckCircle, User } from "lucide-react"
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
  // Estado para rastrear o progresso das cláusulas
  const [progress, setProgress] = useState({
    fundamental: 0,
    procedural: 0,
    verification: 0
  });
  
  // Estado para gerenciar se cada seção está completa
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({
    fundamental: false,
    procedural: false,
    verification: false
  });
  
  // Calcula o progresso geral
  const calculateOverallProgress = () => {
    const totalProgress = Object.values(progress).reduce((sum, value) => sum + value, 0);
    return Math.round(totalProgress / Object.values(progress).length);
  };
  
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
  
  // Verifica se todas as seções foram preenchidas
  const allSectionsCompleted = () => {
    return Object.values(completedSections).every(Boolean);
  };
  
  const { code, description } = calculateSupplierType(formData.dataVolume, formData.dataSensitivity);

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
  
  // Cláusulas adicionais para fornecedores de tipo A (crítico)
  const criticalClauses = code === "A" ? [
    "Plano de contingência para incidentes graves",
    "Prazos mais rígidos para resposta a violações (4 horas)",
    "Garantias financeiras específicas para incidentes de dados",
    "Acordos de nível de serviço (SLA) mais rigorosos",
    "Obrigação de notificação prévia para alterações nas medidas de segurança"
  ] : [];
  
  // Cláusulas adicionais para fornecedores de TI
  const techClauses = formData.isTechnology ? [
    "Política de gestão de patches de segurança",
    "Procedimentos de backup e recuperação de desastres",
    "Segregação de dados em ambientes multi-tenant",
    "Processo de manutenção e atualização de infraestrutura",
    "Política de logs e trilhas de auditoria"
  ] : [];

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
        <h2 className="text-xl font-bold mb-2 flex items-center text-blue-800">
          <User size={20} className="mr-2" />
          Etapa 3: Contratação do Fornecedor
        </h2>
        <p className="text-sm text-blue-700">
          Esta etapa define as cláusulas contratuais necessárias com base na classificação de risco do fornecedor.
        </p>
      </div>

      <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h3 className="font-medium">Dados do Fornecedor</h3>
            <p className="text-sm text-gray-600">Nome: <span className="font-medium">{formData.supplierName}</span></p>
            <p className="text-sm text-gray-600">Tipo de Contrato: <span className="font-medium">{formData.contractType === 'continuous' ? 'Continuado' : 'Pontual'}</span></p>
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
        
        {/* Barra de progresso */}
        <div className="mt-5 pt-4 border-t">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Análise de cláusulas contratuais</span>
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
        {/* Seção de Cláusulas Fundamentais */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div
            className={`flex items-center justify-between p-3 ${
              expandedSections.fundamental 
                ? 'bg-gray-100 border-b' 
                : completedSections.fundamental
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50'
            } cursor-pointer`}
            onClick={() => toggleSection("fundamental")}
          >
            <div className="flex items-center">
              <FileText size={18} className={`mr-2 ${completedSections.fundamental ? 'text-green-500' : 'text-gray-500'}`} />
              <h3 className="font-medium">1. Cláusulas Fundamentais</h3>
              {completedSections.fundamental && (
                <CheckCircle size={16} className="ml-2 text-green-500" />
              )}
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">{progress.fundamental}%</span>
              {expandedSections.fundamental ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </div>

          {expandedSections.fundamental && (
            <div className="p-4">
              <Checklist 
                title="Elementos Essenciais do Contrato" 
                items={fundamentalClauses} 
                type="fundamental" 
                onProgressUpdate={(completed, total) => updateSectionProgress('fundamental', completed, total)}
              />
            </div>
          )}
        </div>

        {/* Seção de Cláusulas Procedimentais */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div
            className={`flex items-center justify-between p-3 ${
              expandedSections.procedural 
                ? 'bg-gray-100 border-b' 
                : completedSections.procedural
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50'
            } cursor-pointer`}
            onClick={() => toggleSection("procedural")}
          >
            <div className="flex items-center">
              <FileText size={18} className={`mr-2 ${completedSections.procedural ? 'text-green-500' : 'text-gray-500'}`} />
              <h3 className="font-medium">2. Cláusulas Procedimentais</h3>
              {completedSections.procedural && (
                <CheckCircle size={16} className="ml-2 text-green-500" />
              )}
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">{progress.procedural}%</span>
              {expandedSections.procedural ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </div>

          {expandedSections.procedural && (
            <div className="p-4">
              <Checklist 
                title="Procedimentos Operacionais" 
                items={proceduralClauses} 
                type="procedural"
                onProgressUpdate={(completed, total) => updateSectionProgress('procedural', completed, total)}
              />
            </div>
          )}
        </div>

        {/* Seção de Cláusulas de Verificação */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div
            className={`flex items-center justify-between p-3 ${
              expandedSections.verification 
                ? 'bg-gray-100 border-b' 
                : completedSections.verification
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50'
            } cursor-pointer`}
            onClick={() => toggleSection("verification")}
          >
            <div className="flex items-center">
              <FileText size={18} className={`mr-2 ${completedSections.verification ? 'text-green-500' : 'text-gray-500'}`} />
              <h3 className="font-medium">3. Cláusulas de Verificação</h3>
              {completedSections.verification && (
                <CheckCircle size={16} className="ml-2 text-green-500" />
              )}
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">{progress.verification}%</span>
              {expandedSections.verification ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </div>

          {expandedSections.verification && (
            <div className="p-4">
              <Checklist 
                title="Mecanismos de Controle" 
                items={verificationClauses} 
                type="verification"
                onProgressUpdate={(completed, total) => updateSectionProgress('verification', completed, total)}
              />
            </div>
          )}
        </div>
        
        {/* Cláusulas adicionais para fornecedores críticos */}
        {code === "A" && criticalClauses.length > 0 && (
          <div className="border border-red-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-3 bg-red-50 text-red-800">
              <div className="flex items-center">
                <AlertCircle size={18} className="text-red-500 mr-2" />
                <h3 className="font-medium">Cláusulas Adicionais para Fornecedores Críticos (Tipo A)</h3>
              </div>
              <p className="text-xs text-red-600 mt-1 ml-6">
                Estas cláusulas são necessárias devido ao alto risco apresentado por este fornecedor.
              </p>
            </div>
            
            <div className="p-4">
              <Checklist 
                title="Proteções Contratuais Adicionais" 
                items={criticalClauses} 
                type="critical"
              />
            </div>
          </div>
        )}
        
        {/* Cláusulas adicionais para fornecedores de TI */}
        {formData.isTechnology && techClauses.length > 0 && (
          <div className="border border-blue-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-800">
              <div className="flex items-center">
                <AlertCircle size={18} className="text-blue-500 mr-2" />
                <h3 className="font-medium">Cláusulas Específicas para Fornecedores de TI/SaaS</h3>
              </div>
              <p className="text-xs text-blue-600 mt-1 ml-6">
                Estas cláusulas são recomendadas para fornecedores de tecnologia e serviços em nuvem.
              </p>
            </div>
            
            <div className="p-4">
              <Checklist 
                title="Requisitos Técnicos Específicos" 
                items={techClauses} 
                type="tech"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t">
        <button 
          onClick={prevStep} 
          className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Voltar para Avaliação
        </button>
        <button 
          onClick={nextStep} 
          className={`px-4 py-2 ${
            allSectionsCompleted() 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-300 cursor-not-allowed'
          } text-white rounded-md transition-colors flex items-center`}
          disabled={!allSectionsCompleted()}
        >
          Avançar para Monitoramento
          <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
      
      {!allSectionsCompleted() && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded text-sm">
          <div className="flex items-start">
            <AlertCircle size={18} className="text-yellow-500 mr-2 mt-0.5" />
            <p className="text-yellow-700">
              Complete a verificação de todas as cláusulas contratuais obrigatórias antes de avançar.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

