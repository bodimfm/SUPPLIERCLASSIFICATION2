"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { supplierFormSchema, type SupplierFormValues } from "@/lib/schemas/supplier-schema"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Save, FileCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"
import { calculateSupplierType } from "@/lib/risk-matrix"
import { calculateRiskScore } from "@/lib/risk-scoring"
import { getDraftService, useDebounce } from "@/lib/draft-service"

// Valores iniciais para o formulário
const defaultValues: Partial<SupplierFormValues> = {
  supplierName: "",
  taxId: "",
  email: "",
  phone: "",
  address: "",
  contactPerson: "",
  serviceDescription: "",
  internalResponsible: "",
  dataVolume: "low",
  dataSensitivity: "non-sensitive",
  contractType: "punctual",
  isTechnology: false,
  supplierType: "",
  supplierTypeDescription: "",
  sensitiveFlagged: false,
  uploadedDocuments: [],
  notProvidedDocuments: [],
  submittedToOffice: false,
  uploadedDocumentsMetadata: [],
  
  dataType: "none",
  volume: "low",
  criticality: "non-critical",
  policy: "unknown",
  certification: "unknown",
  subcontracting: "none",
  incidents: "none",
  
  riskScore: 0,
  riskLevel: "low",
  riskDescription: "",
  
  dpoReview: {
    reviewed: false
  },
  
  status: "draft",
  
  registrationDate: new Date().toISOString(),
  lastAssessmentDate: new Date().toISOString(),
  documentsCount: 0
}

interface SupplierFormProps {
  initialData?: Partial<SupplierFormValues>
  onSubmit?: (data: SupplierFormValues) => void
  submitButtonText?: string
  nextStep?: () => void
  draftId?: string
}

