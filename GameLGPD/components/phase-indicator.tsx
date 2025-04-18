"use client"

import { motion } from "framer-motion"

interface PhaseIndicatorProps {
  currentPhase: number
  totalPhases: number
  className?: string
}

export default function PhaseIndicator({ currentPhase, totalPhases, className = "" }: PhaseIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full ${className}`}
    >
      <span className="font-bold text-lg">{currentPhase}</span>
      <span className="text-xs">/</span>
      <span className="text-sm">{totalPhases}</span>
    </motion.div>
  )
}

