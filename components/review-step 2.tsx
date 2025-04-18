"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { BadgeCheck, AlertTriangle, Info, FileCheck, FileWarning } from "lucide-react"
import { calculateSupplierType, getRiskLevel } from "@/lib/risk-assessment"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ReviewStepProps {
  formData: any
  uploadedDocuments: string[]
  notProvidedDocuments: string[]
  prevStep: () => void
  submitToDPO: () => void
  isSubmitting?: boolean
}

export default function ReviewStep({
  formData,
  uploadedDocuments,
  notProvidedDocuments,
  prevStep,
  submitToDPO,
  isSubmitting = false,
}: ReviewStepProps) {
  // Calcular tipo de fornecedor e nível de risco
  const supplierTypeResult = calculateSupplierType(
    formData.dataVolume || "medium",
    formData.dataSensitivity || "regular"
  )
  const riskLevel = getRiskLevel(supplierTypeResult.code)

  // Verificar se todos os documentos obrigatórios foram fornecidos
  const hasAllRequiredDocs = notProvidedDocuments.length === 0
  
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Revisar e Enviar</h2>
        <p className="text-gray-500">
          Revise todas as informações antes de enviar ao DPO para análise final.
        </p>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl flex items-center">
            <BadgeCheck className="mr-2 h-5 w-5 text-blue-600" />
            Resumo da Classificação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 divide-y">
          <div className="py-4 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-gray-700">Dados do Fornecedor</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-500">Nome:</span>
                  <span className="font-medium">{formData.supplierName || "Não informado"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">CNPJ:</span>
                  <span className="font-medium">{formData.taxId || "Não informado"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Tecnologia:</span>
                  <span className="font-medium">{formData.isTechnology ? "Sim" : "Não"}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">Tipo de Dados e Volume</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-500">Sensibilidade:</span>
                  <span className="font-medium capitalize">{formData.dataSensitivity || "Regular"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Volume:</span>
                  <span className="font-medium capitalize">{formData.dataVolume || "Médio"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Tipo de Contrato:</span>
                  <span className="font-medium capitalize">
                    {formData.contractType === "continuous" ? "Contínuo" : "Pontual"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="py-4">
            <h3 className="font-medium text-gray-700">Descrição do Serviço</h3>
            <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
              {formData.serviceDescription || "Não informado"}
            </p>
          </div>
          
          <div className="py-4">
            <div className="flex gap-2 items-center">
              <h3 className="font-medium text-gray-700">Classificação de Risco</h3>
              
              {riskLevel === "high" && (
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
                  ALTO RISCO
                </span>
              )}
              
              {riskLevel === "medium" && (
                <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 font-medium">
                  MÉDIO RISCO
                </span>
              )}
              
              {riskLevel === "low" && (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                  BAIXO RISCO
                </span>
              )}
            </div>
            
            <div className="mt-3 p-3 bg-gray-50 rounded-md border text-sm">
              <p className="font-medium">Tipo de Fornecedor: {supplierTypeResult.code}</p>
              <p className="text-gray-600 mt-1">{supplierTypeResult.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl flex items-center">
            <FileCheck className="mr-2 h-5 w-5 text-blue-600" />
            Documentação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 flex items-center">
                Documentos Enviados 
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                  {uploadedDocuments.length} {uploadedDocuments.length === 1 ? "documento" : "documentos"}
                </span>
              </h3>
              
              {uploadedDocuments.length > 0 ? (
                <ScrollArea className="h-32 mt-2 rounded-md border p-2">
                  <ul className="space-y-1 text-sm">
                    {uploadedDocuments.map((doc, index) => (
                      <li key={index} className="flex items-center">
                        <BadgeCheck className="h-4 w-4 text-green-500 mr-2" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <p className="text-sm text-gray-500 mt-2">Nenhum documento enviado</p>
              )}
            </div>
            
            {notProvidedDocuments.length > 0 && (
              <div>
                <h3 className="font-medium text-amber-700 flex items-center">
                  <FileWarning className="h-4 w-4 mr-2" />
                  Documentos Não Fornecidos 
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                    {notProvidedDocuments.length} {notProvidedDocuments.length === 1 ? "documento" : "documentos"}
                  </span>
                </h3>
                <ScrollArea className="h-24 mt-2 rounded-md border border-amber-100 p-2 bg-amber-50">
                  <ul className="space-y-1 text-sm text-amber-700">
                    {notProvidedDocuments.map((doc, index) => (
                      <li key={index} className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
                <p className="text-xs text-amber-600 mt-1">
                  Essa ausência de documentos pode impactar a avaliação de risco.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-700" />
        <AlertTitle className="text-blue-800">Próximos Passos</AlertTitle>
        <AlertDescription className="text-blue-700">
          Após o envio, o DPO (Data Protection Officer) realizará uma análise completa e poderá 
          solicitar informações adicionais ou recomendar modificações contratuais.
        </AlertDescription>
      </Alert>
      
      {!hasAllRequiredDocs && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Documentação Incompleta</AlertTitle>
          <AlertDescription className="text-amber-700">
            Alguns documentos obrigatórios não foram fornecidos. Você ainda pode prosseguir,
            mas isso pode atrasar a avaliação ou resultar em uma classificação de risco mais alta.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={isSubmitting}
        >
          Voltar
        </Button>
        <Button 
          onClick={submitToDPO} 
          disabled={isSubmitting}
          className={riskLevel === "high" ? "bg-red-600 hover:bg-red-700" : ""}
        >
          {isSubmitting ? "Enviando..." : "Enviar para Análise do DPO"}
        </Button>
      </div>
    </div>
  )
}