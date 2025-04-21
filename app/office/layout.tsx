import { ReactNode } from "react"
import { Metadata } from "next"
import { Sidebar } from "@/components/sidebar"

interface OfficeLayoutProps {
  children: ReactNode
}

export const metadata: Metadata = {
  title: "Escritório DPO - Sistema de Gestão de Riscos",
  description: "Gerenciamento de avaliações de fornecedores",
}

export default function OfficeLayout({ children }: OfficeLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        {children}
      </div>
    </div>
  )
}