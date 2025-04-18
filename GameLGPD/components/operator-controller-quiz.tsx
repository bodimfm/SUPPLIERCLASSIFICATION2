"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { useSound } from "./sound-provider"

interface Scenario {
  id: string
  description: string
  correctAnswer: "controller" | "operator"
}

interface OperatorControllerQuizProps {
  onComplete: (score: number, total: number) => void
}

export default function OperatorControllerQuiz({ onComplete }: OperatorControllerQuizProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: "scenario1",
      description: "Empresa que determina como os dados dos clientes serão utilizados para marketing",
      correctAnswer: "controller",
    },
    {
      id: "scenario2",
      description: "Empresa de cloud que armazena dados de funcionários seguindo instruções do cliente",
      correctAnswer: "operator",
    },
    {
      id: "scenario3",
      description: "Consultoria que processa dados de pesquisa conforme orientações do contratante",
      correctAnswer: "operator",
    },
    {
      id: "scenario4",
      description: "Empresa que decide quais dados coletar em seu site e por quanto tempo mantê-los",
      correctAnswer: "controller",
    },
    {
      id: "scenario5",
      description: "Empresa de folha de pagamento que processa dados de funcionários seguindo regras do cliente",
      correctAnswer: "operator",
    },
  ])

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, "controller" | "operator" | null>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [completed, setCompleted] = useState(false)
  const { playSound } = useSound()

  const handleAnswer = (answer: "controller" | "operator") => {
    playSound("click")

    const currentScenario = scenarios[currentScenarioIndex]
    const isCorrect = answer === currentScenario.correctAnswer

    // Salvar resposta
    setAnswers((prev) => ({
      ...prev,
      [currentScenario.id]: answer,
    }))

    // Mostrar feedback
    setShowFeedback(true)

    // Tocar som baseado na resposta
    if (isCorrect) {
      playSound("correct")
    } else {
      playSound("incorrect")
    }

    // Avançar para próximo cenário após um tempo
    setTimeout(() => {
      setShowFeedback(false)

      if (currentScenarioIndex < scenarios.length - 1) {
        setCurrentScenarioIndex((prev) => prev + 1)
      } else {
        // Calcular pontuação
        let score = 0
        scenarios.forEach((scenario) => {
          if (answers[scenario.id] === scenario.correctAnswer) {
            score++
          }
        })

        setCompleted(true)
        playSound("complete")
        onComplete(score, scenarios.length)
      }
    }, 2000)
  }

  const currentScenario = scenarios[currentScenarioIndex]
  const currentAnswer = currentScenario ? answers[currentScenario.id] : null
  const isCorrect = currentAnswer === currentScenario?.correctAnswer

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </motion.div>
        <h3 className="text-lg font-medium mb-2">Atividade Concluída!</h3>
        <p>Você classificou corretamente os papéis de controlador e operador.</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg text-blue-700 mb-4">
        <p className="font-medium">Controlador vs. Operador</p>
        <p className="text-sm mt-1">
          Segundo a LGPD, o <strong>controlador</strong> é quem toma as decisões sobre o tratamento de dados pessoais,
          enquanto o <strong>operador</strong> realiza o tratamento de dados seguindo as instruções do controlador.
        </p>
      </div>

      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          Cenário {currentScenarioIndex + 1} de {scenarios.length}
        </p>
      </div>

      <Card className="border-2 border-dashed border-slate-200">
        <CardContent className="p-6">
          <motion.p
            key={currentScenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-lg font-medium text-center mb-6"
          >
            {currentScenario.description}
          </motion.p>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              className={`h-auto py-6 ${showFeedback && currentScenario.correctAnswer === "controller" ? "bg-green-50 border-green-200" : ""} ${showFeedback && currentAnswer === "controller" && !isCorrect ? "bg-red-50 border-red-200" : ""}`}
              onClick={() => handleAnswer("controller")}
              disabled={showFeedback}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold mb-1">Controlador</span>
                <span className="text-xs text-center">Decide sobre o tratamento</span>

                {showFeedback && currentScenario.correctAnswer === "controller" && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-2" />
                )}
                {showFeedback && currentAnswer === "controller" && !isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500 mt-2" />
                )}
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className={`h-auto py-6 ${showFeedback && currentScenario.correctAnswer === "operator" ? "bg-green-50 border-green-200" : ""} ${showFeedback && currentAnswer === "operator" && !isCorrect ? "bg-red-50 border-red-200" : ""}`}
              onClick={() => handleAnswer("operator")}
              disabled={showFeedback}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold mb-1">Operador</span>
                <span className="text-xs text-center">Segue instruções do controlador</span>

                {showFeedback && currentScenario.correctAnswer === "operator" && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-2" />
                )}
                {showFeedback && currentAnswer === "operator" && !isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500 mt-2" />
                )}
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-md ${isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            <div className="flex items-center gap-2 font-medium mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Correto!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span>Incorreto</span>
                </>
              )}
            </div>
            <p>
              {isCorrect
                ? `Sim, neste cenário temos um ${currentScenario.correctAnswer === "controller" ? "controlador" : "operador"}.`
                : `Na verdade, neste cenário temos um ${currentScenario.correctAnswer === "controller" ? "controlador" : "operador"}.`}
            </p>
            <p className="mt-1 text-sm">
              {currentScenario.correctAnswer === "controller"
                ? "O controlador determina as finalidades e os meios de tratamento de dados pessoais."
                : "O operador realiza o tratamento de dados pessoais em nome do controlador e seguindo suas instruções."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

