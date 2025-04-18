"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DynamicQuiz from "@/components/dynamic-quiz"
import TipModal from "@/components/tip-modal"
import DPOMascot from "@/components/dpo-mascot"
import BadgeCollection, { type GameBadge } from "@/components/badge-collection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award, CheckCircle2, Medal } from "lucide-react"
import { QuestionSelectionMode } from "@/lib/question-service"
import PhaseHeader from "@/components/phase-header"
import ProgressBar from "@/components/progress-bar"
import AnimatedContainer from "@/components/animated-container"
import OfficeHeader from "@/components/office-header"
import { motion } from "framer-motion"
import PhaseNavigation from "@/components/phase-navigation"
import PhaseIndicator from "@/components/phase-indicator"

export default function Fase4() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [score, setScore] = useState(0)
  const [showTip, setShowTip] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showMascot, setShowMascot] = useState(true)
  const [mascotMessage, setMascotMessage] = useState(
    "Bem-vindo à Fase Final! Aqui você vai demonstrar seu conhecimento sobre monitoramento contínuo de fornecedores.",
  )
  const [mascotType, setMascotType] = useState<"neutral" | "success" | "error" | "tip">("neutral")
  const testMode = searchParams.get("testMode") === "true"

  useEffect(() => {
    const scoreParam = searchParams.get("score")
    if (scoreParam) {
      setScore(Number.parseInt(scoreParam))
    }
  }, [searchParams])

  const handleQuizComplete = (quizScore: number, total: number) => {
    setScore(score + quizScore)

    if (quizScore === total) {
      setMascotMessage(
        "Excelente! Auditorias periódicas e relatórios de conformidade são essenciais para garantir que o fornecedor mantenha as medidas de proteção ao longo do tempo.",
      )
      setMascotType("success")
    } else if (quizScore >= total * 0.7) {
      setMascotMessage("Muito bom! Você acertou a maioria das perguntas sobre monitoramento contínuo de fornecedores.")
      setMascotType("success")
    } else {
      setMascotMessage(
        "Atenção! A conformidade com a LGPD é um processo contínuo. Verificar apenas uma vez ou confiar na palavra do fornecedor não é suficiente.",
      )
      setMascotType("error")
    }

    setShowTip(true)
    setQuizCompleted(true)
    setShowMascot(true)

    // Mostrar resultados finais após completar o quiz
    setTimeout(() => {
      handleShowResults()
    }, 3000)
  }

  const handleShowResults = () => {
    setShowResults(true)

    // Show final mascot message based on score
    const totalQuestions = 10 // Ajustado para considerar todas as perguntas das fases
    const percentCorrect = (score / totalQuestions) * 100

    if (percentCorrect >= 75) {
      setMascotMessage(
        "Parabéns! Você demonstrou excelente conhecimento sobre LGPD e avaliação de fornecedores. Você está pronto para aplicar esses conceitos no dia a dia!",
      )
      setMascotType("success")
    } else if (percentCorrect >= 50) {
      setMascotMessage(
        "Bom trabalho! Você tem um conhecimento sólido sobre LGPD e avaliação de fornecedores, mas ainda há espaço para melhorar.",
      )
      setMascotType("tip")
    } else {
      setMascotMessage(
        "Você completou o jogo! Recomendo revisar os conceitos da LGPD para fortalecer seu conhecimento sobre avaliação de fornecedores.",
      )
      setMascotType("neutral")
    }

    setShowMascot(true)

    // Save badges to localStorage
    const unlockedBadges = calculateUnlockedBadges(score)
    localStorage.setItem("lgpdBadges", JSON.stringify(unlockedBadges))
  }

  const tip = {
    title: "Monitoramento Contínuo de Fornecedores",
    content:
      "A conformidade com a LGPD não é um evento único, mas um processo contínuo. Estabeleça um programa de monitoramento que inclua auditorias periódicas, solicitação de relatórios de conformidade, e revisão de incidentes de segurança. Isso ajuda a garantir que seus fornecedores mantenham os padrões de proteção de dados ao longo do tempo e reduz riscos de violações que poderiam afetar sua empresa.",
  }

  // Calcular percentual de acertos
  const totalQuestions = 10 // Ajustado para considerar todas as perguntas das fases
  const percentCorrect = (score / totalQuestions) * 100
  const resultMessage = () => {
    if (percentCorrect >= 75)
      return "Excelente! Você demonstrou um ótimo conhecimento sobre LGPD e avaliação de fornecedores."
    if (percentCorrect >= 50) return "Bom trabalho! Você tem um conhecimento sólido, mas ainda há espaço para melhorar."
    return "Você completou o jogo! Recomendamos revisar os conceitos da LGPD para fortalecer seu conhecimento."
  }

  const calculateUnlockedBadges = (finalScore: number): GameBadge[] => {
    const percentCorrect = (finalScore / totalQuestions) * 100

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

  const badges = calculateUnlockedBadges(score)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl">
        <OfficeHeader />

        <div className="flex justify-end mb-4">
          <PhaseIndicator currentPhase={4} totalPhases={4} />
        </div>

        <div className="flex justify-center">
          <AnimatedContainer className="w-full max-w-4xl">
            {!showResults ? (
              <Card className="border-none shadow-lg">
                <PhaseHeader
                  phase={4}
                  title="Monitoramento Contínuo"
                  description="Aprenda como monitorar a conformidade de fornecedores ao longo do tempo"
                  icon={<Medal className="h-5 w-5 text-purple-500" />}
                />

                <CardContent className="p-6">
                  <div className="mb-6">
                    <ProgressBar currentPhase={4} totalPhases={4} />
                  </div>

                  {!quizCompleted ? (
                    <DynamicQuiz
                      mode={QuestionSelectionMode.RANDOM}
                      questionsPerSession={3}
                      shuffleOptions={true}
                      showExplanation={true}
                      onComplete={handleQuizComplete}
                    />
                  ) : (
                    <motion.div
                      className="text-center p-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                      >
                        <Medal className="h-8 w-8 text-green-600" />
                      </motion.div>
                      <p className="text-lg font-medium mb-4">Questionário Final Concluído!</p>
                      <p className="mt-4 font-medium">Pontuação final: {score} pontos</p>
                    </motion.div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center">
                  {/* {quizCompleted && <Button onClick={handleShowResults}>Ver Resultados Finais</Button>} */}
                </CardFooter>
              </Card>
            ) : (
              <Card className="w-full max-w-4xl border-none shadow-lg">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Award className="h-12 w-12 text-yellow-500" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-center">Parabéns por Completar o Jogo!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">Sua pontuação final:</p>
                    <p className="text-3xl font-bold">{score} pontos</p>
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

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="font-medium text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Lembre-se:
                    </p>
                    <p className="text-green-600">
                      A avaliação de fornecedores é um componente crítico da conformidade com a LGPD. Ao garantir que
                      seus fornecedores sigam as melhores práticas de proteção de dados, você reduz riscos para sua
                      organização e protege os direitos dos titulares de dados.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button onClick={() => router.push("/")}>Voltar ao Início</Button>
                </CardFooter>
              </Card>
            )}
          </AnimatedContainer>
        </div>
      </div>

      {showTip && (
        <TipModal title={tip.title} content={tip.content} isOpen={showTip} onClose={() => setShowTip(false)} />
      )}

      {showMascot && <DPOMascot message={mascotMessage} type={mascotType} autoHide={false} />}

      <PhaseNavigation currentPhase={4} totalPhases={4} score={score} testMode={testMode} />
    </div>
  )
}

