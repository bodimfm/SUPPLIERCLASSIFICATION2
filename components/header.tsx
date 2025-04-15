"use client"

import Image from "next/image"
import { Building2 } from "lucide-react"
import { motion } from "framer-motion"

interface HeaderProps {
  onEnterOfficeEnvironment?: () => void
  isOfficeEnvironment?: boolean
}

export default function Header({ onEnterOfficeEnvironment, isOfficeEnvironment = false }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Image
            src={process.env.NEXT_PUBLIC_LOGO_PATH || "/images/logo-rafael-maciel.png"}
            alt="Rafael Maciel Sociedade de Advogados"
            width={120}
            height={90}
            className="object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-[#0a3144]">Sistema de Gestão de Riscos de Privacidade</h1>
            <p className="text-xl text-gray-600">Avaliação e Monitoramento de Fornecedores</p>
          </div>
        </div>

        {!isOfficeEnvironment && onEnterOfficeEnvironment && (
          <button
            onClick={onEnterOfficeEnvironment}
            className="flex items-center px-6 py-3 text-base font-medium text-white bg-[#0a3144] rounded-lg border border-[#0a3144] hover:bg-[#1a4155] transition-colors duration-200"
          >
            <Building2 className="h-5 w-5 mr-3" />
            Ambiente do Escritório
          </button>
        )}
      </div>
    </header>
  )
}
