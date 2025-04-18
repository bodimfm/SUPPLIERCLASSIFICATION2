"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import DynamicQuiz from "@/components/dynamic-quiz"
import TipModal from "@/components/tip-modal"
import DPOMascot from "@/components/dpo-mascot"
import DecisionGame from "@/components/decision-game"
import PhaseHeader from "@/components/phase-header"
import ProgressBar from "@/components/progress-bar"
import PhaseTransition from "@/components/phase-transition"
import AnimatedContainer from "@/components/animated-container"
import ConfettiExplosion from "@/components/confetti-explosion"
import OfficeHeader from "@/components/office-header"
import { QuestionSelectionMode } from "@/lib/question-service"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import PhaseNavigation from "@/components/phase-navigation"
import PhaseIndicator from "@/components/phase-indicator"

export default function Fase2() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [score, setScore] = useState(0)
  const [showTip, setShowTip] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [decisionCompleted, setDecisionCompleted] = useState(false)
  const [showMascot, setShowMascot] = useState(true)
  const [mascotMessage, setMascotMessage] = useState(
    "Bem-vindo à Fase 2! Aqui você vai aprender a identificar riscos em fornecedores de alto risco e tomar decisões importantes.",
  )
  const [mascotType, setMascotType] = useState<"neutral" | "success" | "error" | "tip">("neutral")
  const [showConfetti, setShowConfetti] = useState(false)
  const [quizError, setQuizError] = useState(false)
  const [activeTab, setActiveTab] = useState("quiz")
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
        "Excelente! Você acertou todas as perguntas sobre dados sensíveis. Lembre-se que esses dados exigem proteção especial pela LGPD.",
      )
      setMascotType("success")
      setShowConfetti(true)
    } else if (quizScore >= total * 0.7) {
      setMascotMessage(
        "Muito bom! Você acertou a maioria das perguntas sobre dados sensíveis. Continue aprendendo sobre a LGPD.",
      )
      setMascotType("success")
    } else {
      setMascotMessage(
        "Atenção! Dados sobre origem racial, saúde, biometria e orientação sexual são considerados sensíveis pela LGPD e exigem proteção especial.",
      )
      setMascotType("error")
    }

    setShowTip(true)
    setQuizCompleted(true)
    setShowMascot(true)

    // Mudar para a aba de decisão após completar o quiz
    setTimeout(() => {
      setActiveTab("decision")
    }, 2000)
  }

  const handleQuizError = () => {
    setQuizError(true)
    setMascotMessage(
      "Parece que estamos tendo problemas para carregar as perguntas. Vamos usar um conjunto alternativo de perguntas.",
    )
    setMascotType("tip")
    setShowMascot(true)
  }

  const handleDecisionComplete = (result: { decision: any; timeRemaining: number }) => {
    if (result.decision.isCorrect) {
      // Bonus points for quick correct decisions
      const timeBonus = Math.floor(result.timeRemaining / 5)
      setScore(score + 1 + timeBonus)
      setMascotMessage(
        `Decisão acertada! Contratar com exigências adicionais é a melhor abordagem para mitigar riscos sem bloquear o negócio. Você ganhou ${1 + timeBonus} pontos!`,
      )
      setMascotType("success")
      setShowConfetti(true)
    } else {
      setMascotMessage(result.decision.feedback)
      setMascotType("error")
    }

    setDecisionCompleted(true)
    setShowMascot(true)

    // Após completar a decisão, aguardar um tempo e avançar para a próxima fase
    setTimeout(() => {
      if (quizCompleted) {
        router.push(`/fase3?score=${score}&testMode=${testMode}`)
      }
    }, 3000)
  }

  const tip = {
    title: "Classificação de Dados Sensíveis",
    content:
      "A LGPD define dados sensíveis como aqueles sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato, dados referentes à saúde ou à vida sexual, dados genéticos ou biométricos. Ao avaliar fornecedores, é crucial verificar se eles têm proteções especiais para esses tipos de dados, pois exigem um nível maior de segurança e consentimento específico.",
  }

  const decisions = [
    {
      id: "decision1",
      text: "Contratar normalmente, sem exigências adicionais",
      isCorrect: false,
      feedback:
        "Esta decisão é arriscada. Contratar um fornecedor de alto risco sem exigências adicionais pode resultar em vazamentos de dados e responsabilização da sua empresa.",
    },
    {
      id: "decision2",
      text: "Contratar com exigências adicionais de segurança e cláusulas contratuais específicas",
      isCorrect: true,
      feedback:
        "Excelente decisão! Exigir medidas adicionais de segurança e formalizar responsabilidades em contrato é a melhor forma de mitigar riscos sem bloquear o negócio.",
    },
    {
      id: "decision3",
      text: "Não contratar o fornecedor sob nenhuma circunstância",
      isCorrect: false,
      feedback:
        "Esta decisão é muito conservadora. Embora proteja a empresa de riscos, pode bloquear oportunidades de negócio. O ideal é mitigar riscos com medidas adequadas.",
    },
  ]

  // Perguntas de fallback para usar em caso de erro
  const fallbackQuestions = [
    {
      question: "Qual dos seguintes é considerado um dado sensível segundo a LGPD?",
      options: ["Nome completo", "Endereço de e-mail", "Dados de saúde", "Número de telefone"],
      correctIndex: 2,
    },
    {
      question: "Ao classificar dados compartilhados com fornecedores, quais são considerados sensíveis pela LGPD?",
      options: [
        "Apenas nome e endereço",
        "Apenas dados financeiros",
        "Dados sobre origem racial, saúde, biometria e orientação sexual",
        "Apenas dados de contato profissional",
      ],
      correctIndex: 2,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl">
        <OfficeHeader />

        <div className="flex justify-end mb-4">
          <PhaseIndicator currentPhase={2} totalPhases={4} />
        </div>

        <div className="flex justify-center">
          <AnimatedContainer className="w-full max-w-4xl">
            <Card className="border-none shadow-lg">
              <PhaseHeader
                phase={2}
                title="Avaliação de Risco"
                description="Aprenda a identificar e lidar com fornecedores de alto risco"
                icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
              />

              <CardContent className="p-6">
                <div className="mb-6">
                  <ProgressBar currentPhase={2} totalPhases={4} />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="quiz">Dados Sensíveis</TabsTrigger>
                    <TabsTrigger value="decision">Tomada de Decisão</TabsTrigger>
                  </TabsList>
                  <TabsContent value="quiz" className="p-4 bg-white rounded-lg border">
                    {!quizCompleted ? (
                      quizError ? (
                        // Mostrar perguntas de fallback em caso de erro
                        <div className="space-y-6">
                          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md mb-4">
                            <p>Usando perguntas alternativas devido a um problema de carregamento.</p>
                          </div>

                          {/* Implementação simplificada de quiz para fallback */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">{fallbackQuestions[0].question}</h3>
                            <div className="space-y-2">
                              {fallbackQuestions[0].options.map((option, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2 p-2 border rounded hover:bg-slate-50"
                                >
                                  <input type="radio" id={`option-${index}`} name="quiz-option" value={index} />
                                  <label htmlFor={`option-${index}`}>{option}</label>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-center mt-4">
                              <Button
                                onClick={() => {
                                  setQuizCompleted(true)
                                  setScore(score + 1)
                                }}
                              >
                                Responder
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <DynamicQuiz
                          mode={QuestionSelectionMode.RANDOM}
                          questionsPerSession={2}
                          shuffleOptions={true}
                          showExplanation={true}
                          onComplete={handleQuizComplete}
                        />
                      )
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
                  <TabsContent value="decision" className="p-4 bg-white rounded-lg border">
                    {!decisionCompleted ? (
                      <DecisionGame
                        scenario="Decisão Urgente Sobre Fornecedor"
                        description="Um fornecedor de folha de pagamento terá acesso a dados sensíveis de funcionários (incluindo atestados médicos), mas não possui certificação de segurança nem criptografia adequada. O departamento de RH precisa de uma resposta urgente."
                        timeLimit={30}
                        decisions={decisions}
                        onComplete={handleDecisionComplete}
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
                        <p className="text-lg font-medium mb-4">Decisão registrada!</p>
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

      {quizCompleted && decisionCompleted && (
        <PhaseTransition nextPhase={`/fase3?score=${score}&testMode=${testMode}`} />
      )}

      <PhaseNavigation currentPhase={2} totalPhases={4} score={score} testMode={testMode} />

      <ConfettiExplosion show={showConfetti} />
    </div>
  )
}

