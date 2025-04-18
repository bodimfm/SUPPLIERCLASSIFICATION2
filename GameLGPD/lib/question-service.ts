"use client"

import { useEffect, useState } from "react"

export interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

export enum QuestionSelectionMode {
  SEQUENTIAL = "sequential",
  RANDOM = "random",
  DIFFICULTY = "difficulty",
  CATEGORY = "category",
}

export interface QuestionServiceOptions {
  mode?: QuestionSelectionMode
  questionsPerSession?: number
  excludeAnswered?: boolean
  shuffleOptions?: boolean
  categories?: string[]
  difficulty?: "easy" | "medium" | "hard"
}

const defaultOptions: QuestionServiceOptions = {
  mode: QuestionSelectionMode.RANDOM,
  questionsPerSession: 5,
  excludeAnswered: true,
  shuffleOptions: true,
}

export function useQuestionService(options: QuestionServiceOptions = defaultOptions) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([])

  // Carregar perguntas do arquivo JSON
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)

        // Verificar se estamos no lado do cliente antes de fazer a requisição
        if (typeof window !== "undefined") {
          // Usar um conjunto de perguntas de fallback em caso de erro
          const fallbackQuestions = [
            {
              id: 1,
              question: "Por que é importante verificar se o fornecedor possui uma política de privacidade formal?",
              options: [
                "Porque demonstra compromisso com a proteção de dados e conformidade com a LGPD.",
                "Porque permite reduzir custos operacionais.",
                "Porque agiliza a contratação sem necessidade de avaliação.",
                "Porque é um requisito opcional sem impacto legal.",
              ],
              correct: 0,
              explanation:
                "Uma política formal mostra que o fornecedor adota práticas de proteção de dados e segue as exigências da LGPD, diminuindo riscos de incidentes.",
            },
            {
              id: 2,
              question: "Qual dos seguintes é considerado um dado sensível segundo a LGPD?",
              options: ["Nome completo", "Endereço de e-mail", "Dados de saúde", "Número de telefone"],
              correct: 2,
              explanation:
                "Dados de saúde estão entre os dados sensíveis, que exigem um nível maior de proteção conforme a LGPD.",
            },
            {
              id: 3,
              question:
                "Qual é o principal motivo para incluir cláusulas contratuais específicas de proteção de dados na contratação de fornecedores?",
              options: [
                "Reduzir custos de contratação.",
                "Definir responsabilidades e garantir conformidade com a LGPD.",
                "Aumentar o prazo do contrato.",
                "Facilitar a terceirização de serviços.",
              ],
              correct: 1,
              explanation:
                "Cláusulas específicas definem as responsabilidades de cada parte e estabelecem obrigações claras, ajudando a evitar sanções em caso de incidentes.",
            },
            {
              id: 4,
              question: "Qual é o papel do DPO (Encarregado de Dados) na avaliação de fornecedores?",
              options: [
                "Aprovar automaticamente todos os fornecedores.",
                "Realizar a análise crítica dos riscos e validar as informações apresentadas.",
                "Gerenciar apenas a área de TI.",
                "Elaborar o contrato sem verificar dados técnicos.",
              ],
              correct: 1,
              explanation:
                "O DPO é responsável por revisar e validar a avaliação dos fornecedores, garantindo que os riscos estejam controlados e em conformidade com a LGPD.",
            },
            {
              id: 5,
              question: "Como a certificação ISO 27001 pode impactar a avaliação de risco de um fornecedor?",
              options: [
                "Aumenta o risco, pois é uma certificação cara.",
                "Reduz o risco, demonstrando práticas robustas de segurança da informação.",
                "Não tem impacto na avaliação de risco.",
                "Substitui a necessidade de cláusulas contratuais.",
              ],
              correct: 1,
              explanation:
                "A certificação ISO 27001 indica que o fornecedor segue padrões internacionais de segurança, o que reduz o risco associado à sua contratação.",
            },
            {
              id: 6,
              question:
                "Qual medida técnica é mais eficaz para proteger dados pessoais em trânsito entre sua empresa e um fornecedor?",
              options: [
                "Criptografia de ponta a ponta",
                "Armazenamento em servidores locais",
                "Backup diário dos dados",
                "Uso de senhas complexas",
              ],
              correct: 0,
              explanation:
                "A criptografia de ponta a ponta garante que os dados permaneçam protegidos durante a transmissão, mesmo que sejam interceptados por terceiros não autorizados.",
            },
            {
              id: 7,
              question: "Ao avaliar um fornecedor internacional, qual aspecto é mais crítico segundo a LGPD?",
              options: [
                "O idioma do contrato",
                "O país onde o fornecedor está localizado e seu nível de proteção de dados",
                "O tamanho da empresa fornecedora",
                "A moeda utilizada para pagamento",
              ],
              correct: 1,
              explanation:
                "A LGPD exige garantias específicas para transferências internacionais, sendo fundamental verificar se o país do fornecedor possui nível adequado de proteção de dados.",
            },
            {
              id: 8,
              question: "Qual é a principal responsabilidade do operador de dados em relação ao controlador?",
              options: [
                "Definir as finalidades do tratamento de dados",
                "Realizar o tratamento conforme as instruções do controlador",
                "Coletar o consentimento dos titulares",
                "Determinar o prazo de armazenamento dos dados",
              ],
              correct: 1,
              explanation:
                "O operador deve realizar o tratamento de dados seguindo estritamente as instruções fornecidas pelo controlador, que é quem define as finalidades e decisões sobre o tratamento.",
            },
            {
              id: 9,
              question:
                "Qual documento é essencial para formalizar as responsabilidades entre sua empresa e um fornecedor que processará dados pessoais?",
              options: [
                "Contrato de Processamento de Dados (DPA)",
                "Política de Cookies",
                "Termos de Uso do site",
                "Relatório financeiro anual",
              ],
              correct: 0,
              explanation:
                "O Contrato de Processamento de Dados (DPA) é o documento que estabelece claramente as responsabilidades, obrigações e limites do fornecedor no tratamento dos dados pessoais.",
            },
            {
              id: 10,
              question: "Qual medida NÃO é adequada para avaliar a conformidade de um fornecedor com a LGPD?",
              options: [
                "Solicitar certificações de segurança da informação",
                "Realizar auditorias periódicas",
                "Verificar histórico de incidentes de segurança",
                "Basear-se apenas no preço mais baixo dos serviços",
              ],
              correct: 3,
              explanation:
                "Basear-se apenas no preço mais baixo ignora aspectos críticos de conformidade com a LGPD. A avaliação deve considerar medidas técnicas, organizacionais e histórico de segurança.",
            },
            {
              id: 11,
              question:
                "Em caso de incidente de segurança envolvendo dados pessoais tratados por um fornecedor, quem deve notificar a ANPD?",
              options: [
                "Apenas o fornecedor (operador)",
                "Apenas a sua empresa (controlador)",
                "Ambos, independentemente",
                "O controlador, com informações fornecidas pelo operador",
              ],
              correct: 3,
              explanation:
                "A responsabilidade de notificar a ANPD é do controlador, mas o operador deve fornecer todas as informações necessárias sobre o incidente para que o controlador possa cumprir essa obrigação.",
            },
            {
              id: 12,
              question:
                "Qual cláusula é mais importante incluir em contratos com fornecedores que processam dados pessoais?",
              options: [
                "Cláusula de exclusividade comercial",
                "Cláusula de confidencialidade e segurança dos dados",
                "Cláusula de marketing conjunto",
                "Cláusula de propriedade intelectual",
              ],
              correct: 1,
              explanation:
                "A cláusula de confidencialidade e segurança dos dados garante que o fornecedor mantenha os dados protegidos e não os utilize para finalidades não autorizadas pelo controlador.",
            },
          ]

          // Usar diretamente as perguntas de fallback em vez de tentar carregar o arquivo
          setQuestions(fallbackQuestions)
          initializeSession(fallbackQuestions)
        }

        setLoading(false)
      } catch (err) {
        console.error("Erro ao carregar perguntas:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  // Carregar questões respondidas do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAnsweredQuestions = localStorage.getItem("answeredQuestions")
      if (savedAnsweredQuestions) {
        try {
          const parsedAnswers = JSON.parse(savedAnsweredQuestions)
          setAnsweredQuestions(new Set(parsedAnswers))
        } catch (e) {
          console.error("Erro ao carregar questões respondidas:", e)
        }
      }
    }
  }, [])

  // Salvar questões respondidas no localStorage quando mudar
  useEffect(() => {
    if (typeof window !== "undefined" && answeredQuestions.size > 0) {
      localStorage.setItem("answeredQuestions", JSON.stringify([...answeredQuestions]))
    }
  }, [answeredQuestions])

  // Inicializar a sessão de perguntas com base nas opções
  const initializeSession = (allQuestions: Question[]) => {
    let availableQuestions = [...allQuestions]

    // Filtrar perguntas já respondidas se necessário
    if (options.excludeAnswered) {
      availableQuestions = availableQuestions.filter((q) => !answeredQuestions.has(q.id))
    }

    // Se não houver perguntas disponíveis suficientes, resetar as perguntas respondidas
    if (availableQuestions.length < (options.questionsPerSession || 5)) {
      setAnsweredQuestions(new Set())
      availableQuestions = [...allQuestions]
    }

    // Selecionar perguntas com base no modo escolhido
    let selectedQuestions: Question[] = []

    switch (options.mode) {
      case QuestionSelectionMode.RANDOM:
        // Embaralhar e selecionar aleatoriamente
        selectedQuestions = shuffleArray(availableQuestions).slice(0, options.questionsPerSession)
        break

      case QuestionSelectionMode.SEQUENTIAL:
        // Selecionar em ordem
        selectedQuestions = availableQuestions.slice(0, options.questionsPerSession)
        break

      // Outros modos podem ser implementados conforme necessário

      default:
        selectedQuestions = shuffleArray(availableQuestions).slice(0, options.questionsPerSession)
    }

    // Embaralhar as opções de cada pergunta se necessário
    if (options.shuffleOptions) {
      selectedQuestions = selectedQuestions.map((q) => {
        // Preservar o índice da resposta correta ao embaralhar
        const correctAnswer = q.options[q.correct]
        const shuffledOptions = shuffleArray([...q.options])
        const newCorrectIndex = shuffledOptions.findIndex((opt) => opt === correctAnswer)

        return {
          ...q,
          options: shuffledOptions,
          correct: newCorrectIndex,
        }
      })
    }

    // Verificar se há perguntas duplicadas e substituí-las se necessário
    const questionIds = new Set<number>()
    const finalQuestions: Question[] = []

    for (const question of selectedQuestions) {
      if (!questionIds.has(question.id)) {
        questionIds.add(question.id)
        finalQuestions.push(question)
      } else {
        // Se encontrar uma pergunta duplicada, tente encontrar outra que não esteja no conjunto
        const remainingQuestions = availableQuestions.filter((q) => !questionIds.has(q.id))
        if (remainingQuestions.length > 0) {
          const replacement = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)]
          questionIds.add(replacement.id)
          finalQuestions.push(replacement)
        }
      }
    }

    setSessionQuestions(finalQuestions)
    setCurrentQuestionIndex(0)
  }

  // Avançar para a próxima pergunta
  const nextQuestion = () => {
    if (currentQuestionIndex < sessionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      return true
    }
    return false
  }

  // Voltar para a pergunta anterior
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      return true
    }
    return false
  }

  // Marcar uma pergunta como respondida
  const markAsAnswered = (questionId: number) => {
    setAnsweredQuestions((prev) => new Set(prev).add(questionId))
  }

  // Reiniciar a sessão com novas perguntas
  const resetSession = () => {
    initializeSession(questions)
  }

  // Obter a pergunta atual
  const getCurrentQuestion = (): Question | null => {
    if (sessionQuestions.length === 0) return null
    return sessionQuestions[currentQuestionIndex]
  }

  // Verificar se é a última pergunta
  const isLastQuestion = (): boolean => {
    return currentQuestionIndex === sessionQuestions.length - 1
  }

  // Verificar se é a primeira pergunta
  const isFirstQuestion = (): boolean => {
    return currentQuestionIndex === 0
  }

  // Função auxiliar para embaralhar um array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    // Fisher-Yates (Knuth) Shuffle - algoritmo mais eficiente para embaralhamento
    for (let i = newArray.length - 1; i > 0; i--) {
      // Usar Math.random() * (i + 1) para garantir que todos os índices tenham chance igual
      const j = Math.floor(Math.random() * (i + 1))
      // Swap usando destructuring
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  return {
    loading,
    error,
    currentQuestion: getCurrentQuestion(),
    nextQuestion,
    previousQuestion,
    markAsAnswered,
    resetSession,
    isLastQuestion,
    isFirstQuestion,
    progress: {
      current: currentQuestionIndex + 1,
      total: sessionQuestions.length,
    },
  }
}

