"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronRight } from "lucide-react"

interface PhaseNavigationProps {
  currentPhase?: number
  totalPhases?: number
  showHome?: boolean
  className?: string
}

export default function PhaseNavigation({
  currentPhase = 1,
  totalPhases = 4,
  showHome = true,
  className = "",
}: PhaseNavigationProps) {
  const [completedPhases, setCompletedPhases] = useState<number[]>([])
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const testMode = searchParams?.get("testMode") === "true"

  useEffect(() => {
    // Carregar fases completadas do localStorage
    const savedCompletedPhases = localStorage.getItem("completedPhases")
    if (savedCompletedPhases) {
      setCompletedPhases(JSON.parse(savedCompletedPhases))
    }
  }, [])

  useEffect(() => {
    // Marcar fase atual como completa quando o usuário navegar para a próxima fase
    if (currentPhase > 0 && !completedPhases.includes(currentPhase)) {
      const newCompletedPhases = [...completedPhases, currentPhase]
      setCompletedPhases(newCompletedPhases)
      localStorage.setItem("completedPhases", JSON.stringify(newCompletedPhases))
    }
  }, [currentPhase, completedPhases])

  const isPhaseAccessible = (phase: number) => {
    // Em modo de teste, todas as fases são acessíveis
    if (testMode) return true

    // Fase 1 é sempre acessível
    if (phase === 1) return true

    // Outras fases são acessíveis se a fase anterior foi concluída
    return completedPhases.includes(phase - 1)
  }

  const phases = Array.from({ length: totalPhases }, (_, i) => i + 1)

  return (
    <nav className={`flex items-center space-x-1 ${className}`}>
      {showHome && (
        <Link
          href="/"
          className={`px-2 py-1 text-sm rounded-md transition-colors ${
            pathname === "/" ? "bg-primary text-white" : "hover:bg-gray-100"
          }`}
        >
          Início
        </Link>
      )}

      {phases.map((phase) => (
        <div key={phase} className="flex items-center">
          {phase > 1 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          <Link
            href={isPhaseAccessible(phase) ? `/fase${phase}` : "#"}
            className={`px-2 py-1 text-sm rounded-md transition-colors ${
              pathname === `/fase${phase}`
                ? "bg-primary text-white"
                : isPhaseAccessible(phase)
                  ? "hover:bg-gray-100"
                  : "opacity-50 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (!isPhaseAccessible(phase)) {
                e.preventDefault()
              }
            }}
          >
            Fase {phase}
          </Link>
        </div>
      ))}

      {testMode && <div className="ml-4 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md">Modo de Teste</div>}
    </nav>
  )
}

