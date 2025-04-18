"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import DynamicQuiz from "@/components/dynamic-quiz"
import TipModal from "@/components/tip-modal"
import DPOMascot from "@/components/dpo-mascot"
import SimpleDragDrop from "@/components/simple-drag-drop"
import PhaseHeader from "@/components/phase-header"
import ProgressBar from "@/components/progress-bar"
import AnimatedContainer from "@/components/animated-container"
import ConfettiExplosion from "@/components/confetti-explosion"
import OfficeHeader from "@/components/office-header"
import { QuestionSelectionMode } from "@/lib/question-service"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardCheck, FileCheck } from "lucide-react"
import PhaseNavigation from "@/components/phase-navigation"
import PhaseIndicator from "@/components/phase-indicator"

export default function Fase1() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [score, setScore] = useState(0)
  const [showTip, setShowTip] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [dragDropCompleted, setDragDropCompleted] = useState(false)
  const [showMascot, setShowMascot] = useState(true)
  const [mascotMessage, setMascotMessage] = useState(
    "Bem-vindo à Fase 1! Aqui você vai aprender a identificar dados pessoais e fazer a avaliação inicial de um fornecedor.",
  )
  const [mascotType, setMascotType] = useState<"neutral" | "success" | "error" | "tip">("neutral")
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeTab, setActiveTab] = useState("quiz")
  const testMode = searchParams.get("testMode") === "true"

  const handleQuizComplete = (quizScore: number, total: number) => {
    setScore(score + quizScore)

    if (quizScore === total) {
      setMascotMessage(
        "Excelente! Você acertou todas as perguntas. Você demonstra um ótimo conhecimento sobre LGPD e fornecedores.",
      )
      setMascotType("success")
      setShowConfetti(true)
    } else if (quizScore >= total * 0.7) {
      setMascotMessage(
        "Muito bom! Você acertou a maioria das perguntas. Continue aprendendo sobre LGPD e avaliação de fornecedores.",
      )
      setMascotType("success")
    } else {
      setMascotMessage(
        "Você completou o questionário! Recomendo revisar os conceitos da LGPD para fortalecer seu conhecimento.",
      )
      setMascotType("tip")
    }

    setShowTip(true)
    setQuizCompleted(true)
    setShowMascot(true)

    // Mudar para a aba de classificação após completar o quiz
    setTimeout(() => {
      setActiveTab("classification")
    }, 1500)
  }

  const handleDragDropComplete = (result: { correct: number; total: number }) => {
    const additionalPoints = Math.floor((result.correct / result.total) * 2) // Max 2 points
    setScore(score + additionalPoints)

    if (result.correct === result.total) {
      setMascotMessage(
        `Perfeito! Você classificou todos os ${result.total} itens corretamente. Isso é fundamental para avaliar o risco de um fornecedor.`,
      )
      setMascotType("success")
      setShowConfetti(true)
    } else if (result.correct >= result.total / 2) {
      setMascotMessage(
        `Bom trabalho! Você classificou ${result.correct} de ${result.total} itens corretamente. Lembre-se que dados sensíveis exigem proteção especial.`,
      )
      setMascotType("tip")
    } else {
      setMascotMessage(
        `Você classificou ${result.correct} de ${result.total} itens corretamente. Revise os conceitos de dados pessoais e sensíveis na LGPD.`,
      )
      setMascotType("error")
    }

    setDragDropCompleted(true)
    setShowMascot(true)

    // Após completar a classificação, aguardar um tempo e avançar para a próxima fase
    setTimeout(() => {
      if (quizCompleted) {
        router.push(`/fase2?score=${score + additionalPoints}&testMode=${testMode}`)
      }
    }, 3000)
  }

  const tip = {
    title: "Avaliação de Fornecedores e LGPD",
    content:
      "A LGPD exige que as empresas garantam que seus fornecedores também estejam em conformidade com a lei. Isso significa verificar se eles possuem medidas técnicas e administrativas adequadas para proteger os dados pessoais. Um contrato de processamento de dados é essencial nessa relação.",
  }

  const dataItems = [
    { id: "item1", content: "Nome completo", category: "pessoal" },
    { id: "item2", content: "CPF", category: "pessoal" },
    { id: "item3", content: "Endereço residencial", category: "pessoal" },
    { id: "item4", content: "Dados de saúde", category: "sensivel" },
    { id: "item5", content: "Biometria", category: "sensivel" },
    { id: "item6", content: "Origem racial", category: "sensivel" },
    { id: "item7", content: "Dados estatísticos agregados", category: "anonimizado" },
    { id: "item8", content: "Informações sem identificação pessoal", category: "anonimizado" },
  ]

  const categories = [
    { id: "pessoal", name: "Dados Pessoais" },
    { id: "sensivel", name: "Dados Sensíveis" },
    { id: "anonimizado", name: "Dados Anonimizados" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl">
        <OfficeHeader />

        <div className="flex justify-end mb-4">
          <PhaseIndicator currentPhase={1} totalPhases={4} />
        </div>

        <div className="flex justify-center">
          <AnimatedContainer className="w-full max-w-4xl">
            <Card className="border-none shadow-lg">
              <PhaseHeader
                phase={1}
                title="Requisitos Básicos da LGPD"
                description="Entenda os requisitos fundamentais da LGPD para avaliação de fornecedores"
                icon={<FileCheck className="h-5 w-5" />}
              />

              <CardContent className="p-6">
                <div className="mb-6">
                  <ProgressBar currentPhase={1} totalPhases={4} />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="quiz">Questionário Inicial</TabsTrigger>
                    <TabsTrigger value="classification">Classificação de Dados</TabsTrigger>
                  </TabsList>
                  <TabsContent value="quiz" className="p-4 bg-white rounded-lg border">
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
                          <ClipboardCheck className="h-8 w-8 text-green-600" />
                        </motion.div>
                        <p className="text-lg font-medium mb-4">Questionário Concluído!</p>
                        <p className="mt-4 font-medium">Pontuação atual: {score}</p>
                      </motion.div>
                    )}
                  </TabsContent>
                  <TabsContent value="classification" className="p-4 bg-white rounded-lg border">
                    {!dragDropCompleted ? (
                      <div className="space-y-4">
                        <p className="text-center mb-4 font-medium">
                          Arraste cada tipo de dado para a categoria correta:
                        </p>
                        <SimpleDragDrop items={dataItems} categories={categories} onComplete={handleDragDropComplete} />
                      </div>
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
                          <ClipboardCheck className="h-8 w-8 text-green-600" />
                        </motion.div>
                        <p className="text-lg font-medium mb-4">Classificação de dados concluída!</p>
                        <p className="mt-4 font-medium">Pontuação atual: {score}</p>
                      </motion.div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>
      </div>

      {showTip && (
        <TipModal title={tip.title} content={tip.content} isOpen={showTip} onClose={() => setShowTip(false)} />
      )}

      {showMascot && <DPOMascot message={mascotMessage} type={mascotType} autoHide={true} />}

      {/* Navegação automática implementada nas funções de conclusão */}

      <PhaseNavigation currentPhase={1} totalPhases={4} score={score} testMode={testMode} />

      <ConfettiExplosion show={showConfetti} />
    </div>
  )
}

