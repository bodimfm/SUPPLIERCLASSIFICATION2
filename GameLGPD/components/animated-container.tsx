"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { ReactNode } from "react"

interface AnimatedContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function AnimatedContainer({ children, className = "", delay = 0 }: AnimatedContainerProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

