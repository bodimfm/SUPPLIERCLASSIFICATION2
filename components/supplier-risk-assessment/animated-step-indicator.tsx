"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FileText, Shield, User, RefreshCw, CheckCircle } from "lucide-react"
import { Tooltip } from "../ui/tooltip"

interface StepIndicatorProps {
  currentStep: number
}

export const AnimatedStepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const steps = [
    {
      name: "Triagem Interna",
      icon: <FileText size={20} />,
      description:
        "Nesta etapa, o responsável interno da empresa preenche informações preliminares sobre o fornecedor, incluindo descrição do serviço, volume e sensibilidade dos dados.",
    },
    {
      name: "Avaliação Externa",
      icon: <Shield size={20} />,
      description:
        "O escritório terceirizado avalia o fornecedor com base em critérios de conformidade legal, maturidade técnica e governança de subcontratados.",
    },
    {
      name: "Contratação",
      icon: <User size={20} />,
      description:
        "Definição dos requisitos contratuais específicos para proteção de dados, incluindo cláusulas fundamentais, procedimentais e de verificação.",
    },
    {
      name: "Monitoramento",
      icon: <RefreshCw size={20} />,
      description:
        "Estabelecimento de um plano de monitoramento contínuo do fornecedor, com verificações periódicas e gestão de atualizações.",
    },
  ]

  if (!mounted) return null

  return (
    <div className="relative mb-12 pt-4">
      {/* Progress bar background */}
      <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 hidden sm:block" />

      {/* Animated progress bar */}
      <motion.div
        className="absolute top-8 left-0 h-1 bg-blue-600 hidden sm:block"
        initial={{ width: "0%" }}
        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      <div className="flex flex-wrap items-center justify-between w-full">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center mb-2 relative z-10">
            <Tooltip
              content={
                <div>
                  <p className="font-medium">{step.name}</p>
                  <p className="text-xs mt-1 text-white/80">{step.description}</p>
                </div>
              }
              position="top"
              maxWidth="300px"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  backgroundColor: index === currentStep ? "#2563eb" : index < currentStep ? "#22c55e" : "#e5e7eb",
                  color: index <= currentStep ? "#ffffff" : "#4b5563",
                }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                }}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md cursor-help`}
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
            </Tooltip>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              className="mt-3 text-center"
            >
              <span className={`text-sm ${index === currentStep ? "font-bold" : ""}`}>{step.name}</span>
              {index === currentStep && (
                <motion.div
                  className="h-1 bg-blue-600 mt-1 rounded-full"
                  layoutId="activeStep"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}
