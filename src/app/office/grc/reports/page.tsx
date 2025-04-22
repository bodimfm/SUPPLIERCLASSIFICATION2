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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  FileBarChart, 
  Calendar, 
  Filter, 
  Clock, 
  RefreshCw, 
  PieChart, 
  BarChart3,
  TrendingUp,
  Eye,
  Plus,
  Share2
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts"

// Dados de exemplo para os relatórios
const reportsData = [
  {
    id: "REP-001",
    name: "Relatório de Conformidade ISO 31000",
    description: "Análise detalhada de conformidade com a norma ISO 31000 de Gestão de Riscos",
    category: "Conformidade",
    created: "10/04/2025",
    lastRun: "19/04/2025",
    scheduleType: "Mensal",
    status: "Disponível"
  },
  {
    id: "REP-002",
    name: "Análise de Riscos de Fornecedores",
    description: "Visão geral dos riscos relacionados a fornecedores de acordo com ISO 27036",
    category: "Riscos",
    created: "05/03/2025",
    lastRun: "18/04/2025",
    scheduleType: "Semanal",
    status: "Disponível"
  },
  {
    id: "REP-003",
    name: "Eficácia dos Controles de Segurança",
    description: "Análise da eficácia dos controles de segurança implementados para fornecedores",
    category: "Controles",
    created: "15/03/2025",
    lastRun: "15/04/2025",
    scheduleType: "Mensal",
    status: "Disponível"
  },
  {
    id: "REP-004",
    name: "Não Conformidades Críticas",
    description: "Lista de não conformidades críticas que requerem ação imediata",
    category: "Conformidade",
    created: "20/03/2025",
    lastRun: "20/04/2025",
    scheduleType: "Semanal",
    status: "Disponível"
  },
  {
    id: "REP-005",
    name: "Tendências de Riscos",
    description: "Análise de tendências nos riscos identificados ao longo do tempo",
    category: "Riscos",
    created: "01/04/2025",
    lastRun: "17/04/2025",
    scheduleType: "Mensal",
    status: "Em Processamento"
  },
];

// Dados de exemplo para o dashboard
const complianceOverTimeData = [
  { name: 'Jan', iso31000: 60, iso27036: 50 },
  { name: 'Fev', iso31000: 63, iso27036: 55 },
  { name: 'Mar', iso31000: 68, iso27036: 59 },
  { name: 'Abr', iso31000: 78, iso27036: 65 },
];

const riskDistributionData = [
  { name: 'Alto', value: 12, color: '#ef4444' },
  { name: 'Médio', value: 25, color: '#f59e0b' },
  { name: 'Baixo', value: 43, color: '#22c55e' },
];

const controlsEffectivenessData = [
  { name: 'Controles ISO 27036', effectiveness: 75, gap: 25 },
  { name: 'Controles ISO 31000', effectiveness: 82, gap: 18 },
  { name: 'Controles LGPD', effectiveness: 90, gap: 10 },
];

// Componente para mostrar o status de um relatório
function ReportStatus({ status }: { status: string }) {
  let bgColor = "";
  let textColor = "";
  
  switch (status) {
    case "Disponível":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      break;
    case "Em Processamento":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
  }
  
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
}

