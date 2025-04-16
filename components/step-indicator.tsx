import type React from "react"
import { FileText, Shield, Upload, BarChart2, CheckCircle } from "lucide-react"

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

  // Calcular a porcentagem de progresso com base no número total de etapas
  const progressPercentage = Math.min(100, Math.round((currentStep / displaySteps.length) * 100));

  return (
    <div className="w-full px-6 py-4 bg-blue-50 rounded-lg">
      <div className="relative flex items-center justify-between">
        {/* Barra de progresso de fundo */}
        <div className="absolute w-full h-[2px] bg-gray-200 top-1/2 -translate-y-1/2"></div>
        
        {/* Barra de progresso ativa */}
        <div 
          className="absolute h-[2px] bg-green-500 top-1/2 -translate-y-1/2 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
          aria-label={`${progressPercentage}% completo`}
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
        
        {/* Etapas */}
        {displaySteps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative z-10">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                ${index === currentStep
                  ? "bg-blue-600 text-white" 
                  : index < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-400 border border-gray-300"}`}
            >
              {index < currentStep ? <CheckCircle className="animate-fadeIn" /> : step.icon}
            </div>
            <span className={`mt-2 text-sm font-medium ${index === currentStep ? "text-blue-800" : index < currentStep ? "text-green-700" : "text-gray-500"}`}>
              {step.name}
            </span>
            <span className="text-xs text-gray-500 text-center max-w-[150px]">
              {step.description}
            </span>
          </div>
        ))}
      </div>
      
      {/* Indicador textual de progresso */}
      <div className="flex justify-center mt-4">
        <span className="text-sm text-gray-500">
          Etapa {currentStep} de {displaySteps.length} ({progressPercentage}% concluído)
        </span>
      </div>
    </div>
  )
}
