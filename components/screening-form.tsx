"use client"

import type React from "react"
import { AlertCircle, FileText } from "lucide-react"
import { LiveClassification } from "./live-classification"
import type { FormData } from "./supplier-risk-assessment"

interface ScreeningFormProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  nextStep: () => void
}

export const ScreeningForm: React.FC<ScreeningFormProps> = ({
  formData,
  updateFormData,
  nextStep,
}) => {
  // Manipulador de eventos para inputs e textareas
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Tratamento especial para checkbox
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      updateFormData({ [name]: checkbox.checked });
    } else {
      updateFormData({ [name]: value });
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0a3144] mb-2">Triagem Inicial do Fornecedor</h2>
        <p className="text-sm text-gray-600">
          Preencha as informações básicas sobre o fornecedor para determinar a classificação de risco.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nome do Fornecedor</label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Digite o nome do fornecedor"
              required
              suppressHydrationWarning
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">CNPJ</label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="xx.xxx.xxx/xxxx-xx"
              required
              suppressHydrationWarning
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Responsável pela Triagem</label>
            <input
              type="text"
              name="internalResponsible"
              value={formData.internalResponsible || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Nome do responsável interno"
              required
              suppressHydrationWarning
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email de Contato</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="email@exemplo.com"
              suppressHydrationWarning
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descrição do Serviço</label>
          <textarea
            name="serviceDescription"
            value={formData.serviceDescription}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Descreva em detalhes o escopo do serviço"
            required
            suppressHydrationWarning
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="dataVolume" className="block text-sm font-medium mb-2">Volume de Dados</label>
            <select
              id="dataVolume"
              name="dataVolume"
              value={formData.dataVolume}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              aria-label="Volume de Dados"
              suppressHydrationWarning
            >
              <option value="low">Baixo (menos de 100 indivíduos)</option>
              <option value="medium">Médio (100 a 1.000 indivíduos)</option>
              <option value="high">Alto (1.000 a 10.000 indivíduos)</option>
              <option value="massive">Massivo (mais de 10.000 indivíduos)</option>
            </select>
          </div>

          <div>
            <label htmlFor="dataSensitivity" className="block text-sm font-medium mb-2">Sensibilidade dos Dados</label>
            <select
              id="dataSensitivity"
              name="dataSensitivity"
              value={formData.dataSensitivity}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              aria-label="Sensibilidade dos Dados"
              suppressHydrationWarning
            >
              <option value="non-sensitive">Não pessoais</option>
              <option value="regular">Comuns</option>
              <option value="sensitive">Sensíveis</option>
            </select>

            {formData.sensitiveFlagged && (
              <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                <div className="flex">
                  <AlertCircle size={16} className="text-yellow-500 mr-2" />
                  <p>Atenção: O fornecedor terá acesso a dados sensíveis.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contractType" className="block text-sm font-medium mb-2">Tipo de Contrato</label>
            <select
              id="contractType"
              name="contractType"
              value={formData.contractType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              aria-label="Tipo de Contrato"
              suppressHydrationWarning
            >
              <option value="punctual">Pontual</option>
              <option value="continuous">Continuado</option>
            </select>
          </div>

          <div className="flex items-center h-full pt-8">
            <input
              type="checkbox"
              id="isTechnology"
              name="isTechnology"
              checked={formData.isTechnology}
              onChange={handleChange}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="isTechnology" className="text-sm">
              Fornecedor de TI/SaaS (Software as a Service)
            </label>
          </div>
        </div>
      </div>

      {/* Componente dinâmico de classificação e documentos */}
      {formData.supplierName && formData.serviceDescription && <LiveClassification formData={formData} />}

      {/* Seção de Políticas de Privacidade no novo estilo conforme a imagem */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <FileText className="mr-2 text-blue-600 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-[#0a3144]">Políticas de Privacidade e Segurança</h3>
            <p className="text-sm text-gray-600 mb-3">
              O fornecedor declara possuir política de privacidade ou política interna de segurança de dados?
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="policy-yes" 
                  name="policy" 
                  value="yes"
                  checked={formData.policy === "yes"}
                  onChange={handleChange}
                  className="mr-2" 
                />
                <label htmlFor="policy-yes" className="text-sm">Sim, e pode apresentar documento</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="policy-no" 
                  name="policy" 
                  value="no"
                  checked={formData.policy === "no"}
                  onChange={handleChange}
                  className="mr-2" 
                />
                <label htmlFor="policy-no" className="text-sm">Não possui nada formal</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="policy-unknown" 
                  name="policy" 
                  value="unknown"
                  checked={formData.policy === "unknown"}
                  onChange={handleChange}
                  className="mr-2" 
                />
                <label htmlFor="policy-unknown" className="text-sm">Desconheço</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6 flex justify-end">
        <button
          onClick={nextStep}
          className="px-6 py-3 bg-[#0a3144] text-white rounded-md hover:bg-[#1a4155] transition-colors duration-200 flex items-center"
          disabled={!formData.supplierName || !formData.serviceDescription}
        >
          Avançar
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="ml-2"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}
