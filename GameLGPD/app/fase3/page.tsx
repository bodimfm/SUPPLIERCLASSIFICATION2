"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DynamicQuiz from "@/components/dynamic-quiz"
import TipModal from "@/components/tip-modal"
import DPOMascot from "@/components/dpo-mascot"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, ShieldCheck } from "lucide-react"
import { QuestionSelectionMode } from "@/lib/question-service"
import PhaseHeader from "@/components/phase-header"
import ProgressBar from "@/components/progress-bar"
import AnimatedContainer from "@/components/animated-container"
import OfficeHeader from "@/components/office-header"
import { motion } from "framer-motion"
import PhaseNavigation from "@/components/phase-navigation"
import PhaseIndicator from "@/components/phase-indicator"

export default function Fase3() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [score, setScore] = useState(0)
  const [showTip, setShowTip] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [planCompleted, setPlainCompleted] = useState(false)
  const [showMascot, setShowMascot] = useState(true)
  const [mascotMessage, setMascotMessage] = useState(
    "Bem-vindo à Fase 3! Agora que identificamos os riscos, vamos criar um plano de ação para mitigá-los.",
  )
  const [mascotType, setMascotType] = useState<"neutral" | "success" | "error" | "tip">("neutral")
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([])
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
        "Correto! O Contrato de Processamento de Dados (DPA) é essencial para formalizar as responsabilidades de cada parte no tratamento de dados pessoais.",
      )
      setMascotType("success")
    } else if (quizScore >= total * 0.7) {
      setMascotMessage(
        "Bom trabalho! Você acertou a maioria das perguntas sobre contratos e documentação de fornecedores.",
      )
      setMascotType("success")
    } else {
      setMascotMessage(
        "Atenção! O Contrato de Processamento de Dados (DPA) é o documento adequado para formalizar a relação de processamento de dados com fornecedores.",
      )
      setMascotType("error")
    }

    setShowTip(true)
    setQuizCompleted(true)
    setShowMascot(true)

    // Mudar para a aba de plano de ação após completar o quiz
    setTimeout(() => {
      setActiveTab("plan")
    }, 2000)
  }

  const handlePlanComplete = () => {
    // Check if essential measures are selected
    const essentialMeasures = ["measure1", "measure3", "measure5"]
    const selectedEssential = essentialMeasures.filter((m) => selectedMeasures.includes(m))

    const additionalPoints = Math.min(selectedEssential.length, 3)
    setScore(score + additionalPoints)

    if (selectedEssential.length === essentialMeasures.length) {
      setMascotMessage(
        "Excelente plano de ação! Você selecionou todas as medidas essenciais para mitigar os riscos do fornecedor.",
      )
      setMascotType("success")
    } else if (selectedEssential.length >= 2) {
      setMascotMessage(
        "Bom plano de ação, mas faltou alguma medida essencial. Lembre-se que cláusulas contratuais e auditorias são fundamentais.",
      )
      setMascotType("tip")
    } else {
      setMascotMessage(
        "Seu plano precisa ser revisado. Faltaram medidas essenciais como cláusulas contratuais específicas e auditorias periódicas.",
      )
      setMascotType("error")
    }

    setPlainCompleted(true)
    setShowMascot(true)

    // Após completar o plano, aguardar um tempo e avançar para a próxima fase
    setTimeout(() => {
      if (quizCompleted) {
        router.push(`/fase4?score=${score + additionalPoints}&testMode=${testMode}`)
      }
    }, 3000)
  }

  const handleNextPhase = () => {
    router.push(`/fase4?score=${score}`)
  }

  const tip = {
    title: "Contratos com Fornecedores",
    content:
      "O Contrato de Processamento de Dados (DPA - Data Processing Agreement) é um documento jurídico essencial que estabelece os direitos e obrigações entre sua empresa (controlador) e o fornecedor (operador) em relação ao tratamento de dados pessoais. Este documento deve especificar claramente o escopo do processamento, medidas de segurança, confidencialidade, e procedimentos em caso de incidentes. A LGPD exige que este tipo de contrato esteja em vigor antes de compartilhar dados com fornecedores.",
  }

  const mitigationMeasures = [
    {
      id: "measure1",
      label: "Incluir cláusulas específicas de proteção de dados no contrato",
      essential: true,
    },
    {
      id: "measure2",
      label: "Solicitar brochuras de marketing do fornecedor",
      essential: false,
    },
    {
      id: "measure3",
      label: "Exigir implementação de criptografia para dados em repouso e em trânsito",
      essential: true,
    },
    {
      id: "measure4",
      label: "Agendar reunião social com o fornecedor",
      essential: false,
    },
    {
      id: "measure5",
      label: "Estabelecer direito de auditoria periódica",
      essential: true,
    },
    {
      id: "measure6",
      label: "Definir procedimento de notificação de incidentes em 24 horas",
      essential: true,
    },
    {
      id: "measure7",
      label: "Exigir treinamento em LGPD para a equipe do fornecedor",
      essential: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl">
        <OfficeHeader />

        <div className="flex justify-end mb-4">
          <PhaseIndicator currentPhase={3} totalPhases={4} />
        </div>

        <div className="flex justify-center">
          <AnimatedContainer className="w-full max-w-4xl">
            <Card className="border-none shadow-lg">
              <PhaseHeader
                phase={3}
                title="Mitigação de Riscos"
                description="Aprenda a implementar medidas para mitigar riscos com fornecedores"
                icon={<ClipboardList className="h-5 w-5 text-blue-500" />}
              />

              <CardContent className="p-6">
                <div className="mb-6">
                  <ProgressBar currentPhase={3} totalPhases={4} />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="quiz">Documentação</TabsTrigger>
                    <TabsTrigger value="plan">Plano de Ação</TabsTrigger>
                  </TabsList>
                  <TabsContent value="quiz" className="p-4 bg-white rounded-lg border">
                    {!quizCompleted ? (
                      <DynamicQuiz
                        mode={QuestionSelectionMode.RANDOM}
                        questionsPerSession={2}
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
                          <ClipboardList className="h-8 w-8 text-green-600" />
                        </motion.div>
                        <p className="text-lg font-medium mb-4">Questionário Concluído!</p>
                        <p className="mt-4 font-medium">Pontuação atual: {score}</p>
                      </motion.div>
                    )}
                  </TabsContent>
                  <TabsContent value="plan" className="p-4 bg-white rounded-lg border">
                    {!planCompleted ? (
                      <div className="space-y-6">
                        <div className="bg-amber-50 p-4 rounded-md text-amber-700 mb-4">
                          <p className="font-medium">Instruções:</p>
                          <p>
                            Selecione as medidas que você considera essenciais para mitigar os riscos do fornecedor de
                            alto risco.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {mitigationMeasures.map((measure) => (
                            <div key={measure.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={measure.id}
                                checked={selectedMeasures.includes(measure.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMeasures([...selectedMeasures, measure.id])
                                  } else {
                                    setSelectedMeasures(selectedMeasures.filter((id) => id !== measure.id))
                                  }
                                }}
                              />
                              <Label htmlFor={measure.id} className="font-normal">
                                {measure.label}
                              </Label>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-center mt-6">
                          <Button onClick={handlePlanComplete} disabled={selectedMeasures.length === 0}>
                            Finalizar Plano de Ação
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <div className="flex justify-center mb-4">
                          <ShieldCheck className="h-12 w-12 text-green-500" />
                        </div>
                        <p className="text-lg font-medium mb-4">Plano de Ação Concluído!</p>
                        <p>Você selecionou {selectedMeasures.length} medidas para mitigar os riscos.</p>
                        <p className="mt-4">Pontuação atual: {score}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center">{quizCompleted && planCompleted && null}</CardFooter>
            </Card>
          </AnimatedContainer>
        </div>
      </div>

      {showTip && (
        <TipModal title={tip.title} content={tip.content} isOpen={showTip} onClose={() => setShowTip(false)} />
      )}

      {showMascot && <DPOMascot message={mascotMessage} type={mascotType} autoHide={true} />}

      <PhaseNavigation currentPhase={3} totalPhases={4} score={score} testMode={testMode} />
    </div>
  )
}

