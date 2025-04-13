import type React from "react"
import { FileText, Shield, User, RefreshCw, CheckCircle } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface StepIndicatorProps {
  currentStep: number
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const isMobile = useMobile()
  
  const steps = [
    { 
      name: "Triagem Interna", 
      icon: <FileText size={20} />,
      description: "Qualificação inicial e classificação do fornecedor"
    },
    { 
      name: "Avaliação Externa", 
      icon: <Shield size={20} />,
      description: "Análise de conformidade legal e técnica"
    },
    { 
      name: "Contratação", 
      icon: <User size={20} />,
      description: "Definição de cláusulas contratuais"
    },
    { 
      name: "Monitoramento", 
      icon: <RefreshCw size={20} />,
      description: "Verificação contínua de conformidade"
    },
  ]

  return (
    <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-wrap items-center justify-between w-full">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div 
              key={index} 
              className={`flex ${isMobile ? 'flex-col items-center mb-3' : 'flex-1 items-center'} relative`}
            >
              <div 
                className={`
                  ${isMobile ? 'w-12 h-12' : 'w-14 h-14'} 
                  rounded-full flex items-center justify-center shadow-sm
                  ${isActive ? "bg-blue-600 text-white border-4 border-blue-200" : ""}
                  ${isCompleted ? "bg-green-500 text-white" : ""}
                  ${!isActive && !isCompleted ? "bg-gray-100 text-gray-400 border border-gray-200" : ""}
                  z-10
                `}
              >
                {isCompleted ? <CheckCircle size={20} /> : step.icon}
              </div>
              
              {!isMobile && index < steps.length - 1 && (
                <div className={`h-1 flex-grow mx-2 ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
              )}
              
              <div className={`${isMobile ? 'text-center mt-2' : 'ml-4'} ${index === currentStep ? 'opacity-100' : 'opacity-80'}`}>
                <span className={`text-sm font-medium block ${isActive ? "text-blue-600" : ""}`}>
                  {step.name}
                </span>
                {!isMobile && (
                  <span className="text-xs text-gray-500 block mt-1">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Descrições para dispositivos móveis */}
      {isMobile && currentStep < steps.length && (
        <div className="mt-4 pt-3 border-t text-center">
          <p className="text-xs text-gray-600">{steps[currentStep].description}</p>
        </div>
      )}
    </div>
  )
}

