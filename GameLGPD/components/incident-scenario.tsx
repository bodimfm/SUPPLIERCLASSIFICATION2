"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSound } from "./sound-provider"

interface Action {
  id: string
  text: string
  isCorrect: boolean
  feedback: string
}

interface IncidentScenarioProps {
  onComplete: (score: number, total: number) => void
}

export default function IncidentScenario({ onComplete }: IncidentScenarioProps) {
  const [timeRemaining, setTimeRemaining] = useState(30) // 30 segundos para decidir
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [completed, setCompleted] = useState(false)
  const { playSound } = useSound()

  const scenario = {
    title: "Incidente de Segurança",
    description:
      "Um funcionário do fornecedor de armazenamento em nuvem informa que houve um acesso não autorizado aos dados dos clientes. O incidente ocorreu há 24 horas e ainda não se sabe a extensão do vazamento. O que você deve fazer primeiro?",
    actions: [
      {
        id: "action1",
        text: "Notificar imediatamente a ANPD e os titulares dos dados",
        isCorrect: false,
        feedback:
          "Embora a notificação seja importante, primeiro é necessário entender a extensão do incidente para fornecer informações precisas.",
      },
      {
        id: "action2",
        text: "Solicitar mais informações ao fornecedor e iniciar uma investigação interna",
        isCorrect: true,
        feedback:
          "Correto! Antes de notificar, é essencial entender a extensão do incidente, quais dados foram afetados e quais medidas já foram tomadas pelo fornecedor.",
      },
      {
        id: "action3",
        text: "Encerrar imediatamente o contrato com o fornecedor",
        isCorrect: false,
        feedback:
          "Esta ação é precipitada. Antes de tomar medidas drásticas, é necessário investigar o incidente e avaliar a resposta do fornecedor.",
      },
      {
        id: "action4",
        text: "Ignorar o alerta, pois a responsabilidade é exclusivamente do fornecedor",
        isCorrect: false,
        feedback:
          "Incorreto. Como controlador dos dados, sua empresa compartilha a responsabilidade pelo incidente e deve tomar medidas ativas.",
      },
    ],
  }

  useEffect(() => {
    if (completed || showFeedback) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        // Tocar som de contagem regressiva nos últimos 5 segundos
        if (prev <= 5 && prev > 0) {
          playSound("click")
        }

        // Som de alerta final quando o tempo acabar
        if (prev === 1) {
          setTimeout(() => {
            playSound("incorrect")
          }, 800)
        }

        if (prev <= 1) {
          clearInterval(timer)
          // Selecionar uma ação aleatória se o tempo acabar
          if (!selectedAction) {
            const randomAction = scenario.actions[0]
            setSelectedAction(randomAction)
            setShowFeedback(true)

            setTimeout(() => {
              setCompleted(true)
              onComplete(0, 1) // Pontuação zero se o tempo acabar
            }, 3000)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [completed, selectedAction, showFeedback, playSound, onComplete])

  const handleSelectAction = (action: Action) => {
    playSound("click")
    setSelectedAction(action)
    setShowFeedback(true)

    // Tocar som baseado na resposta
    if (action.isCorrect) {
      playSound("correct")
    } else {
      playSound("incorrect")
    }

    // Completar após mostrar feedback
    setTimeout(() => {
      setCompleted(true)
      onComplete(action.isCorrect ? 1 : 0, 1)
    }, 4000)
  }

  const percentRemaining = (timeRemaining / 30) * 100

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
        <h3 className="text-lg font-medium mb-2">Simulação Concluída!</h3>
        <p>Você completou o cenário de incidente de segurança.</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium text-orange-800 mb-1">{scenario.title}</h3>
            <p className="text-orange-700">{scenario.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Clock className={`h-5 w-5 ${timeRemaining < 10 ? "text-red-500" : "text-orange-500"}`} />
        <div className="flex-1">
          <Progress value={percentRemaining} className={`h-2 ${timeRemaining < 10 ? "bg-red-100" : ""}`} />
        </div>
        <motion.span
          className={`text-sm font-medium ${timeRemaining < 10 ? "text-red-500" : ""}`}
          animate={{ scale: timeRemaining < 10 ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: timeRemaining < 10 ? Number.POSITIVE_INFINITY : 0, duration: 0.5 }}
        >
          {timeRemaining}s
        </motion.span>
      </div>

      <div className="space-y-3">
        {scenario.actions.map((action) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant={
                showFeedback && selectedAction?.id === action.id
                  ? action.isCorrect
                    ? "default"
                    : "destructive"
                  : "outline"
              }
              className={`w-full justify-start h-auto py-3 px-4 text-left ${
                !showFeedback ? "hover:border-primary hover:bg-primary/5" : ""
              }`}
              onClick={() => !showFeedback && handleSelectAction(action)}
              disabled={showFeedback}
            >
              <span className="flex-1">{action.text}</span>
              {showFeedback && selectedAction?.id === action.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  {action.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 ml-2 text-white" />
                  ) : (
                    <XCircle className="h-5 w-5 ml-2 text-white" />
                  )}
                </motion.div>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showFeedback && selectedAction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-md ${selectedAction.isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            <div className="flex items-center gap-2 font-medium mb-1">
              {selectedAction.isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Decisão correta!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span>Decisão incorreta</span>
                </>
              )}
            </div>
            <p>{selectedAction.feedback}</p>
            <p className="mt-2 text-sm">
              <strong>Dica LGPD:</strong> Em caso de incidente de segurança, a LGPD exige que o controlador comunique à
              ANPD e aos titulares em prazo razoável, mas primeiro é essencial avaliar a gravidade do incidente.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

