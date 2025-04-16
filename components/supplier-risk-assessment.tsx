"use client"

import { useState, useEffect } from "react"
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
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { calculateRiskScore, getRiskDescription } from "@/lib/risk-scoring"
import { getRiskAssessmentService } from "@/lib/risk-assessment-service"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

// Atualize o tipo FormData para incluir os novos campos de avaliação de risco
export type FormData = {
  supplierName: string
  taxId?: string  // CNPJ
  email?: string
  phone?: string
  address?: string
  contactPerson?: string
  serviceDescription: string
  internalResponsible?: string
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
  
  // Metadados dos documentos para integração com Supabase
  uploadedDocumentsMetadata?: Array<{
    name: string
    documentId?: string
    url: string
    path?: string
    uploadDate: string
  }>

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
  
  // ID do fornecedor no banco de dados (null quando é um novo fornecedor)
  supplierId?: string
  
  // Status do fornecedor
  status?: string

  // Campos para monitoramento e avaliação temporal
  registrationDate?: string
  lastAssessmentDate?: string
  nextAssessmentDate?: string
  documentsCount?: number
}

// Atualize o estado inicial para incluir os novos campos
const initialFormData: FormData = {
  supplierName: "",
  taxId: "",
  email: "",
  phone: "",
  address: "",
  contactPerson: "",
  serviceDescription: "",
  internalResponsible: "",
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
  uploadedDocumentsMetadata: [],

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
  
  status: "pending",
  
  // Inicializando os novos campos para monitoramento temporal
  registrationDate: new Date().toISOString(),
  lastAssessmentDate: new Date().toISOString(),
  nextAssessmentDate: "",
  documentsCount: 0
}

interface SupplierRiskAssessmentProps {
  hideHeader?: boolean;
  hideFooter?: boolean;
}

