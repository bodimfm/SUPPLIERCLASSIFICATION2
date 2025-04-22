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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle2, 
  Shield, 
  ShieldAlert, 
  FileCheck, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Link as LinkIcon,
  FileText,
  ShieldCheck
} from "lucide-react"

// Dados de exemplo para os controles
const controlsData = [
  {
    id: "CTRL-001",
    name: "Avaliação de Segurança de Fornecedores",
    category: "Segurança da Informação",
    description: "Processo formal de avaliação de segurança da informação para fornecedores antes da contratação",
    standard: "ISO 27036",
    implementation: 85,
    effectiveness: 78,
    risks: ["RISK-001", "RISK-004"],
    owner: "Departamento de TI",
    lastReview: "10/04/2025"
  },
  {
    id: "CTRL-002",
    name: "Cláusulas Contratuais de Privacidade",
    category: "Conformidade Legal",
    description: "Inclusão de cláusulas específicas sobre proteção de dados em contratos com fornecedores",
    standard: "LGPD",
    implementation: 100,
    effectiveness: 90,
    risks: ["RISK-002"],
    owner: "Departamento Jurídico",
    lastReview: "15/04/2025"
  },
  {
    id: "CTRL-003",
    name: "Monitoramento Contínuo de Fornecedores",
    category: "Operacional",
    description: "Sistema de monitoramento contínuo do desempenho e conformidade de fornecedores críticos",
    standard: "ISO 31000",
    implementation: 65,
    effectiveness: 60,
    risks: ["RISK-003", "RISK-005"],
    owner: "Gestão de Fornecedores",
    lastReview: "05/04/2025"
  },
  {
    id: "CTRL-004",
    name: "Gestão de Credenciais de Acesso",
    category: "Segurança da Informação",
    description: "Processo de gerenciamento de credenciais de acesso fornecidas a fornecedores e terceiros",
    standard: "ISO 27036",
    implementation: 70,
    effectiveness: 75,
    risks: ["RISK-004"],
    owner: "Departamento de TI",
    lastReview: "12/04/2025"
  },
  {
    id: "CTRL-005",
    name: "Estratégia de Diversificação de Fornecedores",
    category: "Estratégico",
    description: "Estratégia para evitar dependência excessiva de um único fornecedor para serviços críticos",
    standard: "ISO 31000",
    implementation: 50,
    effectiveness: 45,
    risks: ["RISK-005"],
    owner: "Diretoria Executiva",
    lastReview: "18/04/2025"
  },
];

// Componente que exibe a efetividade do controle com cor correspondente
function EffectivenessIndicator({ percentage }: { percentage: number }) {
  const getColor = () => {
    if (percentage >= 85) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span>{percentage}%</span>
    </div>
  );
}

// Componente para exibir a implementação do controle com cor correspondente
function ImplementationStatus({ percentage }: { percentage: number }) {
  const getColor = () => {
    if (percentage >= 85) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span>{percentage}%</span>
    </div>
  );
}

