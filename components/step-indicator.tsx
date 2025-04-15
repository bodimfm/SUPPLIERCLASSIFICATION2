import type React from "react"
import { FileText, Shield, Upload, BarChart2 } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
  totalSteps?: number
  internalProcess?: boolean
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep,
  totalSteps = 4,
  internalProcess = true
}) => {
  const steps = [
    { name: "Triagem", description: "Coleta de informações básicas", icon: <FileText size={20} /> },
    { name: "Classificação", description: "Identificação de requisitos", icon: <Shield size={20} /> },
    { name: "Documentação", description: "Upload de arquivos", icon: <Upload size={20} /> },
    { name: "Avaliação", description: "Análise pelo escritório", icon: <BarChart2 size={20} /> },
  ]

  // Mostrar apenas os passos relevantes se for um processo interno
  const displaySteps = internalProcess ? steps.slice(0, 3) : steps;

  return (
    <div className="w-full px-6 py-4 bg-blue-50 rounded-lg">
      <div className="relative flex items-center justify-between">
        {/* Linha de conexão */}
        <div className="absolute w-full h-[1px] bg-gray-300 top-1/2 -translate-y-1/2"></div>
        
        {/* Etapas */}
        {displaySteps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative z-10">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center 
                ${index === currentStep - 1
                  ? "bg-blue-600 text-white" 
                  : index < currentStep - 1
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-400 border border-gray-300"}`}
            >
              {step.icon}
            </div>
            <span className={`mt-2 text-sm font-medium ${index === currentStep - 1 ? "text-blue-800" : "text-gray-500"}`}>
              {step.name}
            </span>
            <span className="text-xs text-gray-500 text-center max-w-[150px]">
              {step.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
