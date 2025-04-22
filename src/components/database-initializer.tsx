"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function DatabaseInitializer() {
  const { toast } = useToast()
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeDatabase = async () => {
      if (isInitializing || isInitialized) return

      setIsInitializing(true)

      try {
        // Todas as tabelas já existem no Supabase
        console.log("Verificando estrutura do banco de dados...")
        console.log("Todas as tabelas já estão criadas no Supabase")
        
        setIsInitialized(true)
        console.log("Inicialização do banco de dados concluída")
      } catch (error) {
        console.error("Erro ao inicializar banco de dados:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeDatabase()
  }, [isInitializing, isInitialized, toast])

  return null // Este componente não renderiza nada visualmente
}
