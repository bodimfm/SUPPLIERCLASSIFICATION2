"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react"
import MascoteCorner from "./mascote-corner"
import { useQuestionService, QuestionSelectionMode } from "@/lib/question-service"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSound } from "./sound-provider"
import EnhancedDecisionGame from "./enhanced-decision-game"
import Scoreboard from "./scoreboard"

interface DynamicQuizProps {
  onComplete?: (score: number, total: number) => void
  questionsPerSession?: number
  mode?: QuestionSelectionMode
  shuffleOptions?: boolean
  showExplanation?: boolean
}

export default function DynamicQuiz({
  onComplete,
  questionsPerSession = 5,
  mode = QuestionSelectionMode.RANDOM,
  shuffleOptions = true,
  showExplanation = true,
}: DynamicQuizProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [mascoteMessage, setMascoteMessage] = useState("")
  const [showMascoteMessage, setShowMascoteMessage] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const { playSound } = useSound()

  // State for interactive questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showingInteractiveQuestion, setShowingInteractiveQuestion] = useState(false)
  const [interactiveQuestionScore, setInteractiveQuestionScore] = useState(0)
  const [interactiveQuestionsCompleted, setInteractiveQuestionsCompleted] = useState(0)
  const [selectedInteractiveQuestions, setSelectedInteractiveQuestions] = useState<any[]>([])

  // Calculate maximum possible score
  const [maxPossibleScore, setMaxPossibleScore] = useState(0)

  // Define interactive questions
  const interactiveQuestions = [
    // Operator/Controller question
    {
      type: "drag-drop" as const,
      id: "drag-drop1",
      title: "Controlador vs. Operador",
      description: "Identifique se cada cenário descreve um controlador ou um operador de dados segundo a LGPD.",
      scenarios: [
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
      ],
    },

    // Decision scenario
    {
      type: "decision" as const,
      id: "decision1",
      title: "Incidente de Segurança",
      description:
        "Um funcionário do fornecedor de armazenamento em nuvem informa que houve um acesso não autorizado aos dados dos clientes. O incidente ocorreu há 24 horas e ainda não se sabe a extensão do vazamento. O que você deve fazer primeiro?",
      timeLimit: 30,
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
    },

    // Memory game
    {
      type: "memory-game" as const,
      id: "memory1",
      title: "Jogo da Memória LGPD",
      description:
        "Encontre os pares que relacionam medidas de proteção de dados com suas funções na avaliação de fornecedores.",
      cards: [
        {
          id: "1a",
          content: "Criptografia",
          matchId: "1",
        },
        {
          id: "1b",
          content: "Protege dados em repouso e em trânsito",
          matchId: "1",
        },
        {
          id: "2a",
          content: "Contrato de Processamento de Dados (DPA)",
          matchId: "2",
        },
        {
          id: "2b",
          content: "Define responsabilidades entre controlador e operador",
          matchId: "2",
        },
        {
          id: "3a",
          content: "Auditoria de Fornecedor",
          matchId: "3",
        },
        {
          id: "3b",
          content: "Verifica conformidade com requisitos de segurança",
          matchId: "3",
        },
        {
          id: "4a",
          content: "Transferência Internacional",
          matchId: "4",
        },
        {
          id: "4b",
          content: "Exige garantias adicionais de proteção",
          matchId: "4",
        },
      ],
    },
    // Outro cenário de decisão
    {
      type: "decision" as const,
      id: "decision2",
      title: "Avaliação de Novo Fornecedor",
      description:
        "Sua empresa está avaliando um novo fornecedor de software de CRM que processará dados de clientes. Durante a avaliação, você descobre que eles não possuem um DPO designado. Qual deve ser sua primeira ação?",
      timeLimit: 30,
      actions: [
        {
          id: "action1",
          text: "Desqualificar imediatamente o fornecedor",
          isCorrect: false,
          feedback:
            "Embora a ausência de um DPO seja preocupante, nem todas as empresas são obrigadas a ter um DPO. É importante avaliar outros aspectos de conformidade antes de tomar uma decisão.",
        },
        {
          id: "action2",
          text: "Solicitar informações sobre como eles lidam com proteção de dados sem um DPO",
          isCorrect: true,
          feedback:
            "Correto! É importante entender como o fornecedor gerencia a proteção de dados, mesmo sem um DPO formal. Eles podem ter outras estruturas de governança adequadas.",
        },
        {
          id: "action3",
          text: "Ignorar esse detalhe, pois a responsabilidade de conformidade é apenas da sua empresa",
          isCorrect: false,
          feedback:
            "Incorreto. A conformidade do fornecedor com a LGPD é um aspecto crucial na avaliação de risco, e sua empresa pode ser corresponsável por violações.",
        },
        {
          id: "action4",
          text: "Exigir que contratem um DPO antes de assinar o contrato",
          isCorrect: false,
          feedback:
            "Esta abordagem pode ser excessiva. Nem todas as organizações precisam de um DPO, dependendo do volume e tipo de dados processados. É melhor avaliar suas práticas de proteção de dados como um todo.",
        },
      ],
    },

    // Outro jogo de arrastar e soltar
    {
      type: "drag-drop" as const,
      id: "drag-drop2",
      title: "Bases Legais para Tratamento",
      description:
        "Identifique a base legal mais adequada para cada cenário de compartilhamento de dados com fornecedores.",
      scenarios: [
        {
          id: "scenario1",
          description: "Compartilhamento de dados de funcionários com empresa de folha de pagamento",
          correctAnswer: "legitimate-interest",
        },
        {
          id: "scenario2",
          description: "Envio de dados de clientes para empresa de marketing para campanhas promocionais",
          correctAnswer: "consent",
        },
        {
          id: "scenario3",
          description: "Compartilhamento de dados médicos de pacientes com laboratório para exames",
          correctAnswer: "consent",
        },
        {
          id: "scenario4",
          description: "Transferência de dados para escritório de advocacia para defesa em processo judicial",
          correctAnswer: "legal-obligation",
        },
        {
          id: "scenario5",
          description: "Compartilhamento de dados cadastrais com empresa de logística para entrega de produtos",
          correctAnswer: "contract-execution",
        },
      ],
    },
  ]

  const {
    loading,
    error,
    currentQuestion,
    nextQuestion,
    previousQuestion,
    markAsAnswered,
    resetSession,
    isLastQuestion,
    isFirstQuestion,
    progress,
  } = useQuestionService({
    mode,
    questionsPerSession,
    excludeAnswered: true,
    shuffleOptions,
  })

  // Função para selecionar aleatoriamente questões interativas
  const getRandomInteractiveQuestions = useCallback(() => {
    return shuffleArray([...interactiveQuestions]).slice(0, 3) // Seleciona 3 questões aleatórias
  }, [])

  // Função auxiliar para embaralhar array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // Calculate max possible score when questions are loaded
  useEffect(() => {
    if (!loading && !error && progress.total > 0) {
      // Regular questions (1 point each) + Interactive questions (2 points each)
      const maxScore = progress.total + selectedInteractiveQuestions.length * 2
      setMaxPossibleScore(maxScore)
    }
  }, [loading, error, progress.total, selectedInteractiveQuestions.length])

  // Determine when to show interactive questions
  useEffect(() => {
    // Show interactive questions at specific points in the quiz
    // For example, after every 2 regular questions
    if (currentQuestionIndex > 0 && currentQuestionIndex % 2 === 0) {
      const interactiveIndex = Math.floor(currentQuestionIndex / 2) - 1
      if (interactiveIndex < selectedInteractiveQuestions.length && interactiveQuestionsCompleted <= interactiveIndex) {
        setShowingInteractiveQuestion(true)
      } else {
        setShowingInteractiveQuestion(false)
      }
    } else {
      setShowingInteractiveQuestion(false)
    }
  }, [currentQuestionIndex, interactiveQuestionsCompleted, selectedInteractiveQuestions.length])

  // Selecionar questões interativas aleatoriamente ao iniciar
  useEffect(() => {
    if (!loading && !error) {
      const randomQuestions = getRandomInteractiveQuestions()
      setSelectedInteractiveQuestions(randomQuestions)
    }
  }, [loading, error, getRandomInteractiveQuestions])

  useEffect(() => {
    // Reset state when the question changes
    if (!loading && !error && !showingInteractiveQuestion && currentQuestion) {
      setSelectedOption(null)
      setHasSubmitted(false)
      setShowMascoteMessage(false)
    }
  }, [currentQuestion, loading, error, showingInteractiveQuestion])

  const handleSubmit = () => {
    if (selectedOption !== null && currentQuestion) {
      const correct = selectedOption === currentQuestion.correct
      setIsCorrect(correct)
      setHasSubmitted(true)

      if (correct) {
        // Award 1 point for correct multiple-choice question
        setScore((prev) => prev + 1)
        setMascoteMessage("Muito bem! Você acertou!")
        playSound("correct")
      } else {
        setMascoteMessage("Ops! Essa não é a resposta correta.")
        playSound("incorrect")
      }

      setShowMascoteMessage(true)
      markAsAnswered(currentQuestion.id)
    }
  }

  const handleNext = () => {
    playSound("click")
    setCurrentQuestionIndex((prev) => prev + 1)
    const hasNext = nextQuestion()
    if (!hasNext && !quizCompleted && !showingInteractiveQuestion) {
      setQuizCompleted(true)
      playSound("complete")
      if (onComplete) {
        // Calculate total score (regular questions + interactive questions)
        onComplete(score + interactiveQuestionScore, maxPossibleScore)
      }
    }
  }

  const handlePrevious = () => {
    playSound("click")
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
    previousQuestion()
  }

  const handleReset = () => {
    playSound("click")
    setScore(0)
    setInteractiveQuestionScore(0)
    setInteractiveQuestionsCompleted(0)
    setQuizCompleted(false)
    setCurrentQuestionIndex(0)
    setShowingInteractiveQuestion(false)
    resetSession()
  }

  const handleOptionSelect = (value: string) => {
    playSound("click")
    setSelectedOption(Number.parseInt(value))
  }

  const handleInteractiveComplete = (interactiveScore: number, total: number) => {
    // Add interactive question score (2 points each)
    const pointsEarned = interactiveScore * 2
    setInteractiveQuestionScore((prev) => prev + pointsEarned)

    // Show feedback message
    if (interactiveScore > 0) {
      setMascoteMessage(`Parabéns! Você ganhou ${pointsEarned} pontos nesta atividade!`)
      setShowMascoteMessage(true)
    }

    // Mark interactive question as completed
    setInteractiveQuestionsCompleted((prev) => prev + 1)

    // Continue to next question
    setShowingInteractiveQuestion(false)

    // Check if quiz is completed
    if (isLastQuestion() && interactiveQuestionsCompleted + 1 >= selectedInteractiveQuestions.length) {
      setQuizCompleted(true)
      playSound("complete")
      if (onComplete) {
        onComplete(score + interactiveQuestionScore + pointsEarned, maxPossibleScore)
      }
    }
  }

  // Calculate current total score
  const currentTotalScore = score + interactiveQuestionScore

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>Não foi possível carregar as perguntas. Usando perguntas de backup.</p>
        <Button onClick={resetSession} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    )
  }

  if (!currentQuestion && !showingInteractiveQuestion) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
        <p>Carregando perguntas alternativas...</p>
        <Button onClick={resetSession} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Recarregar perguntas
        </Button>
      </div>
    )
  }

  if (quizCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Quiz Completo!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Sua pontuação:</p>
            <p className="text-3xl font-bold">
              {currentTotalScore} de {maxPossibleScore}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ({score} pts de questões + {interactiveQuestionScore} pts de atividades interativas)
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Desempenho:</p>
            <Progress value={(currentTotalScore / maxPossibleScore) * 100} className="h-2" />
            <p className="text-sm text-right">{Math.round((currentTotalScore / maxPossibleScore) * 100)}%</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-blue-700">
            <p className="font-medium">Avaliação:</p>
            {currentTotalScore === maxPossibleScore ? (
              <p>Excelente! Você acertou todas as perguntas!</p>
            ) : currentTotalScore >= maxPossibleScore * 0.7 ? (
              <p>Muito bom! Você demonstrou um bom conhecimento sobre LGPD e avaliação de fornecedores.</p>
            ) : currentTotalScore >= maxPossibleScore * 0.5 ? (
              <p>Bom trabalho! Você tem um conhecimento sólido, mas ainda há espaço para melhorar.</p>
            ) : (
              <p>Você completou o quiz! Recomendamos revisar os conceitos da LGPD para fortalecer seu conhecimento.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Show interactive question
  if (showingInteractiveQuestion) {
    const interactiveIndex = Math.floor(currentQuestionIndex / 2) - 1
    const currentInteractiveQuestion = selectedInteractiveQuestions[interactiveIndex]

    return (
      <div className="space-y-6 relative">
        {/* Scoreboard */}
        <Scoreboard score={currentTotalScore} maxScore={maxPossibleScore} className="absolute top-0 right-0 z-10" />

        <div className="flex justify-between items-center mb-4 pt-12">
          <p className="text-sm text-muted-foreground">
            Atividade Interativa {interactiveQuestionsCompleted + 1} de {selectedInteractiveQuestions.length} (Questão{" "}
            {currentQuestionIndex + 1} de {progress.total + selectedInteractiveQuestions.length} total)
          </p>
          <Progress
            value={
              ((currentQuestionIndex + interactiveQuestionsCompleted) /
                (progress.total + selectedInteractiveQuestions.length)) *
              100
            }
            className="w-1/2 h-2"
          />
        </div>

        <MascoteCorner message={mascoteMessage} showMessage={showMascoteMessage} size="medium" />

        <EnhancedDecisionGame questions={[currentInteractiveQuestion]} onComplete={handleInteractiveComplete} />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 relative">
      {/* Scoreboard */}
      <Scoreboard score={currentTotalScore} maxScore={maxPossibleScore} className="absolute top-0 right-0 z-10" />

      <div className="flex justify-between items-center mb-4 pt-12">
        <p className="text-sm text-muted-foreground">
          Pergunta {currentQuestionIndex + 1} de {progress.total + selectedInteractiveQuestions.length} (
          {progress.total} questões + {selectedInteractiveQuestions.length} atividades interativas)
        </p>
        <Progress
          value={
            ((currentQuestionIndex + interactiveQuestionsCompleted) /
              (progress.total + selectedInteractiveQuestions.length)) *
            100
          }
          className="w-1/2 h-2"
        />
      </div>

      <MascoteCorner message={mascoteMessage} showMessage={showMascoteMessage} size="medium" />

      <motion.h3
        className="text-lg font-medium"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {currentQuestion.question}
      </motion.h3>

      <RadioGroup value={selectedOption?.toString()} onValueChange={handleOptionSelect} className="space-y-3">
        {currentQuestion.options.map((option, index) => (
          <motion.div
            key={index}
            className={`flex items-start space-x-2 p-3 rounded-md transition-colors ${
              hasSubmitted
                ? index === currentQuestion.correct
                  ? "bg-green-50 border border-green-200"
                  : selectedOption === index && selectedOption !== currentQuestion.correct
                    ? "bg-red-50 border border-red-200"
                    : "bg-white border border-transparent"
                : "bg-white hover:bg-slate-50 border border-transparent"
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={hasSubmitted} />
            <div className="flex-1 flex justify-between items-center">
              <Label htmlFor={`option-${index}`} className="font-normal">
                {option}
              </Label>

              {hasSubmitted && index === currentQuestion.correct && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </motion.div>
              )}

              {hasSubmitted && selectedOption === index && selectedOption !== currentQuestion.correct && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <XCircle className="h-5 w-5 text-red-500" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </RadioGroup>

      <AnimatePresence>
        {!hasSubmitted && (
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.5 }}
          >
            <Button onClick={handleSubmit} disabled={selectedOption === null} className="px-8">
              Responder
            </Button>
          </motion.div>
        )}

        {hasSubmitted && (
          <motion.div
            className={`p-4 rounded-md ${isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 font-medium mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Resposta correta! (+1 ponto)</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span>Resposta incorreta</span>
                </>
              )}
            </div>
            <p>
              {isCorrect
                ? "Muito bem! Você acertou a questão."
                : `A resposta correta é: ${currentQuestion.options[currentQuestion.correct]}`}
            </p>

            {showExplanation && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-sm font-medium">Explicação:</p>
                <p className="text-sm">{currentQuestion.explanation}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {hasSubmitted && (
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handlePrevious} disabled={isFirstQuestion()} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>

          <Button onClick={handleNext} size="sm">
            {isLastQuestion() ? "Finalizar" : "Próxima"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </motion.div>
  )
}

