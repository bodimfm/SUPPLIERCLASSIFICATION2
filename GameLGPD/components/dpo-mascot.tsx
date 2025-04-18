"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { motion } from "framer-motion"

interface DPOMascotProps {
  message: string
  type?: "neutral" | "success" | "error" | "tip"
  autoHide?: boolean
  className?: string
}

export default function DPOMascot({ message, type = "neutral", autoHide = false, className }: DPOMascotProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [autoHide])

  if (!visible) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={cn("fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2")}
    >
      {/* Pop-up de mensagem removido conforme solicitado */}

      <motion.div
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
        transition={{ duration: 0.5 }}
        className="relative h-20 w-20 cursor-pointer"
      >
        <Image
          src="/images/mascote-lgpd.png"
          alt="DPO Mascote"
          width={80}
          height={80}
          className="drop-shadow-lg"
          onError={(e) => {
            // Fallback para quando a imagem falhar
            e.currentTarget.style.display = "none"
            const parent = e.currentTarget.parentElement
            if (parent) {
              parent.classList.add("bg-primary/10", "rounded-full", "flex", "items-center", "justify-center")
              parent.innerHTML = '<div class="text-primary font-bold">DPO</div>'
            }
          }}
        />
      </motion.div>
    </motion.div>
  )
}

