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
        // Verificar se as tabelas necessárias existem
        console.log("Verificando estrutura do banco de dados...")

        // Criar tabela assessments e checklist_items
        console.log("Criando tabela assessments e checklist_items...")
        try {
          const assessmentsResponse = await fetch("/api/create-assessments-table")
          const assessmentsData = await assessmentsResponse.json()

          if (!assessmentsData.success) {
            console.error("Erro ao criar tabela assessments:", assessmentsData.error)
          } else {
            console.log("Tabela assessments criada ou já existente")
          }
        } catch (error) {
          console.error("Erro ao criar tabela assessments:", error)
        }

        // Criar tabela documents
        console.log("Criando tabela documents...")
        try {
          const documentsResponse = await fetch("/api/create-documents-table")
          const documentsData = await documentsResponse.json()

          if (!documentsData.success) {
            console.error("Erro ao criar tabela documents:", documentsData.error)
          } else {
            console.log("Tabela documents criada ou já existente")
          }
        } catch (error) {
          console.error("Erro ao criar tabela documents:", error)
        }

        // Verificar se o bucket supplier-documents existe
        console.log("Verificando bucket supplier-documents...")
        try {
          const bucketResponse = await fetch("/api/create-bucket")
          const bucketData = await bucketResponse.json()

          if (!bucketData.success) {
            console.error("Erro ao verificar/criar bucket:", bucketData.error)
          } else {
            console.log("Bucket supplier-documents verificado/criado")
          }
        } catch (error) {
          console.error("Erro ao verificar bucket:", error)
        }

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
