"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DPOMascot from "@/components/dpo-mascot"
import AnimatedContainer from "@/components/animated-container"
import OfficeHeader from "@/components/office-header"
import { ArrowRight, BookOpen } from "lucide-react"
import Image from "next/image"
import { useSound } from "@/components/sound-provider"

export default function Home() {
  const [showMascot, setShowMascot] = useState(false)
  const { playSound } = useSound()

  useEffect(() => {
    // Show mascot with a slight delay for better UX
    const timer = setTimeout(() => {
      setShowMascot(true)
      playSound("transition")
    }, 1000)

    return () => clearTimeout(timer)
  }, [playSound])

  const handleStartClick = () => {
    playSound("click")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl">
        <OfficeHeader />

        <div className="flex justify-center">
          <AnimatedContainer className="w-full max-w-2xl">
            <Card className="border-none shadow-lg">
              <CardHeader className="text-center">
                <motion.div
                  className="mx-auto w-24 h-24 flex items-center justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <Image
                    src="/images/mascote-lgpd.png"
                    alt="Mascote LGPD"
                    width={100}
                    height={100}
                    className="drop-shadow-lg"
                  />
                </motion.div>
                <CardTitle className="text-2xl md:text-3xl">LGPD e Avaliação de Fornecedores</CardTitle>
                <CardDescription className="text-base">
                  Aprenda sobre a Lei Geral de Proteção de Dados e como avaliar fornecedores de forma interativa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <p className="text-center">
                    Este jogo educativo vai te ajudar a entender os principais conceitos da LGPD e como aplicá-los na
                    avaliação de fornecedores.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-blue-50 p-6 rounded-lg text-blue-700 border border-blue-100"
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-blue-800 mb-2">Sua Missão:</p>
                      <p>
                        Você foi contratado pela empresa ProtecData S/A e recebeu a missão de avaliar fornecedores que
                        terão acesso a dados pessoais. Complete as 4 fases do jogo e torne-se um especialista em
                        compliance!
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-green-50 p-6 rounded-lg text-green-700 border border-green-100"
                >
                  <p className="font-medium text-green-800 mb-2">O que você vai aprender:</p>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>
                      <span className="font-bold">Fase 1:</span> Requisitos básicos da LGPD para avaliação de
                      fornecedores
                    </li>
                    <li>
                      <span className="font-bold">Fase 2:</span> Como classificar dados pessoais e sensíveis
                    </li>
                    <li>
                      <span className="font-bold">Fase 3:</span> Documentação necessária para formalizar relações com
                      fornecedores
                    </li>
                    <li>
                      <span className="font-bold">Fase 4:</span> Monitoramento contínuo de conformidade
                    </li>
                  </ul>
                </motion.div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Link href="/fase1" onClick={handleStartClick}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="gap-2">
                      <span>Iniciar Jornada</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
              </CardFooter>
            </Card>
          </AnimatedContainer>
        </div>
      </div>

      {showMascot && (
        <DPOMascot
          message="Olá! Eu sou o DPO Virtual e vou te guiar nessa jornada de aprendizado sobre LGPD e avaliação de fornecedores. Vamos começar?"
          autoHide={false}
        />
      )}
    </div>
  )
}

