"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, AlertTriangle } from "lucide-react"

interface Document {
  id: string
  name: string
  description: string
  required: boolean
}

interface RequiredDocumentsProps {
  supplierType: string
  supplierTypeDescription: string
  documents: Document[]
  nextStep: () => void
  prevStep: () => void
}

export default function RequiredDocuments({
  supplierType,
  supplierTypeDescription,
  documents,
  nextStep,
  prevStep,
}: RequiredDocumentsProps) {
  const requiredCount = documents.filter((doc) => doc.required).length
  const optionalCount = documents.length - requiredCount

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Requisitos Documentais</h2>
        <p className="text-gray-500">
          Com base na classificação do fornecedor, os seguintes documentos serão necessários.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Classificação do Fornecedor</h3>
              <p className="text-sm text-gray-500">
                Tipo {supplierType}: {supplierTypeDescription}
              </p>
            </div>
            <div
              className={`
              h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold
              ${
                supplierType === "A"
                  ? "bg-red-500"
                  : supplierType === "B"
                    ? "bg-orange-500"
                    : supplierType === "C"
                      ? "bg-yellow-500"
                      : "bg-green-500"
              }
            `}
            >
              {supplierType}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold">{requiredCount}</div>
              <div className="text-sm text-gray-500">Documentos Obrigatórios</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold">{optionalCount}</div>
              <div className="text-sm text-gray-500">Documentos Recomendados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Lista de Documentos Necessários</h3>

        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-start p-4 border rounded-lg">
              <div className="mr-4 mt-1">
                {doc.required ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium">{doc.name}</h4>
                  {doc.required && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">
                      Obrigatório
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Voltar
        </Button>
        <Button onClick={nextStep}>Próximo: Upload de Documentos</Button>
      </div>
    </div>
  )
}