// Componente para exibir o standard do controle com badge
function StandardBadge({ standard }: { standard: string }) {
  const getVariant = () => {
    switch (standard) {
      case 'ISO 27036':
        return 'default';
      case 'ISO 31000':
        return 'secondary';
      case 'LGPD':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  return <Badge variant={getVariant() as any}>{standard}</Badge>;
}

export default function ControlsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddControlOpen, setIsAddControlOpen] = useState(false);
  
  // Função para filtrar os controles com base na busca
  const filteredControls = controlsData.filter(control =>
    control.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    control.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    control.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Controles</h1>
          <p className="text-muted-foreground">
            Gerenciamento de controles de segurança baseados nas normas ISO 31000 e ISO 27036
          </p>
        </div>
        <Button onClick={() => setIsAddControlOpen(true)} className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Controle
        </Button>
      </div>
      
      {/* Abas para diferentes visões dos controles */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos os Controles</TabsTrigger>
          <TabsTrigger value="iso27036">ISO 27036</TabsTrigger>
          <TabsTrigger value="iso31000">ISO 31000</TabsTrigger>
          <TabsTrigger value="effectiveness">Efetividade</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {/* Seção informativa sobre controles de segurança */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Controles de Segurança
              </CardTitle>
              <CardDescription>
                Visão geral dos controles de segurança baseados nas normas ISO 31000 e ISO 27036
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Total de Controles</h3>
                    <p className="text-2xl font-bold">{controlsData.length}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Controles Implementados</h3>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <ShieldAlert className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Controles em Implementação</h3>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <FileCheck className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Efetividade Média</h3>
                    <p className="text-2xl font-bold">69.6%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Ferramentas de busca e filtro */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar controles por nome, categoria, descrição..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Importar
              </Button>
            </div>
          </div>
          
          {/* Tabela principal de controles */}
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Controles</CardTitle>
              <CardDescription>
                Visualize e gerencie os controles implementados na organização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Standard</TableHead>
                    <TableHead>Implementação</TableHead>
                    <TableHead>Efetividade</TableHead>
                    <TableHead>Riscos Vinculados</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredControls.map((control) => (
                    <TableRow key={control.id}>
                      <TableCell className="font-medium">{control.id}</TableCell>
                      <TableCell>{control.name}</TableCell>
                      <TableCell>{control.category}</TableCell>
                      <TableCell>
                        <StandardBadge standard={control.standard} />
                      </TableCell>
                      <TableCell>
                        <ImplementationStatus percentage={control.implementation} />
                      </TableCell>
                      <TableCell>
                        <EffectivenessIndicator percentage={control.effectiveness} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {control.risks.map((risk, index) => (
                            <Badge key={index} variant="outline" className="cursor-pointer">
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <LinkIcon className="h-4 w-4" />
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
                Exibindo {filteredControls.length} de {controlsData.length} controles
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Anterior</Button>
                <Button variant="outline" size="sm">Próximo</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="iso27036">
          <Card>
            <CardHeader>
              <CardTitle>Controles ISO 27036</CardTitle>
              <CardDescription>
                Controles específicos para segurança da informação nas relações com fornecedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Controles específicos da norma ISO 27036 - Segurança da informação para relações com fornecedores:</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Implementação</TableHead>
                    <TableHead>Riscos Mitigados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {controlsData
                    .filter(control => control.standard === "ISO 27036")
                    .map((control) => (
                      <TableRow key={control.id}>
                        <TableCell className="font-medium">{control.id}</TableCell>
                        <TableCell>{control.name}</TableCell>
                        <TableCell>
                          <ImplementationStatus percentage={control.implementation} />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {control.risks.map((risk, index) => (
                              <Badge key={index} variant="outline" className="cursor-pointer">
                                {risk}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="iso31000">
          <Card>
            <CardHeader>
              <CardTitle>Controles ISO 31000</CardTitle>
              <CardDescription>
                Controles relacionados à gestão de riscos conforme ISO 31000
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Controles baseados na metodologia de gestão de riscos da ISO 31000:</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Implementação</TableHead>
                    <TableHead>Riscos Mitigados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {controlsData
                    .filter(control => control.standard === "ISO 31000")
                    .map((control) => (
                      <TableRow key={control.id}>
                        <TableCell className="font-medium">{control.id}</TableCell>
                        <TableCell>{control.name}</TableCell>
                        <TableCell>
                          <ImplementationStatus percentage={control.implementation} />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {control.risks.map((risk, index) => (
                              <Badge key={index} variant="outline" className="cursor-pointer">
                                {risk}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="effectiveness">
          <Card>
            <CardHeader>
              <CardTitle>Efetividade dos Controles</CardTitle>
              <CardDescription>
                Análise da efetividade dos controles implementados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Análise de efetividade baseada em métricas e indicadores:</p>
              
              {/* Controles ordenados por efetividade */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Efetividade</TableHead>
                    <TableHead>Implementação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...controlsData]
                    .sort((a, b) => b.effectiveness - a.effectiveness)
                    .map((control) => (
                      <TableRow key={control.id}>
                        <TableCell className="font-medium">{control.id}</TableCell>
                        <TableCell>{control.name}</TableCell>
                        <TableCell>
                          <EffectivenessIndicator percentage={control.effectiveness} />
                        </TableCell>
                        <TableCell>
                          <ImplementationStatus percentage={control.implementation} />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog para adicionar novo controle */}
      <Dialog open={isAddControlOpen} onOpenChange={setIsAddControlOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Controle</DialogTitle>
            <DialogDescription>
              Preencha as informações para registrar um novo controle de segurança
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="control-name">Nome do Controle</Label>
                <Input id="control-name" placeholder="Ex: Avaliação de Segurança de Fornecedores" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="control-category">Categoria</Label>
                <Select>
                  <SelectTrigger id="control-category">
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
              <Label htmlFor="control-description">Descrição</Label>
              <Textarea 
                id="control-description" 
                placeholder="Descreva o controle em detalhes..." 
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="control-standard">Norma Relacionada</Label>
                <Select>
                  <SelectTrigger id="control-standard">
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
              
              <div className="space-y-2">
                <Label htmlFor="control-owner">Responsável</Label>
                <Select>
                  <SelectTrigger id="control-owner">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ti">Departamento de TI</SelectItem>
                    <SelectItem value="juridico">Departamento Jurídico</SelectItem>
                    <SelectItem value="fornecedores">Gestão de Fornecedores</SelectItem>
                    <SelectItem value="diretoria">Diretoria Executiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Riscos Relacionados</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                {["RISK-001", "RISK-002", "RISK-003", "RISK-004", "RISK-005"].map((risk) => (
                  <Badge key={risk} variant="outline" className="cursor-pointer hover:bg-accent">
                    {risk}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddControlOpen(false)}>Cancelar</Button>
            <Button>Salvar Controle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}