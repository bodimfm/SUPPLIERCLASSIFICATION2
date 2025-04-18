"use client"

import { motion } from "framer-motion"

interface ProgressBarProps {
  currentPhase: number
  totalPhases: number
}

export default function ProgressBar({ currentPhase, totalPhases }: ProgressBarProps) {
  const progress = (currentPhase / totalPhases) * 100

  return (
    <div className="space-y-2">
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between">
        {Array.from({ length: totalPhases }, (_, i) => (
          <div
            key={i}
            className={`flex flex-col items-center ${i + 1 <= currentPhase ? "text-primary font-medium" : "text-muted-foreground"}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1
                ${
                  i + 1 < currentPhase
                    ? "bg-primary text-primary-foreground"
                    : i + 1 === currentPhase
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                      : "bg-slate-200 text-slate-500"
                }`}
            >
              {i + 1}
            </div>
            <span className="text-xs">{i + 1 === currentPhase ? "Atual" : ""}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

