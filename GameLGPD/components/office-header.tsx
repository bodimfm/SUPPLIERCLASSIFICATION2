"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import SoundControl from "./sound-control"
import { useSound } from "./sound-provider"

export default function OfficeHeader() {
  const { playSound } = useSound()

  const handleLogoClick = () => {
    playSound("click")
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white shadow-md py-3 px-4 mb-6 rounded-lg"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" onClick={handleLogoClick}>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative h-12 w-12 flex items-center justify-center"
            >
              <Image
                src="/images/logo-rafael-maciel.png"
                alt="Rafael Maciel Sociedade de Advogados"
                width={48}
                height={48}
                className="object-contain"
                onError={(e) => {
                  // Quando a imagem falhar, o texto RM continuará visível
                  e.currentTarget.style.display = "none"
                }}
              />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-primary font-montserrat">LGPD Compliance</h1>
              <p className="text-xs text-gray-500 font-montserrat">Avaliação de Fornecedores</p>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium font-raleway">Treinamento Oficial</p>
            <p className="text-xs text-gray-500 font-raleway">RMSA - Encarregado de Dados</p>
          </div>
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Image
              src="/images/mascote-lgpd.png"
              alt="Logo LGPD"
              width={30}
              height={30}
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          </div>
          <SoundControl />
        </div>
      </div>
    </motion.header>
  )
}

