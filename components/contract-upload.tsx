"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle, FileSpreadsheet, Upload, Info, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface ContractUploadProps {
  onFileProcessed: (file: File) => void
  isProcessing?: boolean
}

export default function ContractUpload({ onFileProcessed, isProcessing = false }: ContractUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Resetar o estado quando a análise externa terminar
  useEffect(() => {
    if (!isProcessing && uploading) {
      // Se estávamos fazendo upload mas o processamento externo terminou
      setUploading(false)
      setUploadProgress(0)
      setSelectedFile(null)
    }
  }, [isProcessing, uploading])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Verificar tipo de arquivo
      if (
        file.type === "text/csv" ||
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        setSelectedFile(file)
        setError(null)
      } else {
        setSelectedFile(null)
        setError("Formato de arquivo não suportado. Por favor, envie um arquivo CSV ou Excel (.xlsx, .xls).")
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 200)

      // Simular processamento
      await new Promise((resolve) => setTimeout(resolve, 1500))

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Notificar que o arquivo foi processado
      onFileProcessed(selectedFile)

      // Aguardar um momento para mostrar 100% antes de resetar
      // Não redefina o estado aqui pois o componente pai lidará com isso
      setTimeout(() => {
        if (!isProcessing) {
          // Apenas limpar o progresso se o componente pai não estiver em processamento
          setUploading(false)
          setUploadProgress(0)
        }
      }, 500)
    } catch (err) {
      console.error("Erro ao processar arquivo:", err)
      setError("Ocorreu um erro ao processar o arquivo. Por favor, tente novamente.")
      setUploading(false)
    }
  }

  const isDisabled = isProcessing || uploading;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Upload de Contratos</h3>
            <p className="text-sm text-gray-500">
              Faça upload de uma planilha contendo a lista de fornecedores contratados e as datas dos contratos.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Formato esperado</AlertTitle>
            <AlertDescription className="text-blue-700">
              A planilha deve conter duas colunas: "supplierName" (nome do fornecedor) e "contractDate" (data do
              contrato no formato YYYY-MM-DD).
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="contract-file">Selecione a planilha de contratos</Label>
            <div className="flex gap-2">
              <Input
                id="contract-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={isDisabled}
              />
              <Button onClick={handleUpload} disabled={!selectedFile || isDisabled}>
                {uploading || isProcessing ? (
                  <>
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isProcessing ? "Analisando..." : "Processando..."}
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Processar
                  </>
                )}
              </Button>
            </div>
          </div>

          {(uploadProgress > 0 || isProcessing) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{isProcessing ? "Analisando..." : `${Math.round(uploadProgress)}%`}</span>
              </div>
              <Progress value={isProcessing ? 100 : uploadProgress} className="h-2" />
            </div>
          )}

          {selectedFile && !isDisabled && (
            <div className="text-sm text-gray-500">
              Arquivo selecionado: <span className="font-medium">{selectedFile.name}</span> (
              {(selectedFile.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
