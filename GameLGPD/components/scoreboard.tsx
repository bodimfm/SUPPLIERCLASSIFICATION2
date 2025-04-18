"use client"

import { motion } from "framer-motion"
import { Trophy } from "lucide-react"

interface ScoreboardProps {
  score: number
  maxScore: number
  className?: string
}

export default function Scoreboard({ score, maxScore, className = "" }: ScoreboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/90 backdrop-blur-sm shadow-md rounded-lg px-3 py-2 flex items-center gap-2 ${className}`}
    >
      <Trophy className="h-5 w-5 text-yellow-500" />
      <div>
        <p className="text-sm font-medium">
          Pontuação: <span className="text-primary font-bold">{score}</span>
          <span className="text-xs text-muted-foreground ml-1">/ {maxScore} pts</span>
        </p>
      </div>
    </motion.div>
  )
}

