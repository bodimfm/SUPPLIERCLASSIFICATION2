"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useSound } from "./sound-provider"

interface PhaseTransitionProps {
  nextPhase: string
  score: number
  delay?: number
}

export default function PhaseTransition({ nextPhase, score, delay = 2000 }: PhaseTransitionProps) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const { playSound } = useSound()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true)
      playSound("transition")
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, playSound])

  const handleNextPhase = () => {
    // First animate out
    setShow(false)
    playSound("click")

    // Then navigate after animation completes
    setTimeout(() => {
      playSound("transition")
      router.push(`${nextPhase}?score=${score}`)
    }, 500)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button onClick={handleNextPhase} size="lg" className="shadow-lg gap-2">
            <span>Próxima Fase</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

