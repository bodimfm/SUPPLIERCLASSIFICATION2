"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import GameBoard from "@/components/game-board"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"
import BadgeCollection, { type GameBadge } from "@/components/badge-collection"

export default function TabuleiroPage() {
  const router = useRouter()
  const [gameCompleted, setGameCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const searchParams = useSearchParams()
  const testMode = searchParams.get("testMode") === "true"

  const handleGameComplete = (score: number) => {
    setFinalScore(score)
    setGameCompleted(true)
  }

  // Calcular percentual de acertos
  const maxScore = 10 // Pontuação máxima possível
  const percentCorrect = (finalScore / maxScore) * 100

  const resultMessage = () => {
    if (percentCorrect >= 75)
      return "Excelente! Você demonstrou um ótimo conhecimento sobre LGPD e avaliação de fornecedores."
    if (percentCorrect >= 50) return "Bom trabalho! Você tem um conhecimento sólido, mas ainda há espaço para melhorar."
    return "Você completou o jogo! Recomendamos revisar os conceitos da LGPD para fortalecer seu conhecimento."
  }

  const calculateUnlockedBadges = (score: number): GameBadge[] => {
    const percentCorrect = (score / maxScore) * 100

    return [
      {
        id: "classificador",
        name: "Classificador de Dados",
        description: "Desbloqueado ao classificar corretamente os tipos de dados pessoais",
        icon: "🏷️",
        unlocked: percentCorrect >= 50,
      },
      {
        id: "contratador",
        name: "Contratador Seguro",
        description: "Desbloqueado ao completar a avaliação de um fornecedor com sucesso",
        icon: "📝",
        unlocked: percentCorrect >= 25,
      },
      {
        id: "dpo_jr",
        name: "DPO Júnior",
        description: "Desbloqueado ao completar todas as fases com pelo menos 70% de acertos",
        icon: "🛡️",
        unlocked: percentCorrect >= 75,
      },
    ]
  }

  const badges = calculateUnlockedBadges(finalScore)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {!gameCompleted ? (
        <GameBoard onComplete={handleGameComplete} testMode={testMode} />
      ) : (
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Award className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="text-xl md:text-2xl text-center">Parabéns por Completar o Jogo!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Sua pontuação final:</p>
              <p className="text-3xl font-bold">{finalScore} pontos</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Desempenho:</p>
              <Progress value={percentCorrect} className="h-2" />
              <p className="text-sm text-right">{percentCorrect.toFixed(0)}%</p>
            </div>

            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="font-medium">Avaliação:</p>
              <p>{resultMessage()}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-700">Conquistas desbloqueadas:</p>
              <BadgeCollection badges={badges} className="mt-3" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/")}>Voltar ao Início</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

