"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, FileUp, LineChart, AlertCircle, CheckCircle, Upload, Save, HelpCircle, Info } from "lucide-react"
import { LiveClassification } from "./live-classification"
import type { FormData } from "./supplier-risk-assessment"

interface WizardFormProps {
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

export const WizardForm: React.FC<WizardFormProps> = ({
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
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [
    { title: "Informações do Fornecedor", description: "Dados básicos sobre o fornecedor e responsável" },
    { title: "Detalhes do Serviço", description: "Informações sobre o serviço e tratamento de dados" },
    { title: "Documentação", description: "Upload de documentos relevantes" },
    { title: "Análise Prévia", description: "Classificação preliminar do fornecedor" },
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">
                    Nome do Fornecedor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="supplierName"
                      value={formData.supplierName}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="Digite o nome do fornecedor"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Ajuda"
                      aria-describedby="supplier-name-help"
                    >
                      <HelpCircle size={16} />
                    </button>
                    <span id="supplier-name-help" className="sr-only">Nome completo do fornecedor</span>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium mb-1">CNPJ</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="00.000.000/0000-00"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Ajuda"
                      aria-describedby="cnpj-help"
                    >
                      <HelpCircle size={16} />
                    </button>
                    <span id="cnpj-help" className="sr-only">Formato 00.000.000/0000-00</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-1">
                  Responsável pela Triagem <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="internalResponsible"
                    value={formData.internalResponsible}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Nome do responsável interno"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Ajuda"
                    aria-describedby="internal-responsible-help"
                  >
                    <HelpCircle size={16} />
                  </button>
                  <span id="internal-responsible-help" className="sr-only">Pessoa responsável pela triagem</span>
                </div>
              </div>
            </div>
          </motion.div>
        )
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Descrição do Serviço/Fornecimento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    name="serviceDescription"
                    value={formData.serviceDescription}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Descreva em detalhes o escopo do serviço"
                    required
                  ></textarea>
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    aria-label="Ajuda"
                    aria-describedby="service-description-help"
                  >
                    <HelpCircle size={16} />
                  </button>
                  <span id="service-description-help" className="sr-only">Detalhamento do serviço prestado</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dataVolume" className="block text-sm font-medium mb-1">Volume de Dados</label>
                  <div className="relative">
                    <select
                      id="dataVolume"
                      name="dataVolume"
                      value={formData.dataVolume}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Selecione o volume</option>
                      <option value="low">Baixo (menos de 100 indivíduos)</option>
                      <option value="medium">Médio (100 a 1.000 indivíduos)</option>
                      <option value="high">Alto (mais de 1.000 indivíduos)</option>
                    </select>
                    <button
                      type="button"
                      className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Ajuda"
                      aria-describedby="data-volume-help"
                    >
                      <HelpCircle size={16} />
                    </button>
                    <span id="data-volume-help" className="sr-only">Número aproximado de titulares de dados</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="dataSensitivity" className="block text-sm font-medium mb-1">Sensibilidade dos Dados</label>
                  <div className="relative">
                    <select
                      id="dataSensitivity"
                      name="dataSensitivity"
                      value={formData.dataSensitivity}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Selecione a sensibilidade</option>
                      <option value="non-sensitive">Não-sensíveis</option>
                      <option value="regular">Regulares</option>
                      <option value="sensitive">Sensíveis</option>
                    </select>
                    <button
                      type="button"
                      className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Ajuda"
                      aria-describedby="data-sensitivity-help"
                    >
                      <HelpCircle size={16} />
                    </button>
                    <span id="data-sensitivity-help" className="sr-only">Classificação da natureza das informações</span>
                  </div>

                  {formData.sensitiveFlagged && (
                    <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                      <div className="flex">
                        <AlertCircle size={16} className="text-yellow-500 mr-2" />
                        <p>
                          Atenção: O fornecedor terá acesso a dados sensíveis. Uma avaliação mais rigorosa será
                          necessária.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contractType" className="block text-sm font-medium mb-1">Tipo de Contrato</label>
                  <div className="relative">
                    <select
                      id="contractType"
                      name="contractType"
                      value={formData.contractType}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="punctual">Pontual</option>
                      <option value="continuous">Continuado</option>
                    </select>
                    <button
                      type="button"
                      className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Ajuda"
                      aria-describedby="contract-type-help"
                    >
                      <HelpCircle size={16} />
                    </button>
                    <span id="contract-type-help" className="sr-only">Defina se o contrato é pontual ou continuado</span>
                  </div>
                </div>

                <div>
                  <div className="h-8 flex items-center mt-6">
                    <input
                      type="checkbox"
                      id="isTechnology"
                      name="isTechnology"
                      checked={formData.isTechnology}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor="isTechnology" className="text-sm font-medium">
                      Fornecedor de TI/SaaS (Software as a Service)
                    </label>
                    <button
                      type="button"
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      aria-label="Ajuda"
                      aria-describedby="is-technology-help"
                    >
                      <HelpCircle size={16} />
                    </button>
                    <span id="is-technology-help" className="sr-only">Marque se o fornecedor oferece tecnologia ou software</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <div className="mt-6 mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3 flex items-center">
                  <Upload size={18} className="mr-2 text-gray-600" />
                  Anexar Documentação Relevante
                  <button
                    type="button"
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    aria-label="Ajuda"
                    aria-describedby="upload-docs-help"
                  >
                    <HelpCircle size={16} />
                  </button>
                  <span id="upload-docs-help" className="sr-only">Envie contratos ou propostas relevantes</span>
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  Faça upload de qualquer documentação adicional relevante para a avaliação do fornecedor (contratos,
                  propostas, questionários preliminares, etc.).
                </p>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg bg-white">
                  {selectedFile ? (
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <FileText size={20} className="text-blue-600 mr-2" />
                          <span className="text-sm font-medium truncate max-w-xs">{selectedFile.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</span>
                      </div>

                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-xs text-red-500 hover:text-red-700 underline"
                      >
                        Remover arquivo
                      </button>
                    </div>
                  ) : (
                    <>
                      <FileUp size={36} className="text-gray-400 mb-2" />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100">
                          Selecionar Arquivo
                        </span>
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PDF, Word, Excel ou ZIP até 10MB</p>
                    </>
                  )}
                </div>

                {uploadStatus === "uploading" && (
                  <div className="mt-3 p-2 bg-blue-50 text-blue-700 text-sm rounded flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                    Enviando arquivo para o Supabase...
                  </div>
                )}

                {uploadStatus === "success" && (
                  <div className="mt-3 p-2 bg-green-50 text-green-700 text-sm rounded flex items-center">
                    <CheckCircle size={16} className="mr-2" />
                    Arquivo enviado com sucesso
                  </div>
                )}

                {uploadStatus === "error" && (
                  <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    Erro ao enviar arquivo. Por favor, tente novamente.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <LineChart size={18} className="mr-2 text-blue-700" />
                  <h3 className="font-medium">Análise Prévia de Classificação</h3>
                  <button
                    type="button"
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    aria-label="Ajuda"
                    aria-describedby="preview-help"
                  >
                    <HelpCircle size={16} />
                  </button>
                  <span id="preview-help" className="sr-only">Resumo da classificação baseada nos dados preenchidos</span>
                </div>

                {formData.supplierName && formData.serviceDescription ? (
                  <LiveClassification formData={formData as any} />
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-start">
                      <Info size={20} className="text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-700">
                          Preencha o nome do fornecedor e a descrição do serviço para visualizar a análise prévia.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="bg-blue-50 p-3 rounded-lg mb-6 border border-blue-200">
        <h2 className="text-xl font-bold mb-2 flex items-center text-blue-800">
          <FileText size={20} className="mr-2" />
          Triagem Interna: Fase Preliminar
          <button type="button" className="ml-2 text-blue-600 hover:text-blue-800" aria-label="Informações">
            <Info size={16} />
          </button>
        </h2>
        <p className="text-sm text-blue-700">
          Esta etapa deve ser preenchida pelo responsável interno da empresa antes de submeter ao escritório
          terceirizado que atua como encarregado de dados pessoais.
        </p>
        <div className="mt-4" aria-describedby="progress-description">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span>{steps[currentStep].title}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className="h-2 bg-blue-600 rounded"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              role="progressbar"
              aria-valuenow={currentStep + 1}
              aria-valuemin={1}
              aria-valuemax={steps.length}
            />
          </div>
          <span id="progress-description" className="sr-only">Progresso do formulário</span>
        </div>
      </div>

      {/* Wizard Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col items-center ${index < steps.length - 1 ? "flex-1" : ""} cursor-help`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === index
                    ? "bg-blue-600 text-white"
                    : currentStep > index
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > index ? <CheckCircle size={16} /> : index + 1}
              </div>
              <div className="text-xs mt-1 text-center">{step.title}</div>
              {index < steps.length - 1 && (
                <div className={`h-1 w-full mt-2 ${currentStep > index ? "bg-green-500" : "bg-gray-200"}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">{renderStepContent()}</div>

      {/* Error Message */}
      {errorDetails && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle size={20} className="text-red-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Erro ao submeter avaliação</h3>
              <p className="text-sm text-red-700 mt-1">{errorDetails}</p>
              <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono overflow-auto">
                <p>Detalhes técnicos:</p>
                <p>{errorDetails}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className={`px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 ${
            currentStep === 0 ? "invisible" : ""
          }`}
        >
          Anterior
        </button>
        {currentStep < steps.length - 1 ? (
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Próximo
          </button>
        ) : (
          <button
            onClick={submitInitialAssessment}
            disabled={isSubmitting}
            className={`px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Submeter para Análise do Escritório
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