export function SupplierForm({
  initialData,
  onSubmit,
  submitButtonText = "Próximo",
  nextStep,
  draftId
}: SupplierFormProps) {
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(false)
  const [draftSaving, setDraftSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [draftId_, setDraftId] = useState<string | undefined>(draftId)
  
  // Inicializar o formulário com react-hook-form + zod
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData
    }
  })
  
  // Observar mudanças no formulário para cálculos automáticos
  const watchIsTechnology = form.watch("isTechnology")
  const watchDataVolume = form.watch("dataVolume")
  const watchDataSensitivity = form.watch("dataSensitivity")
  const watchDataType = form.watch("dataType")
  const watchVolume = form.watch("volume")
  const watchCriticality = form.watch("criticality")
  const watchPolicy = form.watch("policy")
  const watchCertification = form.watch("certification")
  const watchSubcontracting = form.watch("subcontracting")
  const watchIncidents = form.watch("incidents")
  
  // Usar debounce para não salvar a cada digitação
  const debouncedFormValues = useDebounce(form.getValues(), 800)
  
  // Atualizar o tipo de fornecedor quando campos relevantes mudarem
  useEffect(() => {
    const { code, description } = calculateSupplierType(
      watchDataVolume,
      watchDataSensitivity,
      watchIsTechnology
    )
    
    form.setValue("supplierType", code)
    form.setValue("supplierTypeDescription", description)
  }, [watchDataVolume, watchDataSensitivity, watchIsTechnology, form])
  
  // Calcular pontuação de risco quando campos relevantes mudarem
  useEffect(() => {
    if (watchDataType && watchVolume && watchCriticality) {
      const riskScoreData = {
        dataType: watchDataType,
        volume: watchVolume,
        criticality: watchCriticality,
        policy: watchPolicy,
        certification: watchCertification,
        subcontracting: watchSubcontracting,
        incidents: watchIncidents
      }
      
      const { score, riskLevel, description } = calculateRiskScore(riskScoreData)
      
      form.setValue("riskScore", score)
      form.setValue("riskLevel", riskLevel)
      form.setValue("riskDescription", description)
    }
  }, [
    watchDataType,
    watchVolume,
    watchCriticality,
    watchPolicy,
    watchCertification,
    watchSubcontracting,
    watchIncidents,
    form
  ])
  
  // Salvar rascunho automaticamente quando o formulário mudar
  useEffect(() => {
    const saveDraft = async () => {
      // Não salvar se não houver nome do fornecedor
      if (!debouncedFormValues.supplierName) return

      try {
        setDraftSaving(true)
        const draftService = getDraftService()
        const savedDraftId = await draftService.saveDraft(debouncedFormValues)
        
        // Atualizar o ID do rascunho se for um novo
        if (!draftId_) {
          setDraftId(savedDraftId)
        }
        
        setLastSaved(new Date())
      } catch (error) {
        console.error("Erro ao salvar rascunho:", error)
        // Não mostrar toast para não incomodar o usuário constantemente
      } finally {
        setDraftSaving(false)
      }
    }
    
    // Só salvar se houver mudanças
    if (debouncedFormValues.supplierName) {
      saveDraft()
    }
  }, [debouncedFormValues, draftId_])
  
  // Manipulador de submissão do formulário
  const handleSubmit = async (data: SupplierFormValues) => {
    setLoading(true)
    
    try {
      // Se há um manipulador de submissão externo, usá-lo
      if (onSubmit) {
        await onSubmit(data)
      }
      
      // Se há uma função para ir para o próximo passo, chamá-la
      if (nextStep) {
        nextStep()
      }
    } catch (error: any) {
      console.error("Erro ao enviar formulário:", error)
      toast({
        variant: "destructive",
        title: "Erro ao enviar formulário",
        description: error.message || "Ocorreu um erro ao enviar o formulário. Tente novamente."
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Salvar rascunho manualmente
  const saveDraftManually = async () => {
    try {
      setDraftSaving(true)
      const draftService = getDraftService()
      const savedDraftId = await draftService.saveDraft(form.getValues())
      
      // Atualizar o ID do rascunho se for um novo
      if (!draftId_) {
        setDraftId(savedDraftId)
      }
      
      setLastSaved(new Date())
      
      toast({
        title: "Rascunho salvo",
        description: "Seu rascunho foi salvo com sucesso.",
        duration: 3000
      })
    } catch (error: any) {
      console.error("Erro ao salvar rascunho:", error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar rascunho",
        description: error.message || "Ocorreu um erro ao salvar o rascunho. Tente novamente."
      })
    } finally {
      setDraftSaving(false)
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Status do rascunho */}
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-500" />
            <div>
              <span className="text-sm font-medium text-blue-700">
                Rascunho {draftSaving ? "salvando..." : lastSaved ? "salvo" : ""}
              </span>
              {lastSaved && (
                <p className="text-xs text-blue-600">
                  Último salvamento: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={saveDraftManually}
            disabled={draftSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar rascunho
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Fornecedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="supplierName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Fornecedor *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do fornecedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contato@fornecedor.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 0000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pessoa de Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da pessoa de contato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="serviceDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Serviço *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva detalhadamente o serviço que será prestado pelo fornecedor" 
                      {...field} 
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="internalResponsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável Interno</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável interno" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Classificação de Risco</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dataVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume de Dados</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o volume" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="massive">Massivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Quantidade de dados pessoais que serão tratados
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dataSensitivity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sensibilidade dos Dados</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a sensibilidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="non-sensitive">Não sensíveis</SelectItem>
                        <SelectItem value="regular">Regulares</SelectItem>
                        <SelectItem value="sensitive">Sensíveis</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Nível de sensibilidade dos dados pessoais
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contractType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Contrato</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="punctual">Pontual</SelectItem>
                        <SelectItem value="continuous">Contínuo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Tipo de contratação com o fornecedor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="isTechnology"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Fornecedor de Tecnologia</FormLabel>
                    <FormDescription>
                      O fornecedor presta serviços de tecnologia da informação ou acessa sistemas
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Dados</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum dado pessoal</SelectItem>
                        <SelectItem value="common">Dados pessoais comuns</SelectItem>
                        <SelectItem value="sensitive">Dados pessoais sensíveis</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o volume" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixo (até 100 registros)</SelectItem>
                        <SelectItem value="medium">Médio (100-1000 registros)</SelectItem>
                        <SelectItem value="high">Alto (mais de 1000 registros)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="criticality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Criticidade</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a criticidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="non-critical">Não crítico</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="policy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Possui Política de Privacidade</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Sim</SelectItem>
                        <SelectItem value="no">Não</SelectItem>
                        <SelectItem value="unknown">Desconhecido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="certification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificações</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Possui certificações</SelectItem>
                        <SelectItem value="no">Não possui certificações</SelectItem>
                        <SelectItem value="unknown">Desconhecido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subcontracting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcontratação</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Não subcontrata</SelectItem>
                        <SelectItem value="identified">Subcontrata com identificação</SelectItem>
                        <SelectItem value="unknown">Desconhecido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="incidents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incidentes de Segurança</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem incidentes</SelectItem>
                        <SelectItem value="resolved">Incidentes resolvidos</SelectItem>
                        <SelectItem value="unresolved">Incidentes não resolvidos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {form.watch("riskScore") > 0 && (
              <Alert className={`
                ${form.watch("riskLevel") === "low" ? "bg-green-50 border-green-200" : 
                  form.watch("riskLevel") === "medium" ? "bg-yellow-50 border-yellow-200" :
                  form.watch("riskLevel") === "high" ? "bg-orange-50 border-orange-200" :
                  "bg-red-50 border-red-200"}
              `}>
                <AlertCircle className={`h-4 w-4 
                  ${form.watch("riskLevel") === "low" ? "text-green-600" : 
                    form.watch("riskLevel") === "medium" ? "text-yellow-600" :
                    form.watch("riskLevel") === "high" ? "text-orange-600" :
                    "text-red-600"}
                `} />
                <AlertTitle className={`
                  ${form.watch("riskLevel") === "low" ? "text-green-800" : 
                    form.watch("riskLevel") === "medium" ? "text-yellow-800" :
                    form.watch("riskLevel") === "high" ? "text-orange-800" :
                    "text-red-800"}
                `}>
                  Nível de Risco: {
                    form.watch("riskLevel") === "low" ? "Baixo" :
                    form.watch("riskLevel") === "medium" ? "Médio" :
                    form.watch("riskLevel") === "high" ? "Alto" :
                    "Crítico"
                  } ({form.watch("riskScore")} pontos)
                </AlertTitle>
                <AlertDescription className={`
                  ${form.watch("riskLevel") === "low" ? "text-green-700" : 
                    form.watch("riskLevel") === "medium" ? "text-yellow-700" :
                    form.watch("riskLevel") === "high" ? "text-orange-700" :
                    "text-red-700"}
                `}>
                  {form.watch("riskDescription")}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          {form.formState.isSubmitting || loading ? (
            <Button disabled>
              <span className="animate-spin mr-2">⟳</span>
              Processando...
            </Button>
          ) : (
            <Button type="submit">
              {submitButtonText}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}