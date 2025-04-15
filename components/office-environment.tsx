"use client"

import { useState } from "react"
import OfficeLayout from "./office-layout"
import MonitoringForm from "./monitoring-form"
import AdherenceAnalysis from "./adherence-analysis"
import SuppliersList from "./suppliers-list"
import OfficeSettings from "./office-settings"
import DpoReviewForm from "./dpo-review-form"

interface OfficeEnvironmentProps {
  formData: any
  updateFormData: (data: Partial<any>) => void
  onBack: () => void
}

export default function OfficeEnvironment({ formData, updateFormData, onBack }: OfficeEnvironmentProps) {
  const [activeSection, setActiveSection] = useState("assessment")

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  const handleDpoReviewComplete = () => {
    setActiveSection("monitoring")
  }

  return (
    <OfficeLayout activeSection={activeSection} onSectionChange={handleSectionChange} onExit={onBack}>
      {activeSection === "assessment" && (
        <DpoReviewForm
          formData={formData}
          updateFormData={updateFormData}
          onBack={onBack}
          onComplete={handleDpoReviewComplete}
        />
      )}

      {activeSection === "monitoring" && (
        <MonitoringForm formData={formData} prevStep={() => handleSectionChange("assessment")} />
      )}

      {activeSection === "adherence" && <AdherenceAnalysis onBack={() => handleSectionChange("assessment")} />}

      {activeSection === "suppliers" && <SuppliersList />}

      {activeSection === "settings" && <OfficeSettings />}
    </OfficeLayout>
  )
}
