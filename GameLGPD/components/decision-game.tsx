"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, XCircle } from "lucide-react"
import { useSound } from "./sound-provider"
import EnhancedDecisionGame from "./enhanced-decision-game"

interface Decision {
  id: string
  text: string
  isCorrect: boolean
  feedback: string
}

interface DecisionGameProps {
  scenario: string
  description: string
  timeLimit: number // in seconds
  decisions: Decision[]
  onComplete: (result: { decision: Decision; timeRemaining: number }) => void
}

export default function DecisionGame({ scenario, description, timeLimit, decisions, onComplete }: DecisionGameProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const { playSound } = useSound()

  // Check if we should use the enhanced version with interactive questions
  const useEnhancedVersion = true // You can make this conditional based on props or other logic

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  if (useEnhancedVersion) {
    // Sample interactive questions for the enhanced version
    const interactiveQuestions = [
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

      // Drag and drop for operator/controller
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

      // Timeline challenge
      {
        type: "timeline" as const,
        id: "timeline1",
        title: "Linha do Tempo de Avaliação de Fornecedores",
        description: "Organize as etapas do processo de avaliação de fornecedores na ordem correta.",
        steps: [
          {
            id: "step1",
            text: "Realizar due diligence inicial do fornecedor",
            correctOrder: 1,
          },
          {
            id: "step2",
            text: "Elaborar questionário de avaliação de segurança",
            correctOrder: 2,
          },
          {
            id: "step3",
            text: "Analisar respostas e documentação do fornecedor",
            correctOrder: 3,
          },
          {
            id: "step4",
            text: "Classificar o nível de risco do fornecedor",
            correctOrder: 4,
          },
          {
            id: "step5",
            text: "Definir cláusulas contratuais específicas de proteção de dados",
            correctOrder: 5,
          },
          {
            id: "step6",
            text: "Implementar plano de monitoramento contínuo",
            correctOrder: 6,
          },
        ],
      },

      // Compliance wheel
      {
        type: "wheel" as const,
        id: "wheel1",
        title: "Roda do Compliance",
        description: "Gire a roda e responda às perguntas sobre LGPD e segurança da informação.",
        segments: [
          {
            id: "segment1",
            question: "Qual é o prazo para notificar a ANPD em caso de incidente de segurança?",
            options: [
              "Imediatamente após a descoberta",
              "Em prazo razoável, conforme a gravidade",
              "Em até 72 horas",
              "Em até 30 dias",
            ],
            correctIndex: 1,
            explanation:
              "A LGPD não estabelece um prazo fixo, mas determina que a notificação deve ocorrer em prazo razoável, conforme a gravidade do incidente.",
          },
          {
            id: "segment2",
            question: "Quem é o principal responsável pela conformidade com a LGPD na relação com fornecedores?",
            options: [
              "O fornecedor (operador)",
              "O controlador",
              "A ANPD",
              "Ambos compartilham responsabilidades iguais",
            ],
            correctIndex: 1,
            explanation:
              "O controlador é o principal responsável pela conformidade com a LGPD, mesmo quando utiliza fornecedores como operadores.",
          },
          {
            id: "segment3",
            question: "O que é um Data Processing Agreement (DPA)?",
            options: [
              "Um relatório de impacto à proteção de dados",
              "Um contrato entre controlador e operador",
              "Um certificado de segurança da informação",
              "Um plano de resposta a incidentes",
            ],
            correctIndex: 1,
            explanation:
              "O DPA é um contrato que estabelece as responsabilidades e obrigações entre o controlador e o operador no tratamento de dados pessoais.",
          },
          {
            id: "segment4",
            question: "Qual medida NÃO é obrigatória na avaliação de fornecedores segundo a LGPD?",
            options: [
              "Verificar se o fornecedor possui certificação ISO 27001",
              "Verificar se o fornecedor possui políticas de proteção de dados",
              "Verificar como o fornecedor lida com solicitações de titulares",
              "Verificar medidas técnicas e administrativas de segurança",
            ],
            correctIndex: 0,
            explanation:
              "A certificação ISO 27001, embora recomendável, não é uma exigência obrigatória da LGPD para fornecedores.",
          },
        ],
      },

      // Connection puzzle
      {
        type: "connection-puzzle" as const,
        id: "connection1",
        title: "Puzzle de Conexão de Medidas de Segurança",
        description: "Conecte cada medida de segurança com o benefício correspondente na proteção de dados.",
        measures: [
          {
            id: "measure1",
            name: "Criptografia",
            icon: "🔒",
          },
          {
            id: "measure2",
            name: "Controle de Acesso",
            icon: "🔑",
          },
          {
            id: "measure3",
            name: "Backup Regular",
            icon: "💾",
          },
          {
            id: "measure4",
            name: "Auditoria de Logs",
            icon: "📊",
          },
        ],
        benefits: [
          {
            id: "benefit1",
            name: "Proteção contra vazamentos",
            icon: "🛡️",
          },
          {
            id: "benefit2",
            name: "Prevenção de acessos não autorizados",
            icon: "🚫",
          },
          {
            id: "benefit3",
            name: "Recuperação em caso de incidentes",
            icon: "♻️",
          },
          {
            id: "benefit4",
            name: "Detecção de atividades suspeitas",
            icon: "🔍",
          },
        ],
        correctConnections: [
          {
            measureId: "measure1",
            benefitId: "benefit1",
            explanation:
              "A criptografia protege os dados contra vazamentos, tornando-os ilegíveis para pessoas não autorizadas.",
          },
          {
            measureId: "measure2",
            benefitId: "benefit2",
            explanation: "O controle de acesso previne que pessoas não autorizadas acessem dados sensíveis.",
          },
          {
            measureId: "measure3",
            benefitId: "benefit3",
            explanation:
              "Backups regulares permitem a recuperação de dados em caso de incidentes como ransomware ou falhas de sistema.",
          },
          {
            measureId: "measure4",
            benefitId: "benefit4",
            explanation:
              "A auditoria de logs permite detectar atividades suspeitas e investigar incidentes de segurança.",
          },
        ],
      },
    ]

    return (
      <EnhancedDecisionGame
        questions={interactiveQuestions}
        onComplete={(score, total) => {
          // Convert score to original format expected by parent component
          const result = {
            decision: {
              id: "enhanced",
              text: "Decisão baseada em questões interativas",
              isCorrect: score > 0,
              feedback:
                score > total / 2
                  ? "Você demonstrou bom conhecimento sobre LGPD e avaliação de fornecedores!"
                  : "Você precisa revisar alguns conceitos sobre LGPD e avaliação de fornecedores.",
            },
            timeRemaining: 0,
          }
          onComplete(result)
        }}
      />
    )
  }

  useEffect(() => {
    if (isCompleted) return

    timerRef.current = setInterval(() => {
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
          clearInterval(timerRef.current as NodeJS.Timeout)
          // Auto-select a decision if time runs out
          if (!selectedDecision) {
            const randomDecision = decisions[0] // Default to first option if time runs out
            setSelectedDecision(randomDecision)
            setIsCompleted(true)
            onComplete({ decision: randomDecision, timeRemaining: 0 })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current as NodeJS.Timeout)
  }, [decisions, isCompleted, onComplete, selectedDecision, playSound])

  const handleSelectDecision = (decision: Decision) => {
    if (isCompleted) return

    setSelectedDecision(decision)
    setIsCompleted(true)

    // Play sound based on decision correctness
    if (decision.isCorrect) {
      playSound("correct")
    } else {
      playSound("incorrect")
    }

    // Delay the completion callback to allow for animation
    setTimeout(() => {
      onComplete({ decision, timeRemaining })
    }, 1500)
  }

  const percentRemaining = (timeRemaining / timeLimit) * 100

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
      <Card>
        <CardHeader>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <CardTitle>{scenario}</CardTitle>
          </motion.div>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <CardDescription>{description}</CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: timeRemaining < 5 ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: timeRemaining < 5 ? Number.POSITIVE_INFINITY : 0,
              repeatType: "reverse",
            }}
          >
            <Clock className={`h-5 w-5 ${timeRemaining < timeLimit * 0.3 ? "text-red-500" : "text-orange-500"}`} />
            <div className="flex-1">
              <Progress
                value={percentRemaining}
                className={`h-2 ${timeRemaining < timeLimit * 0.3 ? "bg-red-100" : ""}`}
              />
            </div>
            <motion.span
              className={`text-sm font-medium ${timeRemaining < timeLimit * 0.3 ? "text-red-500" : ""}`}
              animate={{ scale: timeRemaining < timeLimit * 0.3 ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: timeRemaining < timeLimit * 0.3 ? Number.POSITIVE_INFINITY : 0, duration: 0.5 }}
            >
              {timeRemaining}s
            </motion.span>
          </motion.div>

          <div className="space-y-3">
            <AnimatePresence>
              {decisions.map((decision, index) => (
                <motion.div
                  key={decision.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Button
                    variant={
                      selectedDecision?.id === decision.id
                        ? decision.isCorrect
                          ? "default"
                          : "destructive"
                        : "outline"
                    }
                    className={`w-full justify-start h-auto py-3 px-4 text-left ${
                      !isCompleted ? "hover:border-primary hover:bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      playSound("click")
                      handleSelectDecision(decision)
                    }}
                    disabled={isCompleted}
                  >
                    <span className="flex-1">{decision.text}</span>
                    {selectedDecision?.id === decision.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      >
                        {decision.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 ml-2 text-white" />
                        ) : (
                          <XCircle className="h-5 w-5 ml-2 text-white" />
                        )}
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {selectedDecision && (
              <motion.div
                className={`p-4 rounded-md ${selectedDecision.isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 font-medium mb-1">
                  {selectedDecision.isCorrect ? (
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
                <p>{selectedDecision.feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter>
          {isCompleted && (
            <motion.div
              className="text-sm text-muted-foreground w-full text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {selectedDecision?.isCorrect
                ? "Boa escolha! Você tomou a decisão correta."
                : "Esta não foi a melhor decisão. Veja o feedback acima para entender por quê."}
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

