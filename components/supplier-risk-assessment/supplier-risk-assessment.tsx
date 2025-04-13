"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { AlertCircle } from "lucide-react"
import { StepIndicator } from "./step-indicator"
import { ScreeningForm } from "./screening-form"
import { AssessmentForm } from "./assessment-form"
import { ContractForm } from "./contract-form"
import { MonitoringForm } from "./monitoring-form"
import { SubmissionStatus } from "./submission-status"
import { calculateSupplierType } from "@/lib/risk-assessment"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

export type FormData = {
  supplierName: string
  serviceDescription: string
  dataVolume: "low" | "medium" | "high" | "massive"
  dataSensitivity: "non-sensitive" | "regular" | "sensitive"
  contractType: "punctual" | "continuous"
  isTechnology: boolean
  supplierType: string
  sensitiveFlagged: boolean
  companyId: string
  internalResponsible: string
  requestDate: string
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
  const [formData, setFormData] = useState<FormData>({
    supplierName: "",
    serviceDescription: "",
    dataVolume: "medium",
    dataSensitivity: "regular",
    contractType: "continuous",
    isTechnology: false,
    supplierType: "",
    sensitiveFlagged: false,
    companyId: "CLIENTE001", // Identificador da empresa cliente
    internalResponsible: "",
    requestDate: new Date().toISOString().split("T")[0],
  })

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

  // Função para lidar com a seleção de arquivo
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
    }
  }, [])

  // Função para simular o upload do arquivo para o SharePoint
  const uploadFileToSharePoint = useCallback(async () => {
    if (!selectedFile) return false

    setUploadStatus("uploading")

    try {
      // Simulação de tempo de processamento de rede
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Log do que seria enviado para o SharePoint em um ambiente real
      console.log(`Enviando arquivo para SharePoint:
        - Nome do arquivo: ${selectedFile.name}
        - Tamanho: ${(selectedFile.size / 1024).toFixed(2)} KB
        - Pasta de destino: /Clientes/${formData.companyId}/Fornecedores/${formData.supplierName}
        - Data de envio: ${new Date().toLocaleString()}
      `)

      setUploadStatus("success")
      return true
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      setUploadStatus("error")
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive",
      })
      return false
    }
  }, [selectedFile, formData.companyId, formData.supplierName, toast])

  // Função para submeter a avaliação inicial
  const submitInitialAssessment = useCallback(async () => {
    // Verificar se todos os campos obrigatórios estão preenchidos
    const errors = [];
    
    if (!formData.supplierName.trim()) {
      errors.push("Nome do fornecedor é obrigatório");
    }
    
    if (!formData.serviceDescription.trim()) {
      errors.push("Descrição do serviço é obrigatória");
    }
    
    if (!formData.internalResponsible.trim()) {
      errors.push("Responsável pela triagem é obrigatório");
    }
    
    if (errors.length > 0) {
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: (
          <ul className="list-disc pl-4 mt-2 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });
      return;
    }

    // Calcular o tipo de fornecedor
    const { code } = calculateSupplierType(formData.dataVolume, formData.dataSensitivity)
    setFormData((prev) => ({
      ...prev,
      supplierType: code,
    }))

    // Se houver arquivo, fazer upload
    let uploadSuccess = true
    if (selectedFile) {
      uploadSuccess = await uploadFileToSharePoint()
    }

    if (uploadSuccess) {
      // Marcar como submetido e exibir tela de confirmação
      setSubmissionComplete(true)
      toast({
        title: "Avaliação submetida",
        description: "A avaliação inicial foi enviada com sucesso",
        variant: "default",
      })
    }
  }, [formData, selectedFile, uploadFileToSharePoint, toast])

  // Função para iniciar a avaliação pelo escritório terceirizado
  const startExternalAssessment = useCallback(() => {
    setCurrentStep(1)
  }, [])

  // Função para avançar no fluxo
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1)
  }, [])

  // Função para voltar ao passo anterior
  const prevStep = useCallback(() => {
    setCurrentStep((prev) => prev - 1)
  }, [])

  return (
    <div className={`max-w-4xl mx-auto p-4 ${isMobile ? 'px-2' : 'px-4'}`}>
      <div className="bg-white p-4 rounded shadow mb-6">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center mb-2`}>
          Sistema de Gestão de Riscos na Contratação de Fornecedores
        </h1>
        <p className="text-center text-gray-600">
          Análise de privacidade e segurança de dados em conformidade com a LGPD
        </p>
      </div>

      {!submissionComplete && <StepIndicator currentStep={currentStep} />}

      {currentStep === 0 &&
        (submissionComplete ? (
          <SubmissionStatus
            formData={formData}
            selectedFile={selectedFile}
            startExternalAssessment={startExternalAssessment}
          />
        ) : (
          <ScreeningForm
            formData={formData}
            handleChange={handleChange}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            handleFileChange={handleFileChange}
            uploadStatus={uploadStatus}
            submitInitialAssessment={submitInitialAssessment}
            toggleSection={toggleSection}
            expandedSections={expandedSections}
          />
        ))}

      {currentStep === 1 && (
        <AssessmentForm
          formData={formData}
          toggleSection={toggleSection}
          expandedSections={expandedSections}
          prevStep={prevStep}
          nextStep={nextStep}
        />
      )}

      {currentStep === 2 && (
        <ContractForm
          formData={formData}
          toggleSection={toggleSection}
          expandedSections={expandedSections}
          prevStep={prevStep}
          nextStep={nextStep}
        />
      )}

      {currentStep === 3 && (
        <MonitoringForm
          formData={formData}
          toggleSection={toggleSection}
          expandedSections={expandedSections}
          prevStep={prevStep}
        />
      )}

      {currentStep > 0 && (
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
      )}
    </div>
  )
}

export default SupplierRiskAssessment

