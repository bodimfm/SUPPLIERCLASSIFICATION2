"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, HelpCircle } from "lucide-react"
import { useSound } from "./sound-provider"

interface MemoryCard {
  id: string
  content: string
  matchId: string
  flipped: boolean
  matched: boolean
}

interface MemoryCardGameProps {
  onComplete: (score: number, total: number) => void
}

export default function MemoryCardGame({ onComplete }: MemoryCardGameProps) {
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const { playSound } = useSound()

  // Inicializar cartas
  useEffect(() => {
    const cardPairs = [
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
    ]

    // Embaralhar cartas
    const shuffledCards = [...cardPairs]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({
        ...card,
        flipped: false,
        matched: false,
      }))

    setCards(shuffledCards)
  }, [])

  // Verificar pares quando duas cartas são viradas
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards
      const firstCard = cards.find((card) => card.id === firstId)
      const secondCard = cards.find((card) => card.id === secondId)

      if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
        // Par encontrado
        playSound("correct")
        setMatchedPairs((prev) => [...prev, firstCard.matchId])

        // Atualizar cartas
        setCards(cards.map((card) => (card.id === firstId || card.id === secondId ? { ...card, matched: true } : card)))

        // Mostrar dica
        setShowTip(true)
        setTimeout(() => setShowTip(false), 3000)
      } else {
        // Par não encontrado
        playSound("incorrect")

        // Virar cartas de volta após um tempo
        setTimeout(() => {
          setCards(
            cards.map((card) => (flippedCards.includes(card.id) && !card.matched ? { ...card, flipped: false } : card)),
          )
        }, 1000)
      }

      // Incrementar movimentos
      setMoves((prev) => prev + 1)

      // Limpar cartas viradas após verificação
      setTimeout(() => {
        setFlippedCards([])
      }, 1000)
    }
  }, [flippedCards, cards, playSound])

  // Verificar se o jogo foi completado
  useEffect(() => {
    if (matchedPairs.length === 4 && !completed) {
      setCompleted(true)
      playSound("complete")

      // Calcular pontuação baseada no número de movimentos
      // Pontuação máxima: 4 pontos (4 pares em 4 movimentos)
      // Pontuação mínima: 1 ponto (completou o jogo)
      const maxMoves = 8 // Número ideal de movimentos (4 pares)
      const score = Math.max(1, Math.min(4, Math.ceil(4 * (maxMoves / Math.max(moves, maxMoves)))))

      setTimeout(() => {
        onComplete(score, 4)
      }, 1500)
    }
  }, [matchedPairs, completed, moves, onComplete, playSound])

  const handleCardClick = (id: string) => {
    // Ignorar cliques se já houver duas cartas viradas ou se a carta já estiver virada ou combinada
    if (flippedCards.length === 2 || flippedCards.includes(id)) return

    const card = cards.find((c) => c.id === id)
    if (card && (card.flipped || card.matched)) return

    playSound("click")

    // Virar a carta
    setCards(cards.map((card) => (card.id === id ? { ...card, flipped: true } : card)))

    // Adicionar à lista de cartas viradas
    setFlippedCards((prev) => [...prev, id])
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
        <h3 className="text-lg font-medium mb-2">Jogo Completado!</h3>
        <p>Você encontrou todos os pares em {moves} movimentos.</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg text-blue-700 mb-4">
        <p className="font-medium">Jogo da Memória LGPD</p>
        <p className="text-sm mt-1">
          Encontre os pares que relacionam medidas de proteção de dados com suas funções na avaliação de fornecedores.
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-medium">Pares encontrados: {matchedPairs.length}/4</p>
        <p className="text-sm font-medium">Movimentos: {moves}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: card.flipped || card.matched ? 1 : 1.05 }}
            whileTap={{ scale: card.flipped || card.matched ? 1 : 0.95 }}
            onClick={() => handleCardClick(card.id)}
          >
            <Card
              className={`h-32 cursor-pointer transition-colors ${
                card.matched
                  ? "bg-green-50 border-green-200"
                  : card.flipped
                    ? "bg-blue-50 border-blue-200"
                    : "hover:border-primary"
              }`}
            >
              <CardContent className="p-4 h-full flex items-center justify-center">
                {card.flipped || card.matched ? (
                  <p className="text-center text-sm font-medium">{card.content}</p>
                ) : (
                  <HelpCircle className="h-8 w-8 text-slate-300" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showTip && matchedPairs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-md bg-green-50 text-green-700"
          >
            <div className="flex items-center gap-2 font-medium mb-1">
              <CheckCircle2 className="h-5 w-5" />
              <span>Par encontrado!</span>
            </div>
            <p className="text-sm">Excelente! Você encontrou um par importante para a avaliação de fornecedores.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

