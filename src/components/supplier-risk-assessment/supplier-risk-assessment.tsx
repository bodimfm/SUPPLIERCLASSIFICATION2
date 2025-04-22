"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedStepIndicator } from "./animated-step-indicator"
import { WizardForm } from "./wizard-form"
import { AssessmentForm } from "./assessment-form"
import { ContractForm } from "./contract-form"
import { MonitoringForm } from "./monitoring-form"
import { SubmissionStatus } from "./submission-status"
import { calculateSupplierType } from "@/lib/risk-assessment"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { createSupplier, createAssessment, type Supplier, type Assessment } from "@/lib/supabase"
// Adicione este import no topo do arquivo
import { SaveNotification } from "@/components/ui/save-notification"

export type FormData = {
  supplierName: string
  serviceDescription: string
  dataVolume: string
  dataSensitivity: string
  contractType: string
  isTechnology: boolean
  supplierType: string
  sensitiveFlagged: boolean
  companyId: string
  internalResponsible: string
  requestDate: string
  cnpj: string
}

const SupplierRiskAssessment = () => {
  const { toast } = useToast()
  const isMobile = useMobile()

  // Estados para controlar as etapas do fluxo
  const [currentStep, setCurrentStep] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Novo estado para controlar a visibilidade da análise
  const [showAnalysis, setShowAnalysis] = useState(false)
  // Estado para armazenar o ID do fornecedor criado
  const [supplierId, setSupplierId] = useState<string | null>(null)
  // Estado para armazenar o ID da avaliação criada
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  // Estado para armazenar detalhes do erro
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  // Adicione estes estados dentro do componente SupplierRiskAssessment
  const [showSaveNotification, setShowSaveNotification] = useState(false)
  const [saveNotificationMessage, setSaveNotificationMessage] = useState("")

  const [formData, setFormData] = useState<FormData>({
    supplierName: "",
    serviceDescription: "",
    dataVolume: "",
    dataSensitivity: "",
    contractType: "",
    isTechnology: false,
    supplierType: "",
    sensitiveFlagged: false,
    companyId: "CLIENTE001", // Identificador da empresa cliente
    internalResponsible: "",
    requestDate: new Date().toISOString().split("T")[0],
    cnpj: "",
  })

  // Reset error details when form data changes
  useEffect(() => {
    if (errorDetails) {
      setErrorDetails(null)
    }
  }, [formData, errorDetails])

  // Função para expandir/recolher seções
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }, [])

  // Função para atualizar dados do formulário
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target
      const checked = (e.target as HTMLInputElement).checked

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))

      // Flag para dados sensíveis
      if (name === "dataSensitivity" && value === "sensitive") {
        setFormData((prev) => ({
          ...prev,
          sensitiveFlagged: true,
        }))
      }
    },
    [],
  )

  // Nova função para mostrar a análise
  const handleShowAnalysis = useCallback(() => {
    if (!formData.supplierName || !formData.serviceDescription) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha o nome do fornecedor e a descrição do serviço",
        variant: "destructive",
      })
      return
    }
    setShowAnalysis(true)
  }, [formData.supplierName, formData.serviceDescription, toast])

  // Função para lidar com a seleção de arquivo
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
    }
  }, [])

  // Função para fazer upload do arquivo para o Supabase
  const uploadFileToSupabase = useCallback(
    async (supplierId: string, assessmentId: string | null) => {
      if (!selectedFile) return false
      setUploadStatus("uploading")
      try {
        // Enviar arquivo via rota API de upload
        const form = new FormData()
        form.append('file', selectedFile)
        form.append('supplierId', supplierId)
        if (assessmentId) {
          form.append('assessment_id', assessmentId)
        }
        form.append('uploadedBy', formData.internalResponsible)
        
        const response = await fetch('/api/documents', { method: 'POST', body: form })
        const data = await response.json()
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Falha ao enviar documento')
        }
        
        setUploadStatus("success")
        return true
      } catch (error: any) {
        console.error("Erro ao fazer upload:", error)
        setUploadStatus("error")
        toast({ 
          title: "Erro no upload", 
          description: error.message || 'Falha ao enviar arquivo.', 
          variant: 'destructive' 
        })
        return false
      }
    },
    [selectedFile, formData.internalResponsible, toast],
  )

  // Validate form data
  const validateFormData = useCallback(() => {
    // Required fields
    const requiredFields = [
      { field: "supplierName", label: "Nome do fornecedor" },
      { field: "serviceDescription", label: "Descrição do serviço" },
      { field: "internalResponsible", label: "Responsável interno" },
      { field: "dataVolume", label: "Volume de dados" },
      { field: "dataSensitivity", label: "Sensibilidade dos dados" },
      { field: "contractType", label: "Tipo de contrato" },
    ]

    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof FormData]) {
        toast({
          title: "Campo obrigatório",
          description: `O campo "${label}" é obrigatório.`,
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }, [formData, toast])

  // Modifique apenas a função submitInitialAssessment dentro do componente SupplierRiskAssessment
  const submitInitialAssessment = useCallback(async () => {
    // Reset error state
    setErrorDetails(null)

    // Validate form data
    if (!validateFormData()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Calcular o tipo de fornecedor
      const { code, description } = calculateSupplierType(
        formData.dataVolume as "low" | "medium" | "high" | "massive",
        formData.dataSensitivity as "non-sensitive" | "regular" | "sensitive",
      )

      // Atualizar o tipo de fornecedor no formData
      const updatedFormData = {
        ...formData,
        supplierType: code,
      }
      setFormData(updatedFormData)

      // Mapear a sensibilidade dos dados para o campo data_type
      let dataType: "none" | "common" | "sensitive" = "none"
      if (updatedFormData.dataSensitivity === "non-sensitive") dataType = "none"
      else if (updatedFormData.dataSensitivity === "regular") dataType = "common"
      else if (updatedFormData.dataSensitivity === "sensitive") dataType = "sensitive"

      // Mapear o nível de risco
      let riskLevel: "low" | "medium" | "high" | "critical" = "low"
      if (code === "A") riskLevel = "critical"
      else if (code === "B") riskLevel = "high"
      else if (code === "C") riskLevel = "medium"
      else if (code === "D") riskLevel = "low"

      // Prepare supplier data
      const supplierData: Partial<Supplier> = {
        name: updatedFormData.supplierName,
        cnpj: updatedFormData.cnpj || null,
        internal_responsible: updatedFormData.internalResponsible,
        supplier_type: code,
        supplier_type_description: description,
        data_volume: updatedFormData.dataVolume as "low" | "medium" | "high",
        data_type: dataType,
        is_technology: updatedFormData.isTechnology,
        risk_level: riskLevel,
        risk_description: description,
        status: "pending",
        company_id: updatedFormData.companyId,
        registration_date: new Date().toISOString().split("T")[0],
        created_by: updatedFormData.internalResponsible,
        dpo_reviewed: false,
        service_description: updatedFormData.serviceDescription,
        contract_type: updatedFormData.contractType,
      }

      console.log("Creating supplier with data:", supplierData)

      // Criar o fornecedor no Supabase
      const supplier = await createSupplier(supplierData)

      console.log("Supplier created successfully:", supplier)

      // Armazenar o ID do fornecedor
      if (supplier && supplier.id) {
        setSupplierId(supplier.id)

        console.log("Creating assessment for supplier:", supplier.id)

        try {
          // Prepare assessment data
          const assessmentData: Partial<Assessment> = {
            supplier_id: supplier.id,
            internal_responsible: updatedFormData.internalResponsible,
            status: "draft",
            data_volume: updatedFormData.dataVolume,
            data_sensitivity: updatedFormData.dataSensitivity,
            data_type: dataType,
            supplier_type: code,
            contract_type: updatedFormData.contractType,
            is_technology: updatedFormData.isTechnology,
            service_description: updatedFormData.serviceDescription,
          }

          console.log("Assessment data to be sent:", assessmentData)

          // Create assessment
          const assessment = await createAssessment(assessmentData)

          console.log("Assessment created successfully:", assessment)

          // Armazenar o ID da avaliação
          if (assessment && assessment.id) {
            setAssessmentId(assessment.id)

            // If there's a file, upload it
            if (selectedFile) {
              console.log("Uploading file for supplier:", supplier.id)
              try {
                await uploadFileToSupabase(supplier.id, assessment.id)
              } catch (uploadError: any) {
                // Se houver erro no upload, apenas exibir um aviso mas continuar o fluxo
                console.warn("Erro ao fazer upload do arquivo:", uploadError)
                toast({
                  title: "Aviso",
                  description:
                    "O fornecedor foi criado, mas houve um problema ao fazer upload do arquivo. O bucket 'supplier-documents' pode não existir.",
                  variant: "default",
                })
              }
            }

            // Mark as submitted and show confirmation screen
            setSubmissionComplete(true)
            toast({
              title: "Avaliação submetida",
              description: "A avaliação inicial foi enviada com sucesso",
              variant: "default",
            })
          } else {
            throw new Error("Falha ao criar avaliação: ID não retornado")
          }
        } catch (assessmentError: any) {
          console.error("Error creating assessment:", assessmentError)

          // Capture detailed error information
          let errorDetail = "Erro desconhecido ao criar avaliação"
          if (assessmentError instanceof Error) {
            errorDetail = assessmentError.message
            console.error("Error message:", assessmentError.message)
            console.error("Error stack:", assessmentError.stack)
          } else if (typeof assessmentError === "object" && assessmentError !== null) {
            try {
              errorDetail = JSON.stringify(assessmentError)
            } catch (e) {
              errorDetail = "Erro não serializável ao criar avaliação"
            }
          }

          throw new Error(`Erro ao criar avaliação: ${errorDetail}`)
        }
      } else {
        throw new Error("Falha ao criar fornecedor: ID não retornado")
      }
    } catch (error: any) {
      console.error("Error submitting assessment:", error)

      // Capture error details for display
      let errorMessage = "Ocorreu um erro ao submeter a avaliação."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null) {
        try {
          errorMessage = JSON.stringify(error)
        } catch (e) {
          errorMessage = "Erro não serializável"
        }
      }

      setErrorDetails(errorMessage)

      toast({
        title: "Erro ao submeter",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, selectedFile, uploadFileToSupabase, toast, validateFormData])

  // Função para iniciar a avaliação pelo escritório terceirizado
  const startExternalAssessment = useCallback(() => {
    setCurrentStep(1)
    setSubmissionComplete(false)
  }, [])

  // Função para avançar no fluxo
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }, [])

  // Função para voltar ao passo anterior
  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  // Adicione esta função dentro do componente SupplierRiskAssessment
  const showSaveSuccess = (message: string) => {
    setSaveNotificationMessage(message)
    setShowSaveNotification(true)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {!submissionComplete && <AnimatedStepIndicator currentStep={currentStep} totalSteps={4} />}

      <AnimatePresence mode="wait">
        {currentStep === 0 &&
          (submissionComplete ? (
            <motion.div
              key="submission"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SubmissionStatus
                formData={formData}
                selectedFile={selectedFile}
                startExternalAssessment={startExternalAssessment}
                supplierId={supplierId}
                assessmentId={assessmentId}
              />
            </motion.div>
          ) : (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          ))}

        {currentStep === 1 && (
          <motion.div
            key="assessment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AssessmentForm
              formData={formData}
              toggleSection={toggleSection}
              expandedSections={expandedSections}
              prevStep={prevStep}
              nextStep={nextStep}
              supplierId={supplierId}
              assessmentId={assessmentId}
            />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="contract"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ContractForm
              formData={formData}
              toggleSection={toggleSection}
              expandedSections={expandedSections}
              prevStep={prevStep}
              nextStep={nextStep}
              supplierId={supplierId}
              assessmentId={assessmentId}
            />
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="monitoring"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MonitoringForm
              formData={formData}
              toggleSection={toggleSection}
              expandedSections={expandedSections}
              prevStep={prevStep}
              supplierId={supplierId}
              assessmentId={assessmentId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {currentStep > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <div className="flex items-start">
              <AlertCircle size={18} className="text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Acesso restrito ao escritório terceirizado</p>
                <p className="text-yellow-700">
                  As etapas a partir deste ponto são de responsabilidade exclusiva do escritório terceirizado que atua
                  como encarregado de dados pessoais.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* Adicione este componente no final do return, antes do último </div> */}
      <SaveNotification
        show={showSaveNotification}
        message={saveNotificationMessage}
        onClose={() => setShowSaveNotification(false)}
      />
    </div>
  )
}

export default SupplierRiskAssessment
