"use client"

import type React from "react"
import { WizardForm } from "./wizard-form"
import type { FormData } from "./supplier-risk-assessment"

interface ScreeningFormProps {
  formData: FormData
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  selectedFile: File | null
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadStatus: "idle" | "uploading" | "success" | "error"
  submitInitialAssessment: () => Promise<void>
  toggleSection: (section: string) => void
  expandedSections: Record<string, boolean>
  showAnalysis: boolean
  handleShowAnalysis: () => void
  isSubmitting: boolean
  errorDetails: string | null
}

export const ScreeningForm: React.FC<ScreeningFormProps> = ({
  formData,
  handleChange,
  selectedFile,
  setSelectedFile,
  handleFileChange,
  uploadStatus,
  submitInitialAssessment,
  toggleSection,
  expandedSections,
  showAnalysis,
  handleShowAnalysis,
  isSubmitting,
  errorDetails,
}) => {
  return (
    <WizardForm
      formData={formData}
      handleChange={handleChange}
      selectedFile={selectedFile}
      setSelectedFile={setSelectedFile}
      handleFileChange={handleFileChange}
      uploadStatus={uploadStatus}
      submitInitialAssessment={submitInitialAssessment}
      toggleSection={toggleSection}
      expandedSections={expandedSections}
      showAnalysis={showAnalysis}
      handleShowAnalysis={handleShowAnalysis}
      isSubmitting={isSubmitting}
      errorDetails={errorDetails}
    />
  )
}
