"use client"

import { useState } from "react"
import type React from "react"
import { 
  ChevronDown, ChevronRight, RefreshCw, CheckCircle, 
  AlertCircle, Calendar, FileText, Bell, Clock 
} from "lucide-react"
import { Checklist } from "./checklist"
import { calculateSupplierType, riskLevelColor } from "@/lib/risk-assessment"
import type { FormData } from "./supplier-risk-assessment"
import { useToast } from "@/hooks/use-toast"

interface MonitoringFormProps {
  formData: FormData
  toggleSection: (section: string) => void
  expandedSections: Record<string, boolean>
  prevStep: () => void
}

export const MonitoringForm: React.FC<MonitoringFormProps> = ({
  formData,
  toggleSection,
  expandedSections,
  prevStep,
}) => {
  const { toast } = useToast()
  const { code, description } = calculateSupplierType(formData.dataVolume, formData.dataSensitivity)
  
  // Estado para rastrear o progresso das verificações
  const [progress, setProgress] = useState({
    periodic: 0,
    updates: 0
  });
  
  // Estado para gerenciar se cada seção está completa
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({
    periodic: false,
    updates: false
  });
  
  // Estado para a data de próxima revisão
  const [nextReviewDate, setNextReviewDate] = useState(() => {
    const today = new Date();
    let months = 12; // padrão: anual
    
    // Define frequência com base no tipo do fornecedor
    if (code === "A") months = 3;      // trimestral
    else if (code === "B") months = 6; // semestral
    else if (code === "C") months = 12; // anual
    else if (code === "D") months = 24; // bienal
    
    const nextDate = new Date(today);
    nextDate.setMonth(today.getMonth() + months);
    
    return nextDate.toLocaleDateString('pt-BR');
  });
  
  // Calcula o progresso geral
  const calculateOverallProgress = () => {
    const totalProgress = Object.values(progress).reduce((sum, value) => sum + value, 0);
    return Math.round(totalProgress / Object.values(progress).length);
  };
  
  // Atualiza o progresso de uma seção específica
  const updateSectionProgress = (section: string, completedItems: number, totalItems: number) => {
    const percentage = Math.round((completedItems / totalItems) * 100);
    
    setProgress(prev => ({
      ...prev,
      [section]: percentage
    }));
    
    setCompletedSections(prev => ({
      ...prev,
      [section]: percentage === 100
    }));
  };
  
  // Verifica se todas as seções foram preenchidas
  const allSectionsCompleted = () => {
    return Object.values(completedSections).every(Boolean);
  };

  const periodicChecks = [
    "Cronograma de verificações baseado em risco",
    "Questionários de autoavaliação periódicos",
    "Auditorias presenciais (para fornecedores Tipo A)",
    "Verificação de certificações renovadas",
    "Testes de invasão/vulnerabilidade (quando aplicável)",
  ]

  const updateManagement = [
    "Procedimento de notificação de mudanças/atualizações significativas",
    "Reavaliação em caso de alteração de escopo",
    "Atualização de inventário de dados/fluxos",
    "Revisão em caso de reorganização societária do fornecedor",
    "Avaliação de impacto para mudanças críticas",
  ]
  
  // Requisitos adicionais de monitoramento baseados no tipo
  const criticalMonitoring = code === "A" ? [
    "Auditoria mensal de logs e registros de acesso",
    "Revisão trimestral de incidentes de segurança",
    "Verificação semestral de controles de segurança física",
    "Monitoramento contínuo de atividades suspeitas em tempo real",
    "Testes anuais de invasão (pentest) obrigatórios"
  ] : [];
  
  // Monitoramento específico para TI
  const techMonitoring = formData.isTechnology ? [
    "Verificação de atualizações de segurança e patches",
    "Monitoramento de disponibilidade e desempenho de serviços",
    "Controle de versões de software e ciclo de vida",
    "Revisão de listas de controle de acesso (ACLs)",
    "Verificação de políticas de backup e recuperação"
  ] : [];

  const handleComplete = () => {
    if (!allSectionsCompleted()) {
      toast({
        title: "Verificações incompletas",
        description: "Complete as verificações de monitoramento antes de finalizar o processo.",
        variant: "destructive",
      })
      return;
    }
    
    toast({
      title: "Processo concluído com sucesso",
      description: `O plano de monitoramento para ${formData.supplierName} foi finalizado. Próxima revisão: ${nextReviewDate}`,
      variant: "default",
    })
  }
  
  // Função para gerar datas baseadas no tipo do fornecedor
  const getMonitoringSchedule = () => {
    const today = new Date();
    const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
    
    const scheduleItems = [];
    
    // Próxima autoavaliação
    const selfAssessment = new Date(today);
    if (code === "A") selfAssessment.setMonth(today.getMonth() + 3);      // trimestral
    else if (code === "B") selfAssessment.setMonth(today.getMonth() + 6); // semestral 
    else selfAssessment.setMonth(today.getMonth() + 12);                  // anual
    
    scheduleItems.push({
      name: "Próximo questionário de autoavaliação",
      date: formatDate(selfAssessment)
    });
    
    // Próxima auditoria/verificação
    const audit = new Date(today);
    if (code === "A") audit.setMonth(today.getMonth() + 12);       // anual
    else if (code === "B") audit.setMonth(today.getMonth() + 12);  // anual
    else if (code === "C") audit.setMonth(today.getMonth() + 12);  // anual
    else audit.setMonth(today.getMonth() + 24);                    // bienal
    
    scheduleItems.push({
      name: code === "A" ? "Próxima auditoria completa" : 
            code === "B" ? "Próxima auditoria documental" : 
            "Próxima verificação básica",
      date: formatDate(audit)
    });
    
    // Se for fornecedor crítico, adicionar verificação trimestral
    if (code === "A") {
      const quarterlyCritical = new Date(today);
      quarterlyCritical.setMonth(today.getMonth() + 3);
      
      scheduleItems.push({
        name: "Revisão trimestral de incidentes de segurança",
        date: formatDate(quarterlyCritical)
      });
      
      // Adicionar teste anual
      const annualPentest = new Date(today);
      annualPentest.setMonth(today.getMonth() + 12);
      
      scheduleItems.push({
        name: "Próximo teste de invasão (pentest)",
        date: formatDate(annualPentest)
      });
    }
    
    // Se for TI, adicionar verificação de patches
    if (formData.isTechnology) {
      const patchReview = new Date(today);
      patchReview.setMonth(today.getMonth() + 3);
      
      scheduleItems.push({
        name: "Revisão de atualizações e patches de segurança",
        date: formatDate(patchReview)
      });
    }
    
    return scheduleItems;
  };
  
  const monitoringSchedule = getMonitoringSchedule();

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
        <h2 className="text-xl font-bold mb-2 flex items-center text-blue-800">
          <RefreshCw size={20} className="mr-2" />
          Etapa 4: Monitoramento Contínuo do Fornecedor
        </h2>
        <p className="text-sm text-blue-700">
          Esta etapa define o plano de monitoramento para verificação contínua da conformidade do fornecedor.
        </p>
      </div>

      <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h3 className="font-medium">Dados do Fornecedor</h3>
            <p className="text-sm text-gray-600">Nome: <span className="font-medium">{formData.supplierName}</span></p>
            <p className="text-sm text-gray-600">Serviço: <span className="font-medium">{formData.serviceDescription.substring(0, 60)}{formData.serviceDescription.length > 60 ? '...' : ''}</span></p>
          </div>
          <div className="flex items-center mt-3 sm:mt-0">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${riskLevelColor[code]}`}
            >
              {code}
            </div>
            <div className="ml-3">
              <p className="font-medium">Tipo {code}</p>
              <p className="text-sm">{description}</p>
            </div>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="mt-5 pt-4 border-t">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progresso do plano de monitoramento</span>
            <span className="text-sm font-medium">{calculateOverallProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                calculateOverallProgress() === 100 ? 'bg-green-600' : 
                calculateOverallProgress() > 70 ? 'bg-blue-600' : 
                calculateOverallProgress() > 30 ? 'bg-yellow-500' : 'bg-orange-500'
              }`} 
              style={{ width: `${calculateOverallProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Cronograma de monitoramento */}
      <div className="mb-6 p-4 border rounded-lg shadow-sm bg-blue-50">
        <div className="flex items-center mb-3">
          <Calendar size={18} className="text-blue-600 mr-2" />
          <h3 className="font-medium text-blue-800">Cronograma de Monitoramento</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {monitoringSchedule.map((item, index) => (
            <div key={index} className="flex items-center bg-white p-3 rounded-md border border-blue-100">
              <Clock size={16} className="text-blue-500 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-blue-700">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Seção de Verificações Periódicas */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div
            className={`flex items-center justify-between p-3 ${
              expandedSections.periodic 
                ? 'bg-gray-100 border-b' 
                : completedSections.periodic
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50'
            } cursor-pointer`}
            onClick={() => toggleSection("periodic")}
          >
            <div className="flex items-center">
              <FileText size={18} className={`mr-2 ${completedSections.periodic ? 'text-green-500' : 'text-gray-500'}`} />
              <h3 className="font-medium">1. Verificações Periódicas</h3>
              {completedSections.periodic && (
                <CheckCircle size={16} className="ml-2 text-green-500" />
              )}
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">{progress.periodic}%</span>
              {expandedSections.periodic ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </div>

          {expandedSections.periodic && (
            <div className="p-4">
              <Checklist 
                title="Monitoramento Regular" 
                items={periodicChecks} 
                type="periodic"
                onProgressUpdate={(completed, total) => updateSectionProgress('periodic', completed, total)}
              />
            </div>
          )}
        </div>

        {/* Seção de Gestão de Atualizações */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div
            className={`flex items-center justify-between p-3 ${
              expandedSections.updates 
                ? 'bg-gray-100 border-b' 
                : completedSections.updates
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50'
            } cursor-pointer`}
            onClick={() => toggleSection("updates")}
          >
            <div className="flex items-center">
              <Bell size={18} className={`mr-2 ${completedSections.updates ? 'text-green-500' : 'text-gray-500'}`} />
              <h3 className="font-medium">2. Gestão de Atualizações</h3>
              {completedSections.updates && (
                <CheckCircle size={16} className="ml-2 text-green-500" />
              )}
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">{progress.updates}%</span>
              {expandedSections.updates ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </div>

          {expandedSections.updates && (
            <div className="p-4">
              <Checklist 
                title="Controle de Mudanças" 
                items={updateManagement}
                type="updates"
                onProgressUpdate={(completed, total) => updateSectionProgress('updates', completed, total)}
              />
            </div>
          )}
        </div>
        
        {/* Monitoramento adicional para fornecedores críticos (Tipo A) */}
        {code === "A" && criticalMonitoring.length > 0 && (
          <div className="border border-red-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-3 bg-red-50 text-red-800">
              <div className="flex items-center">
                <AlertCircle size={18} className="text-red-500 mr-2" />
                <h3 className="font-medium">Monitoramento Especial para Fornecedores Críticos</h3>
              </div>
              <p className="text-xs text-red-600 mt-1 ml-6">
                Estas verificações adicionais são necessárias devido ao alto risco apresentado.
              </p>
            </div>
            
            <div className="p-4">
              <Checklist 
                title="Verificações Avançadas" 
                items={criticalMonitoring} 
                type="critical-monitoring"
              />
            </div>
          </div>
        )}
        
        {/* Monitoramento específico para fornecedores de TI */}
        {formData.isTechnology && techMonitoring.length > 0 && (
          <div className="border border-blue-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-800">
              <div className="flex items-center">
                <AlertCircle size={18} className="text-blue-500 mr-2" />
                <h3 className="font-medium">Monitoramento Específico para Tecnologia</h3>
              </div>
              <p className="text-xs text-blue-600 mt-1 ml-6">
                Estas verificações são especializadas para fornecedores de tecnologia e serviços em nuvem.
              </p>
            </div>
            
            <div className="p-4">
              <Checklist 
                title="Controles Técnicos" 
                items={techMonitoring} 
                type="tech-monitoring"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Definição da data da próxima revisão */}
      <div className="mt-6 p-4 border rounded-lg bg-green-50">
        <h3 className="font-medium text-green-800 mb-2 flex items-center">
          <Calendar size={18} className="text-green-600 mr-2" />
          Programação da Próxima Revisão
        </h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <label className="block text-sm text-green-700 mb-1" htmlFor="nextReviewDate">
              Data da próxima revisão completa:
              <input 
                id="nextReviewDate"
                type="date" 
                className="px-3 py-2 border border-green-200 rounded-md"
                value={nextReviewDate}
                onChange={(e) => setNextReviewDate(e.target.value)}
              />
            </label>
          </div>
          <div className="flex-grow ml-0 sm:ml-4 text-sm text-green-700">
            <p>
              Conforme a classificação do fornecedor como <strong>Tipo {code}</strong>, 
              recomenda-se uma frequência de revisão
              {code === "A" && " trimestral para questionários e anual para auditoria completa."}
              {code === "B" && " semestral para questionários e anual para auditoria documental."}
              {code === "C" && " anual para verificações documentais."}
              {code === "D" && " bienal para verificações básicas."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t">
        <button 
          onClick={prevStep}
          className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Voltar para Contratação
        </button>
        <button 
          onClick={handleComplete}
          className={`px-4 py-2 ${
            allSectionsCompleted() 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-green-300 cursor-not-allowed'
          } text-white rounded-md transition-colors flex items-center`}
          disabled={!allSectionsCompleted()}
        >
          <CheckCircle size={18} className="mr-2" />
          Concluir Processo
        </button>
      </div>
      
      {!allSectionsCompleted() && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded text-sm">
          <div className="flex items-start">
            <AlertCircle size={18} className="text-yellow-500 mr-2 mt-0.5" />
            <p className="text-yellow-700">
              Complete todas as verificações do plano de monitoramento antes de finalizar.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

