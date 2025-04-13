"use client"

import type React from "react"
import { CheckCircle, FileText, ExternalLink, Calendar, Clock, UserCheck, AlertTriangle, Shield } from "lucide-react"
import { calculateSupplierType, getRequiredDocuments, riskLevelColor } from "@/lib/risk-assessment"
import type { FormData } from "./supplier-risk-assessment"

interface SubmissionStatusProps {
  formData: FormData
  selectedFile: File | null
  startExternalAssessment: () => void
}

export const SubmissionStatus: React.FC<SubmissionStatusProps> = ({
  formData,
  selectedFile,
  startExternalAssessment,
}) => {
  const { code, description } = calculateSupplierType(formData.dataVolume, formData.dataSensitivity)
  const requiredDocuments = getRequiredDocuments(code, formData.isTechnology)
  
  // Obter a data atual formatada
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Calcular estimativa de prazo com base no tipo do fornecedor
  const getEstimatedTimeframe = () => {
    switch(code) {
      case 'A': return '10 a 15 dias úteis';
      case 'B': return '5 a 10 dias úteis';
      case 'C': return '3 a 5 dias úteis';
      case 'D': return '1 a 3 dias úteis';
      default: return '5 dias úteis';
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Triagem Concluída com Sucesso</h2>
        <p className="text-gray-600">
          A triagem inicial do fornecedor <strong className="text-gray-800">{formData.supplierName}</strong> foi concluída e submetida para avaliação.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg border shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <FileText size={18} className="mr-2 text-gray-500" />
            Detalhes da Submissão
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <Calendar size={16} className="mr-2 mt-0.5 text-gray-400" />
              <div>
                <p className="text-gray-500">Data da solicitação:</p>
                <p className="font-medium">{currentDate}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Shield size={16} className="mr-2 mt-0.5 text-gray-400" />
              <div>
                <p className="text-gray-500">Classificação de risco:</p>
                <p className="font-medium flex items-center">
                  <span className={`inline-block w-5 h-5 rounded-full mr-2 ${riskLevelColor[code]} text-white text-xs font-bold flex items-center justify-center`}>
                    {code}
                  </span>
                  {description}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <UserCheck size={16} className="mr-2 mt-0.5 text-gray-400" />
              <div>
                <p className="text-gray-500">Responsável pela triagem:</p>
                <p className="font-medium">{formData.internalResponsible}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock size={16} className="mr-2 mt-0.5 text-gray-400" />
              <div>
                <p className="text-gray-500">Prazo estimado:</p>
                <p className="font-medium">{getEstimatedTimeframe()}</p>
              </div>
            </div>
            
            {selectedFile && (
              <div className="flex items-start">
                <FileText size={16} className="mr-2 mt-0.5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Documentação anexada:</p>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <AlertTriangle size={18} className="mr-2 text-blue-500" />
            Próximas Etapas
          </h3>
          
          <ol className="list-decimal pl-5 space-y-3 text-sm text-blue-700">
            <li>
              <p className="font-medium">Análise Preliminar</p>
              <p className="text-blue-600 text-xs">O escritório terceirizado irá analisar as informações fornecidas nesta triagem inicial.</p>
            </li>
            
            <li>
              <p className="font-medium">Solicitação de Documentação</p>
              <p className="text-blue-600 text-xs mb-1">Serão solicitados os seguintes documentos obrigatórios:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                {requiredDocuments
                  .filter((doc) => doc.required)
                  .slice(0, 3)
                  .map((doc) => (
                    <li key={doc.id}>{doc.name}</li>
                  ))}
                {requiredDocuments.filter((doc) => doc.required).length > 3 && (
                  <li>...e {requiredDocuments.filter((doc) => doc.required).length - 3} outros documentos</li>
                )}
              </ul>
            </li>
            
            <li>
              <p className="font-medium">Avaliação Completa</p>
              <p className="text-blue-600 text-xs">Após análise documental, poderá ser agendada uma reunião para esclarecimentos adicionais.</p>
            </li>
            
            <li>
              <p className="font-medium">Emissão de Parecer</p>
              <p className="text-blue-600 text-xs">O escritório emitirá um parecer de conformidade e recomendações de cláusulas contratuais.</p>
            </li>
          </ol>
          
          <div className="mt-4 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-500 italic">
              O prazo para conclusão dependerá da agilidade do fornecedor em fornecer a documentação solicitada.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <FileText size={16} className="mr-2" /> Iniciar Nova Avaliação
        </button>
        <button
          onClick={startExternalAssessment}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <ExternalLink size={16} className="mr-2" /> Continuar como Escritório Terceirizado
        </button>
      </div>
    </div>
  )
}

