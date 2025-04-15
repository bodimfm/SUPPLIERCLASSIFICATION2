"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ClipboardList, BarChart3, FileText, Users, Settings, ChevronRight, ChevronLeft } from "lucide-react"

interface OfficeMenuProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function OfficeMenu({ activeSection, onSectionChange }: OfficeMenuProps) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { id: "assessment", label: "Avaliação", icon: FileText },
    { id: "monitoring", label: "Monitoramento", icon: ClipboardList },
    { id: "adherence", label: "Análise de Aderência", icon: BarChart3 },
    { id: "suppliers", label: "Fornecedores", icon: Users },
    { id: "settings", label: "Configurações", icon: Settings },
  ]

  return (
    <div
      className={`bg-gray-100 border-r border-gray-200 h-full transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        {!collapsed && <h3 className="font-medium">Ambiente do Escritório</h3>}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="ml-auto">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="p-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "secondary" : "ghost"}
            className={`w-full justify-start mb-1 ${collapsed ? "px-2" : "px-4"}`}
            onClick={() => onSectionChange(item.id)}
          >
            <item.icon className="h-5 w-5 mr-2" />
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </div>
    </div>
  )
}
