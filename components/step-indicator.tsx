"use client"

import { CheckCircle, Circle } from "lucide-react"
import { motion } from "framer-motion"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  internalProcess: boolean
}

export default function StepIndicator({ currentStep, totalSteps, internalProcess }: StepIndicatorProps) {
  const steps = [
    { name: "Triagem", description: "Coleta de informações básicas" },
    { name: "Classificação", description: "Identificação de requisitos" },
    { name: "Documentação", description: "Upload de arquivos" },
    { name: "Avaliação", description: "Análise pelo escritório" },
  ]

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
              internalProcess ? "bg-blue-100 text-blue-800" : "bg-[#0a3144] text-white"
            }`}
          >
            {internalProcess ? "Processo Interno (Empresa)" : "Processo Externo (Escritório)"}
          </motion.span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {steps.slice(0, totalSteps).map((step, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className="flex items-center">
              {index < currentStep - 1 ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : index === currentStep - 1 ? (
                <motion.div
                  className="h-8 w-8 rounded-full bg-[#0a3144] flex items-center justify-center text-white font-medium"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                >
                  {index + 1}
                </motion.div>
              ) : (
                <Circle className="h-8 w-8 text-gray-300" />
              )}
            </div>
            <div className="mt-2 text-center">
              <div className="text-sm font-medium">{step.name}</div>
              <div className="text-xs text-gray-500 hidden md:block">{step.description}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative mt-2">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="h-0.5 w-full bg-gray-200"></div>
        </div>
        <div className="relative flex justify-between">
          {steps.slice(0, totalSteps).map((_, index) => (
            <motion.div
              key={index}
              className={`h-0.5 w-1/5 ${index < currentStep - 1 ? "bg-[#0a3144]" : "bg-gray-200"}`}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
