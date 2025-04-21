"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  getSupplierById,
  getDocumentsBySupplier,
  getAssessmentsBySupplier,
  type Supplier,
  type Document,
  type Assessment,
} from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileText, Download, Calendar, User, FileCheck, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { calculateSupplierType, riskLevelColor } from "@/lib/risk-assessment"

export default function SupplierDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        if (!params.id) return

        const supplierId = params.id as string
        const supplierData = await getSupplierById(supplierId)
        setSupplier(supplierData)

        try {
          const documentsData = await getDocumentsBySupplier(supplierId)
          setDocuments(documentsData)
        } catch (docError) {
          console.error("Erro ao buscar documentos:", docError)
          // Em caso de erro, definir array vazio
          setDocuments([])
        }

        try {
          const assessmentsData = await getAssessmentsBySupplier(supplierId)
          setAssessments(assessmentsData)
        } catch (assessError) {
          console.error("Erro ao buscar avaliações:", assessError)
          // Não exibir toast para erro de avaliações, apenas definir array vazio
          setAssessments([])
        }
      } catch (error) {
        console.error("Erro ao buscar dados do fornecedor:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os detalhes do fornecedor.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSupplierData()
  }, [params.id, toast])

  // Função para obter o ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={18} className="text-green-500" />
      case "rejected":
        return <AlertCircle size={18} className="text-red-500" />
      case "in_review":
        return <Clock size={18} className="text-orange-500" />
      default:
        return <Clock size={18} className="text-gray-500" />
    }
  }

  // Função para obter o texto de status
  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprovado"
      case "rejected":
        return "Rejeitado"
      case "in_review":
        return "Em Revisão"
      default:
        return "Pendente"
    }
  }

  // Função para obter a cor de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "in_review":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !supplier) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('supplierId', supplier.id)
      formData.append('assessmentId', '')
      formData.append('uploadedBy', supplier.internal_responsible || 'unknown')

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Falha ao enviar documento')
      }
      const refreshed = await getDocumentsBySupplier(supplier.id)
      setDocuments(refreshed)
      setSelectedFile(null)
      toast({ title: 'Documento enviado', description: 'Upload realizado com sucesso.', variant: 'default' })
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error)
      toast({ title: 'Erro no upload', description: error.message || 'Falha ao enviar documento.', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Carregando dados do fornecedor...</span>
        </div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Fornecedor não encontrado</h3>
          <p className="mt-1 text-gray-500">O fornecedor solicitado não existe ou foi removido.</p>
          <div className="mt-6">
            <Link href="/suppliers">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Voltar para a lista de fornecedores
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Use default values for potentially undefined properties
  const dataVolume = supplier.data_volume || "low"
  const dataSensitivity =
    supplier.data_type === "sensitive" ? "sensitive" : supplier.data_type === "common" ? "regular" : "non-sensitive"

  const { code, description } = calculateSupplierType(
    dataVolume as "low" | "medium" | "high" | "massive",
    dataSensitivity as "non-sensitive" | "regular" | "sensitive",
  )

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <Link href="/suppliers">
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={18} className="mr-1" />
            Voltar para a lista de fornecedores
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{supplier.name || "Sem nome"}</h1>
              <p className="text-sm text-gray-500">ID: {supplier.id}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
                  supplier.status || "pending",
                )}`}
              >
                {getStatusIcon(supplier.status || "pending")}
                <span className="ml-1">{getStatusText(supplier.status || "pending")}</span>
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium mb-4">Informações Gerais</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Descrição do Serviço</p>
                  <p className="text-sm">{supplier.service_description || "Sem descrição"}</p>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <p className="text-sm">
                    Cadastrado em: {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="flex items-center">
                  <User size={16} className="text-gray-400 mr-2" />
                  <p className="text-sm">Responsável: {supplier.internal_responsible || "Não especificado"}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium mb-4">Classificação de Risco</h2>
              <div className="flex items-center mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    riskLevelColor[(supplier.supplier_type as "A" | "B" | "C" | "D") || "D"]
                  }`}
                >
                  {supplier.supplier_type || "D"}
                </div>
                <div className="ml-3">
                  <p className="font-medium">Tipo {supplier.supplier_type || "D"}</p>
                  <p className="text-sm">{description}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Volume de Dados:</p>
                  <p className="text-sm font-medium">
                    {dataVolume === "low"
                      ? "Baixo"
                      : dataVolume === "medium"
                        ? "Médio"
                        : dataVolume === "high"
                          ? "Alto"
                          : "Massivo"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Sensibilidade dos Dados:</p>
                  <p className="text-sm font-medium">
                    {dataSensitivity === "non-sensitive"
                      ? "Não-sensíveis"
                      : dataSensitivity === "regular"
                        ? "Regulares"
                        : "Sensíveis"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Tipo de Contrato:</p>
                  <p className="text-sm font-medium">
                    {supplier.contract_type === "punctual" ? "Pontual" : "Continuado"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Fornecedor de TI/SaaS:</p>
                  <p className="text-sm font-medium">{supplier.is_technology ? "Sim" : "Não"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium mb-4">Documentos</h2>
            <div className="mb-4 flex items-center">
              <input
                type="file"
                aria-label="Selecione um documento"
                onChange={handleFileChange}
                disabled={uploading}
                className="border p-1" />
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Enviando...' : 'Enviar Documento'}
              </button>
            </div>
            {documents.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FileText className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Nenhum documento encontrado para este fornecedor.</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <li key={doc.id} className="p-4 hover:bg-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText size={20} className="text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium">{doc.name || "Documento sem nome"}</p>
                            <p className="text-xs text-gray-500">
                              Enviado em: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                        </div>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Download size={16} className="mr-1" />
                          <span className="text-sm">Download</span>
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium mb-4">Avaliações</h2>
            {assessments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FileCheck className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Nenhuma avaliação encontrada para este fornecedor.</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <li key={assessment.id} className="p-4 hover:bg-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileCheck size={20} className="text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium">
                              Avaliação #{assessment.id ? assessment.id.substring(0, 8) : "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Criada em:{" "}
                              {assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            assessment.status || "draft",
                          )}`}
                        >
                          {assessment.status === "draft"
                            ? "Rascunho"
                            : assessment.status === "submitted"
                              ? "Enviada"
                              : assessment.status === "in_review"
                                ? "Em Revisão"
                                : "Concluída"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
