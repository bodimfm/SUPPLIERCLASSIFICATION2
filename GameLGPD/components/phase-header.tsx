"use client"

import type React from "react"

import { motion } from "framer-motion"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PhaseHeaderProps {
  phase: number
  title: string
  description: string
  icon?: React.ReactNode
}

export default function PhaseHeader({ phase, title, description, icon }: PhaseHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex items-center justify-center min-w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-md"
        >
          {icon || phase}
        </motion.div>
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <span className="text-primary font-bold">Fase {phase}:</span> {title}
            </CardTitle>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <CardDescription>{description}</CardDescription>
          </motion.div>
        </div>
      </div>
    </CardHeader>
  )
}

