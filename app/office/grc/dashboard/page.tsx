"use client"

import { useEffect, useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ShieldAlert, 
  FileCheck, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2, 
  ClipboardCheck, 
  Users,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react"

// Importação lazy condicional de recharts
let RechartComponents: any = {
  BarChart: null,
  Bar: null,
  XAxis: null,
  YAxis: null,
  CartesianGrid: null,
  Tooltip: null,
  Legend: null,
  ResponsiveContainer: null,
  PieChart: null,
  Pie: null,
  Cell: null
};

const riskData = [
  { category: 'Alto', value: 12, color: '#ef4444' },
  { category: 'Médio', value: 25, color: '#f59e0b' },
  { category: 'Baixo', value: 43, color: '#22c55e' },
];

const complianceData = [
  { name: 'ISO 31000', compliant: 78, gap: 22 },
  { name: 'ISO 27036', compliant: 65, gap: 35 },
  { name: 'LGPD', compliant: 85, gap: 15 },
  { name: 'GDPR', compliant: 72, gap: 28 },
];

const COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

export default function GRCDashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Carregar recharts dinamicamente no lado do cliente
  useEffect(() => {
    const loadRecharts = async () => {
      try {
        const recharts = await import('recharts');
        RechartComponents = {
          BarChart: recharts.BarChart,
          Bar: recharts.Bar,
          XAxis: recharts.XAxis,
          YAxis: recharts.YAxis,
          CartesianGrid: recharts.CartesianGrid,
          Tooltip: recharts.Tooltip,
          Legend: recharts.Legend,
          ResponsiveContainer: recharts.ResponsiveContainer,
          PieChart: recharts.PieChart,
          Pie: recharts.Pie,
          Cell: recharts.Cell
        };
      } catch (e) {
        console.error("Erro ao carregar recharts:", e);
      }
    };
    
    if (typeof window !== 'undefined') {
      loadRecharts();
    }
  }, []);

  if (!isMounted) {
    return null;
  }
  
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } = RechartComponents;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard GRC</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de Governança, Risco e Conformidade baseado nas normas ISO 31000 e 27036.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="risks">Riscos</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Cards de visão geral */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nível de Conformidade Geral
                </CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76%</div>
                <Progress value={76} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  +5% comparado ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Riscos Críticos
                </CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <Progress value={12} max={100} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  -3 comparado ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Controles Implementados
                </CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <Progress value={87} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  +12% comparado ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fornecedores Avaliados
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">65</div>
                <Progress value={65} max={80} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  81% do total de fornecedores
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de visão geral */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Distribuição de Riscos</CardTitle>
                <CardDescription>
                  Distribuição dos riscos por categoria de severidade
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  {RechartComponents.ResponsiveContainer ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {riskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                      <div className="text-center">
                        <PieChartIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500">Gráfico de distribuição de riscos</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Conformidade por Framework</CardTitle>
                <CardDescription>
                  Nível de conformidade por framework regulatório
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  {RechartComponents.ResponsiveContainer ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={complianceData}
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
                        <Bar dataKey="compliant" fill="#22c55e" name="Conforme" />
                        <Bar dataKey="gap" fill="#ef4444" name="Não Conforme" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                      <div className="text-center">
                        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500">Gráfico de conformidade por framework</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Atividades recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Últimas atualizações no sistema GRC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-blue-100 p-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Avaliação de Fornecedor Concluída</p>
                    <p className="text-sm text-muted-foreground">Fornecedor X-Tech classificado como baixo risco</p>
                    <p className="text-xs text-muted-foreground">Hoje às 10:45</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Novo Risco Identificado</p>
                    <p className="text-sm text-muted-foreground">Risco de vazamento de dados no sistema de armazenamento</p>
                    <p className="text-xs text-muted-foreground">Ontem às 15:20</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-green-100 p-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Melhoria na Conformidade</p>
                    <p className="text-sm text-muted-foreground">Implementados 3 novos controles de segurança ISO 27036</p>
                    <p className="text-xs text-muted-foreground">20/04/2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Riscos (ISO 31000)</CardTitle>
              <CardDescription>
                Resumo dos riscos identificados e monitorados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Esta aba mostrará informações detalhadas sobre a gestão de riscos.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Para informações completas, acesse a página de Gestão de Riscos.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status de Conformidade</CardTitle>
              <CardDescription>
                Visão geral da conformidade com ISO 31000 e 27036
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Esta aba mostrará informações detalhadas sobre a conformidade.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Para informações completas, acesse a página de Conformidade.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fornecedores e Terceiros</CardTitle>
              <CardDescription>
                Gestão de fornecedores conforme ISO 27036
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Esta aba mostrará informações sobre fornecedores e terceiros.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Para informações completas, acesse a página de Fornecedores.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}