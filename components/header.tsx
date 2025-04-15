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
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-gray-200 py-4 px-6"
    >
      <div className="max-w-6xl mx-auto flex items-center">
        <div className="flex items-center flex-1">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center"
          >
            <Image
              src="/images/logo-rafael-maciel.png"
              alt="Rafael Maciel Sociedade de Advogados"
              width={80}
              height={60}
              className="mr-6"
            />
          </motion.div>

          <div>
            <h1 className="text-xl font-semibold text-[#0a3144]">Sistema de Gestão de Riscos de Privacidade</h1>
            <p className="text-sm text-gray-600">Avaliação e Monitoramento de Fornecedores</p>
          </div>
        </div>

        {!isOfficeEnvironment && onEnterOfficeEnvironment && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnterOfficeEnvironment}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0a3144] rounded-md border border-[#0a3144] hover:bg-[#1a4155] transition-colors duration-200"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Ambiente do Escritório
          </motion.button>
        )}
      </div>
    </motion.header>
  )
}
