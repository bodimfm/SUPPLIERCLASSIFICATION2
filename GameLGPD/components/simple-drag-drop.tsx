"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import MascoteCorner from "./mascote-corner"
import { useSound } from "./sound-provider"

interface DataItem {
  id: string
  content: string
  category: string
}

interface Category {
  id: string
  name: string
  items: DataItem[]
}

interface SimpleDragDropProps {
  items: DataItem[]
  categories: Omit<Category, "items">[]
  onComplete: (result: { correct: number; total: number }) => void
}

export default function SimpleDragDrop({ items, categories, onComplete }: SimpleDragDropProps) {
  const [gameItems, setGameItems] = useState<DataItem[]>(items)
  const [gameCategories, setGameCategories] = useState<Category[]>(categories.map((cat) => ({ ...cat, items: [] })))
  const [draggedItem, setDraggedItem] = useState<DataItem | null>(null)
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)
  const [mascoteMessage, setMascoteMessage] = useState("")
  const [showMascoteMessage, setShowMascoteMessage] = useState(false)
  const { playSound } = useSound()

  const handleDragStart = (item: DataItem) => {
    setDraggedItem(item)
    playSound("click")
  }

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault()

    // Add visual feedback for drag over
    const element = e.currentTarget as HTMLElement
    element.classList.add("bg-primary/10", "border-primary")
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Remove visual feedback
    const element = e.currentTarget as HTMLElement
    element.classList.remove("bg-primary/10", "border-primary")
  }

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault()

    // Remove visual feedback
    const element = e.currentTarget as HTMLElement
    element.classList.remove("bg-primary/10", "border-primary")

    if (draggedItem) {
      // Play sound
      playSound("click")

      // Remove from items
      setGameItems(gameItems.filter((i) => i.id !== draggedItem.id))

      // Add to category
      setGameCategories(
        gameCategories.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              items: [...cat.items, draggedItem],
            }
          }
          return cat
        }),
      )

      setDraggedItem(null)
    }
  }

  const handleVerify = () => {
    let correct = 0
    let total = 0

    gameCategories.forEach((category) => {
      category.items.forEach((item) => {
        total++
        if (item.category === category.id) {
          correct++
        }
      })
    })

    setResult({ correct, total })
    setCompleted(true)

    // Play sound based on result
    if (correct === total) {
      playSound("complete")
    } else if (correct >= total / 2) {
      playSound("correct")
    } else {
      playSound("incorrect")
    }

    // Show mascote message
    if (correct === total) {
      setMascoteMessage("Perfeito! Você classificou todos os itens corretamente!")
    } else if (correct >= total / 2) {
      setMascoteMessage(`Bom trabalho! Você acertou ${correct} de ${total} itens.`)
    } else {
      setMascoteMessage("Você pode melhorar! Tente novamente para entender melhor a classificação.")
    }
    setShowMascoteMessage(true)

    // Delay the completion callback to allow for animation
    setTimeout(() => {
      onComplete({ correct, total })
    }, 2000)
  }

  const allItemsPlaced = gameItems.length === 0

  return (
    <div className="space-y-6 relative">
      <MascoteCorner message={mascoteMessage} showMessage={showMascoteMessage} position="bottom-right" size="medium" />

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {gameCategories.map((category, index) => (
          <motion.div
            key={category.id}
            className="bg-slate-50 border-2 border-dashed rounded-lg p-3 min-h-[200px] transition-colors"
            onDragOver={(e) => handleDragOver(e, category.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, category.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <h3 className="font-medium text-center mb-3">{category.name}</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {category.items.map((item) => (
                  <motion.div
                    key={item.id}
                    className={`bg-white border rounded-md p-3 flex items-center justify-between ${
                      completed
                        ? item.category === category.id
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                        : ""
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <span>{item.content}</span>
                    {completed &&
                      (item.category === category.id ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ))}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {gameItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Itens para classificar:</h3>
                <div className="space-y-2">
                  {gameItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="bg-white border rounded-md p-3 flex items-center gap-2 cursor-grab active:cursor-grabbing hover:bg-slate-50 hover:border-primary/50 transition-colors"
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <span>{item.content}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!completed ? (
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              onClick={() => {
                playSound("click")
                handleVerify()
              }}
              disabled={!allItemsPlaced}
              className="px-8"
            >
              Verificar Classificação
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className={`p-4 rounded-md ${
              result && result.correct === result.total
                ? "bg-green-50 text-green-700"
                : result && result.correct >= result.total / 2
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-red-50 text-red-700"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 font-medium mb-1">
              {result && result.correct === result.total ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Classificação perfeita!</span>
                </>
              ) : result && result.correct >= result.total / 2 ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Boa classificação!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span>Classificação incorreta</span>
                </>
              )}
            </div>
            <p>{result && `Você classificou corretamente ${result.correct} de ${result.total} itens.`}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

