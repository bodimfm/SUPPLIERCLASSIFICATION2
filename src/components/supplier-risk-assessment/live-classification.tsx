"use client"

import type React from "react"

import { motion } from "framer-motion"
import { calculateSupplierType, getRequiredDocuments, riskLevelColor } from "@/lib/risk-assessment"
import { AlertCircle, Info } from "lucide-react"

interface LiveClassificationProps {
  formData?: {
    supplierName: string
    serviceDescription: string
    dataVolume: string
    dataSensitivity: string
    isTechnology: boolean
  }
  // Props from new wizard
  supplierName?: string
  serviceDescription?: string
  dataVolume?: string
  dataSensitivity?: string
  isTechnology?: boolean
}

export const LiveClassification: React.FC<LiveClassificationProps> = ({ 
  formData,
  supplierName,
  serviceDescription,
  dataVolume,
  dataSensitivity,
  isTechnology 
}) => {
  // Support both old and new props
  const data = {
    supplierName: supplierName || formData?.supplierName || '',
    serviceDescription: serviceDescription || formData?.serviceDescription || '',
    dataVolume: dataVolume || formData?.dataVolume || '',
    dataSensitivity: dataSensitivity || formData?.dataSensitivity || '',
    isTechnology: isTechnology !== undefined ? isTechnology : formData?.isTechnology || false
  }
  // Verificar se os campos necessários estão preenchidos
  if (!data.dataVolume || !data.dataSensitivity) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 border rounded-lg overflow-hidden shadow-md"
      >
        <div className="bg-yellow-50 p-4 border-b border-yellow-200">
          <div className="flex items-start">
            <AlertCircle size={20} className="text-yellow-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg text-yellow-800">Informações Incompletas</h3>
              <p className="text-sm text-yellow-700">
                Por favor, selecione o volume de dados e a sensibilidade para obter uma análise completa.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const { code, description } = calculateSupplierType(
    data.dataVolume as "low" | "medium" | "high" | "massive",
    data.dataSensitivity as "non-sensitive" | "regular" | "sensitive",
  )

  const requiredDocuments = getRequiredDocuments(code, data.isTechnology)

  const requiredCount = requiredDocuments.filter((doc) => doc.required).length
  const optionalCount = requiredDocuments.filter((doc) => !doc.required).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 border rounded-lg overflow-hidden shadow-md"
    >
      <div className="bg-gray-50 p-4 border-b">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-bold text-lg flex items-center"
        >
          <Info size={18} className="mr-2 text-blue-600" />
          Análise Prévia da Classificação
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-600"
        >
          Baseado nas informações fornecidas, este fornecedor está classificado como:
        </motion.p>
      </div>

      <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="flex items-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${riskLevelColor[code]} shadow-lg`}
          >
            {code}
          </motion.div>
          <div className="ml-4">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="font-medium text-lg"
            >
              {description}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-gray-600"
            >
              {code === "A" && "Tratamento massivo de dados sensíveis com alto risco"}
              {code === "B" && "Tratamento significativo de dados sensíveis ou volume elevado"}
              {code === "C" && "Tratamento moderado de dados com risco limitado"}
              {code === "D" && "Tratamento básico de dados não-sensíveis em baixo volume"}
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="flex flex-col items-center border-l pl-4 md:ml-4"
        >
          <div className="text-center">
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-3xl font-bold"
            >
              {requiredCount + optionalCount}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-gray-500"
            >
              DOCUMENTOS TOTAIS
            </motion.p>
          </div>
          <div className="flex gap-4 mt-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <p className="text-lg font-bold text-red-600">{requiredCount}</p>
              <p className="text-xs text-gray-500">OBRIGATÓRIOS</p>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center"
            >
              <p className="text-lg font-bold text-blue-600">{optionalCount}</p>
              <p className="text-xs text-gray-500">OPCIONAIS</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="border-t">
        <div className="p-4 bg-gray-50 border-b">
          <motion.h4
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="font-medium"
          >
            Documentos Necessários para Análise
          </motion.h4>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-sm text-gray-600"
          >
            Documentos que deverão ser solicitados ao fornecedor:
          </motion.p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requiredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.05 }}
                className={`flex items-start p-3 rounded-md ${doc.required ? "bg-red-50" : "bg-blue-50"} hover:shadow-md transition-shadow`}
              >
                <div
                  className={`mt-1 mr-3 w-4 h-4 rounded-full flex-shrink-0 ${doc.required ? "bg-red-500" : "bg-blue-500"}`}
                ></div>
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-gray-600">{doc.required ? "Obrigatório" : "Recomendado"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
