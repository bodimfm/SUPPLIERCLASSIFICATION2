import type React from "react"
import { Info, AlertTriangle, AlertCircle, FileCheck } from "lucide-react"
import { calculateSupplierType, getRequiredDocuments, riskLevelColor } from "@/lib/risk-assessment"
import type { FormData } from "./supplier-risk-assessment"

interface LiveClassificationProps {
  formData: FormData
}

export const LiveClassification: React.FC<LiveClassificationProps> = ({ formData }) => {
  const { code, description } = calculateSupplierType(formData.dataVolume, formData.dataSensitivity)
  const requiredDocuments = getRequiredDocuments(code, formData.isTechnology)

  const requiredCount = requiredDocuments.filter((doc) => doc.required).length
  const optionalCount = requiredDocuments.filter((doc) => !doc.required).length
  
  // Determinar o ícone e as diretrizes com base no nível de risco
  const getRiskIcon = () => {
    switch (code) {
      case "A":
        return <AlertCircle className="h-5 w-5 text-white" />
      case "B":
        return <AlertTriangle className="h-5 w-5 text-white" />
      case "C":
        return <Info className="h-5 w-5 text-white" />
      case "D":
        return <FileCheck className="h-5 w-5 text-white" />
      default:
        return null
    }
  }
  
  const getGuidelinesForRisk = () => {
    switch (code) {
      case "A":
        return [
          "Requer due diligence completa e DPA detalhado", 
          "Avaliação presencial e/ou auditoria recomendada",
          "Verificação rigorosa de subcontratados",
          "Monitoramento contínuo"
        ]
      case "B":
        return [
          "Questionário intermediário + cláusulas específicas",
          "Verificação documental detalhada",
          "Controles técnicos intermediários",
          "Monitoramento periódico"
        ]
      case "C":
        return [
          "Questionário básico + cláusulas padrão",
          "Autoavaliação documentada",
          "Controles básicos de segurança"
        ]
      case "D":
        return [
          "Cláusulas contratuais mínimas", 
          "Sem avaliação específica de privacidade"
        ]
      default:
        return []
    }
  }

  return (
    <div className="mt-6 border rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 p-4 border-b">
        <h3 className="font-bold text-lg">Análise Prévia da Classificação</h3>
        <p className="text-sm text-gray-600">
          Baseado nas informações fornecidas, este fornecedor está classificado como:
        </p>
      </div>

      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start">
            <div className={`rounded-lg p-3 flex items-center justify-center text-white ${riskLevelColor[code]}`}>
              {getRiskIcon()}
              <div className="ml-2 font-bold text-xl">{code}</div>
            </div>
            <div className="ml-4">
              <p className="font-bold text-lg">{description}</p>
              <p className="text-sm text-gray-600 mt-1">
                {code === "A" && "Tratamento massivo de dados sensíveis com alto risco"}
                {code === "B" && "Tratamento significativo de dados sensíveis ou volume elevado"}
                {code === "C" && "Tratamento moderado de dados com risco limitado"}
                {code === "D" && "Tratamento mínimo de dados não-sensíveis em baixo volume"}
              </p>
              
              <div className="mt-3">
                <p className="font-medium text-sm mb-1">Diretrizes para este nível:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {getGuidelinesForRisk().map((guideline, index) => (
                    <li key={index} className="text-sm text-gray-700">{guideline}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center border-l pl-4 md:ml-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{requiredCount + optionalCount}</p>
              <p className="text-xs text-gray-500">DOCUMENTOS TOTAIS</p>
            </div>
            <div className="flex gap-6 mt-3">
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">{requiredCount}</p>
                <p className="text-xs text-gray-500">OBRIGATÓRIOS</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{optionalCount}</p>
                <p className="text-xs text-gray-500">OPCIONAIS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="p-4 bg-gray-50 border-b">
          <h4 className="font-medium">Documentos Necessários para Análise</h4>
          <p className="text-sm text-gray-600">Documentos que deverão ser solicitados ao fornecedor:</p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requiredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-start p-3 rounded-md ${
                  doc.required ? "bg-red-50 border border-red-100" : "bg-blue-50 border border-blue-100"
                }`}
              >
                <div
                  className={`mt-1 mr-3 w-4 h-4 rounded-full flex-shrink-0 ${
                    doc.required ? "bg-red-500" : "bg-blue-500"
                  }`}
                ></div>
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className={`text-xs mt-1 ${doc.required ? "text-red-700" : "text-blue-700"}`}>
                    {doc.required ? "Obrigatório" : "Recomendado"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

