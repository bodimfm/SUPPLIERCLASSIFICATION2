"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function DatabaseSetupButton() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSetupDatabase = async () => {
    setIsLoading(true)

    try {
      // Criar tabela assessments
      const assessmentsResponse = await fetch("/api/create-assessments-table")
      const assessmentsData = await assessmentsResponse.json()

      if (assessmentsData.success) {
        toast({
          title: "Tabela assessments criada",
          description: "A tabela assessments foi criada com sucesso",
        })
      } else {
        toast({
          title: "Erro ao criar tabela assessments",
          description: "Ocorreu um erro ao criar a tabela assessments",
          variant: "destructive",
        })
      }

      // Criar tabela documents
      const documentsResponse = await fetch("/api/create-documents-table")
      const documentsData = await documentsResponse.json()

      if (documentsData.success) {
        toast({
          title: "Tabela documents criada",
          description: "A tabela documents foi criada com sucesso",
        })
      } else {
        toast({
          title: "Erro ao criar tabela documents",
          description: "Ocorreu um erro ao criar a tabela documents",
          variant: "destructive",
        })
      }

      // Criar bucket
      const bucketResponse = await fetch("/api/create-bucket")
      const bucketData = await bucketResponse.json()

      if (bucketData.success) {
        toast({
          title: "Bucket criado/verificado",
          description: "O bucket supplier-documents foi criado ou já existe",
        })
      } else {
        toast({
          title: "Erro ao criar bucket",
          description: "Ocorreu um erro ao criar o bucket supplier-documents",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao configurar banco de dados:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao configurar o banco de dados",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSetupDatabase} disabled={isLoading} className="bg-navy hover:bg-navy/80">
      {isLoading ? "Configurando..." : "Configurar Banco de Dados"}
    </Button>
  )
}
