"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { FormData } from "./supplier-risk-assessment"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle, FileText, X, AlertTriangle, CheckCircle, Upload, Link } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { uploadToSharePoint } from "@/lib/document-storage-service"
import { Progress } from "@/components/ui/progress"

interface Document {
  id: string
  name: string
  description: string
  required: boolean
}

interface DocumentUploadProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  requiredDocuments: Document[]
  submitToOffice: () => void
  prevStep: () => void
  isSubmitting?: boolean
}

// Tipo para rastrear informações de upload
interface UploadedFileInfo {
  name: string
  documentId?: string
  sharePointUrl?: string // Mantido por compatibilidade, mas na verdade é a URL do Supabase
  uploadDate: Date
  filePath?: string
  originalName?: string
}

export default function DocumentUpload({
  formData,
  updateFormData,
  requiredDocuments,
  submitToOffice,
  prevStep,
  isSubmitting = false,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([])
  const [notProvidedDocs, setNotProvidedDocs] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Initialize state on client-side only to prevent hydration mismatches
  useEffect(() => {
    setUploadedFiles(formData.uploadedDocuments?.map((name) => ({
      name,
      uploadDate: new Date(),
    })) || [])
    setNotProvidedDocs(formData.notProvidedDocuments || [])
    setMounted(true)
  }, [formData.uploadedDocuments, formData.notProvidedDocuments])

  // Lógica para determinar se o usuário pode prosseguir
  const requiredDocCount = requiredDocuments.filter((doc) => doc.required).length
  const uploadedCount = uploadedFiles.length
  const notProvidedCount = notProvidedDocs.length
  const isComplete = uploadedCount + notProvidedCount >= requiredDocCount

  // Adicione este log no início do componente, após a declaração das variáveis de estado
  console.log("Estado inicial do DocumentUpload:", {
    uploadedFiles,
    notProvidedDocs,
    requiredDocCount: requiredDocuments.filter((doc) => doc.required).length,
    isComplete,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrentFile(e.target.files[0])
      setUploadError(null)
    }
  }

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocumentId(docId)
  }

  const handleUpload = async () => {
    if (!currentFile || !formData.supplierName) return

    setUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      // Simular progresso de upload enquanto processa
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 300)

      // Fazer upload para o Supabase Storage (função mantida com nome legado para compatibilidade)
      const result = await uploadToSharePoint(currentFile, formData.supplierName)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Adicionar à lista de arquivos carregados
      const newUploadedFile: UploadedFileInfo = {
        name: currentFile.name,
        documentId: selectedDocumentId || undefined,
        sharePointUrl: result.webUrl,
        uploadDate: new Date(),
        filePath: result.path, // Caminho do arquivo no Supabase Storage
        originalName: result.originalName
      }

      const newUploadedFiles = [...uploadedFiles, newUploadedFile]
      setUploadedFiles(newUploadedFiles)

      // Atualizar o estado global com detalhes do arquivo
      updateFormData({
        uploadedDocuments: newUploadedFiles.map((file) => file.name),
        // Também podemos incluir metadados adicionais para uso posterior
        uploadedDocumentsMetadata: newUploadedFiles.map(file => ({
          name: file.name,
          documentId: file.documentId,
          url: file.sharePointUrl,
          path: file.filePath,
          uploadDate: file.uploadDate.toISOString()
        }))
      })

      // Se o arquivo foi associado a um documento específico e esse documento estava marcado como não fornecido,
      // remova-o da lista de não fornecidos
      if (selectedDocumentId && notProvidedDocs.includes(selectedDocumentId)) {
        const newNotProvided = notProvidedDocs.filter((id) => id !== selectedDocumentId)
        setNotProvidedDocs(newNotProvided)
        updateFormData({ notProvidedDocuments: newNotProvided })
      }

      // Limpar seleções
      setCurrentFile(null)
      setSelectedDocumentId(null)

      // Reset file input
      const fileInput = document.getElementById("document-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      // Aguardar um momento para mostrar 100% antes de resetar
      setTimeout(() => {
        setUploadProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError("Erro ao fazer upload do arquivo. Por favor, tente novamente.")
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (fileName: string) => {
    const newFiles = uploadedFiles.filter((file) => file.name !== fileName)
    setUploadedFiles(newFiles)
    updateFormData({ uploadedDocuments: newFiles.map((file) => file.name) })
  }

  // Função para marcar um documento como não fornecido
  const markAsNotProvided = (docId: string, docName: string) => {
    console.log(`Marcando documento como não fornecido: ${docId} - ${docName}`)

    // Verifique se o documento já foi carregado
    if (uploadedFiles.some((file) => file.documentId === docId)) {
      // Se já foi carregado, remova-o da lista de arquivos carregados
      const newFiles = uploadedFiles.filter((file) => file.documentId !== docId)
      setUploadedFiles(newFiles)
      updateFormData({ uploadedDocuments: newFiles.map((file) => file.name) })
    }

    // Adicione à lista de documentos não fornecidos
    const newNotProvided = [...notProvidedDocs, docId]
    setNotProvidedDocs(newNotProvided)
    updateFormData({ notProvidedDocuments: newNotProvided })

    console.log("Estado atualizado:", {
      notProvidedDocs: newNotProvided,
      uploadedFiles: uploadedFiles,
      isComplete:
        uploadedFiles.length + newNotProvided.length >= requiredDocuments.filter((doc) => doc.required).length,
    })
  }

  // Função para remover um documento da lista de não fornecidos
  const removeFromNotProvided = (docId: string) => {
    console.log(`Removendo documento da lista de não fornecidos: ${docId}`)

    const newNotProvided = notProvidedDocs.filter((id) => id !== docId)
    setNotProvidedDocs(newNotProvided)
    updateFormData({ notProvidedDocuments: newNotProvided })

    console.log("Estado atualizado após remoção:", {
      notProvidedDocs: newNotProvided,
      isComplete:
        uploadedFiles.length + newNotProvided.length >= requiredDocuments.filter((doc) => doc.required).length,
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Upload de Documentos</h2>
        <p className="text-gray-500">
          Faça o upload dos documentos necessários para avaliação pelo escritório. Os arquivos serão armazenados 
          com segurança no Supabase Storage.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Status do Upload</h3>
              <p className="text-sm text-gray-500">
                {uploadedCount} de {requiredDocCount} documentos obrigatórios carregados
              </p>
              {notProvidedCount > 0 && (
                <p className="text-sm text-amber-500">{notProvidedCount} documentos marcados como não fornecidos</p>
              )}
            </div>
            <div
              className={`
              h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold
              ${isComplete ? "bg-green-500" : "bg-amber-500"}
            `}
            >
              {uploadedCount + notProvidedCount}/{requiredDocCount}
            </div>
          </div>

          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${isComplete ? "bg-green-500" : "bg-amber-500"}`}
              style={{ width: `${Math.min(100, ((uploadedCount + notProvidedCount) / requiredDocCount) * 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="grid gap-4">
          <Label htmlFor="document-select">Selecione o tipo de documento (opcional)</Label>
          {mounted && (
            <select
              id="document-select"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedDocumentId || ""}
              onChange={(e) => handleDocumentSelect(e.target.value)}
              disabled={uploading}
              suppressHydrationWarning
            >
              <option value="">-- Selecione um tipo de documento --</option>
              {requiredDocuments.map((doc) => {
                const isUploaded = uploadedFiles.some((file) => file.documentId === doc.id)
                const isNotProvided = notProvidedDocs.includes(doc.id)

                if (!isUploaded && !isNotProvided) {
                  return (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} {doc.required ? "(Obrigatório)" : "(Recomendado)"}
                    </option>
                  )
                }
                return null
              })}
            </select>
          )}

          <Label htmlFor="document-upload">Selecione um arquivo para upload</Label>
          <div className="flex gap-2">
            <Input id="document-upload" type="file" onChange={handleFileChange} disabled={uploading || isSubmitting} suppressHydrationWarning />
            <Button 
              onClick={handleUpload} 
              disabled={!currentFile || uploading || isSubmitting || !formData.supplierName}
              suppressHydrationWarning
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso do upload</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-500">Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (máx. 10MB)</div>

          <Alert className="bg-blue-50 border-blue-200">
            <Link className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Armazenamento Seguro</AlertTitle>
            <AlertDescription className="text-blue-700">
              Os arquivos serão armazenados com segurança no Supabase Storage, com organização por fornecedor
            </AlertDescription>
          </Alert>
        </div>

        <h4 className="font-medium">Documentos Requeridos</h4>
        <div className="space-y-2">
          {requiredDocuments
            .filter((doc) => doc.required)
            .map((doc) => {
              const uploadedFile = uploadedFiles.find((file) => file.documentId === doc.id)
              const isUploaded = !!uploadedFile
              const isNotProvided = notProvidedDocs.includes(doc.id)

              return (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isUploaded
                      ? "bg-green-50 border border-green-100"
                      : isNotProvided
                        ? "bg-amber-50 border border-amber-100"
                        : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center">
                    {isUploaded ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : isNotProvided ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <div>
                      <span>{doc.name}</span>
                      {isUploaded && uploadedFile.sharePointUrl && (
                        <div className="text-xs text-green-600 mt-1">
                          <a
                            href={uploadedFile.sharePointUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <Link className="h-3 w-3 mr-1" />
                            Ver arquivo
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isUploaded && !isNotProvided && (
                      <Button variant="outline" size="sm" onClick={() => markAsNotProvided(doc.id, doc.name)}>
                        Marcar como não fornecido
                      </Button>
                    )}
                    {isNotProvided && (
                      <Button variant="outline" size="sm" onClick={() => removeFromNotProvided(doc.id)}>
                        Remover marcação
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {notProvidedDocs.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200 mt-4">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Atenção</AlertTitle>
          <AlertDescription className="text-amber-700">
            Você marcou {notProvidedDocs.length} documento(s) como não fornecido(s). Isso pode afetar a avaliação de
            risco do fornecedor pelo escritório. Você ainda poderá prosseguir com o processo.
          </AlertDescription>
        </Alert>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Arquivos enviados</h4>
          <div className="space-y-2">
            {uploadedFiles.map((fileInfo, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <span>{fileInfo.name}</span>
                    {fileInfo.documentId && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({requiredDocuments.find((d) => d.id === fileInfo.documentId)?.name || "Documento"})
                      </span>
                    )}
                    {fileInfo.sharePointUrl && (
                      <div className="text-xs text-blue-600 mt-1">
                        <a
                          href={fileInfo.sharePointUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <Link className="h-3 w-3 mr-1" />
                          Ver arquivo
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(fileInfo.name)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={isSubmitting} suppressHydrationWarning>
          Voltar
        </Button>
        <Button 
          onClick={submitToOffice} 
          disabled={!isComplete || isSubmitting}
          suppressHydrationWarning
        >
          {isSubmitting ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar para Análise do Escritório"
          )}
        </Button>
      </div>
    </div>
  )
}
