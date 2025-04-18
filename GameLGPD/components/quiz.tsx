"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle } from "lucide-react"
import MascoteCorner from "./mascote-corner"

interface QuizProps {
  question: string
  options: string[]
  correctIndex: number
  onComplete: (result: boolean) => void
}

export default function Quiz({ question, options, correctIndex, onComplete }: QuizProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [mascoteMessage, setMascoteMessage] = useState("")
  const [showMascoteMessage, setShowMascoteMessage] = useState(false)

  const handleSubmit = () => {
    if (selectedOption !== null) {
      const correct = selectedOption === correctIndex
      setIsCorrect(correct)
      setHasSubmitted(true)

      // Show mascote message
      setMascoteMessage(correct ? "Muito bem! Você acertou!" : "Ops! Essa não é a resposta correta.")
      setShowMascoteMessage(true)

      // Delay the completion callback to allow for animation
      setTimeout(() => {
        onComplete(correct)
      }, 1500)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 relative">
      <MascoteCorner message={mascoteMessage} showMessage={showMascoteMessage} size="medium" />

      <motion.h3
        className="text-lg font-medium"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {question}
      </motion.h3>

      <RadioGroup
        value={selectedOption?.toString()}
        onValueChange={(value) => setSelectedOption(Number.parseInt(value))}
        className="space-y-3"
      >
        {options.map((option, index) => (
          <motion.div
            key={index}
            className={`flex items-start space-x-2 p-3 rounded-md transition-colors ${
              hasSubmitted
                ? index === correctIndex
                  ? "bg-green-50 border border-green-200"
                  : selectedOption === index && selectedOption !== correctIndex
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

              {hasSubmitted && index === correctIndex && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </motion.div>
              )}

              {hasSubmitted && selectedOption === index && selectedOption !== correctIndex && (
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
                  <span>Resposta correta!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span>Resposta incorreta</span>
                </>
              )}
            </div>
            <p>{isCorrect ? "Muito bem! Você acertou a questão." : `A resposta correta é: ${options[correctIndex]}`}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

