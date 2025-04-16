"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Link, AlertTriangle } from "lucide-react"
import { getRequiredDocuments } from "@/lib/document-requirements"

// Atualize a interface SubmissionConfirmationProps
interface SubmissionConfirmationProps {
  supplierName: string
  supplierType: string
  uploadedDocuments: string[]
  notProvidedDocuments: string[]
  isTechnology?: boolean
  nextStep: () => void
  supplierId?: string
}

// Atualize o componente para mostrar informações sobre documentos não fornecidos
export default function SubmissionConfirmation({
  supplierName,
  supplierType,
  uploadedDocuments,
  notProvidedDocuments,
  isTechnology = false,
  nextStep,
  supplierId,
}: SubmissionConfirmationProps) {
  // Obter a lista completa de documentos para referência
  const allDocuments = getRequiredDocuments(supplierType, isTechnology)

  // Mapear IDs de documentos não fornecidos para nomes
  const notProvidedNames = notProvidedDocuments.map((id) => {
    const doc = allDocuments.find((d) => d.id === id)
    return doc ? doc.name : id
  })

  // Construir URL do Supabase Storage para a pasta do fornecedor
  const storageBaseUrl =
    "https://project-ref.supabase.co/storage/v1/object/public/supplier-documents"
  const sanitizedSupplierName = supplierName
    .trim()
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Documentação Enviada com Sucesso</h2>
        <p className="text-gray-500 text-center max-w-md">
          A documentação do fornecedor <span className="font-medium">{supplierName}</span> foi enviada para análise pelo
          escritório terceirizado.
        </p>
        
        {supplierId && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm text-blue-800">
              ID do Fornecedor: <span className="font-mono font-medium">{supplierId}</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Dados salvos com sucesso no banco de dados.
            </p>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Resumo da Submissão</h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center">
                <p className="font-medium">Documentos Enviados: {uploadedDocuments.length}</p>
                <a
                  href={storageBaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm text-blue-600 flex items-center"
                >
                  <Link className="h-3 w-3 mr-1" />
                  Ver no Storage
                </a>
              </div>
              {uploadedDocuments.length > 0 && (
                <ul className="mt-2 text-sm text-gray-600 list-disc pl-5">
                  {uploadedDocuments.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              )}
            </div>

            {notProvidedNames.length > 0 && (
              <div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                  <p className="font-medium text-amber-700">Documentos Não Fornecidos: {notProvidedNames.length}</p>
                </div>
                <ul className="mt-2 text-sm text-amber-600 list-disc pl-5">
                  {notProvidedNames.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
                <p className="text-sm text-amber-600 mt-2">
                  O escritório poderá solicitar estes documentos durante a avaliação.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Próximos Passos</h3>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm font-medium">1</span>
              </div>
              <div>
                <p className="font-medium">Análise pelo Escritório</p>
                <p className="text-sm text-gray-500">O escritório terceirizado irá analisar a documentação enviada.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm font-medium">2</span>
              </div>
              <div>
                <p className="font-medium">Avaliação de Conformidade</p>
                <p className="text-sm text-gray-500">
                  Será realizada uma avaliação detalhada da conformidade com a LGPD.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm font-medium">3</span>
              </div>
              <div>
                <p className="font-medium">Recomendações Contratuais</p>
                <p className="text-sm text-gray-500">O escritório fornecerá recomendações para a contratação.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={nextStep}>Acessar Ambiente do Escritório</Button>
      </div>
    </div>
  )
}
