import type React from "react"
import { Info, HelpCircle } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface RiskMatrixProps {
  highlightCell?: {
    volume: string;
    sensitivity: string;
  }
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ highlightCell }) => {
  const isMobile = useMobile()
  
  // Definição de células da matriz
  const matrixCells = {
    baixo: {
      "non-sensitive": { type: "D", name: "Básico", color: "bg-green-100 border-green-300" },
      "regular": { type: "D", name: "Básico", color: "bg-green-100 border-green-300" },
      "sensitive": { type: "C", name: "Moderado", color: "bg-yellow-100 border-yellow-300" },
    },
    medio: {
      "non-sensitive": { type: "D", name: "Básico", color: "bg-green-100 border-green-300" },
      "regular": { type: "C", name: "Moderado", color: "bg-yellow-100 border-yellow-300" },
      "sensitive": { type: "B", name: "Significativo", color: "bg-orange-100 border-orange-300" },
    },
    alto: {
      "non-sensitive": { type: "C", name: "Moderado", color: "bg-yellow-100 border-yellow-300" },
      "regular": { type: "C", name: "Moderado", color: "bg-yellow-100 border-yellow-300" },
      "sensitive": { type: "B", name: "Significativo", color: "bg-orange-100 border-orange-300" },
    },
    massivo: {
      "non-sensitive": { type: "C", name: "Moderado", color: "bg-yellow-100 border-yellow-300" },
      "regular": { type: "B", name: "Significativo", color: "bg-orange-100 border-orange-300" },
      "sensitive": { type: "A", name: "Crítico", color: "bg-red-100 border-red-300" },
    },
  };
  
  // Mapeamento para apresentação na interface
  const volumeMap = {
    "low": "baixo",
    "medium": "medio",
    "high": "alto",
    "massive": "massivo"
  };
  
  // Descrições dos níveis de risco
  const riskDescriptions = {
    "A": "Due Diligence completa, avaliação presencial, verificação de subcontratados",
    "B": "Questionário intermediário, verificação documental detalhada",
    "C": "Questionário básico, autoavaliação documentada",
    "D": "Cláusulas contratuais mínimas apenas"
  };

  return (
    <div className="my-6 border rounded-lg shadow-sm overflow-hidden">
      <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-semibold flex items-center">
          <Info size={18} className="mr-2 text-gray-500" />
          Matriz de Classificação de Risco
        </h3>
        <div className="flex items-center text-xs text-gray-500 hover:text-gray-700">
          <HelpCircle size={14} className="mr-1" />
          <span>Baseado na LGPD</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Volume de Dados</th>
                <th className="border p-2 text-center">Não-sensíveis</th>
                <th className="border p-2 text-center">Regulares</th>
                <th className="border p-2 text-center">Sensíveis</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(matrixCells).map(([volume, sensitivities]) => (
                <tr key={volume}>
                  <td className="border p-2 font-medium">
                    {volume === 'baixo' && 'Baixo'}
                    {volume === 'medio' && 'Médio'}
                    {volume === 'alto' && 'Alto'}
                    {volume === 'massivo' && 'Massivo'}
                  </td>
                  {Object.entries(sensitivities).map(([sensitivity, cell]) => {
                    const isHighlighted = 
                      highlightCell && 
                      volumeMap[highlightCell.volume] === volume && 
                      highlightCell.sensitivity === sensitivity;
                    
                    return (
                      <td 
                        key={sensitivity} 
                        className={`
                          border p-2 text-center font-medium
                          ${cell.color}
                          ${isHighlighted ? 'ring-2 ring-offset-1 ring-blue-500' : ''}
                        `}
                      >
                        <div className="flex flex-col items-center">
                          <span className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-sm mb-1
                            ${cell.type === 'A' ? 'bg-red-500 text-white' : ''}
                            ${cell.type === 'B' ? 'bg-orange-500 text-white' : ''}
                            ${cell.type === 'C' ? 'bg-yellow-500 text-white' : ''}
                            ${cell.type === 'D' ? 'bg-green-500 text-white' : ''}
                          `}>
                            {cell.type}
                          </span>
                          <span className="text-sm">{cell.name}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Legendas e informações adicionais */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm">
            <h4 className="font-medium mb-2 text-gray-700">Volumes de Dados</h4>
            <ul className="space-y-1 text-gray-600">
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                <strong>Baixo:</strong> Menos de 100 indivíduos
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                <strong>Médio:</strong> De 100 a 1.000 indivíduos
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                <strong>Alto:</strong> De 1.000 a 10.000 indivíduos
              </li>
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                <strong>Massivo:</strong> Mais de 10.000 indivíduos
              </li>
            </ul>
          </div>
          
          <div className="text-sm">
            <h4 className="font-medium mb-2 text-gray-700">Níveis de Controle</h4>
            <ul className="space-y-1">
              <li className="flex items-center">
                <span className="inline-block w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center mr-2">A</span>
                <span className="text-gray-600">Crítico - {!isMobile && riskDescriptions["A"]}</span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center mr-2">B</span>
                <span className="text-gray-600">Significativo - {!isMobile && riskDescriptions["B"]}</span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-5 h-5 bg-yellow-500 text-white rounded-full text-xs flex items-center justify-center mr-2">C</span>
                <span className="text-gray-600">Moderado - {!isMobile && riskDescriptions["C"]}</span>
              </li>
              <li className="flex items-center">
                <span className="inline-block w-5 h-5 bg-green-500 text-white rounded-full text-xs flex items-center justify-center mr-2">D</span>
                <span className="text-gray-600">Básico - {!isMobile && riskDescriptions["D"]}</span>
              </li>
            </ul>
          </div>
        </div>
        
        {isMobile && (
          <div className="mt-4 pt-4 border-t text-xs text-gray-500">
            <p className="mb-1">
              <strong>Consulte a documentação completa</strong> para detalhes sobre os requisitos de cada nível de controle.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

