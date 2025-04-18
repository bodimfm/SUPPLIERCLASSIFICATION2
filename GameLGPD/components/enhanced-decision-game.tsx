"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react"
import { useSound } from "./sound-provider"

// Types for different interactive elements
type QuestionType = "decision" | "drag-drop" | "memory-game" | "timeline" | "wheel" | "connection-puzzle"

// Base interface for all question types
interface BaseQuestion {
  type: QuestionType
  id: string
  title: string
  description: string
}

// Decision scenario question
interface DecisionQuestion extends BaseQuestion {
  type: "decision"
  timeLimit: number
  actions: {
    id: string
    text: string
    isCorrect: boolean
    feedback: string
  }[]
}

// Drag and drop question for operator/controller
interface DragDropQuestion extends BaseQuestion {
  type: "drag-drop"
  scenarios: {
    id: string
    description: string
    correctAnswer: "controller" | "operator"
  }[]
}

// Memory game question
interface MemoryGameQuestion extends BaseQuestion {
  type: "memory-game"
  cards: {
    id: string
    content: string
    matchId: string
  }[]
}

// Timeline question
interface TimelineQuestion extends BaseQuestion {
  type: "timeline"
  steps: {
    id: string
    text: string
    correctOrder: number
  }[]
}

// Wheel question
interface WheelQuestion extends BaseQuestion {
  type: "wheel"
  segments: {
    id: string
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  }[]
}

// Connection puzzle question
interface ConnectionPuzzleQuestion extends BaseQuestion {
  type: "connection-puzzle"
  measures: {
    id: string
    name: string
    icon: string
  }[]
  benefits: {
    id: string
    name: string
    icon: string
  }[]
  correctConnections: {
    measureId: string
    benefitId: string
    explanation: string
  }[]
}

// Union type for all question types
type InteractiveQuestion =
  | DecisionQuestion
  | DragDropQuestion
  | MemoryGameQuestion
  | TimelineQuestion
  | WheelQuestion
  | ConnectionPuzzleQuestion

interface EnhancedDecisionGameProps {
  questions: InteractiveQuestion[]
  onComplete?: (score: number, total: number) => void
}