export default function ReportsPage() {
  const [isGenerateReportOpen, setIsGenerateReportOpen] = useState(false);
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Relatórios e análises de Governança, Risco e Conformidade
          </p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={() => setIsGenerateReportOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Gerar Novo Relatório
        </Button>
      </div>
      
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
          <TabsTrigger value="archived">Arquivados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          {/* Dashboard de Relatórios */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportsData.filter(report => report.status === "Disponível").length}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Última atualização: 20/04/2025
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Relatórios Esta Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground mt-2">
                  +2 comparado à semana anterior
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Próximo Relatório Agendado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-md font-medium">Análise de Riscos de Fornecedores</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Programado para: 25/04/2025
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Gráficos do Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conformidade ao Longo do Tempo</CardTitle>
                <CardDescription>
                  Percentual de conformidade com as normas ISO 31000 e 27036
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={complianceOverTimeData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="iso31000" 
                        name="ISO 31000" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="iso27036" 
                        name="ISO 27036" 
                        stroke="#10b981" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição de Riscos</CardTitle>
                <CardDescription>
                  Distribuição dos riscos por nível de severidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={riskDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Eficácia dos Controles</CardTitle>
              <CardDescription>
                Avaliação da eficácia dos controles implementados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={controlsEffectivenessData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="effectiveness" name="Eficácia" fill="#22c55e" />
                    <Bar dataKey="gap" name="Gap" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input placeholder="Buscar relatórios..." />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categorias</SelectLabel>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="compliance">Conformidade</SelectItem>
                    <SelectItem value="risk">Riscos</SelectItem>
                    <SelectItem value="controls">Controles</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
              <CardDescription>
                Relatórios gerados e disponíveis para visualização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Última Execução</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsData.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">{report.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{report.category}</TableCell>
                      <TableCell>{report.lastRun}</TableCell>
                      <TableCell><ReportStatus status={report.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" disabled={report.status !== "Disponível"}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled={report.status !== "Disponível"}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
              <CardDescription>
                Relatórios programados para geração automática
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead>Próxima Execução</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">SCH-001</TableCell>
                    <TableCell>Relatório Semanal de Riscos</TableCell>
                    <TableCell>Semanal (Segunda-feira)</TableCell>
                    <TableCell>24/04/2025</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Clock className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">SCH-002</TableCell>
                    <TableCell>Dashboard de Conformidade</TableCell>
                    <TableCell>Diário</TableCell>
                    <TableCell>21/04/2025</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Clock className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">SCH-003</TableCell>
                    <TableCell>Relatório de Conformidade ISO 31000</TableCell>
                    <TableCell>Mensal (1º dia)</TableCell>
                    <TableCell>01/05/2025</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Clock className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Arquivados</CardTitle>
              <CardDescription>
                Relatórios históricos arquivados para referência futura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 mb-4">
                <Input 
                  type="date" 
                  className="w-auto" 
                  placeholder="Data inicial" 
                />
                <Input 
                  type="date" 
                  className="w-auto" 
                  placeholder="Data final" 
                />
                <Button variant="secondary">Buscar</Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Data de Arquivamento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">ARC-001</TableCell>
                    <TableCell>Relatório de Conformidade Q1 2025</TableCell>
                    <TableCell>31/03/2025</TableCell>
                    <TableCell>05/04/2025</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">ARC-002</TableCell>
                    <TableCell>Análise Anual de Riscos 2024</TableCell>
                    <TableCell>15/01/2025</TableCell>
                    <TableCell>20/01/2025</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog para gerar novo relatório */}
      <Dialog open={isGenerateReportOpen} onOpenChange={setIsGenerateReportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerar Novo Relatório</DialogTitle>
            <DialogDescription>
              Configure os parâmetros para geração de um novo relatório
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Nome do Relatório</Label>
                <Input id="report-name" placeholder="Ex: Análise de Riscos de Fornecedores" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="report-type">Tipo de Relatório</Label>
                <Select>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipos de Relatório</SelectLabel>
                      <SelectItem value="compliance">Conformidade</SelectItem>
                      <SelectItem value="risk">Riscos</SelectItem>
                      <SelectItem value="controls">Controles</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-description">Descrição</Label>
              <Input id="report-description" placeholder="Descreva o objetivo deste relatório" />
            </div>
            
            <div className="space-y-2">
              <Label>Fontes de Dados</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="source-risks" className="rounded" defaultChecked />
                  <Label htmlFor="source-risks">Riscos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="source-controls" className="rounded" defaultChecked />
                  <Label htmlFor="source-controls">Controles</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="source-compliance" className="rounded" defaultChecked />
                  <Label htmlFor="source-compliance">Conformidade</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="source-suppliers" className="rounded" defaultChecked />
                  <Label htmlFor="source-suppliers">Fornecedores</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Formato do Relatório</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="format-dashboard" 
                    name="report-format" 
                    className="rounded" 
                    defaultChecked 
                  />
                  <div className="flex items-center">
                    <PieChart className="h-4 w-4 mr-1" />
                    <Label htmlFor="format-dashboard">Dashboard</Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="format-tabular" 
                    name="report-format" 
                    className="rounded" 
                  />
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    <Label htmlFor="format-tabular">Tabular</Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="format-detailed" 
                    name="report-format" 
                    className="rounded" 
                  />
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    <Label htmlFor="format-detailed">Detalhado</Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Período de Análise</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="date-start" className="pl-10" type="date" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="date-end" className="pl-10" type="date" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-schedule">Agendar Geração</Label>
              <Select>
                <SelectTrigger id="report-schedule">
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Frequência</SelectLabel>
                    <SelectItem value="once">Uma vez (agora)</SelectItem>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateReportOpen(false)}>Cancelar</Button>
            <Button>Gerar Relatório</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}