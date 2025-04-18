"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import DPOMascot from "@/components/dpo-mascot"
import { Dice5, Flag, MapPin, Trophy } from "lucide-react"

interface House {
  id: number
  title: string
  description: string
  type: "quiz" | "dragdrop" | "decision" | "plan" | "start" | "end"
  position: { x: number; y: number }
  color: string
}

interface GameBoardProps {
  initialScore?: number
  onComplete: (score: number) => void
}

export default function GameBoard({ initialScore = 0, onComplete }: GameBoardProps) {
  const router = useRouter()
  const [position, setPosition] = useState(0)
  const [score, setScore] = useState(initialScore)
  const [showModal, setShowModal] = useState(false)
  const [showDice, setShowDice] = useState(false)
  const [diceValue, setDiceValue] = useState(1)
  const [showMascot, setShowMascot] = useState(false)
  const [mascotMessage, setMascotMessage] = useState("")
  const [mascotType, setMascotType] = useState<"neutral" | "success" | "error" | "tip">("neutral")

  // Define as casas do tabuleiro
  const houses: House[] = [
    {
      id: 0,
      title: "Início",
      description: "Bem-vindo ao jogo de LGPD e Avaliação de Fornecedores!",
      type: "start",
      position: { x: 50, y: 50 },
      color: "bg-green-500",
    },
    {
      id: 1,
      title: "Requisitos Básicos",
      description: "Entenda os requisitos fundamentais da LGPD para avaliação de fornecedores",
      type: "quiz",
      position: { x: 150, y: 50 },
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Classificação de Dados",
      description: "Aprenda a classificar dados pessoais e sensíveis conforme a LGPD",
      type: "dragdrop",
      position: { x: 250, y: 100 },
      color: "bg-purple-500",
    },
    {
      id: 3,
      title: "Avaliação de Risco",
      description: "Identifique riscos em fornecedores e tome decisões importantes",
      type: "decision",
      position: { x: 350, y: 50 },
      color: "bg-orange-500",
    },
    {
      id: 4,
      title: "Plano de Ação",
      description: "Crie um plano para mitigar riscos com fornecedores",
      type: "plan",
      position: { x: 450, y: 100 },
      color: "bg-yellow-500",
    },
    {
      id: 5,
      title: "Fim",
      description: "Parabéns! Você completou o jogo!",
      type: "end",
      position: { x: 550, y: 50 },
      color: "bg-red-500",
    },
  ]

  useEffect(() => {
    // Mostrar mascote de boas-vindas
    setMascotMessage("Bem-vindo ao tabuleiro LGPD! Role o dado para avançar e enfrentar os desafios.")
    setMascotType("neutral")
    setShowMascot(true)

    // Esconder o mascote após 5 segundos
    const timer = setTimeout(() => {
      setShowMascot(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const rollDice = () => {
    setShowDice(true)

    // Animação do dado rolando
    let rolls = 0
    const maxRolls = 10
    const rollInterval = setInterval(() => {
      const newValue = Math.floor(Math.random() * 3) + 1 // Valores de 1 a 3
      setDiceValue(newValue)

      rolls++
      if (rolls >= maxRolls) {
        clearInterval(rollInterval)

        // Após a animação, mover a peça
        setTimeout(() => {
          const newPosition = Math.min(position + newValue, houses.length - 1)
          setPosition(newPosition)
          setShowDice(false)

          // Abrir modal após a peça chegar na casa
          setTimeout(() => {
            setShowModal(true)
          }, 1000)
        }, 500)
      }
    }, 100)
  }

  const handleCloseModal = () => {
    setShowModal(false)

    // Se chegou ao final, chamar onComplete
    if (position === houses.length - 1) {
      onComplete(score)
    }
  }

  const handleChallengeComplete = (additionalScore: number) => {
    const newScore = score + additionalScore
    setScore(newScore)

    setMascotMessage(`Você ganhou ${additionalScore} pontos! Sua pontuação atual é ${newScore}.`)
    setMascotType("success")
    setShowMascot(true)

    // Esconder o mascote após 3 segundos
    setTimeout(() => {
      setShowMascot(false)
    }, 3000)

    setShowModal(false)
  }

  const handleGoToChallenge = () => {
    setShowModal(false)

    // Redirecionar para a página correspondente ao desafio
    switch (houses[position].type) {
      case "quiz":
        router.push(`/fase1?boardScore=${score}`)
        break
      case "dragdrop":
        router.push(`/fase2?boardScore=${score}`)
        break
      case "decision":
        router.push(`/fase3?boardScore=${score}`)
        break
      case "plan":
        router.push(`/fase4?boardScore=${score}`)
        break
      case "end":
        onComplete(score)
        break
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Tabuleiro LGPD
          </CardTitle>
          <CardDescription>
            Avance pelo tabuleiro e complete os desafios para aprender sobre LGPD e avaliação de fornecedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabuleiro */}
          <div className="relative h-[300px] bg-slate-100 rounded-lg p-4 overflow-hidden">
            {/* Caminho do tabuleiro */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M50,50 L150,50 L250,100 L350,50 L450,100 L550,50"
                fill="none"
                stroke="#ccc"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="5,5"
              />
            </svg>

            {/* Casas do tabuleiro */}
            {houses.map((house) => (
              <div
                key={house.id}
                className={`absolute w-16 h-16 rounded-full ${house.color} flex items-center justify-center text-white font-bold shadow-md`}
                style={{
                  left: `${house.position.x - 32}px`,
                  top: `${house.position.y - 32}px`,
                  zIndex: 10,
                }}
              >
                {house.type === "start" && <Flag className="h-6 w-6" />}
                {house.type === "quiz" && <span>F1</span>}
                {house.type === "dragdrop" && <span>F2</span>}
                {house.type === "decision" && <span>F3</span>}
                {house.type === "plan" && <span>F4</span>}
                {house.type === "end" && <Trophy className="h-6 w-6" />}
              </div>
            ))}

            {/* Peça do jogador */}
            <motion.div
              className="absolute w-12 h-12 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center z-20"
              initial={{ x: houses[0].position.x - 24, y: houses[0].position.y - 24 }}
              animate={{
                x: houses[position].position.x - 24,
                y: houses[position].position.y - 24,
              }}
              transition={{ duration: 1, type: "spring" }}
            >
              <MapPin className="h-6 w-6 text-white" />
            </motion.div>

            {/* Dado */}
            {showDice && (
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 z-30"
                animate={{ rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Dice5 className="h-12 w-12 text-primary" />
                <div className="text-center font-bold text-xl mt-2">{diceValue}</div>
              </motion.div>
            )}
          </div>

          {/* Pontuação */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm font-medium">
              Posição: Casa {position + 1} de {houses.length}
            </div>
            <div className="text-sm font-medium">Pontuação: {score}</div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={rollDice} disabled={showDice || position === houses.length - 1} className="gap-2">
            <Dice5 className="h-4 w-4" />
            Rolar Dado
          </Button>
        </CardFooter>
      </Card>

      {/* Modal da casa */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{houses[position]?.title}</DialogTitle>
            <DialogDescription>{houses[position]?.description}</DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-slate-50 rounded-md">
            {houses[position]?.type === "start" && <p>Você está no início do jogo. Role o dado para avançar!</p>}

            {(houses[position]?.type === "quiz" ||
              houses[position]?.type === "dragdrop" ||
              houses[position]?.type === "decision" ||
              houses[position]?.type === "plan") && (
              <p>Você chegou a um desafio! Clique no botão abaixo para iniciá-lo.</p>
            )}

            {houses[position]?.type === "end" && (
              <div className="text-center">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <p className="font-medium">Parabéns! Você completou o tabuleiro!</p>
                <p>Sua pontuação final: {score}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            {houses[position]?.type === "start" && <Button onClick={handleCloseModal}>Entendi</Button>}

            {(houses[position]?.type === "quiz" ||
              houses[position]?.type === "dragdrop" ||
              houses[position]?.type === "decision" ||
              houses[position]?.type === "plan") && <Button onClick={handleGoToChallenge}>Iniciar Desafio</Button>}

            {houses[position]?.type === "end" && <Button onClick={handleCloseModal}>Ver Resultados</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showMascot && <DPOMascot message={mascotMessage} type={mascotType} autoHide={false} />}
    </div>
  )
}

