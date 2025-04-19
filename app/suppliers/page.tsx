"use client"

import { useState, useEffect, useId } from "react"
import Link from "next/link"
import { getSuppliers, type Supplier } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { FileText, Plus, Search, Filter, ArrowUpDown, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

export default function SuppliersPage() {
  // Usar useId para gerar IDs estáveis entre servidor e cliente
  const searchInputId = useId()
  const statusFilterId = useId()
  const buttonId = useId()
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Supplier>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const { toast } = useToast()

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getSuppliers()
        setSuppliers(data)
      } catch (error) {
        console.error("Erro ao buscar fornecedores:", error)
        toast({
          title: "Erro ao carregar fornecedores",
          description: "Não foi possível carregar a lista de fornecedores.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [toast])

  // Função para filtrar fornecedores
  const filteredSuppliers = suppliers.filter((supplier) => {
    // Add null checks before calling toLowerCase()
    const supplierName = supplier.name || ""
    const serviceDescription = supplier.service_description || ""

    const matchesSearch =
      supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceDescription.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter ? supplier.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  // Função para ordenar fornecedores
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    // Add null checks for sorting as well
    const valueA = a[sortField] ?? ""
    const valueB = b[sortField] ?? ""

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  // Função para alternar a direção da ordenação
  const toggleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Função para obter o ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} className="text-green-500" />
      case "rejected":
        return <AlertCircle size={16} className="text-red-500" />
      case "in_review":
        return <Clock size={16} className="text-orange-500" />
      default:
        return <Clock size={16} className="text-gray-500" />
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

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Fornecedores</h1>
          <Link href="/supplier-risk-assessment">
            <button
              id={buttonId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
            >
              <Plus size={18} className="mr-2" />
              Novo Fornecedor
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                id={searchInputId}
                type="text"
                placeholder="Buscar fornecedores..."
                className="w-full pl-10 pr-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  id={statusFilterId}
                  aria-label="Filtrar status"
                  className="appearance-none pl-10 pr-8 py-2 border rounded-md bg-white"
                  value={statusFilter || ""}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                >
                  <option value="">Todos os status</option>
                  <option value="pending">Pendente</option>
                  <option value="in_review">Em Revisão</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-500">Carregando fornecedores...</span>
            </div>
          ) : sortedSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum fornecedor encontrado</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || statusFilter
                  ? "Nenhum fornecedor corresponde aos filtros aplicados."
                  : "Comece adicionando um novo fornecedor."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-48"
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center">
                        Nome do Fornecedor
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("supplier_type")}
                    >
                      <div className="flex items-center">
                        Tipo
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("created_at")}
                    >
                      <div className="flex items-center">
                        Data
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedSuppliers.map((supplier) => (
                    <motion.tr
                      key={supplier.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{supplier.name || "Sem nome"}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[150px] cursor-help">
                              {supplier.service_description || "Sem descrição"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Tipo {supplier.supplier_type || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            supplier.status || "pending",
                          )}`}
                        >
                          {getStatusIcon(supplier.status || "pending")}
                          <span className="ml-1">{getStatusText(supplier.status || "pending")}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/suppliers/${supplier.id}`}>
                          <span className="text-blue-600 hover:text-blue-900 cursor-pointer">Detalhes</span>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
