"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { CheckSquare, Square, Info } from "lucide-react"

interface ChecklistProps {
  title: string
  items: string[]
  type?: string
  onProgressUpdate?: (completedItems: number, totalItems: number) => void
}

export const Checklist: React.FC<ChecklistProps> = ({ 
  title, 
  items, 
  type = "basic",
  onProgressUpdate 
}) => {
  // Estado para rastrear quais itens foram marcados
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  
  // Calcular o número de itens marcados
  const completedItemsCount = Object.values(checkedItems).filter(Boolean).length;
  
  // Notificar o componente pai sobre mudanças no progresso
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(completedItemsCount, items.length);
    }
  }, [completedItemsCount, items.length, onProgressUpdate]);
  
  // Alternar o estado de um item específico
  const toggleItem = (index: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="mt-4 border rounded-lg p-4 bg-white">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-medium text-lg">{title}</h3>
        <div className="text-sm text-gray-600">
          {completedItemsCount}/{items.length} verificados
        </div>
      </div>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-start p-2 rounded-md ${
              checkedItems[index] ? 'bg-green-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => toggleItem(index)}
          >
            <div className="mt-0.5 mr-2 cursor-pointer text-lg">
              {checkedItems[index] ? (
                <CheckSquare size={20} className="text-green-600" />
              ) : (
                <Square size={20} className="text-gray-400" />
              )}
            </div>
            <label className={`text-sm cursor-pointer flex-grow ${checkedItems[index] ? 'text-green-800' : ''}`}>
              {item}
            </label>
          </div>
        ))}
      </div>
      
      {items.length > 0 && completedItemsCount < items.length && (
        <div className="mt-4 pt-3 border-t flex items-center text-xs text-blue-600">
          <Info size={14} className="mr-1" />
          <span>Clique nos itens para marcá-los como verificados</span>
        </div>
      )}
      
      {completedItemsCount === items.length && (
        <div className="mt-4 pt-3 border-t text-center">
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Checklist completo
          </span>
        </div>
      )}
    </div>
  )
}

