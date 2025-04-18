"use client"

import { motion } from "framer-motion"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-white border-t border-gray-200 py-4 px-6 mt-auto"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-[#0a3144] mb-2 md:mb-0">
            &copy; {currentYear} Rafael Maciel Sociedade de Advogados. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-600">
            Desenvolvido por: RM Serviços Jurídicos e Compliance em Tecnologia e Inovação.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
