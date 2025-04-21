"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, FileText, Monitor, FileCheck } from "lucide-react"

export const AnimatedStepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number
  totalSteps: number
}) => {
  const [steps, setSteps] = useState([
    { name: "Triagem", icon: <FileText size={24} />, description: "Informações iniciais do fornecedor" },
    { name: "Checklist", icon: <CheckCircle size={24} />, description: "Critérios de conformidade" },
    { name: "Contrato", icon: <FileCheck size={24} />, description: "Cláusulas contratuais" },
    { name: "Monitoramento", icon: <Monitor size={24} />, description: "Plano de monitoramento" },
  ])

  // Definindo os passos com base no totalSteps
  useEffect(() => {
    if (totalSteps === 3) {
      setSteps([
        { name: "Triagem", icon: <FileText size={24} />, description: "Informações iniciais do fornecedor" },
        { name: "Checklist", icon: <CheckCircle size={24} />, description: "Critérios de conformidade" },
        { name: "Monitoramento", icon: <Monitor size={24} />, description: "Plano de monitoramento" },
      ])
    }
  }, [totalSteps])

  return (
    <div className="py-8">
      {/* Versão para desktop */}
      <div className="hidden md:flex md:flex-col items-center">
        <div className="flex items-center justify-center space-x-12 mb-6">
          {steps.map((step, index) => (
            <div key={`step-${index}`} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 200,
                }}
                className={`relative ${
                  index < steps.length - 1 ? "after:content-[''] after:absolute after:top-1/2 after:left-full after:w-12 after:h-0.5 after:bg-gray-300 after:transform after:-translate-y-1/2" : ""
                }`}
              >
                <motion.div
                  initial={{
                    backgroundColor: "#e5e7eb", // gray-200
                    color: "#4b5563", // gray-600
                  }}
                  animate={{
                    backgroundColor: index === currentStep ? "#2563eb" : index < currentStep ? "#22c55e" : "#e5e7eb",
                    color: index <= currentStep ? "#ffffff" : "#4b5563",
                  }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-md cursor-help"
                  title={step.description}
                >
                  {index < currentStep ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                    >
                      <CheckCircle size={24} />
                    </motion.div>
                  ) : (
                    step.icon
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.2 + 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                className="mt-3 text-center"
              >
                <div
                  className={`font-medium ${
                    index === currentStep ? "text-blue-600" : index < currentStep ? "text-green-500" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </div>
                <div className="text-xs text-gray-500 max-w-[120px] text-center mt-1">{step.description}</div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Versão para mobile */}
      <div className="md:hidden">
        <div className="flex justify-between items-center px-4">
          {steps.map((step, index) => (
            <div key={`mobile-step-${index}`} className="flex flex-col items-center">
              <motion.div
                initial={{
                  backgroundColor: "#e5e7eb",
                  color: "#4b5563",
                }}
                animate={{
                  backgroundColor: index === currentStep ? "#2563eb" : index < currentStep ? "#22c55e" : "#e5e7eb",
                  color: index <= currentStep ? "#ffffff" : "#4b5563",
                }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-full flex items-center justify-center relative"
                title={step.description}
              >
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 left-full w-full h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                )}
                {index < currentStep ? <CheckCircle size={16} /> : <span className="text-xs">{index + 1}</span>}
              </motion.div>
              <div className="text-xs font-medium mt-1">{step.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
