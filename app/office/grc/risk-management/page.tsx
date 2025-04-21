"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertTriangle, 
  FileText, 
  Plus, 
  Search, 
  Sliders, 
  Filter, 
  ArrowUpDown,
  BarChart3,
  Edit,
  Trash2
} from "lucide-react"
import Link from "next/link"

// Dados de exemplo para os riscos
const risksData = [
  {
    id: "RISK-001",
    name: "Vazamento de dados por terceiros",
    category: "Segurança da Informação",
    description: "Possibilidade de fornecedores terem acesso indevido a dados sensíveis e vazarem informações",
    probability: "Média",
    impact: "Alto",
    level: "Alto",
    status: "Ativo",
    controls: 3,
    standard: "ISO 27036",
    lastUpdated: "15/04/2025",
    suppliers: ["Acme Tecnologia", "TechData Solutions"]
  },
  {
    id: "RISK-002",
    name: "Não conformidade com LGPD",
    category: "Conformidade Legal",
    description: "Risco de não cumprimento de requisitos da Lei Geral de Proteção de Dados por parte dos fornecedores",
    probability: "Alta",
    impact: "Alto",
    level: "Crítico",
    status: "Ativo",
    controls: 5,
    standard: "LGPD",
    lastUpdated: "18/04/2025",
    suppliers: ["DataProcess", "InfoTech Serviços"]
  },
  {
    id: "RISK-003",
    name: "Interrupção de serviço crítico",
    category: "Operacional",
    description: "Possibilidade de interrupção de serviços essenciais prestados por fornecedores",
    probability: "Baixa",
    impact: "Alto",
    level: "Médio",
    status: "Mitigado",
    controls: 4,
    standard: "ISO 31000",
    lastUpdated: "10/04/2025",
    suppliers: ["CloudServices BR", "Infratech"]
  },
  {
    id: "RISK-004",
    name: "Acesso não autorizado a sistemas",
    category: "Segurança da Informação",
    description: "Possibilidade de acesso não autorizado a sistemas internos por meio de credenciais de fornecedores",
    probability: "Média",
    impact: "Alto",
    level: "Alto",
    status: "Ativo",
    controls: 6,
    standard: "ISO 27036",
    lastUpdated: "12/04/2025",
    suppliers: ["Acesso Tecnologia", "ID Solutions"]
  },
  {
    id: "RISK-005",
    name: "Dependência excessiva de fornecedor",
    category: "Estratégico",
    description: "Dependência crítica de fornecedor único para operações essenciais",
    probability: "Alta",
    impact: "Médio",
    level: "Alto",
    status: "Em revisão",
    controls: 2,
    standard: "ISO 31000",
    lastUpdated: "19/04/2025",
    suppliers: ["CloudServices BR"]
  },
];

