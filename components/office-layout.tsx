"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ClipboardList, BarChart3, FileText, Users, Settings, ChevronRight, ChevronLeft, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface OfficeLayoutProps {
  children: ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
  onExit: () => void
}

export default function OfficeLayout({ children, activeSection, onSectionChange, onExit }: OfficeLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { id: "assessment", label: "Avaliação", icon: FileText },
    { id: "monitoring", label: "Monitoramento", icon: ClipboardList },
    { id: "adherence", label: "Análise de Aderência", icon: BarChart3 },
    { id: "suppliers", label: "Fornecedores", icon: Users },
    { id: "settings", label: "Configurações", icon: Settings },
  ]

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Menu lateral com fundo azul da logomarca */}
      <div
        className={`bg-[#0a3144] h-full transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
        style={{ transition: "width 0.3s ease" }}
      >
        <div className="p-4 flex justify-between items-center border-b border-[#1a4155]">
          {!collapsed && <h3 className="font-medium text-white">Ambiente do Escritório</h3>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-white hover:bg-[#1a4155] hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="p-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start mb-1 ${collapsed ? "px-2" : "px-4"} 
                ${
                  activeSection === item.id
                    ? "bg-white text-[#0a3144]"
                    : "text-white hover:bg-[#1a4155] hover:text-white"
                }
                transition-all duration-200
              `}
              onClick={() => onSectionChange(item.id)}
            >
              <item.icon className="h-5 w-5 mr-2" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}

          <div className="mt-auto pt-4 border-t border-[#1a4155] mt-4">
            <Button
              variant="ghost"
              className={`w-full justify-start mb-1 ${collapsed ? "px-2" : "px-4"} 
                text-white hover:bg-[#1a4155] hover:text-white transition-all duration-200
              `}
              onClick={onExit}
            >
              <Home className="h-5 w-5 mr-2" />
              {!collapsed && <span>Voltar ao Sistema</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal com animação */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto p-6"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
