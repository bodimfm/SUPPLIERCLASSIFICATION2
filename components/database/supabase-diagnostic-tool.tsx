"use client"

import { useState } from "react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, AlertCircle, Database } from "lucide-react"

// Tipo para o resultado do diagnóstico
type DiagnosticResult = {
  success: boolean
  message: string
  clientStatus?: {
    regularClient: boolean
    adminClient: boolean
  }
  environmentVariables?: {
    url: boolean
    anonKey: boolean
    serviceKey: boolean
  }
  connection?: {
    regularClient: boolean
    adminClient: boolean
  }
  buckets?: {
    listAccess: boolean
    createAccess: boolean
    supplierDocumentsBucket: string
  }
  database?: {
    supplierTable: string
    assessmentTable: string
    documentsTable: string
  }
  rls?: {
    enabled: any
    policies: any
  }
  recommendations?: string[]
}

export function SupabaseDiagnosticTool() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'recommendations'>('overview')

  // Função para executar o diagnóstico
  const runDiagnostic = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch("/api/test-supabase-connection")
      const data = await response.json()
      
      setResult(data)
      
      if (data.success) {
        toast({
          title: "Diagnóstico concluído",
          description: "A conexão com o Supabase está funcionando corretamente.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Diagnóstico concluído",
          description: "Foram encontrados problemas na conexão com o Supabase.",
        })
      }
    } catch (error) {
      console.error("Erro ao executar diagnóstico:", error)
      toast({
        variant: "destructive",
        title: "Erro no diagnóstico",
        description: "Não foi possível executar o diagnóstico. Verifique o console para mais detalhes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para criar tabelas e buckets necessários
  const initializeResources = async () => {
    setIsLoading(true)
    
    try {
      // Criar tabelas
      if (result?.database?.assessmentTable === "não existe") {
        toast({
          title: "Inicializando recursos",
          description: "Criando tabela de avaliações...",
        })
        await fetch("/api/create-assessments-table")
      }
      
      if (result?.database?.documentsTable === "não existe") {
        toast({
          title: "Inicializando recursos",
          description: "Criando tabela de documentos...",
        })
        await fetch("/api/create-documents-table")
      }
      
      // Criar bucket de documentos se necessário
      if (result?.buckets?.supplierDocumentsBucket === "não existe") {
        toast({
          title: "Inicializando recursos",
          description: "Criando bucket de documentos...",
        })
        await fetch("/api/create-bucket")
      }
      
      // Executar diagnóstico novamente para mostrar o progresso
      await runDiagnostic()
      
      toast({
        title: "Inicialização concluída",
        description: "Os recursos necessários foram inicializados.",
      })
    } catch (error) {
      console.error("Erro ao inicializar recursos:", error)
      toast({
        variant: "destructive",
        title: "Erro na inicialização",
        description: "Não foi possível inicializar todos os recursos necessários.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizar status com ícone adequado
  const renderStatus = (status: boolean | string | undefined) => {
    if (typeof status === 'boolean') {
      return status ? 
        <CheckCircle className="h-5 w-5 text-green-500" /> : 
        <XCircle className="h-5 w-5 text-red-500" />
    }
    
    if (typeof status === 'string') {
      if (status === 'acessível' || status === 'existe' || status === 'criado com sucesso') {
        return <CheckCircle className="h-5 w-5 text-green-500" />
      }
      
      if (status === 'não existe' || status.includes('erro') || status === 'vazia ou inacessível') {
        return <XCircle className="h-5 w-5 text-red-500" />
      }
      
      return <AlertCircle className="h-5 w-5 text-amber-500" />
    }
    
    return <AlertCircle className="h-5 w-5 text-amber-500" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="relative"
        >
          <Database className="h-4 w-4 mr-2" />
          Diagnóstico do Supabase
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Diagnóstico do Supabase</DialogTitle>
          <DialogDescription>
            Verifique a conexão e configuração do Supabase para identificar e resolver problemas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Tabs de navegação */}
          <div className="flex border-b border-gray-200">
            <button 
              className={`py-2 px-4 focus:outline-none ${activeTab === 'overview' ? 'border-b-2 border-primary font-medium text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Visão Geral
            </button>
            <button 
              className={`py-2 px-4 focus:outline-none ${activeTab === 'details' ? 'border-b-2 border-primary font-medium text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('details')}
              disabled={!result}
            >
              Detalhes
            </button>
            <button 
              className={`py-2 px-4 focus:outline-none ${activeTab === 'recommendations' ? 'border-b-2 border-primary font-medium text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('recommendations')}
              disabled={!result?.recommendations?.length}
            >
              {result?.recommendations?.length ? (
                <>Recomendações <span className="ml-1 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">{result.recommendations.length}</span></>
              ) : "Recomendações"}
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div>
              {!result && !isLoading && (
                <div className="text-center py-6">
                  <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">Execute o diagnóstico para verificar a conexão e configuração do Supabase.</p>
                  <Button onClick={runDiagnostic}>Iniciar Diagnóstico</Button>
                </div>
              )}
              
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-gray-500">Executando diagnóstico...</p>
                </div>
              )}
              
              {result && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center">
                      {result.success ? (
                        <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500 mr-2" />
                      )}
                      <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.message}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Clientes */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Clientes Supabase</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Cliente Regular</span>
                          {renderStatus(result.connection?.regularClient)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Cliente Admin</span>
                          {renderStatus(result.connection?.adminClient)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Variáveis de ambiente */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Variáveis de Ambiente</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>URL</span>
                          {renderStatus(result.environmentVariables?.url)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Chave Anônima</span>
                          {renderStatus(result.environmentVariables?.anonKey)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Chave de Serviço</span>
                          {renderStatus(result.environmentVariables?.serviceKey)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Armazenamento */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Armazenamento</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Acesso para listar buckets</span>
                          {renderStatus(result.buckets?.listAccess)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Acesso para criar buckets</span>
                          {renderStatus(result.buckets?.createAccess)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Bucket supplier-documents</span>
                          {renderStatus(result.buckets?.supplierDocumentsBucket)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Banco de dados */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Tabelas</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>suppliers</span>
                          {renderStatus(result.database?.supplierTable)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>assessments</span>
                          {renderStatus(result.database?.assessmentTable)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>documents</span>
                          {renderStatus(result.database?.documentsTable)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recomendações resumidas */}
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="font-medium text-amber-800">
                        {result.recommendations.length} {result.recommendations.length === 1 ? 'recomendação encontrada' : 'recomendações encontradas'}.
                        <Button 
                          variant="link" 
                          className="text-amber-800" 
                          onClick={() => setActiveTab('recommendations')}
                        >
                          Ver detalhes
                        </Button>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Tab de detalhes */}
          {activeTab === 'details' && result && (
            <div className="space-y-4">
              <h3 className="font-medium">RLS (Row Level Security)</h3>
              {typeof result.rls?.enabled === 'object' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tabela</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status RLS</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(result.rls.enabled).map(([table, status]) => (
                        <tr key={table}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{table}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                            {status === "ativado" ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Ativado
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-amber-500 mr-1" /> Desativado
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <h3 className="font-medium pt-2">Políticas de Acesso</h3>
              {typeof result.rls?.policies === 'object' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tabela</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Políticas</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(result.rls.policies).map(([table, policies]) => (
                        <tr key={table}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{table}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(policies) && policies.map((policy, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {policy}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="pt-2">
                <p className="text-sm text-gray-500 italic">
                  Para mais detalhes técnicos, verifique o console do navegador.
                </p>
              </div>
            </div>
          )}
          
          {/* Tab de recomendações */}
          {activeTab === 'recommendations' && result?.recommendations && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                <h3 className="font-medium mb-2">Recomendações para resolver problemas</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-gray-800">{recommendation}</li>
                  ))}
                </ul>
              </div>
              
              {/* Ações para resolver problemas comuns */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Ações disponíveis</h3>
                <div className="space-y-2">
                  <Button 
                    onClick={initializeResources}
                    disabled={isLoading || (
                      result.database?.assessmentTable !== "não existe" && 
                      result.database?.documentsTable !== "não existe" && 
                      result.buckets?.supplierDocumentsBucket !== "não existe"
                    )}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inicializando...
                      </>
                    ) : (
                      <>Inicializar tabelas e buckets necessários</>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={runDiagnostic}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>Verificar novamente</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}