// Componente que exibe uma badge com a cor correspondente ao nível de risco
function RiskLevelBadge({ level }: { level: string }) {
  const getVariant = () => {
    switch (level.toLowerCase()) {
      case 'baixo':
        return 'outline';
      case 'médio':
        return 'secondary';
      case 'alto':
        return 'destructive';
      case 'crítico':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  return <Badge variant={getVariant() as any}>{level}</Badge>;
}

// Componente que exibe uma badge com a cor correspondente ao status do risco
function StatusBadge({ status }: { status: string }) {
  const getVariant = () => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'default';
      case 'mitigado':
        return 'secondary';
      case 'em revisão':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  return <Badge variant={getVariant() as any}>{status}</Badge>;
}

// Interface para o tipo de avaliação de risco
interface RiskAssessment {
  id: string;
  name: string;
  category: string;
  description: string;
  probability: string;
  impact: string;
  level: string;
  status: string;
  controls: number;
  standard: string;
  lastUpdated: string;
  suppliers?: string[];
}

export default function RiskManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddRiskOpen, setIsAddRiskOpen] = useState(false);
  const [isRiskDetailOpen, setIsRiskDetailOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<RiskAssessment | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  
  // Função para filtrar os riscos com base na busca e filtros
  const filteredRisks = risksData.filter(risk => {
    // Filtro de busca textual
    const textMatch = 
      risk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de categoria
    const categoryMatch = categoryFilter === "all" || risk.category === categoryFilter;
    
    // Filtro de status
    const statusMatch = statusFilter === "all" || risk.status === statusFilter;
    
    // Filtro de nível
    const levelMatch = levelFilter === "all" || risk.level === levelFilter;
    
    return textMatch && categoryMatch && statusMatch && levelMatch;
  });
  
  // Função para abrir detalhes do risco
  const openRiskDetail = (risk: RiskAssessment) => {
    setSelectedRisk(risk);
    setIsRiskDetailOpen(true);
  };
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Riscos</h1>
          <p className="text-muted-foreground">
            Conforme metodologia ISO 31000 - Identificação, análise e tratamento de riscos
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link href="/office/grc/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard GRC
            </Button>
          </Link>
          <Button onClick={() => setIsAddRiskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Risco
          </Button>
        </div>
      </div>
      
      {/* Seção informativa sobre ISO 31000 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            ISO 31000 - Framework de Gestão de Riscos
          </CardTitle>
          <CardDescription>
            Visão geral do processo de gestão de riscos conforme ISO 31000
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Identificação</h3>
              <p className="text-sm text-muted-foreground">
                Processo de encontrar, reconhecer e descrever riscos que possam afetar os objetivos da organização.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Análise</h3>
              <p className="text-sm text-muted-foreground">
                Compreensão da natureza do risco e determinação do nível de risco, considerando probabilidade e impacto.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Tratamento</h3>
              <p className="text-sm text-muted-foreground">
                Processo para modificar o risco, incluindo mitigação, transferência, aceitação ou eliminação do risco.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Ferramentas de busca e filtro */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar riscos por nome, categoria, descrição..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="Segurança da Informação">Segurança da Informação</SelectItem>
              <SelectItem value="Conformidade Legal">Conformidade Legal</SelectItem>
              <SelectItem value="Operacional">Operacional</SelectItem>
              <SelectItem value="Estratégico">Estratégico</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Mitigado">Mitigado</SelectItem>
              <SelectItem value="Em revisão">Em revisão</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Nível de Risco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="Baixo">Baixo</SelectItem>
              <SelectItem value="Médio">Médio</SelectItem>
              <SelectItem value="Alto">Alto</SelectItem>
              <SelectItem value="Crítico">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Tabela principal de riscos */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Riscos</CardTitle>
          <CardDescription>
            Visualize e gerencie os riscos identificados relacionados a fornecedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Nível
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fornecedores</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRisks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell className="font-medium">{risk.id}</TableCell>
                  <TableCell>{risk.name}</TableCell>
                  <TableCell>{risk.category}</TableCell>
                  <TableCell>
                    <RiskLevelBadge level={risk.level} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={risk.status} />
                  </TableCell>
                  <TableCell>{risk.suppliers?.length || 0}</TableCell>
                  <TableCell>{risk.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openRiskDetail(risk)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Exibindo {filteredRisks.length} de {risksData.length} riscos
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Anterior</Button>
            <Button variant="outline" size="sm">Próximo</Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Dialog para adicionar novo risco */}
      <Dialog open={isAddRiskOpen} onOpenChange={setIsAddRiskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Risco</DialogTitle>
            <DialogDescription>
              Preencha as informações para registrar um novo risco seguindo a metodologia ISO 31000
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="risk-name">Nome do Risco</Label>
                <Input id="risk-name" placeholder="Ex: Vazamento de dados por terceiros" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk-category">Categoria</Label>
                <Select>
                  <SelectTrigger id="risk-category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categorias</SelectLabel>
                      <SelectItem value="security">Segurança da Informação</SelectItem>
                      <SelectItem value="compliance">Conformidade Legal</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="strategic">Estratégico</SelectItem>
                      <SelectItem value="financial">Financeiro</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="risk-description">Descrição</Label>
              <Textarea 
                id="risk-description" 
                placeholder="Descreva o risco em detalhes..." 
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="risk-probability">Probabilidade</Label>
                <Select>
                  <SelectTrigger id="risk-probability">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="very-high">Muito Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="risk-impact">Impacto</Label>
                <Select>
                  <SelectTrigger id="risk-impact">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="risk-standard">Norma Relacionada</Label>
                <Select>
                  <SelectTrigger id="risk-standard">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iso31000">ISO 31000</SelectItem>
                    <SelectItem value="iso27036">ISO 27036</SelectItem>
                    <SelectItem value="lgpd">LGPD</SelectItem>
                    <SelectItem value="gdpr">GDPR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Fornecedores associados</Label>
              <div className="border rounded-md p-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="s1" />
                  <label htmlFor="s1">Acme Tecnologia</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s2" />
                  <label htmlFor="s2">DataProcess</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s3" />
                  <label htmlFor="s3">CloudServices BR</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="s4" />
                  <label htmlFor="s4">Infratech</label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRiskOpen(false)}>Cancelar</Button>
            <Button>Salvar Risco</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para detalhes do risco */}
      <Dialog open={isRiskDetailOpen} onOpenChange={setIsRiskDetailOpen}>
        {selectedRisk && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                {selectedRisk.name}
              </DialogTitle>
              <DialogDescription>
                ID: {selectedRisk.id} | Última atualização: {selectedRisk.lastUpdated}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Categoria</h3>
                  <p>{selectedRisk.category}</p>
                  
                  <h3 className="text-sm font-medium mt-4 mb-2">Descrição</h3>
                  <p className="text-gray-700">{selectedRisk.description}</p>
                  
                  <h3 className="text-sm font-medium mt-4 mb-2">Norma relacionada</h3>
                  <p>{selectedRisk.standard}</p>
                </div>
                
                <div>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Nível de Risco</h3>
                      <RiskLevelBadge level={selectedRisk.level} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Status</h3>
                      <StatusBadge status={selectedRisk.status} />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-8 mb-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Probabilidade</h3>
                      <p>{selectedRisk.probability}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Impacto</h3>
                      <p>{selectedRisk.impact}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Controles</h3>
                      <p>{selectedRisk.controls}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium mt-4 mb-2">Fornecedores afetados</h3>
                  {selectedRisk.suppliers && selectedRisk.suppliers.length > 0 ? (
                    <div className="space-y-1">
                      {selectedRisk.suppliers.map((supplier, index) => (
                        <div key={index} className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                          <p>{supplier}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhum fornecedor associado</p>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium mb-2">Plano de tratamento</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">
                    Implementar controles de segurança adicionais e revisão periódica de permissões de acesso de fornecedores. 
                    Realizar auditorias trimestrais para validar a conformidade.
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Editar Risco
              </Button>
              <Button className="gap-2">
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}