"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertCircle, CheckCircle, FileText, LogOut, Users } from "lucide-react"
import SuppliersList from "@/components/suppliers-list"
import { TasksList } from "@/components/tasks-list"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AdherenceAnalysis from "@/components/adherence-analysis"
import SupplierRiskAssessment from "@/components/supplier-risk-assessment"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const [activeView, setActiveView] = useState<string>("overview")
  const [showAdherenceAnalysis, setShowAdherenceAnalysis] = useState(false)
  const { user, signOut, profile, isClient, isDpoMember, isAdmin } = useAuth()

  // Verificar se o usuário é cliente e redirecionar para fornecedores automaticamente
  useEffect(() => {
    if (isClient && activeView === "overview") {
      setActiveView("suppliers");
    }
  }, [isClient, activeView, setActiveView]);
  
  const handleBackFromAdherence = () => {
    setShowAdherenceAnalysis(false)
  }

  if (showAdherenceAnalysis) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
          <AdherenceAnalysis onBack={handleBackFromAdherence} />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Gerenciamento</h1>
            <p className="text-gray-500">Monitore e gerencie fornecedores, tarefas e conformidade com a LGPD.</p>
            {user && (
              <div className="mt-1">
                <p className="text-sm text-blue-600">
                  Logado como: {user.email}
                </p>
                <p className="text-xs text-gray-500">
                  Tipo de acesso: {isClient ? 'Cliente' : isDpoMember ? 'Membro do DPO' : isAdmin ? 'Administrador' : 'Usuário'}
                  {isClient && ' (apenas visualização)'}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {isClient && (
              <div className="bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800 rounded-md max-w-48">
                Você está em modo de visualização. Contate o escritório DPO para solicitar alterações.
              </div>
            )}
            <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        <Tabs defaultValue={isClient ? "suppliers" : "overview"} value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" disabled={isClient}>Visão Geral</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="monitoring" disabled={isClient}>Monitoramento</TabsTrigger>
            <TabsTrigger value="compliance" disabled={isClient}>Conformidade</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28</div>
                  <p className="text-xs text-muted-foreground">
                    +3 no último mês
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Fornecedores de Alto Risco</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">
                    Tipo A + B críticos
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    3 atrasadas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conformidade</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">82%</div>
                  <p className="text-xs text-muted-foreground">
                    +5% vs. mês anterior
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Distribuição de Fornecedores por Categoria</CardTitle>
                  <CardDescription>Número de fornecedores em cada nível de risco</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-end justify-around gap-2 pt-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-red-500 w-24 h-40 rounded-t-md"></div>
                      <div className="mt-2 font-medium">Tipo A</div>
                      <div className="text-sm text-gray-500">5 fornecedores</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-orange-400 w-24 h-64 rounded-t-md"></div>
                      <div className="mt-2 font-medium">Tipo B</div>
                      <div className="text-sm text-gray-500">8 fornecedores</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-yellow-400 w-24 h-96 rounded-t-md"></div>
                      <div className="mt-2 font-medium">Tipo C</div>
                      <div className="text-sm text-gray-500">12 fornecedores</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-green-500 w-24 h-24 rounded-t-md"></div>
                      <div className="mt-2 font-medium">Tipo D</div>
                      <div className="text-sm text-gray-500">3 fornecedores</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ações Recomendadas</CardTitle>
                  <CardDescription>Tarefas prioritárias para acompanhamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                      <h4 className="font-medium text-amber-800">Revisão de DPO Pendente</h4>
                      <p className="text-sm text-amber-700 mt-1">5 fornecedores aguardando revisão</p>
                    </div>
                    
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                      <h4 className="font-medium text-red-800">Documentos Faltantes</h4>
                      <p className="text-sm text-red-700 mt-1">3 fornecedores com documentação incompleta</p>
                    </div>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                      <h4 className="font-medium text-blue-800">Auditorias Programadas</h4>
                      <p className="text-sm text-blue-700 mt-1">2 auditorias previstas para o próximo mês</p>
                    </div>
                    
                    <button 
                      className="w-full mt-4 px-4 py-2 bg-[#0a3144] text-white rounded-md hover:bg-[#1a4155] transition-colors duration-200 flex items-center justify-center"
                      onClick={() => setActiveView("monitoring")}
                    >
                      Ver Todas as Tarefas
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Conformidade</CardTitle>
                <CardDescription>Verificação de aderência às políticas de contratação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Análise de Aderência à Política de Contratação</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Carregue uma planilha de contratos para verificar a conformidade com a política.
                    </p>
                  </div>
                  <button 
                    className="px-4 py-2 bg-[#0a3144] text-white rounded-md hover:bg-[#1a4155] transition-colors duration-200"
                    onClick={() => setShowAdherenceAnalysis(true)}
                  >
                    Iniciar Análise
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6 mt-6">
            {isClient ? (
              <div>
                <SupplierRiskAssessment hideHeader={true} hideFooter={true} />
              </div>
            ) : (
              <SuppliersList />
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6 mt-6">
            <TasksList />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Conformidade</CardTitle>
                <CardDescription>Visão geral da conformidade com a LGPD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800">Principais Indicadores de Conformidade</h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Documentação Completa</span>
                          <span className="text-sm font-medium">87%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "87%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Contratos com Cláusulas LGPD</span>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Monitoramento Ativo</span>
                          <span className="text-sm font-medium">76%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "76%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Certificações Validadas</span>
                          <span className="text-sm font-medium">63%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "63%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Próximas Verificações</h3>
                      <ul className="mt-3 space-y-2">
                        <li className="text-sm flex justify-between">
                          <span>Auditoria Anual - Tech Solutions</span>
                          <span className="text-gray-500">15/05/2025</span>
                        </li>
                        <li className="text-sm flex justify-between">
                          <span>Renovação de Certificação - Acme Corp</span>
                          <span className="text-gray-500">22/05/2025</span>
                        </li>
                        <li className="text-sm flex justify-between">
                          <span>Verificação Semestral - Data Services</span>
                          <span className="text-gray-500">01/06/2025</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium">Certificações por Tipo</h3>
                      <ul className="mt-3 space-y-2">
                        <li className="text-sm flex justify-between">
                          <span>ISO 27001</span>
                          <span className="text-gray-500">7 fornecedores</span>
                        </li>
                        <li className="text-sm flex justify-between">
                          <span>ISO 27701</span>
                          <span className="text-gray-500">4 fornecedores</span>
                        </li>
                        <li className="text-sm flex justify-between">
                          <span>SOC 2</span>
                          <span className="text-gray-500">3 fornecedores</span>
                        </li>
                        <li className="text-sm flex justify-between">
                          <span>Sem certificação validada</span>
                          <span className="text-gray-500">14 fornecedores</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button 
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                      Exportar Relatório
                    </button>
                    <button 
                      className="px-4 py-2 bg-[#0a3144] text-white rounded-md hover:bg-[#1a4155] transition-colors duration-200"
                      onClick={() => setShowAdherenceAnalysis(true)}
                    >
                      Análise Detalhada
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}