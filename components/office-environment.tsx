"use client"

import { useState } from "react"
import OfficeLayout from "./office-layout"
import { MonitoringForm } from "./monitoring-form"
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
  const [expandedSections, setExpandedSections] = useState({
    periodic: true,
    updates: false
  })

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }))
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
        <MonitoringForm
          formData={formData}
          prevStep={() => handleSectionChange("assessment")}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        />
      )}

      {activeSection === "adherence" && <AdherenceAnalysis onBack={() => handleSectionChange("assessment")} />}

      {activeSection === "suppliers" && <SuppliersList />}

      {activeSection === "settings" && <OfficeSettings />}
    </OfficeLayout>
  )
}
