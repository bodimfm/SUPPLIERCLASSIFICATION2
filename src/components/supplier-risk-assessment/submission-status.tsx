"use client"

import type React from "react"
import { CheckCircle, FileText, ExternalLink } from "lucide-react"
import { calculateSupplierType, getRequiredDocuments, riskLevelColor } from "@/lib/risk-assessment"
import type { FormData } from "./supplier-risk-assessment"
import { motion } from "framer-motion"

interface SubmissionStatusProps {
  formData?: FormData
  selectedFile?: File | null
  startExternalAssessment?: () => void
  supplierId?: string | null
  assessmentId?: string | null
  // Props from new wizard
  supplier?: any
  assessment?: any
  classificationCode?: string
  classificationType?: string
}

export const SubmissionStatus: React.FC<SubmissionStatusProps> = ({
  formData,
  selectedFile,
  startExternalAssessment,
  supplierId,
  assessmentId,
  supplier,
  assessment,
  classificationCode,
  classificationType,
}) => {
  // Support both old and new wizard props
  const code = classificationCode || (formData ? calculateSupplierType(
    formData.dataVolume as "low" | "medium" | "high" | "massive",
    formData.dataSensitivity as "non-sensitive" | "regular" | "sensitive"
  ).code : 'D')
  
  const description = classificationType || (formData ? calculateSupplierType(
    formData.dataVolume as "low" | "medium" | "high" | "massive",
    formData.dataSensitivity as "non-sensitive" | "regular" | "sensitive"
  ).description : 'Básico')
  
  const isTechnology = supplier?.is_technology || formData?.isTechnology || false
  const supplierName = supplier?.name || formData?.supplierName || ''
  const internalResponsible = supplier?.internal_responsible || formData?.internalResponsible || ''
  const finalSupplierId = supplier?.id || supplierId
  const finalAssessmentId = assessment?.id || assessmentId
  
  const requiredDocuments = getRequiredDocuments(code, isTechnology)
  
  const getEstimatedTimeframe = (supplierType: string) => {
    switch (supplierType) {
      case 'A':
        return '10-15 dias úteis'
      case 'B':
        return '5-10 dias úteis'
      case 'C':
        return '3-5 dias úteis'
      case 'D':
        return '1-3 dias úteis'
      default:
        return '5-10 dias úteis'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white rounded shadow-lg text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
      >
        <CheckCircle size={40} className="text-green-600" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-2xl font-bold mb-4"
      >
        Triagem Concluída com Sucesso
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-gray-600 mb-6"
      >
        A triagem inicial do fornecedor <strong>{supplierName}</strong> foi concluída e submetida ao escritório
        terceirizado para avaliação.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="p-4 bg-gray-50 rounded-lg mb-6 text-left"
      >
        <h3 className="font-medium mb-2">Informações da Submissão:</h3>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Data da solicitação:</strong> {new Date().toLocaleDateString()}
          </p>
          <p className="flex items-center gap-2">
            <strong>Classificação prévia:</strong> 
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-sm font-medium ${riskLevelColor[code]}`}>
              Tipo {code} - {description}
            </span>
          </p>
          <p>
            <strong>Responsável interno:</strong> {internalResponsible}
          </p>
          <p>
            <strong>Prazo estimado:</strong> {getEstimatedTimeframe(code)}
          </p>
          {selectedFile && (
            <p>
              <strong>Documentação enviada:</strong> {selectedFile.name}
            </p>
          )}
          {finalSupplierId && (
            <p>
              <strong>ID do fornecedor:</strong> {finalSupplierId}
            </p>
          )}
          {finalAssessmentId && (
            <p>
              <strong>ID da avaliação:</strong> {finalAssessmentId}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="bg-blue-50 p-4 rounded-lg mb-6 text-left"
      >
        <h3 className="font-medium text-blue-800 mb-2">Próximos Passos:</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm text-blue-700">
          <li>O escritório terceirizado analisará a documentação enviada.</li>
          <li>
            Será solicitado o envio das seguintes documentações obrigatórias:
            <ul className="list-disc pl-5 mt-1 space-y-1">
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
          <li>Após a revisão, será programada uma reunião para finalizar a avaliação.</li>
        </ol>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center"
        >
          <FileText size={16} className="mr-2" /> Iniciar Nova Avaliação
        </motion.button>
        {startExternalAssessment && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startExternalAssessment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <ExternalLink size={16} className="mr-2" /> Continuar como Escritório Terceirizado
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  )
}
