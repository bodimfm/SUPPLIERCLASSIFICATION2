"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileText } from "lucide-react"

export default function SuppliersList() {
  const [searchTerm, setSearchTerm] = useState("")

  // Dados simulados de fornecedores
  const suppliers = [
    {
      id: "1",
      name: "Acme Corporation",
      type: "B",
      status: "approved",
      registrationDate: "15/01/2023",
      documents: 5,
    },
    {
      id: "2",
      name: "Tech Solutions Inc",
      type: "A",
      status: "approved",
      registrationDate: "20/02/2023",
      documents: 7,
    },
    {
      id: "3",
      name: "Data Services Ltd",
      type: "C",
      status: "pending",
      registrationDate: "10/03/2023",
      documents: 3,
    },
    {
      id: "4",
      name: "Cloud Systems",
      type: "B",
      status: "approved",
      registrationDate: "05/04/2023",
      documents: 6,
    },
    {
      id: "5",
      name: "Security Partners",
      type: "A",
      status: "approved",
      registrationDate: "12/05/2023",
      documents: 8,
    },
  ]

  // Filtrar fornecedores com base no termo de busca
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Função para obter o badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aprovado</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pendente</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejeitado</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  }

  // Função para obter o badge de tipo
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "A":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Tipo A</Badge>
      case "B":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Tipo B</Badge>
      case "C":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Tipo C</Badge>
      case "D":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Tipo D</Badge>
      default:
        return <Badge>Tipo {type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Fornecedores</h2>
          <p className="text-gray-500">Visualize e gerencie todos os fornecedores cadastrados no sistema.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Search className="h-4 w-4 mr-2 text-gray-400" />
              <Input
                placeholder="Buscar fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-gray-100 text-gray-800">Total: {suppliers.length}</Badge>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Fornecedor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Registro</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      Nenhum fornecedor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{getTypeBadge(supplier.type)}</TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell>{supplier.registrationDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{supplier.documents}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Visualizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