// Componente de roda de decisão
const DecisionWheel = ({
  options,
  spinning,
  selectedIndex,
  onSpin,
}: {
  options: { id: string; text: string; isCorrect?: boolean }[]
  spinning: boolean
  selectedIndex: number | null
  onSpin: () => void
}) => {
  return (
    <div className="relative w-72 h-72 mx-auto my-8">
      {/* Círculo base da roda */}
      <div className="absolute inset-0 rounded-full border-4 border-gray-300 bg-white shadow-lg overflow-hidden">
        {/* Segmentos da roda */}
        {options.map((option, index) => {
          const segmentAngle = 360 / options.length
          const rotation = index * segmentAngle
          const isSelected = selectedIndex === index

          return (
            <div
              key={option.id}
              className={`absolute top-0 left-0 w-full h-full origin-center ${isSelected ? "z-10" : ""}`}
              style={{
                transform: `rotate(${rotation}deg)`,
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${
                  50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)
                }%, 50% 50%)`,
                backgroundColor: isSelected
                  ? option.isCorrect
                    ? "#10b981"
                    : "#ef4444"
                  : index % 2 === 0
                    ? "#f3f4f6"
                    : "#e5e7eb",
              }}
            >
              {/* Texto do segmento */}
              <div
                className="absolute whitespace-nowrap text-xs font-medium px-2 py-1"
                style={{
                  top: "25%",
                  left: "50%",
                  transform: `translateX(-50%) rotate(${-rotation + segmentAngle / 2}deg)`,
                  maxWidth: "80px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {option.text.length > 25 ? option.text.substring(0, 25) + "..." : option.text}
              </div>
            </div>
          )
        })}

        {/* Linhas divisórias entre segmentos */}
        {options.map((_, index) => {
          const segmentAngle = 360 / options.length
          const rotation = index * segmentAngle

          return (
            <div
              key={`line-${index}`}
              className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gray-400 origin-bottom"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            />
          )
        })}
      </div>

      {/* Animação de rotação */}
      <div
        className={`absolute inset-0 rounded-full transition-transform duration-3000 ease-out ${
          spinning ? "animate-spin-slow" : ""
        }`}
        style={{
          transform:
            selectedIndex !== null ? `rotate(${-(selectedIndex * (360 / options.length))}deg)` : "rotate(0deg)",
        }}
      />

      {/* Botão central */}
      <button
        onClick={onSpin}
        disabled={spinning}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary text-white font-bold shadow-lg border-4 border-white flex items-center justify-center z-20 hover:bg-primary/90 disabled:opacity-50"
      >
        {spinning ? <div className="animate-spin h-6 w-6 border-t-2 border-white rounded-full" /> : "GIRAR"}
      </button>

      {/* Ponteiro */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 z-20">
        <div className="w-0 h-0 mx-auto border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-red-500 drop-shadow-md" />
      </div>
    </div>
  )
}

export default function EnhancedDecisionGame({ questions, onComplete }: EnhancedDecisionGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const { playSound } = useSound()

  // States for decision questions
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  // States for drag-drop questions
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, "controller" | "operator" | null>>({})

  // States for memory game
  const [cards, setCards] = useState<
    Array<{
      id: string
      content: string
      matchId: string
      flipped: boolean
      matched: boolean
    }>
  >([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [moves, setMoves] = useState(0)

  // States for timeline
  const [selectedSteps, setSelectedSteps] = useState<string[]>([])
  const [timelineVerified, setTimelineVerified] = useState(false)

  // States for wheel
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null)
  const [wheelAnswer, setWheelAnswer] = useState<number | null>(null)

  // States for connection puzzle
  const [selectedMeasure, setSelectedMeasure] = useState<string | null>(null)
  const [connections, setConnections] = useState<
    Array<{
      measureId: string
      benefitId: string
    }>
  >([])

  const currentQuestion = questions[currentQuestionIndex]
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Reset states when question changes
  useEffect(() => {
    setShowFeedback(false)
    setSelectedAction(null)

    // Only set timeRemaining if the current question is a decision type
    if (currentQuestion?.type === "decision") {
      setTimeRemaining(currentQuestion.timeLimit || 30)
    }

    setCurrentScenarioIndex(0)
    setAnswers({})
    setFlippedCards([])
    setMatchedPairs([])
    setMoves(0)
    setSelectedSteps([])
    setTimelineVerified(false)
    setIsSpinning(false)
    setSelectedSegment(null)
    setWheelAnswer(null)
    setSelectedMeasure(null)
    setConnections([])

    // Initialize cards for memory game
    if (currentQuestion?.type === "memory-game") {
      const shuffledCards = [...currentQuestion.cards]
        .sort(() => Math.random() - 0.5)
        .map((card) => ({
          ...card,
          flipped: false,
          matched: false,
        }))

      setCards(shuffledCards)
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Set up timer for decision questions
    if (currentQuestion?.type === "decision" && !showFeedback && !completed) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentQuestionIndex, currentQuestion, completed])

  // Auto-select action when timer runs out
  useEffect(() => {
    if (timeRemaining === 0 && currentQuestion?.type === "decision" && !showFeedback && !selectedAction) {
      // Auto-select first action if time runs out
      const defaultAction = currentQuestion.actions[0]
      setSelectedAction(defaultAction.id)
      setShowFeedback(true)

      // Play sound
      playSound("incorrect")

      // Move to next question after delay
      setTimeout(() => {
        handleQuestionComplete(0)
      }, 3000)
    }
  }, [timeRemaining, currentQuestion, showFeedback, selectedAction, playSound])

  // Handle decision selection
  const handleDecisionSelect = (actionId: string) => {
    if (showFeedback) return

    playSound("click")
    setSelectedAction(actionId)

    if (currentQuestion?.type === "decision") {
      const selectedActionObj = currentQuestion.actions.find((a) => a.id === actionId)

      if (selectedActionObj) {
        // Play sound based on correctness
        if (selectedActionObj.isCorrect) {
          playSound("correct")
        } else {
          playSound("incorrect")
        }

        setShowFeedback(true)

        // Move to next question after delay
        setTimeout(() => {
          handleQuestionComplete(selectedActionObj.isCorrect ? 1 : 0)
        }, 4000)
      }
    }
  }

  // Handle operator/controller answer
  const handleOperatorControllerAnswer = (answer: "controller" | "operator") => {
    if (currentQuestion?.type !== "drag-drop") return

    playSound("click")

    const dragDropQuestion = currentQuestion
    const currentScenario = dragDropQuestion.scenarios[currentScenarioIndex]
    const isCorrect = answer === currentScenario.correctAnswer

    // Save answer
    setAnswers((prev) => ({
      ...prev,
      [currentScenario.id]: answer,
    }))

    // Show feedback
    setShowFeedback(true)

    // Play sound based on answer
    if (isCorrect) {
      playSound("correct")
    } else {
      playSound("incorrect")
    }

    // Move to next scenario or complete question
    setTimeout(() => {
      setShowFeedback(false)

      if (currentScenarioIndex < dragDropQuestion.scenarios.length - 1) {
        setCurrentScenarioIndex((prev) => prev + 1)
      } else {
        // Calculate score
        let scenarioScore = 0
        dragDropQuestion.scenarios.forEach((scenario) => {
          if (answers[scenario.id] === scenario.correctAnswer) {
            scenarioScore++
          }
        })

        playSound("complete")
        handleQuestionComplete(scenarioScore)
      }
    }, 2000)
  }

  // Handle memory card click
  const handleCardClick = (id: string) => {
    // Ignore clicks if two cards are already flipped or card is already flipped/matched
    if (flippedCards.length === 2 || flippedCards.includes(id)) return

    const card = cards.find((c) => c.id === id)
    if (card && (card.flipped || card.matched)) return

    playSound("click")

    // Flip the card
    setCards(cards.map((card) => (card.id === id ? { ...card, flipped: true } : card)))

    // Add to flipped cards
    setFlippedCards((prev) => [...prev, id])
  }

  // Check for memory game matches
  useEffect(() => {
    if (currentQuestion?.type !== "memory-game" || flippedCards.length !== 2) return

    const [firstId, secondId] = flippedCards
    const firstCard = cards.find((card) => card.id === firstId)
    const secondCard = cards.find((card) => card.id === secondId)

    if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
      // Found a match
      playSound("correct")
      setMatchedPairs((prev) => [...prev, firstCard.matchId])

      // Update cards
      setCards(cards.map((card) => (card.id === firstId || card.id === secondId ? { ...card, matched: true } : card)))
    } else {
      // No match
      playSound("incorrect")

      // Flip cards back after a delay
      setTimeout(() => {
        setCards(
          cards.map((card) => (flippedCards.includes(card.id) && !card.matched ? { ...card, flipped: false } : card)),
        )
      }, 1000)
    }

    // Increment moves
    setMoves((prev) => prev + 1)

    // Clear flipped cards after checking
    setTimeout(() => {
      setFlippedCards([])
    }, 1000)

    // Check if memory game is completed
    if (currentQuestion?.type === "memory-game") {
      const memoryQuestion = currentQuestion
      const totalPairs = memoryQuestion.cards.length / 2

      if (matchedPairs.length + 1 === totalPairs) {
        // All pairs found (adding 1 because we just found a new pair)
        setTimeout(() => {
          playSound("complete")
          handleQuestionComplete(1)
        }, 1500)
      }
    }
  }, [flippedCards, cards, currentQuestion, matchedPairs.length, playSound])

  // Handle question completion and move to next
  const handleQuestionComplete = (questionScore: number) => {
    // Clear any timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Add to total score
    setScore((prev) => prev + questionScore)

    // Move to next question or complete game
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
      }, 1000)
    } else {
      // Game completed
      setCompleted(true)
      playSound("complete")
      if (onComplete) {
        onComplete(score + questionScore, questions.length)
      }
    }
  }

  // Handle next question button
  const handleNextQuestion = () => {
    playSound("click")

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // Game completed
      setCompleted(true)
      if (onComplete) {
        onComplete(score, questions.length)
      }
    }
  }

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
        <p>Você completou todas as questões interativas.</p>
        <p className="mt-2 font-medium">
          Pontuação: {score} de {questions.length}
        </p>
        <p className="text-sm text-muted-foreground mt-1">(Valor: {score * 2} pontos)</p>
      </motion.div>
    )
  }

  // Render based on question type
  if (currentQuestion?.type === "decision") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            Questão {currentQuestionIndex + 1} de {questions.length}
          </p>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-1/2 h-2" />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
          <h3 className="font-medium text-blue-800 mb-1">{currentQuestion.title}</h3>
          <p className="text-blue-700">{currentQuestion.description}</p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${timeRemaining < 10 ? "text-red-500" : "text-orange-500"}`} />
          <div className="flex-1">
            <Progress
              value={(timeRemaining / currentQuestion.timeLimit) * 100}
              className={`h-2 ${timeRemaining < 10 ? "bg-red-100" : ""}`}
            />
          </div>
          <motion.span
            className={`text-sm font-medium ${timeRemaining < 10 ? "text-red-500" : ""}`}
            animate={{ scale: timeRemaining < 10 ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: timeRemaining < 10 ? Number.POSITIVE_INFINITY : 0, duration: 0.5 }}
          >
            {timeRemaining}s
          </motion.span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {currentQuestion.actions.map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                variant={
                  showFeedback && selectedAction === action.id
                    ? action.isCorrect
                      ? "default"
                      : "destructive"
                    : "outline"
                }
                className={`w-full justify-start h-auto py-3 px-4 text-left ${
                  !showFeedback ? "hover:border-primary hover:bg-primary/5" : ""
                }`}
                onClick={() => handleDecisionSelect(action.id)}
                disabled={showFeedback}
              >
                <span className="flex-1">{action.text}</span>
                {showFeedback && selectedAction === action.id && (
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

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && selectedAction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-md ${
                currentQuestion.actions.find((a) => a.id === selectedAction)?.isCorrect
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-center gap-2 font-medium mb-1">
                {currentQuestion.actions.find((a) => a.id === selectedAction)?.isCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Decisão correta! (+2 pontos)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span>Decisão incorreta</span>
                  </>
                )}
              </div>
              <p>{currentQuestion.actions.find((a) => a.id === selectedAction)?.feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Fallback for other question types
  return (
    <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
      <p>Este tipo de questão interativa ainda não está implementado.</p>
      <Button onClick={handleNextQuestion} className="mt-4">
        Próxima Questão <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

