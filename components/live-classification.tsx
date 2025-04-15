import type React from "react"
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

  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <h3 className="font-bold text-lg">Análise Prévia da Classificação</h3>
        <p className="text-sm text-gray-600">
          Baseado nas informações fornecidas, este fornecedor está classificado como:
        </p>
      </div>

      <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${riskLevelColor[code]}`}
          >
            {code}
          </div>
          <div className="ml-4">
            <p className="font-medium text-lg">{description}</p>
            <p className="text-sm text-gray-600">
              {code === "A" && "Tratamento massivo de dados sensíveis com alto risco"}
              {code === "B" && "Tratamento significativo de dados sensíveis ou volume elevado"}
              {code === "C" && "Tratamento moderado de dados com risco limitado"}
              {code === "D" && "Tratamento básico de dados não-sensíveis em baixo volume"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center border-l pl-4 md:ml-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{requiredCount + optionalCount}</p>
            <p className="text-xs text-gray-500">DOCUMENTOS TOTAIS</p>
          </div>
          <div className="flex gap-4 mt-2">
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
                className={`flex items-start p-3 rounded-md ${doc.required ? "bg-red-50" : "bg-blue-50"}`}
              >
                <div
                  className={`mt-1 mr-3 w-4 h-4 rounded-full flex-shrink-0 ${doc.required ? "bg-red-500" : "bg-blue-500"}`}
                ></div>
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-gray-600">{doc.required ? "Obrigatório" : "Recomendado"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