function SupplierRiskAssessment({ hideHeader = false, hideFooter = false }: SupplierRiskAssessmentProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [currentStep, setCurrentStep] = useState(1)
  const [isOfficeEnvironment, setIsOfficeEnvironment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Calcular a pontuação de risco sempre que os campos relevantes mudarem
    if (formData.dataType && formData.volume && formData.criticality) {
      const riskScoreData = {
        dataType: formData.dataType,
        volume: formData.volume,
        criticality: formData.criticality,
        policy: formData.policy,
        certification: formData.certification,
        subcontracting: formData.subcontracting,
        incidents: formData.incidents
      }
      
      const { score, riskLevel, description } = calculateRiskScore(riskScoreData)
      
      setFormData(prev => ({
        ...prev,
        riskScore: score,
        riskLevel: riskLevel,
        riskDescription: description
      }))
    }
  }, [
    formData.dataType,
    formData.volume,
    formData.criticality,
    formData.policy,
    formData.certification,
    formData.subcontracting,
    formData.incidents
  ])

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

  const submitToOffice = async () => {
    if (!formData.supplierName || !formData.taxId) {
      setError("Nome do fornecedor e CNPJ são obrigatórios")
      return
    }
    
    setIsSubmitting(true)
    setError(null)

    try {
      // Gerar um ID para o fornecedor
      const supplierId = formData.supplierId || uuidv4()
      
      // Calcular a próxima data de avaliação com base no tipo de fornecedor
      const today = new Date();
      let nextAssessmentDate = new Date(today);
      
      // Definir intervalo de reavaliação com base no tipo do fornecedor
      switch (formData.supplierType) {
        case 'A':
          // Trimestral (3 meses)
          nextAssessmentDate.setMonth(today.getMonth() + 3);
          break;
        case 'B':
          // Semestral (6 meses)
          nextAssessmentDate.setMonth(today.getMonth() + 6);
          break;
        case 'C':
          // Anual (12 meses)
          nextAssessmentDate.setMonth(today.getMonth() + 12);
          break;
        case 'D':
          // Bienal (24 meses)
          nextAssessmentDate.setMonth(today.getMonth() + 24);
          break;
        default:
          // Padrão: 6 meses
          nextAssessmentDate.setMonth(today.getMonth() + 6);
      }
      
      // Calcular a contagem de documentos
      const documentsCount = (formData.uploadedDocumentsMetadata?.length || 0) + 
                            (formData.notProvidedDocuments?.length || 0);
      
      // Dados básicos do fornecedor para o Supabase
      const supplierData = {
        id: supplierId,
        name: formData.supplierName,
        tax_id: formData.taxId,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        contact_person: formData.contactPerson || null,
        service_description: formData.serviceDescription,
        internal_responsible: formData.internalResponsible || null,
        is_technology: formData.isTechnology,
        data_type: formData.dataType,
        data_volume: formData.volume,
        criticality: formData.criticality,
        policy: formData.policy,
        certification: formData.certification,
        subcontracting: formData.subcontracting,
        incidents: formData.incidents,
        risk_score: formData.riskScore,
        risk_level: formData.riskLevel,
        risk_description: formData.riskDescription,
        supplier_type: formData.supplierType,
        supplier_type_description: formData.supplierTypeDescription,
        status: "pending",
        registration_date: new Date().toISOString(),
        last_assessment_date: new Date().toISOString(),
        next_assessment_date: nextAssessmentDate.toISOString(),
        documents_count: documentsCount
      }
      
      // Obter cliente Supabase para browser
      const supabase = getSupabaseBrowser()
      
      // Inserir ou atualizar o fornecedor no Supabase
      if (formData.supplierId) {
        // Atualização
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', supplierId)
        
        if (error) throw error
      } else {
        // Inserção
        const { error } = await supabase
          .from('suppliers')
          .insert([supplierData])
        
        if (error) throw error
      }
      
      // Processar documentos
      if (formData.uploadedDocumentsMetadata && formData.uploadedDocumentsMetadata.length > 0) {
        const documentsToInsert = formData.uploadedDocumentsMetadata.map(doc => ({
          id: uuidv4(),
          supplier_id: supplierId,
          document_name: doc.name,
          document_id: doc.documentId || "",
          file_name: doc.name,
          file_path: doc.path || doc.url,
          is_provided: true,
          upload_date: doc.uploadDate || new Date().toISOString()
        }))
        
        // Usar o mesmo cliente Supabase
        const { error: docError } = await supabase
          .from('supplier_documents')
          .insert(documentsToInsert)
        
        if (docError) {
          console.error("Erro ao salvar documentos:", docError)
          // Continuar mesmo com erro nos documentos
        }
      }
      
      // Registrar documentos não fornecidos
      if (formData.notProvidedDocuments && formData.notProvidedDocuments.length > 0) {
        const notProvidedToInsert = formData.notProvidedDocuments.map(docName => ({
          id: uuidv4(),
          supplier_id: supplierId,
          document_name: docName,
          document_id: docName.toLowerCase().replace(/\s+/g, '_'),
          is_provided: false
        }))
        
        // Usar o mesmo cliente Supabase para documentos não fornecidos
        const { error: npDocError } = await supabase
          .from('supplier_documents')
          .insert(notProvidedToInsert)
        
        if (npDocError) {
          console.error("Erro ao registrar documentos não fornecidos:", npDocError)
          // Continuar mesmo com erro
        }
      }
      
      // Criar avaliação de risco inicial
      const riskAssessmentService = getRiskAssessmentService()
      const riskAssessmentData = {
        dataType: formData.dataType,
        volume: formData.volume,
        criticality: formData.criticality,
        policy: formData.policy,
        certification: formData.certification,
        subcontracting: formData.subcontracting,
        incidents: formData.incidents
      }
      
      await riskAssessmentService.createAssessment(
        supplierId, 
        riskAssessmentData, 
        formData.isTechnology,
        formData.internalResponsible || "sistema"
      )
      
      // Marcar como enviado e atualizar o ID do fornecedor
      setFormData(prev => ({ 
        ...prev, 
        submittedToOffice: true,
        supplierId,
        status: "pending"
      }))
      
      console.log("Fornecedor salvo com sucesso. ID:", supplierId)
      
      // Avançar para o próximo passo
      nextStep()
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error)
      setError("Ocorreu um erro ao enviar os dados. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
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
        {!hideHeader && <Header isOfficeEnvironment={true} />}
        <div className="flex-1">
          <OfficeEnvironment formData={formData} updateFormData={updateFormData} onBack={exitOfficeEnvironment} />
        </div>
        {!hideFooter && <Footer />}
      </motion.div>
    )
  }

  return (
    <>
      {!hideHeader && <Header onEnterOfficeEnvironment={enterOfficeEnvironment} />}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <StepIndicator currentStep={currentStep} totalSteps={4} internalProcess={currentStep <= 3} />

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

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
                  isSubmitting={isSubmitting}
                />
              )}

              {currentStep === 4 && formData.submittedToOffice && (
                <SubmissionConfirmation
                  supplierName={formData.supplierName}
                  supplierType={formData.supplierType}
                  uploadedDocuments={formData.uploadedDocuments}
                  notProvidedDocuments={formData.notProvidedDocuments}
                  isTechnology={formData.isTechnology}
                  supplierId={formData.supplierId}
                  nextStep={enterOfficeEnvironment}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <div>
                  <h3 className="font-medium">Enviando dados para avaliação</h3>
                  <p className="text-sm text-gray-500">Por favor, aguarde enquanto processamos sua solicitação...</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      {!hideFooter && <Footer />}
    </>
  )
}

export default SupplierRiskAssessment
