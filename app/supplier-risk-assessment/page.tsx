"use client"

import SupplierRiskAssessment from "@/components/supplier-risk-assessment/supplier-risk-assessment"

export default function SupplierRiskAssessmentPage() {
  return (
    <div className="py-8 [&_.text-blue-600]:text-navy [&_.text-blue-700]:text-navy [&_.text-blue-800]:text-navy [&_.bg-blue-50]:bg-navy/10 [&_.bg-blue-100]:bg-navy/20 [&_.bg-blue-500]:bg-navy [&_.bg-blue-600]:bg-navy [&_.border-blue-200]:border-navy/30 [&_.border-blue-500]:border-navy [&_.border-blue-600]:border-navy [&_button.bg-blue-600]:bg-navy [&_button.hover\:bg-blue-700]:hover:bg-navy/80">
      <SupplierRiskAssessment />
    </div>
  )
}
