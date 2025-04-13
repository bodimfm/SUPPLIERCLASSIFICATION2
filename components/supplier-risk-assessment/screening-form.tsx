"use client"

import type React from "react"
import { AlertCircle, CheckCircle, Upload, FileText, FileUp, Save, ChevronUp, ChevronDown } from "lucide-react"
import { LiveClassification } from "./live-classification"
import { RiskMatrix } from "./risk-matrix"
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
}) => {
  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="bg-blue-50 p-3 rounded-lg mb-6 border border-blue-200">
        <h2 className="text-xl font-bold mb-2 flex items-center text-blue-800">
          <FileText size={20} className="mr-2" />
          Triagem Interna: Fase Preliminar
        </h2>
        <p className="text-sm text-blue-700">
          Esta etapa deve ser preenchida pelo responsável interno da empresa antes de submeter ao escritório
          terceirizado que atua como encarregado de dados pessoais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nome do Fornecedor <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="supplierName"
            value={formData.supplierName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Digite o nome do fornecedor"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Responsável pela Triagem <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="internalResponsible"
            value={formData.internalResponsible}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Nome do responsável interno"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Descrição do Serviço/Fornecimento <span className="text-red-500">*</span>
        </label>
        <textarea
          name="serviceDescription"
          value={formData.serviceDescription}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Descreva em detalhes o escopo do serviço"
          required
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Volume de Dados</label>
          <select
            name="dataVolume"
            value={formData.dataVolume}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            aria-label="Volume de Dados"
          >
            <option value="low">Baixo (menos de 100 indivíduos)</option>
            <option value="medium">Médio (100 a 1.000 indivíduos)</option>
            <option value="high">Alto (1.000 a 10.000 indivíduos)</option>
            <option value="massive">Massivo (mais de 10.000 indivíduos)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sensibilidade dos Dados</label>
          <select
            name="dataSensitivity"
            value={formData.dataSensitivity}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            aria-label="Sensibilidade dos Dados"
          >
            <option value="non-sensitive">Não-sensíveis</option>
            <option value="regular">Regulares</option>
            <option value="sensitive">Sensíveis</option>
          </select>

          {formData.dataSensitivity === "sensitive" && (
            <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
              <div className="flex">
                <AlertCircle size={16} className="text-yellow-500 mr-2" />
                <p>Atenção: O fornecedor terá acesso a dados sensíveis. Uma avaliação mais rigorosa será necessária.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Contrato</label>
          <select
            name="contractType"
            value={formData.contractType}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            aria-label="Tipo de Contrato"
          >
            <option value="punctual">Pontual</option>
            <option value="continuous">Continuado</option>
          </select>
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
          </div>
        </div>
      </div>

      {/* Mostrar a matriz de risco e classificação dinâmica */}
      {formData.supplierName && formData.serviceDescription && (
        <>
          <LiveClassification formData={formData} />
          
          {/* Matriz de risco com célula destacada */}
          <div className={`transition-all duration-300 ease-in-out ${expandedSections["riskMatrix"] ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
            <RiskMatrix highlightCell={{ volume: formData.dataVolume, sensitivity: formData.dataSensitivity }} />
          </div>
          
          {/* Botão para expandir/recolher matriz de risco */}
          <div className="mt-2 mb-6 flex justify-center">
            <button
              type="button"
              onClick={() => toggleSection("riskMatrix")}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
            >
              {expandedSections["riskMatrix"] ? (
                <>
                  <ChevronUp size={16} className="mr-1" />
                  Ocultar matriz de risco
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-1" />
                  Ver matriz de risco completa
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Seção de upload de arquivo */}
      <div className="mt-6 mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-medium mb-3 flex items-center">
          <Upload size={18} className="mr-2 text-gray-600" />
          Anexar Documentação Relevante
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Faça upload de qualquer documentação adicional relevante para a avaliação do fornecedor (contratos, propostas,
          questionários preliminares, etc.).
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
            Enviando arquivo para o SharePoint...
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="mt-3 p-2 bg-green-50 text-green-700 text-sm rounded flex items-center">
            <CheckCircle size={16} className="mr-2" />
            Arquivo enviado com sucesso para o SharePoint
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded flex items-center">
            <AlertCircle size={16} className="mr-2" />
            Erro ao enviar arquivo. Por favor, tente novamente.
          </div>
        )}
      </div>

      <div className="border-t pt-6 mt-6 flex justify-end">
        <button
          onClick={submitInitialAssessment}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <Save size={18} className="mr-2" />
          Submeter para Análise do Escritório
        </button>
      </div>
    </div>
  )
}

