"use client"

import { useState } from "react"
import { StepIndicator } from "./step-indicator"
import { ScreeningForm } from "./screening-form"
import RequiredDocuments from "./required-documents"
import DocumentUpload from "./document-upload"
import SubmissionConfirmation from "./submission-confirmation"
import OfficeEnvironment from "./office-environment"
import Header from "./header"
import Footer from "./footer"
import { calculateSupplierType } from "@/lib/risk-matrix"
import { getRequiredDocuments } from "@/lib/document-requirements"
import { motion, AnimatePresence } from "framer-motion"

// Atualize o tipo FormData para incluir os novos campos de avaliação de risco
export type FormData = {
  supplierName: string
  serviceDescription: string
  // Campos antigos mantidos para compatibilidade
  dataVolume: "low" | "medium" | "high" | "massive"
  dataSensitivity: "non-sensitive" | "regular" | "sensitive"
  contractType: "punctual" | "continuous"
  isTechnology: boolean
  supplierType: string
  supplierTypeDescription: string
  sensitiveFlagged: boolean
  uploadedDocuments: string[]
  notProvidedDocuments: string[]
  submittedToOffice: boolean

  // Novos campos para o sistema de pontuação
  dataType: "none" | "common" | "sensitive"
  volume: "low" | "medium" | "high"
  criticality: "critical" | "non-critical"
  policy: "yes" | "no" | "unknown"
  certification: "yes" | "no" | "unknown"
  subcontracting: "none" | "identified" | "unknown"
  incidents: "none" | "resolved" | "unresolved"

  // Campos para armazenar o resultado da avaliação
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  riskDescription: string

  // Campo para armazenar a avaliação do DPO
  dpoReview: {
    reviewed: boolean
    adjustedRiskLevel?: "low" | "medium" | "high" | "critical"
    comments?: string
    reviewDate?: Date
    reviewedBy?: string
  }
}

// Atualize o estado inicial para incluir os novos campos
const initialFormData: FormData = {
  supplierName: "",
  serviceDescription: "",
  dataVolume: "low",
  dataSensitivity: "non-sensitive",
  contractType: "punctual",
  isTechnology: false,
  supplierType: "",
  supplierTypeDescription: "",
  sensitiveFlagged: false,
  uploadedDocuments: [],
  notProvidedDocuments: [],
  submittedToOffice: false,

  // Valores iniciais para os novos campos
  dataType: "none",
  volume: "low",
  criticality: "non-critical",
  policy: "unknown",
  certification: "unknown",
  subcontracting: "none",
  incidents: "none",

  riskScore: 0,
  riskLevel: "low",
  riskDescription: "",

  dpoReview: {
    reviewed: false,
  },
}

function SupplierRiskAssessment() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [currentStep, setCurrentStep] = useState(1)
  const [isOfficeEnvironment, setIsOfficeEnvironment] = useState(false)

  const updateFormData = (data: Partial<FormData>) => {
    const newData = { ...formData, ...data }

    // Calculate supplier type whenever relevant fields change
    if ("dataVolume" in data || "dataSensitivity" in data || "isTechnology" in data) {
      const { code, description } = calculateSupplierType(
        newData.dataVolume,
        newData.dataSensitivity,
        newData.isTechnology,
      )
      newData.supplierType = code
      newData.supplierTypeDescription = description
    }

    setFormData(newData)
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const submitToOffice = () => {
    setFormData((prev) => ({ ...prev, submittedToOffice: true }))
    nextStep()
  }

  const enterOfficeEnvironment = () => {
    setIsOfficeEnvironment(true)
  }

  const exitOfficeEnvironment = () => {
    setIsOfficeEnvironment(false)
  }

  const requiredDocuments = formData.supplierType
    ? getRequiredDocuments(formData.supplierType, formData.isTechnology)
    : []

  if (isOfficeEnvironment) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col min-h-screen"
      >
        <Header isOfficeEnvironment={true} />
        <div className="flex-1">
          <OfficeEnvironment formData={formData} updateFormData={updateFormData} onBack={exitOfficeEnvironment} />
        </div>
        <Footer />
      </motion.div>
    )
  }

  return (
    <>
      <Header onEnterOfficeEnvironment={enterOfficeEnvironment} />
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <StepIndicator currentStep={currentStep} totalSteps={4} internalProcess={currentStep <= 3} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <ScreeningForm formData={formData} updateFormData={updateFormData} nextStep={nextStep} />
              )}

              {currentStep === 2 && formData.supplierType && (
                <RequiredDocuments
                  supplierType={formData.supplierType}
                  supplierTypeDescription={formData.supplierTypeDescription}
                  documents={requiredDocuments}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 3 && (
                <DocumentUpload
                  formData={formData}
                  updateFormData={updateFormData}
                  requiredDocuments={requiredDocuments}
                  submitToOffice={submitToOffice}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 4 && formData.submittedToOffice && (
                <SubmissionConfirmation
                  supplierName={formData.supplierName}
                  supplierType={formData.supplierType}
                  uploadedDocuments={formData.uploadedDocuments}
                  notProvidedDocuments={formData.notProvidedDocuments}
                  isTechnology={formData.isTechnology}
                  nextStep={enterOfficeEnvironment}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <Footer />
    </>
  )
}

export default SupplierRiskAssessment
